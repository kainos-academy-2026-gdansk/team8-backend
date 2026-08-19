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

- Date: 2026-08-17
- Task: US-050 apply for role
- Decision: Applications use `POST /api/job-roles/:id/applications` with `{ cv: string }`. Existing `USER` accounts are applicants; eligible roles require status `OPEN` and more than zero open positions. Applications start at `IN_PROGRESS`, are unique per user/job role, return `409` for ineligible or duplicate submissions, and do not decrement open positions.
- Alternatives considered: A new applicant role, repeated applications, multipart CV upload, and decrementing positions on submission.
- Rationale: Matches the approved story baseline while keeping future CV storage changes isolated.
- Consequences: The frontend must implement the apply and CV pages in its own repository; the backend stores the CV as text until a later migration.

- Date: 2026-08-19
- Task: US-051 admin application review and hiring decisions
- Decision: Admins can fetch a role detail response with embedded `applications` data using the applicant email as the public username label, and can transition `IN_PROGRESS` applications via `PATCH /api/job-roles/:jobRoleId/applications/:applicationId/hire` and `/reject`.
- Alternatives considered: exposing applicant lists to all authenticated users or performing non-atomic status/position updates.
- Rationale: Recruitment admins need a safe review workflow without leaking CV data to regular users; the backend must guard stale state and concurrent hire attempts.
- Consequences: Only queried admins receive `applications` on the role-detail response, while non-admin requests keep the existing payload. Hire decrements one open position and sets `HIRED`; reject sets `REJECTED` without changing positions.
