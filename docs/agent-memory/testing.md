# Testing Memory

Use this file for testing strategy lessons and recurring test setup patterns.

## Entry Template
- Date:
- Task:
- Tests added/updated:
- What was validated:
- Gaps or follow-up:

## Notes
- Prefer targeted tests during iteration.
- Run full suite before merge.
- Update only when this category is impacted by a task.

- Date: 2026-08-18
- Task: Admin and user views
- Tests added/updated: `tests/middleware/requireAuth.test.ts`, `tests/middleware/requireAdmin.test.ts`, `tests/routes/jobRoleRoute.test.ts`, and frontend `tests/authApiService.test.ts`/`tests/index.test.ts`.
- What was validated: valid role propagation, missing-role rejection, Admin-only API guard, Admin/User header visibility, and full backend regression suite.
- Gaps or follow-up: Backend build needs the declared `@types/jsonwebtoken` dependency installed in the local environment; frontend lint still reports existing generated `dist` warnings.

- Date: 2026-08-19
- Task: US-051 admin application review and hiring decisions
- Tests added/updated: `tests/services/applicationService.test.ts`, `tests/controllers/jobRoleController.test.ts`, and route/controller coverage for admin role-detail enrichment and hire/reject actions.
- What was validated: admin-only `applications` data in job-role detail response, successful hire/reject transitions, stale-state conflict handling, missing-role/application rejection, and full backend regression suite.
- Gaps or follow-up: `npm run lint` is still blocked by generated coverage CSS warnings in `coverage/base.css`, which are not part of the app source and should be excluded from repo linting if this becomes a regular issue.

- Date: 2026-08-12
- Task: Job roles pagination
- Tests added/updated: `tests/services/jobRoleService.test.ts`, `tests/controllers/jobRoleController.test.ts`, `tests/routes/jobRoleRoute.test.ts`.
- What was validated: default limit/offset behavior, query param parsing, invalid pagination input handling (400), link generation for first/previous/next/last, `start` alias support.
- Gaps or follow-up: Frontend list-page link rendering is not in this repository and must be implemented in the UI project.

- Date: 2026-08-13
- Task: US-028 job role filtering
- Tests added/updated: `tests/middleware/requestParsers.test.ts` (new `parseOptionalString`/`parseStringList`/`parseOptionalDate`), `tests/services/jobRoleService.test.ts`, `tests/controllers/jobRoleController.test.ts`, `tests/routes/jobRoleRoute.test.ts`.
- What was validated: each filter param, repeated vs single name params, case-insensitive text intent, date range, combined filters, invalid values silently ignored (no 400), and pagination bypass returning all rows with null previous/next links.
- Gaps or follow-up: No DB-integration test for the built Prisma `where` (DAO covered via service/route mocks). Consider a DAO-level test if query shape regresses.

- Date: 2026-08-17
- Task: US-029 job role ordering
- Tests added/updated: `tests/routes/jobRoleRoute.test.ts`, `tests/services/jobRoleService.test.ts`, `tests/dao/jobRoleDaoImpl.test.ts`.
- What was validated: all six fields in both directions, omitted/invalid/repeated/incomplete params, pagination-link preservation, filtered and paginated forwarding, scalar/relation/date Prisma clauses, default order, and stable ID tie-breaking.
- Gaps or follow-up: No live PostgreSQL collation integration test; exact case/locale ordering follows the configured database collation.
- Task: US-050 apply for role
- Tests added/updated: `tests/services/applicationService.test.ts`, `tests/controllers/applicationController.test.ts`, `tests/routes/applicationRoute.test.ts`.
- What was validated: eligible creation, `IN_PROGRESS` response, closed/zero-position rejection, duplicate rejection, invalid CV body, authenticated route wiring, and route success response. Full suite passed with 12 files and 85 tests.
- Gaps or follow-up: Prisma migration could not be applied because PostgreSQL was unavailable at `localhost:5432`; run the migration when the database is available.
