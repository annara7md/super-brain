import { ArtifactPreview } from "./types";

type PlanPreviewViewProps = {
  artifacts: ArtifactPreview[];
  onSelectArtifact?: (artifact: ArtifactPreview) => void;
};

export function PlanPreviewView({ artifacts, onSelectArtifact }: PlanPreviewViewProps) {
  return (
    <section aria-labelledby="plan-preview-title">
      <h2 id="plan-preview-title">3. Plan preview</h2>
      <p>Review all generated planning artifacts before exporting.</p>

      {artifacts.length === 0 ? (
        <p>No artifacts generated yet.</p>
      ) : (
        <ul>
          {artifacts.map((artifact) => (
            <li key={artifact.id}>
              <article>
                <header>
                  <h3>{artifact.title}</h3>
                  <small>{artifact.type}</small>
                </header>
                {artifact.description ? <p>{artifact.description}</p> : null}
                <pre>{artifact.content}</pre>
                {onSelectArtifact ? (
                  <button type="button" onClick={() => onSelectArtifact(artifact)}>
                    Focus artifact
                  </button>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
