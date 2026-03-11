from __future__ import annotations

from pathlib import Path
from string import Template
from typing import Iterable

from .domain import (
    BacklogItem,
    ClarificationItem,
    PlanningBundle,
    RefinementItem,
    RequirementItem,
    ScopeItem,
)

TEMPLATE_ROOT = Path(__file__).resolve().parent.parent / "templates"

REQUIRED_EXPORT_PATHS = (
    "planning/backlog.md",
    "planning/refinement/overview.md",
    "planning/scope.md",
    "planning/requirements.md",
    "planning/clarification.md",
    "AGENTS.md",
    ".agents/skills/project-planning/SKILL.md",
    ".agents/skills/project-planning/templates/backlog.template.md",
    ".agents/skills/project-planning/templates/refinement.template.md",
    ".agents/skills/project-planning/templates/scope.template.md",
    ".agents/skills/project-planning/templates/requirements.template.md",
    ".agents/skills/project-planning/templates/clarification.template.md",
)


def _load_template(name: str) -> Template:
    path = TEMPLATE_ROOT / name
    try:
        return Template(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise FileNotFoundError(
            f"Template '{name}' was not found under template root '{TEMPLATE_ROOT}'."
        ) from exc
    except UnicodeDecodeError as exc:
        raise ValueError(
            f"Template '{name}' under '{TEMPLATE_ROOT}' could not be decoded as UTF-8."
        ) from exc


def _section_block(section_id: str, body: str) -> str:
    return f"<!-- BEGIN GENERATED:{section_id} -->\n{body.rstrip()}\n<!-- END GENERATED:{section_id} -->\n"


def regenerate_document(existing: str | None, section_id: str, generated_body: str) -> str:
    """Regenerate one generated section while preserving user edits outside markers."""
    block = _section_block(section_id, generated_body)
    if not existing:
        return block

    begin = f"<!-- BEGIN GENERATED:{section_id} -->"
    end = f"<!-- END GENERATED:{section_id} -->"
    start_idx = existing.find(begin)
    end_idx = existing.find(end)

    if start_idx == -1 or end_idx == -1 or end_idx < start_idx:
        suffix = "\n" if existing.endswith("\n") else "\n\n"
        return f"{existing}{suffix}{block}"

    end_idx += len(end)
    while end_idx < len(existing) and existing[end_idx] in "\r\n":
        end_idx += 1

    return f"{existing[:start_idx]}{block}{existing[end_idx:]}"


def _render_backlog(items: Iterable[BacklogItem]) -> str:
    rows = [f"### [{i.id()}] {i.title}\n- Priority: {i.priority}\n- Description: {i.description}" for i in items]
    return "\n\n".join(rows) if rows else "_No backlog items._"


def _render_refinement(items: Iterable[RefinementItem]) -> str:
    rows = [f"### [{i.id()}] {i.title}\n- Owner: {i.owner}\n- Notes: {i.notes}" for i in items]
    return "\n\n".join(rows) if rows else "_No refinement items._"


def _render_scope(items: Iterable[ScopeItem]) -> str:
    rows = [
        f"### [{i.id()}] {i.name}\n- Status: {'In Scope' if i.in_scope else 'Out of Scope'}\n- Rationale: {i.rationale}"
        for i in items
    ]
    return "\n\n".join(rows) if rows else "_No scope decisions._"


def _render_requirements(items: Iterable[RequirementItem]) -> str:
    rows = [
        f"### [{i.id()}] {i.requirement}\n- Acceptance Criteria: {i.acceptance_criteria}"
        for i in items
    ]
    return "\n\n".join(rows) if rows else "_No requirements yet._"


def _render_clarifications(items: Iterable[ClarificationItem]) -> str:
    rows = [f"### [{i.id()}] {i.question}\n- Context: {i.context}" for i in items]
    return "\n\n".join(rows) if rows else "_No open clarifications._"


def ensure_required_paths(root: Path) -> None:
    for rel_path in REQUIRED_EXPORT_PATHS:
        (root / rel_path).parent.mkdir(parents=True, exist_ok=True)


def _write_planning_file(root: Path, rel_path: str, template_name: str, project_name: str, section_id: str, generated_body: str) -> None:
    target = root / rel_path
    template = _load_template(template_name)
    if target.exists():
        content = regenerate_document(target.read_text(encoding="utf-8"), section_id, generated_body)
    else:
        content = template.substitute(project_name=project_name, generated_section=_section_block(section_id, generated_body))
    target.write_text(content, encoding="utf-8")


def export_planning_bundle(root: Path, bundle: PlanningBundle) -> dict[str, Path]:
    ensure_required_paths(root)

    _write_planning_file(root, "planning/backlog.md", "planning.backlog.md.tmpl", bundle.project_name, "backlog", _render_backlog(bundle.backlog))
    _write_planning_file(
        root,
        "planning/refinement/overview.md",
        "planning.refinement.overview.md.tmpl",
        bundle.project_name,
        "refinement",
        _render_refinement(bundle.refinement),
    )
    _write_planning_file(root, "planning/scope.md", "planning.scope.md.tmpl", bundle.project_name, "scope", _render_scope(bundle.scope))
    _write_planning_file(
        root,
        "planning/requirements.md",
        "planning.requirements.md.tmpl",
        bundle.project_name,
        "requirements",
        _render_requirements(bundle.requirements),
    )
    _write_planning_file(
        root,
        "planning/clarification.md",
        "planning.clarification.md.tmpl",
        bundle.project_name,
        "clarification",
        _render_clarifications(bundle.clarifications),
    )

    static_exports = {
        "AGENTS.md": _load_template("AGENTS.md.tmpl").substitute(project_name=bundle.project_name),
        ".agents/skills/project-planning/SKILL.md": _load_template("skill.project-planning.md.tmpl").substitute(
            project_name=bundle.project_name
        ),
        ".agents/skills/project-planning/templates/backlog.template.md": _load_template("skill.backlog.template.md.tmpl").template,
        ".agents/skills/project-planning/templates/refinement.template.md": _load_template("skill.refinement.template.md.tmpl").template,
        ".agents/skills/project-planning/templates/scope.template.md": _load_template("skill.scope.template.md.tmpl").template,
        ".agents/skills/project-planning/templates/requirements.template.md": _load_template("skill.requirements.template.md.tmpl").template,
        ".agents/skills/project-planning/templates/clarification.template.md": _load_template("skill.clarification.template.md.tmpl").template,
    }

    for rel_path, content in static_exports.items():
        (root / rel_path).write_text(content, encoding="utf-8")

    return {rel_path: root / rel_path for rel_path in REQUIRED_EXPORT_PATHS}
