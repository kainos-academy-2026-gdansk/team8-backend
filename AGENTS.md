# AGENTS.md

## Purpose
This file defines the team agent workflow for this repository.
The goals are predictable delivery, transparent decisions, and safe changes.

## Scope
- This workflow applies to backend implementation work in this repository.
- The agent must follow the repository architecture: routes -> controllers -> services -> dao.
- The agent must keep Prisma changes, tests, and logging aligned with existing conventions.

## Required Workflow
1. Memory
2. Fetch user story / task context
3. Plan
4. Implement
5. Validate
6. Local agent review
7. Manual verification by developer
8. Retrospective

## Workflow Rules

### 1) Memory
- Read repository memory before planning:
  - docs/agent-memory/general.md
  - docs/agent-memory/patterns.md
  - docs/agent-memory/decisions.md
  - docs/agent-memory/testing.md
- Use memory to avoid repeating known mistakes.

### 2) Fetch User Story / Task Context
- Primary source: task provided in chat.
- Optional source: attached CSV + story number if the user provides it.
- If workflow phase is missing, ask which task/phase to run.
- If required task context is missing, stop and ask.

### 3) Plan (Chatty Mode)
- Planning must be conversational, not a one-shot dump.
- The plan must include:
  - assumptions
  - open questions
  - impacted files
  - test strategy (targeted first, full suite before merge)
  - validation commands
  - risks and rollback notes
- If anything is unclear, ask questions before implementation.

### 4) Approval Gate for New Inventions
- Any new behavior that is not clearly requested requires approval before implementation.
- Approval is required for:
  - new endpoint contracts
  - schema/model shape changes
  - new architectural patterns
  - new third-party dependencies
  - major refactors
- If approval is missing, stop and ask.

### 5) Implement
- Keep changes minimal and scoped to the task.
- Preserve project conventions (TypeScript strict mode, Biome lint, Prisma patterns).
- Respect layering and dependency direction.

### 6) Validate
- Run targeted tests first for changed behavior.
- Run full suite before merge.
- Standard commands:
  - npm run lint
  - npm test (targeted where possible)
  - npm test (full suite before merge)
- For Prisma schema changes:
  - validate migration status
  - ensure generated client is current

### 7) Local Agent Review
- Produce findings first, ordered by severity.
- Focus review on:
  - behavior regressions
  - error handling and status codes
  - validation and security
  - Prisma query correctness
  - test sufficiency
- If critical issues exist, return to Plan before handover.

### 8) Manual Verification by Developer
- Provide a short manual verification checklist:
  - endpoint or flow to verify
  - expected results
  - edge-case checks

### 9) Retrospective
- Run retrospective after every task.
- Update only memory files impacted by the task.
- Record:
  - what changed
  - what worked or failed
  - follow-up actions

## Repository Memory (Committed Team Files)
- docs/agent-memory/general.md
- docs/agent-memory/patterns.md
- docs/agent-memory/decisions.md
- docs/agent-memory/testing.md

## Custom Agents
- Read workflow planner agent: .github/agents/read-workflow.agent.md
- Write workflow executor agent: .github/agents/write-workflow.agent.md

## Copilot Review Instructions
- Repository-level Copilot instructions live in:
  - .github/copilot-instructions.md
  - .github/copilot-review-instructions.md
- For review tasks, findings must be the primary output.
