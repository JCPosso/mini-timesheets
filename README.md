# Mini Timesheets

Timesheet tracker built for the OCMI Workers Comp Software Engineer L2 assessment.

## Stack

| Layer | Tech |
|---|---|
| Monorepo | pnpm workspaces |
| API | Hono + Drizzle + SQLite (better-sqlite3) |
| Web | Next.js 16 (App Router) + React Query + Tailwind |
| Shared | TypeScript + Zod (headless, no framework deps) |
| Tests | Vitest |

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 — install with `npm install -g pnpm`

## Setup from a fresh clone

```bash
# 1. Install all dependencies
pnpm install

# 2. Apply database migrations (creates timesheets.db inside apps/api/)
pnpm --filter @mini-timesheets/api db:migrate
```

## Running

```bash
# Start both API (port 3001) and web (port 3000) in parallel
pnpm dev
```

Or run each separately:

```bash
# API only
pnpm --filter @mini-timesheets/api dev

# Web only
pnpm --filter @mini-timesheets/web dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running tests

```bash
# All tests
pnpm test

# Shared package (overtime calculation unit tests)
pnpm --filter @mini-timesheets/shared test

# API (approval flow integration tests)
pnpm --filter @mini-timesheets/api test
```

## Project structure

```
mini-timesheets/
├── apps/
│   ├── api/          Hono REST API
│   │   ├── src/
│   │   │   ├── db/   Drizzle schema, migrations, client
│   │   │   ├── i18n/ Bilingual (en/es) error messages
│   │   │   ├── routes/  employees, time-entries, weekly
│   │   │   └── utils/   date helpers
│   │   └── drizzle.config.ts
│   └── web/          Next.js frontend
│       ├── app/
│       │   ├── employees/    Screen 1 — employee list + CRUD
│       │   ├── time-entries/ Screen 2 — time entry log
│       │   └── weekly/       Screen 3 — weekly summary + approval
│       └── lib/      API client, week helpers
└── packages/
    └── shared/       Types, Zod schemas, overtime calculation
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/employees` | List employees (`?showInactive=true`) |
| POST | `/api/employees` | Create employee |
| PATCH | `/api/employees/:id` | Update employee |
| POST | `/api/employees/:id/deactivate` | Soft-delete |
| POST | `/api/employees/:id/reactivate` | Re-activate |
| GET | `/api/time-entries` | List entries (`?employeeId=N`) |
| POST | `/api/time-entries` | Log time |
| PATCH | `/api/time-entries/:id` | Edit entry |
| DELETE | `/api/time-entries/:id` | Delete entry |
| GET | `/api/weekly` | Weekly summary (`?weekStart=YYYY-MM-DD`) |
| POST | `/api/weekly/:employeeId/approve` | Approve or reject a week (`?weekStart=YYYY-MM-DD`) |

All responses follow a consistent envelope:

```json
// Success
{ "ok": true, "data": { ... } }

// Error
{ "ok": false, "code": "EMPLOYEE_NOT_FOUND", "message": "Employee not found." }
```

Error messages are bilingual — send `Accept-Language: es` for Spanish.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `./timesheets.db` | SQLite file path (API) |
| `PORT` | `3001` | API port |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | API base URL (web) |
