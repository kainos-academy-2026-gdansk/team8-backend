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
