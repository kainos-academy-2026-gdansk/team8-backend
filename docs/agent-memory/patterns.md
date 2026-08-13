# Patterns Memory

Use this file for coding and architecture patterns that should be repeated.

## Entry Template
- Date:
- Task:
- Pattern:
- Why it works here:
- Example files:

## Notes
- Record stable patterns, not one-off choices.

- Date: 2026-08-13
- Task: Slim job role controller by extracting request parsing
- Pattern: Put HTTP query/path parsing and validation in route middleware, then pass normalized values via `res.locals` to controller.
- Why it works here: Keeps controller focused on orchestration (service call + response mapping), while preserving existing API contract and status codes.
- Example files: `src/middleware/jobRoleRequestParsers.ts`, `src/routes/jobRoleRouter.ts`, `src/controllers/jobRoleController.ts`

- Date: 2026-08-13
- Task: US-028 job role filtering
- Pattern: Define list-query filter types in the DAO layer (`jobRoleDao.ts`) and re-export from the service; build the Prisma `where` in a single DAO helper shared by `getAll`/`countAll`. DAO `getAll` takes `{ pagination?, filters? }` so callers omit `take`/`skip` to fetch all rows.
- Why it works here: Keeps dependency direction routes->controllers->services->dao intact (types flow up via re-export), centralizes `where` construction to avoid filter/count drift, and lets the service toggle pagination bypass without leaking Prisma into upper layers.
- Example files: `src/dao/jobRoleDao.ts`, `src/dao/jobRoleDaoImpl.ts`, `src/services/jobRoleService.ts`, `src/middleware/requestParsers.ts`
- Update only when this category is impacted by a task.
