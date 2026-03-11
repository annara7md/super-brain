export type Priority = "low" | "medium" | "high";

export interface BriefInput {
  rawBrief: string;
  requiredSections: string[];
  criticalTopics: string[];
}

export interface BriefSection {
  heading: string;
  content: string;
}

export interface CriticalGap {
  topic: string;
  reason: string;
  priority: Priority;
}

export interface BriefAnalysisOutput {
  sections: BriefSection[];
  summary: string;
  criticalGaps: CriticalGap[];
}
