# Decisions Memory

Use this file for approved technical decisions and their rationale.

## Entry Template
- Date:
- Task:
- Decision:
- Alternatives considered:
- Rationale:
- Consequences:

## Notes
- Include only decisions that affect future work.

- Date: 2026-08-12
- Task: Job roles pagination
- Decision: GET /api/job-roles now supports query params `limit` and `offset` with `start` as alias; response returns `{ data, total, limit, offset, links }`.
- Alternatives considered: Keep plain array response and expose pagination via headers only.
- Rationale: UI needs first/previous/next/last navigation data in payload and backend must avoid unbounded result sets.
- Consequences: Consumers of GET /api/job-roles should read `data` and `links` instead of assuming array root.
- Update only when this category is impacted by a task.
