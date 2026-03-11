# Architecture

## Purpose
`super-brain` converts incomplete project briefs into deterministic planning artifacts and handoff assets.

## Core domain services
- `BriefAnalysisService`: parses a raw brief into sections, summary, and critical gap list.
- `ClarificationService`: runs strict question sequencing to close unresolved gaps.
- `RequirementsService`, `RefinementService`, `BacklogService`: derive ordered planning artifacts from shared context.
- `PlanQualityService`: scores artifact quality and flags rule violations.
- `AgentHandoffService`: emits deterministic `AGENTS.md`, `SKILL.md`, and supporting files.
- `ExportService`: writes generated files with safe-write/regenerate/overwrite semantics.

## Data flow
1. Parse input brief and identify missing mandatory sections/topics.
2. Run clarification workflow until required answers are complete.
3. Build requirements/refinement/backlog artifacts with deterministic ordering.
4. Evaluate quality constraints and issue severity.
5. Generate AGENTS/SKILL handoff bundle.
6. Export artifacts based on selected write mode.

## Determinism constraints
- Work items are ordered dependency-first, then priority, then title.
- Markdown sections in generated handoff files are emitted in fixed order.
- Export behavior is mode-driven and test-covered to avoid non-deterministic writes.
