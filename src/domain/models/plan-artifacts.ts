export type PlanArtifactType = "requirements" | "refinement" | "backlog";

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  dependencies: string[];
  priority: number;
}

export interface PlanContext {
  objective: string;
  constraints: string[];
  assumptions: string[];
  nonFunctionalRequirements: string[];
  workItems: WorkItem[];
}

export interface PlanArtifact {
  type: PlanArtifactType;
  title: string;
  orderedItems: WorkItem[];
  notes: string[];
}
