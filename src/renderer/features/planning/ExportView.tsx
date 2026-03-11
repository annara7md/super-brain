import { FormEvent, useState } from "react";
import { ExportMode } from "./types";

type ExportViewProps = {
  defaultDestination?: string;
  defaultMode?: ExportMode;
  onExport: (options: { destination: string; mode: ExportMode }) => void;
};

export function ExportView({
  defaultDestination = "",
  defaultMode = "overwrite",
  onExport,
}: ExportViewProps) {
  const [destination, setDestination] = useState(defaultDestination);
  const [mode, setMode] = useState<ExportMode>(defaultMode);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onExport({
      destination: destination.trim(),
      mode,
    });
  };

  return (
    <section aria-labelledby="export-title">
      <h2 id="export-title">4. Export plan</h2>
      <p>Select the destination folder and choose whether to overwrite or update files.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="planning-destination">Destination folder</label>
        <input
          id="planning-destination"
          type="text"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="/path/to/planning-output"
          required
        />

        <fieldset>
          <legend>Write mode</legend>
          <label>
            <input
              type="radio"
              name="export-mode"
              checked={mode === "overwrite"}
              onChange={() => setMode("overwrite")}
            />
            Overwrite existing files
          </label>
          <label>
            <input
              type="radio"
              name="export-mode"
              checked={mode === "update"}
              onChange={() => setMode("update")}
            />
            Update changed files only
          </label>
        </fieldset>

        <button type="submit" disabled={!destination.trim()}>
          Export artifacts
        </button>
      </form>
    </section>
  );
}
