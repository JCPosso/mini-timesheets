import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createEmployeeSchema, updateEmployeeSchema } from "@mini-timesheets/shared";
import { db } from "../db/client";
import { employees } from "../db/schema";
import { AppError, type SuccessEnvelope } from "../errors";
import { getLang, msg } from "../i18n/messages";

export const employeesRouter = new Hono();

employeesRouter.get("/", async (c) => {
  const showInactive = c.req.query("showInactive") === "true";

  const rows = await db
    .select()
    .from(employees)
    .where(showInactive ? undefined : eq(employees.status, "active"));

  return c.json({ ok: true, data: rows } satisfies SuccessEnvelope<typeof rows>);
});

employeesRouter.post("/", zValidator("json", createEmployeeSchema), async (c) => {
  const body = c.req.valid("json");

  const [employee] = await db
    .insert(employees)
    .values({
      firstName: body.firstName,
      lastName: body.lastName,
      hourlyRate: body.hourlyRate,
      status: "active",
    })
    .returning();

  return c.json({ ok: true, data: employee } satisfies SuccessEnvelope<typeof employee>, 201);
});

employeesRouter.get("/:id", async (c) => {
  const lang = getLang(c.req.header("accept-language"));
  const id = Number(c.req.param("id"));

  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  if (!employee) {
    throw new AppError("EMPLOYEE_NOT_FOUND", 404, msg("EMPLOYEE_NOT_FOUND", lang));
  }

  return c.json({ ok: true, data: employee } satisfies SuccessEnvelope<typeof employee>);
});

employeesRouter.patch("/:id", zValidator("json", updateEmployeeSchema), async (c) => {
  const lang = getLang(c.req.header("accept-language"));
  const id = Number(c.req.param("id"));
  const body = c.req.valid("json");

  const [existing] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  if (!existing) {
    throw new AppError("EMPLOYEE_NOT_FOUND", 404, msg("EMPLOYEE_NOT_FOUND", lang));
  }

  const [updated] = await db
    .update(employees)
    .set(body)
    .where(eq(employees.id, id))
    .returning();

  return c.json({ ok: true, data: updated } satisfies SuccessEnvelope<typeof updated>);
});

employeesRouter.post("/:id/deactivate", async (c) => {
  const lang = getLang(c.req.header("accept-language"));
  const id = Number(c.req.param("id"));

  const [existing] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  if (!existing) {
    throw new AppError("EMPLOYEE_NOT_FOUND", 404, msg("EMPLOYEE_NOT_FOUND", lang));
  }

  const [updated] = await db
    .update(employees)
    .set({ status: "inactive", deactivatedAt: new Date().toISOString() })
    .where(eq(employees.id, id))
    .returning();

  return c.json({ ok: true, data: updated } satisfies SuccessEnvelope<typeof updated>);
});

employeesRouter.post("/:id/reactivate", async (c) => {
  const lang = getLang(c.req.header("accept-language"));
  const id = Number(c.req.param("id"));

  const [existing] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  if (!existing) {
    throw new AppError("EMPLOYEE_NOT_FOUND", 404, msg("EMPLOYEE_NOT_FOUND", lang));
  }

  const [updated] = await db
    .update(employees)
    .set({ status: "active", deactivatedAt: null })
    .where(eq(employees.id, id))
    .returning();

  return c.json({ ok: true, data: updated } satisfies SuccessEnvelope<typeof updated>);
});
