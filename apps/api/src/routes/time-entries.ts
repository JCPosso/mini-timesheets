import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createTimeEntrySchema, updateTimeEntrySchema } from "@mini-timesheets/shared";
import { db } from "../db/client";
import { employees, timeEntries, weeklyApprovals } from "../db/schema";
import { AppError, type SuccessEnvelope } from "../errors";
import { getLang, msg } from "../i18n/messages";
import { getWeekStart } from "../utils/date";

export const timeEntriesRouter = new Hono();

timeEntriesRouter.get("/", async (c) => {
  const employeeId = c.req.query("employeeId");

  const rows = employeeId
    ? await db
        .select()
        .from(timeEntries)
        .where(eq(timeEntries.employeeId, Number(employeeId)))
    : await db.select().from(timeEntries);

  return c.json({ ok: true, data: rows } satisfies SuccessEnvelope<typeof rows>);
});

timeEntriesRouter.post("/", zValidator("json", createTimeEntrySchema), async (c) => {
  const lang = getLang(c.req.header("accept-language"));
  const body = c.req.valid("json");

  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, body.employeeId));

  if (!employee) {
    throw new AppError("EMPLOYEE_NOT_FOUND", 404, msg("EMPLOYEE_NOT_FOUND", lang));
  }

  if (employee.status === "inactive") {
    throw new AppError("EMPLOYEE_INACTIVE", 400, msg("EMPLOYEE_INACTIVE", lang));
  }

  const today = new Date().toISOString().split("T")[0];
  if (body.date > today) {
    throw new AppError("FUTURE_DATE_NOT_ALLOWED", 400, msg("FUTURE_DATE_NOT_ALLOWED", lang));
  }

  const weekStart = getWeekStart(body.date);
  const [approval] = await db
    .select()
    .from(weeklyApprovals)
    .where(
      and(
        eq(weeklyApprovals.employeeId, body.employeeId),
        eq(weeklyApprovals.weekStart, weekStart)
      )
    );

  if (approval?.status === "approved") {
    throw new AppError("TIME_ENTRY_LOCKED", 400, msg("TIME_ENTRY_LOCKED", lang));
  }

  const [entry] = await db
    .insert(timeEntries)
    .values({
      employeeId: body.employeeId,
      date: body.date,
      hours: body.hours,
    })
    .returning();

  return c.json({ ok: true, data: entry } satisfies SuccessEnvelope<typeof entry>, 201);
});

timeEntriesRouter.patch("/:id", zValidator("json", updateTimeEntrySchema), async (c) => {
  const lang = getLang(c.req.header("accept-language"));
  const id = Number(c.req.param("id"));
  const body = c.req.valid("json");

  const [entry] = await db
    .select()
    .from(timeEntries)
    .where(eq(timeEntries.id, id));

  if (!entry) {
    throw new AppError("TIME_ENTRY_NOT_FOUND", 404, msg("TIME_ENTRY_NOT_FOUND", lang));
  }

  const weekStart = getWeekStart(body.date ?? entry.date);
  const [approval] = await db
    .select()
    .from(weeklyApprovals)
    .where(
      and(
        eq(weeklyApprovals.employeeId, entry.employeeId),
        eq(weeklyApprovals.weekStart, weekStart)
      )
    );

  if (approval?.status === "approved") {
    throw new AppError("TIME_ENTRY_LOCKED", 400, msg("TIME_ENTRY_LOCKED", lang));
  }

  if (body.date) {
    const today = new Date().toISOString().split("T")[0];
    if (body.date > today) {
      throw new AppError("FUTURE_DATE_NOT_ALLOWED", 400, msg("FUTURE_DATE_NOT_ALLOWED", lang));
    }
  }

  const [updated] = await db
    .update(timeEntries)
    .set(body)
    .where(eq(timeEntries.id, id))
    .returning();

  return c.json({ ok: true, data: updated } satisfies SuccessEnvelope<typeof updated>);
});

timeEntriesRouter.delete("/:id", async (c) => {
  const lang = getLang(c.req.header("accept-language"));
  const id = Number(c.req.param("id"));

  const [entry] = await db
    .select()
    .from(timeEntries)
    .where(eq(timeEntries.id, id));

  if (!entry) {
    throw new AppError("TIME_ENTRY_NOT_FOUND", 404, msg("TIME_ENTRY_NOT_FOUND", lang));
  }

  const weekStart = getWeekStart(entry.date);
  const [approval] = await db
    .select()
    .from(weeklyApprovals)
    .where(
      and(
        eq(weeklyApprovals.employeeId, entry.employeeId),
        eq(weeklyApprovals.weekStart, weekStart)
      )
    );

  if (approval?.status === "approved") {
    throw new AppError("TIME_ENTRY_LOCKED", 400, msg("TIME_ENTRY_LOCKED", lang));
  }

  await db.delete(timeEntries).where(eq(timeEntries.id, id));

  return c.json({ ok: true, data: { id } } satisfies SuccessEnvelope<{ id: number }>);
});
