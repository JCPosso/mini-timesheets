# Mini Timesheets — Claude Code Instructions

## Project overview

Monorepo timesheet tracker for the OCMI Workers Comp technical assessment.

Stack:
- `packages/shared` — headless TypeScript: Zod schemas, types, overtime/pay calculation
- `apps/api` — Hono + Drizzle + SQLite (better-sqlite3), running on port 3001
- `apps/web` — Next.js 16 (App Router) + React Query + Tailwind, running on port 3000

Package manager: **pnpm workspaces** (required). Always use `pnpm` — never `npm` or `yarn`.

## Commands

```bash
# Install all deps from root
pnpm install

# Run both API and web in parallel
pnpm dev

# Run API only
pnpm --filter @mini-timesheets/api dev

# Run web only
pnpm --filter @mini-timesheets/web dev

# Run all tests
pnpm test

# Run shared tests only
pnpm --filter @mini-timesheets/shared test

# Run API tests only
pnpm --filter @mini-timesheets/api test

# Regenerate DB migrations (after schema changes)
pnpm --filter @mini-timesheets/api db:generate

# Apply migrations
pnpm --filter @mini-timesheets/api db:migrate
```

## Architecture rules (enforce strictly)

### shared package
- **Zero framework code**: no React imports, no `window`, no Node.js built-ins.
- Exports: types, Zod schemas, `calculateWeeklyPay()`.
- Overtime rule: hours > 40/week → overtime at 1.5× rate. Logic lives **only** here.
- Both `apps/api` and `apps/web` must import from `@mini-timesheets/shared`, never inline this logic.

### API
- All responses follow the error envelope: `{ ok: false, code, message }` or `{ ok: true, data }`.
- Error messages support i18n via `Accept-Language` header (en/es). Use `getLang()` + `msg()` from `src/i18n/messages.ts`.
- Soft delete for employees: set `status = 'inactive'` and `deactivatedAt`, never DELETE rows.
- Approved weekly entries are **locked**: reject any edit/delete with `TIME_ENTRY_LOCKED`.
- DB client is in `src/db/client.ts`; schema in `src/db/schema.ts`.

### Web
- All server state goes through React Query. Query keys: `["employees", showInactive]`, `["time-entries", employeeId]`, `["weekly", weekStart]`.
- Validation uses Zod schemas from `@mini-timesheets/shared` on the client before submitting.
- Week navigation uses helpers in `apps/web/lib/week.ts`.
- Week start = Monday (ISO week). Use `getWeekStart()` to compute from any date.

## Domain rules

- An employee week = Mon–Sun.
- Overtime = hours above 40 in a single week.
- Pay = `regularHours × rate + overtimeHours × rate × 1.5`.
- Approval statuses: `pending` → `approved` or `rejected`. Once `approved`, entries are locked.
- Inactive employees cannot receive new time entries.
- No future-dated time entries.
- Hours per entry: 0.25 – 24.

## File structure

```
mini-timesheets/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── db/          schema, client, migrate, migrations/
│   │   │   ├── i18n/        messages.ts
│   │   │   ├── routes/      employees.ts, time-entries.ts, weekly.ts
│   │   │   ├── utils/       date.ts
│   │   │   ├── errors.ts
│   │   │   └── index.ts
│   │   └── drizzle.config.ts
│   └── web/
│       ├── app/
│       │   ├── employees/   page.tsx
│       │   ├── time-entries/ page.tsx
│       │   └── weekly/      page.tsx
│       ├── components/      QueryProvider.tsx
│       └── lib/             api.ts, week.ts
└── packages/
    └── shared/
        └── src/             types.ts, schemas.ts, overtime.ts, index.ts
```

## Testing

- Unit tests for overtime: `packages/shared/src/overtime.test.ts`
- Integration tests for approval flow: `apps/api/src/routes/approval.test.ts`
- Test runner: Vitest in both packages.
- DB for API tests: in-memory SQLite (`:memory:`), never the file DB.
