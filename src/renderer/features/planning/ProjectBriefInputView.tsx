import { FormEvent, useState } from "react";

type ProjectBriefInputViewProps = {
  initialBrief?: string;
  onSubmit: (brief: string) => void;
};

export function ProjectBriefInputView({
  initialBrief = "",
  onSubmit,
}: ProjectBriefInputViewProps) {
  const [brief, setBrief] = useState(initialBrief);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(brief.trim());
  };

  return (
    <section aria-labelledby="project-brief-title">
      <h2 id="project-brief-title">1. Project brief</h2>
      <p>Describe project goals, constraints, and expected planning artifacts.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="project-brief-input">Project brief</label>
        <textarea
          id="project-brief-input"
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          placeholder="Summarize what should be planned..."
          rows={8}
          required
        />

        <button type="submit" disabled={!brief.trim()}>
          Start clarification
        </button>
      </form>
    </section>
  );
}
