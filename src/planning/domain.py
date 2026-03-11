from __future__ import annotations

from dataclasses import dataclass, field
from hashlib import sha1
from typing import Iterable


def _stable_id(seed: str) -> str:
    return sha1(seed.encode("utf-8")).hexdigest()[:8]


@dataclass(frozen=True)
class BacklogItem:
    title: str
    description: str
    priority: str = "P2"
    stable_id: str | None = None

    def id(self) -> str:
        return self.stable_id or _stable_id(f"backlog:{self.title}")


@dataclass(frozen=True)
class RefinementItem:
    title: str
    notes: str
    owner: str = "Unassigned"
    stable_id: str | None = None

    def id(self) -> str:
        return self.stable_id or _stable_id(f"refinement:{self.title}")


@dataclass(frozen=True)
class ScopeItem:
    name: str
    rationale: str
    in_scope: bool = True
    stable_id: str | None = None

    def id(self) -> str:
        return self.stable_id or _stable_id(f"scope:{self.name}")


@dataclass(frozen=True)
class RequirementItem:
    requirement: str
    acceptance_criteria: str
    stable_id: str | None = None

    def id(self) -> str:
        return self.stable_id or _stable_id(f"requirements:{self.requirement}")


@dataclass(frozen=True)
class ClarificationItem:
    question: str
    context: str
    stable_id: str | None = None

    def id(self) -> str:
        return self.stable_id or _stable_id(f"clarification:{self.question}")


@dataclass(frozen=True)
class PlanningBundle:
    project_name: str
    backlog: Iterable[BacklogItem] = field(default_factory=list)
    refinement: Iterable[RefinementItem] = field(default_factory=list)
    scope: Iterable[ScopeItem] = field(default_factory=list)
    requirements: Iterable[RequirementItem] = field(default_factory=list)
    clarifications: Iterable[ClarificationItem] = field(default_factory=list)
