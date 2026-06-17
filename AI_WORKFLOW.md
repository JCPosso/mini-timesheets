# AI Workflow

## Tools used

**Claude Code** (CLI) — primary development driver throughout this project.

## How I drive AI in day-to-day development

### Spec-first, then implement

Before writing code I create or reference a spec (in this case the assessment document itself). When starting a new feature I describe the domain rules and constraints upfront, so the AI doesn't have to guess invariants — it knows about the 40h overtime threshold, the approval locking semantics, and the soft-delete requirement from the beginning.

### CLAUDE.md as a persistent project brain

`CLAUDE.md` at the repo root is loaded automatically by Claude Code on every session. It contains:
- Architecture rules that must not be broken (e.g. no overtime logic outside `shared`, no hard deletes)
- File structure so the AI navigates the monorepo correctly
- Domain rules spelled out explicitly (week boundaries, approval state machine, validation ranges)
- Commands for common operations

This means I don't have to re-explain context each session — the AI starts with a full picture.

### Gradual commits as checkpoints

I commit after each coherent unit of work (shared package, API, web). This gives the AI clear rollback points and keeps diffs reviewable. It also signals intent — a commit message like `feat(shared): add overtime calculation with tests` tells the AI what was proven to work.

### Validation at both layers

I explicitly instructed the AI to use the shared Zod schemas on both the API (via `@hono/zod-validator`) and the web (before mutation calls). This prevents the API from being the only guard, and keeps validation logic in one place.

### AI artifacts committed as-is

Per the assessment instructions, `CLAUDE.md` and this file are committed without cleanup. The iteration history — including the initial test assertion that was wrong (22.995 vs 23) caught by running Vitest — is part of the authentic workflow.

## What AI handled well in this project

- Scaffolding the monorepo structure and wiring pnpm workspaces
- Writing the Drizzle schema and generating migrations
- Implementing the error envelope consistently across all routes
- Building the React Query hooks with correct cache invalidation keys
- Writing the overtime unit tests including edge cases (exactly 40h, decimal hours)

## Where I stayed in the loop

- Approving each step before moving to the next
- Catching the incorrect test assertion and fixing it
- Deciding to use SQLite over PostgreSQL (simpler setup for an assessment, explicitly allowed)
- Choosing web over mobile (stronger foundation, less risk)
- Writing the WRITEUP.md entirely without AI assistance (as required)
