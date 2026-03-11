from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from src.planning.domain import (
    BacklogItem,
    ClarificationItem,
    PlanningBundle,
    RefinementItem,
    RequirementItem,
    ScopeItem,
)
from src.planning.generator import REQUIRED_EXPORT_PATHS, export_planning_bundle


class GeneratorTests(unittest.TestCase):
    def test_exports_required_structure(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            bundle = PlanningBundle(project_name="Demo", backlog=[BacklogItem(title="Task", description="Do it")])
            output = export_planning_bundle(root, bundle)

            self.assertEqual(set(output.keys()), set(REQUIRED_EXPORT_PATHS))
            for rel in REQUIRED_EXPORT_PATHS:
                self.assertTrue((root / rel).exists(), rel)

    def test_regeneration_preserves_user_edits_and_stable_ids(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            item = BacklogItem(title="Stable", description="first")
            bundle = PlanningBundle(project_name="Demo", backlog=[item])
            export_planning_bundle(root, bundle)

            backlog = root / "planning/backlog.md"
            original = backlog.read_text(encoding="utf-8")
            backlog.write_text("User intro\n\n" + original, encoding="utf-8")

            bundle2 = PlanningBundle(project_name="Demo", backlog=[BacklogItem(title="Stable", description="updated")])
            export_planning_bundle(root, bundle2)
            updated = backlog.read_text(encoding="utf-8")

            self.assertIn("User intro", updated)
            self.assertIn(item.id(), updated)
            self.assertIn("updated", updated)

    def test_regeneration_for_other_item_classes_and_mixed_bundle(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            refinement = RefinementItem(title="Refine auth", notes="split tickets", owner="Alice")
            scope = ScopeItem(name="OAuth login", rationale="needed for SSO", in_scope=True)
            requirement = RequirementItem(requirement="Users can sign in", acceptance_criteria="Login succeeds")
            clarification = ClarificationItem(question="Need SCIM?", context="Enterprise setup")

            bundle = PlanningBundle(
                project_name="Demo",
                refinement=[refinement],
                scope=[scope],
                requirements=[requirement],
                clarifications=[clarification],
            )
            export_planning_bundle(root, bundle)

            target_files = [
                (root / "planning/refinement/overview.md", refinement.id(), "- user note", "updated notes", PlanningBundle(project_name="Demo", refinement=[RefinementItem(title="Refine auth", notes="updated notes", owner="Alice")])) ,
                (root / "planning/scope.md", scope.id(), "- user note", "updated rationale", PlanningBundle(project_name="Demo", scope=[ScopeItem(name="OAuth login", rationale="updated rationale", in_scope=False)])),
                (root / "planning/requirements.md", requirement.id(), "- user note", "Updated criteria", PlanningBundle(project_name="Demo", requirements=[RequirementItem(requirement="Users can sign in", acceptance_criteria="Updated criteria")])) ,
                (root / "planning/clarification.md", clarification.id(), "- user note", "Updated context", PlanningBundle(project_name="Demo", clarifications=[ClarificationItem(question="Need SCIM?", context="Updated context")])) ,
            ]

            for file_path, stable_id, intro, updated_text, updated_bundle in target_files:
                original = file_path.read_text(encoding="utf-8")
                file_path.write_text(f"{intro}\n\n{original}", encoding="utf-8")
                export_planning_bundle(root, updated_bundle)
                updated = file_path.read_text(encoding="utf-8")
                self.assertIn(intro, updated)
                self.assertIn(stable_id, updated)
                self.assertIn(updated_text, updated)

    def test_empty_bundle_and_explicit_stable_id_are_preserved(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            explicit_id_item = BacklogItem(title="Custom", description="initial", stable_id="BL-123")
            export_planning_bundle(root, PlanningBundle(project_name="Demo", backlog=[explicit_id_item]))

            backlog = root / "planning/backlog.md"
            original = backlog.read_text(encoding="utf-8")
            backlog.write_text("User intro\n\n" + original, encoding="utf-8")

            export_planning_bundle(root, PlanningBundle(project_name="Demo", backlog=[]))
            emptied = backlog.read_text(encoding="utf-8")
            self.assertIn("User intro", emptied)
            self.assertIn("_No backlog items._", emptied)

            export_planning_bundle(
                root,
                PlanningBundle(
                    project_name="Demo",
                    backlog=[BacklogItem(title="Custom renamed", description="updated", stable_id="BL-123")],
                ),
            )
            regenerated = backlog.read_text(encoding="utf-8")
            self.assertIn("User intro", regenerated)
            self.assertIn("BL-123", regenerated)
            self.assertIn("updated", regenerated)


if __name__ == "__main__":
    unittest.main()
