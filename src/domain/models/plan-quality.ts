export type QualitySeverity = "info" | "warning" | "critical";
export type QualityCategory =
  | "nfr-coverage"
  | "acceptance-criteria"
  | "ambiguity"
  | "dependencies";

export interface QualityIssue {
  category: QualityCategory;
  severity: QualitySeverity;
  itemId?: string;
  message: string;
  suggestion: string;
}

export interface PlanQualityInput {
  requiredNfrKeywords: string[];
  workItems: {
    id: string;
    title: string;
    acceptanceCriteria: string[];
    dependencies: string[];
    description: string;
  }[];
}

export interface PlanQualityOutput {
  score: number;
  issues: QualityIssue[];
}
