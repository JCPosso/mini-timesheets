import { zValidator } from "@hono/zod-validator";
import { and, between, eq } from "drizzle-orm";
import { Hono } from "hono";
import {
  approvalActionSchema,
  calculateWeeklyPay,
  weekParamSchema,
  type WeeklySummary,
} from "@mini-timesheets/shared";
import { db } from "../db/client";
import { employees, timeEntries, weeklyApprovals } from "../db/schema";
import { AppError, type SuccessEnvelope } from "../errors";
import { getLang, msg } from "../i18n/messages";
import { getWeekEnd, getWeekStart } from "../utils/date";

export const weeklyRouter = new Hono();

weeklyRouter.get("/", zValidator("query", weekParamSchema), async (c) => {
  const { weekStart } = c.req.valid("query");
  const weekEnd = getWeekEnd(weekStart);

  const allEmployees = await db.select().from(employees);
  const weekEntries = await db
    .select()
    .from(timeEntries)
    .where(between(timeEntries.date, weekStart, weekEnd));
  const weekApprovals = await db
    .select()
    .from(weeklyApprovals)
    .where(eq(weeklyApprovals.weekStart, weekStart));

  const summaries: WeeklySummary[] = allEmployees.map((employee) => {
    const empEntries = weekEntries.filter((e) => e.employeeId === employee.id);
    const totalHours = empEntries.reduce((sum, e) => sum + e.hours, 0);
    const pay = calculateWeeklyPay(totalHours, employee.hourlyRate);
    const approval =
      weekApprovals.find((a) => a.employeeId === employee.id) ?? null;

    return {
      employee,
      weekStart,
      ...pay,
      approval,
      entries: empEntries,
    };
  });

  return c.json({ ok: true, data: summaries } satisfies SuccessEnvelope<WeeklySummary[]>);
});

weeklyRouter.post(
  "/:employeeId/approve",
  zValidator("query", weekParamSchema),
  zValidator("json", approvalActionSchema),
  async (c) => {
    const lang = getLang(c.req.header("accept-language"));
    const employeeId = Number(c.req.param("employeeId"));
    const { weekStart } = c.req.valid("query");
    const { action } = c.req.valid("json");

    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId));

    if (!employee) {
      throw new AppError("EMPLOYEE_NOT_FOUND", 404, msg("EMPLOYEE_NOT_FOUND", lang));
    }

    const [existing] = await db
      .select()
      .from(weeklyApprovals)
      .where(
        and(
          eq(weeklyApprovals.employeeId, employeeId),
          eq(weeklyApprovals.weekStart, weekStart)
        )
      );

    if (existing?.status === "approved") {
      throw new AppError("ALREADY_APPROVED", 409, msg("ALREADY_APPROVED", lang));
    }

    const now = new Date().toISOString();

    let approval;
    if (existing) {
      [approval] = await db
        .update(weeklyApprovals)
        .set({ status: action, updatedAt: now })
        .where(eq(weeklyApprovals.id, existing.id))
        .returning();
    } else {
      [approval] = await db
        .insert(weeklyApprovals)
        .values({
          employeeId,
          weekStart,
          status: action,
          updatedAt: now,
        })
        .returning();
    }

    return c.json({ ok: true, data: approval } satisfies SuccessEnvelope<typeof approval>);
  }
);

// Helper: get week start from any date in the week
weeklyRouter.get("/week-start", async (c) => {
  const date = c.req.query("date");
  if (!date) return c.json({ ok: true, data: { weekStart: getWeekStart(new Date().toISOString().split("T")[0]) } });
  return c.json({ ok: true, data: { weekStart: getWeekStart(date) } });
});
