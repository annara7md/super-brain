from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from src.planning.domain import BacklogItem, PlanningBundle
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


if __name__ == "__main__":
    unittest.main()
