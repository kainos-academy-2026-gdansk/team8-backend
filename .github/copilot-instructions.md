# Copilot Instructions

## Repository Context
- Backend API for internal job offers.
- Stack: TypeScript, Express, Prisma, PostgreSQL, Vitest, Biome.
- Architecture: routes -> controllers -> services -> dao.

## Working Rules
- Follow AGENTS workflow in AGENTS.md.
- Ask clarifying questions when requirements are unclear.
- Any new invented behavior requires explicit approval first.
- Keep changes minimal and focused.

## Planning Rules
- Plan in chatty mode.
- Include assumptions, questions, impacted files, risks, and validation.
- Prefer targeted tests first; run full suite before merge.

## Code Review Mode
When asked for a review:
- Provide findings first, ordered by severity.
- Prioritize bugs, regressions, missing validation, security issues, and test gaps.
- Keep summary short and secondary.
- If no findings, explicitly say so and call out residual risks.

## Review Checklist (Backend)
- API contracts and status codes are correct.
- Input validation and error mapping are safe and consistent.
- No sensitive data in logs.
- Service/controller/dao layering is respected.
- Prisma queries fetch only needed data and include relations intentionally.
- Tests cover happy path, failures, and edge cases for changed behavior.

## Validation Commands
- npm run lint
- targeted tests for changed area
- npm test before merge

## References
- Main review style guide: .github/copilot-review-instructions.md
- Workflow and approval gates: AGENTS.md
