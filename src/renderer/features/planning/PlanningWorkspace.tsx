import { ClarificationFlowView } from "./ClarificationFlowView";
import { ExportView } from "./ExportView";
import { PlanPreviewView } from "./PlanPreviewView";
import { ProjectBriefInputView } from "./ProjectBriefInputView";
import { RegenerateUpdateView } from "./RegenerateUpdateView";
import {
  AnswerMap,
  ArtifactPreview,
  ExportMode,
  Question,
  RegenerationOption,
} from "./types";

type PlanningWorkspaceProps = {
  questions: Question[];
  artifacts: ArtifactPreview[];
  regenerationOptions: RegenerationOption[];
  onBriefSubmit: (brief: string) => void;
  onClarificationComplete: (answers: AnswerMap) => void;
  onExport: (options: { destination: string; mode: ExportMode }) => void;
  onRegenerate: (options: { planningFolder: string; selectedArtifactIds: string[] }) => void;
};

export function PlanningWorkspace({
  questions,
  artifacts,
  regenerationOptions,
  onBriefSubmit,
  onClarificationComplete,
  onExport,
  onRegenerate,
}: PlanningWorkspaceProps) {
  return (
    <main aria-label="Planning workspace">
      <p>This workspace is planning-only and intentionally omits execution/orchestration panels.</p>
      <ProjectBriefInputView onSubmit={onBriefSubmit} />
      <ClarificationFlowView questions={questions} onComplete={onClarificationComplete} />
      <PlanPreviewView artifacts={artifacts} />
      <ExportView onExport={onExport} />
      <RegenerateUpdateView
        availableArtifacts={regenerationOptions}
        onRun={onRegenerate}
      />
    </main>
  );
}
