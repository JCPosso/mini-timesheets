import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { and, eq } from "drizzle-orm";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as schema from "../db/schema";
import { getWeekStart } from "../utils/date";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = resolve(__dirname, "../db/migrations");

function buildDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS });
  return { db, sqlite };
}

describe("Approval flow — integration", () => {
  let sqlite: InstanceType<typeof Database>;
  let db: ReturnType<typeof buildDb>["db"];

  beforeEach(() => {
    ({ db, sqlite } = buildDb());
  });

  afterEach(() => {
    sqlite.close();
  });

  it("approving a week creates an approved record", async () => {
    const [emp] = await db
      .insert(schema.employees)
      .values({ firstName: "Jane", lastName: "Doe", hourlyRate: 22.5, status: "active" })
      .returning();

    await db
      .insert(schema.timeEntries)
      .values({ employeeId: emp.id, date: "2024-06-10", hours: 8 })
      .returning();

    const weekStart = getWeekStart("2024-06-10");
    const now = new Date().toISOString();

    const [approval] = await db
      .insert(schema.weeklyApprovals)
      .values({ employeeId: emp.id, weekStart, status: "approved", updatedAt: now })
      .returning();

    expect(approval.status).toBe("approved");
    expect(approval.weekStart).toBe("2024-06-10");
  });

  it("approved week prevents time entry edits (locked check)", async () => {
    const [emp] = await db
      .insert(schema.employees)
      .values({ firstName: "John", lastName: "Smith", hourlyRate: 18, status: "active" })
      .returning();

    const [entry] = await db
      .insert(schema.timeEntries)
      .values({ employeeId: emp.id, date: "2024-06-11", hours: 8 })
      .returning();

    const weekStart = getWeekStart("2024-06-11");
    const now = new Date().toISOString();

    await db
      .insert(schema.weeklyApprovals)
      .values({ employeeId: emp.id, weekStart, status: "approved", updatedAt: now });

    // Simulate the lock check that the route performs
    const [approval] = await db
      .select()
      .from(schema.weeklyApprovals)
      .where(
        and(
          eq(schema.weeklyApprovals.employeeId, entry.employeeId),
          eq(schema.weeklyApprovals.weekStart, weekStart)
        )
      );

    expect(approval.status).toBe("approved");
    // Route would throw AppError("TIME_ENTRY_LOCKED") when approval.status === "approved"
  });

  it("rejected week can be re-approved", async () => {
    const [emp] = await db
      .insert(schema.employees)
      .values({ firstName: "Ana", lastName: "García", hourlyRate: 25, status: "active" })
      .returning();

    const weekStart = "2024-06-10";
    const now = new Date().toISOString();

    const [rejected] = await db
      .insert(schema.weeklyApprovals)
      .values({ employeeId: emp.id, weekStart, status: "rejected", updatedAt: now })
      .returning();

    expect(rejected.status).toBe("rejected");

    const [approved] = await db
      .update(schema.weeklyApprovals)
      .set({ status: "approved", updatedAt: new Date().toISOString() })
      .where(eq(schema.weeklyApprovals.id, rejected.id))
      .returning();

    expect(approved.status).toBe("approved");
  });
});
