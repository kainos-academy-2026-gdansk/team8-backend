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

- Date: 2026-08-13
- Task: US-028 job role filtering
- Decision: GET /api/job-roles accepts optional filters (`roleName`, `location` case-insensitive contains; repeatable `capability`/`band`/`status` matched by relation name; `closingDateBefore`/`closingDateAfter` range). Invalid filter values are silently dropped (never 400). When any filter is active, pagination is bypassed: all matching rows returned with `offset=0`, `limit=total=data.length`, `links.previous=links.next=null`.
- Alternatives considered: 400 on invalid filters; keeping pagination while filtering.
- Rationale: Applicants need complete filtered result sets; lenient parsing keeps the UI resilient to stray query params.
- Consequences: Filtered responses can be unbounded (accepted at current scale); pagination params are still validated (400) even when ignored due to filtering.

- Date: 2026-08-17
- Task: US-029 job role ordering
- Decision: GET /api/job-roles accepts paired `sortBy`/`sortOrder` parameters. Sortable fields are `roleName`, `location`, `capability`, `band`, `closingDate`, and `status`; directions are `asc`/`desc`. Invalid, repeated, or incomplete ordering returns 400. Relations sort by name, dates chronologically, and explicit ordering uses `id asc` as a stable tie-breaker.
- Alternatives considered: Single signed sort parameter; lenient invalid-input handling; in-memory service sorting.
- Rationale: A typed API contract supports UI and direct API consumers while keeping pagination deterministic and database-backed.
- Consequences: Omitting both parameters retains default `id asc`; pagination links preserve active ordering.
- Update only when this category is impacted by a task.
