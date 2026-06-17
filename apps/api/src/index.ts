import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { AppError, type ErrorEnvelope } from "./errors";
import { employeesRouter } from "./routes/employees";
import { timeEntriesRouter } from "./routes/time-entries";
import { weeklyRouter } from "./routes/weekly";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: "*" }));

app.route("/api/employees", employeesRouter);
app.route("/api/time-entries", timeEntriesRouter);
app.route("/api/weekly", weeklyRouter);

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(
      { ok: false, code: err.code, message: err.message } satisfies ErrorEnvelope,
      err.status as 400 | 404 | 409 | 500
    );
  }

  console.error(err);
  return c.json(
    { ok: false, code: "INTERNAL_ERROR", message: "Internal server error." } satisfies ErrorEnvelope,
    500
  );
});

app.notFound((c) =>
  c.json({ ok: false, code: "INTERNAL_ERROR", message: "Not found." } satisfies ErrorEnvelope, 404)
);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});

export default app;
