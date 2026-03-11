# super-brain

Deterministic planning toolkit for turning partial briefs into prioritized delivery artifacts and agent handoff bundles.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run tests:
   ```bash
   npm test
   ```

## Architecture
- Domain models in `src/domain/models` define contracts for analysis, planning, quality, handoff, and export.
- Stateless services in `src/domain/services` perform deterministic transformations.
- Fixtures in `fixtures/briefs` provide small/medium/large multi-domain brief inputs with known missing information.
- A sample generated bundle in `fixtures/generated/sample-output-bundle` demonstrates target AGENTS/SKILL/reference/template output.

For more detail, see [architecture.md](./architecture.md).

## Workflow
1. **Analyze brief** with `BriefAnalysisService` to extract sections and critical gaps.
2. **Clarify unresolved gaps** using `ClarificationService` sequential prompts.
3. **Generate plan artifacts** via requirements/refinement/backlog services.
4. **Evaluate quality** with `PlanQualityService` before export.
5. **Generate handoff bundle** (`AGENTS.md`, `SKILL.md`, references, templates).
6. **Export artifacts** with `ExportService` in `safe-write`, `regenerate`, or `overwrite` mode.

## Constraints
- Output ordering must remain deterministic across runs.
- Required section/topic gaps must be explicitly surfaced before plan generation.
- Refinement artifacts must enforce fallback acceptance criteria when missing.
- Export modes must obey mode-specific overwrite/conflict semantics.
- Markdown structure for AGENTS/SKILL files must stay section-stable to support automated checks.

## Quality assets included
- Tests for brief parsing/gap detection, clarification sequencing, backlog/refinement generation, AGENTS/SKILL generation, and export overwrite behavior.
- Fixtures for small, medium, and large multi-domain briefs with intentionally missing details.
- Sample generated output bundle under `fixtures/generated/sample-output-bundle`.
