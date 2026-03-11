import { FormEvent, useMemo, useState } from "react";
import { RegenerationOption } from "./types";

type RegenerateUpdateViewProps = {
  availableArtifacts: RegenerationOption[];
  defaultPlanningFolder?: string;
  onRun: (options: { planningFolder: string; selectedArtifactIds: string[] }) => void;
};

export function RegenerateUpdateView({
  availableArtifacts,
  defaultPlanningFolder = "",
  onRun,
}: RegenerateUpdateViewProps) {
  const [planningFolder, setPlanningFolder] = useState(defaultPlanningFolder);
  const [artifactSelections, setArtifactSelections] =
    useState<RegenerationOption[]>(availableArtifacts);

  const selectedArtifactIds = useMemo(
    () => artifactSelections.filter((item) => item.selected).map((item) => item.id),
    [artifactSelections],
  );

  const toggleArtifact = (id: string) => {
    setArtifactSelections((existing) =>
      existing.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRun({
      planningFolder: planningFolder.trim(),
      selectedArtifactIds,
    });
  };

  return (
    <section aria-labelledby="regenerate-title">
      <h2 id="regenerate-title">5. Regenerate / update</h2>
      <p>Load an existing planning folder and regenerate selected artifacts only.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="planning-folder">Planning folder</label>
        <input
          id="planning-folder"
          type="text"
          value={planningFolder}
          onChange={(event) => setPlanningFolder(event.target.value)}
          placeholder="/path/to/existing/planning"
          required
        />

        <fieldset>
          <legend>Artifacts to regenerate</legend>
          {artifactSelections.map((artifact) => (
            <label key={artifact.id}>
              <input
                type="checkbox"
                checked={artifact.selected}
                onChange={() => toggleArtifact(artifact.id)}
              />
              {artifact.label}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled={!planningFolder.trim() || selectedArtifactIds.length === 0}
        >
          Regenerate selected
        </button>
      </form>
    </section>
  );
}
