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
- Update only when this category is impacted by a task.
