import { PlanQualityInput, PlanQualityOutput, QualityIssue } from "../models/plan-quality";

const AMBIGUOUS_TERMS = ["etc", "maybe", "somehow", "appropriate", "fast", "user-friendly"];

export class PlanQualityService {
  evaluate(input: PlanQualityInput): PlanQualityOutput {
    const issues: QualityIssue[] = [];

    for (const keyword of input.requiredNfrKeywords) {
      const found = input.workItems.some((item) => {
        const body = `${item.title} ${item.description} ${item.acceptanceCriteria.join(" ")}`.toLowerCase();
        return body.includes(keyword.toLowerCase());
      });

      if (!found) {
        issues.push({
          category: "nfr-coverage",
          severity: "critical",
          message: `No work item addresses required NFR keyword: ${keyword}.`,
          suggestion: `Add or update a work item with measurable criteria for ${keyword}.`,
        });
      }
    }

    for (const item of input.workItems) {
      if (item.acceptanceCriteria.length === 0) {
        issues.push({
          category: "acceptance-criteria",
          severity: "critical",
          itemId: item.id,
          message: "Work item has no acceptance criteria.",
          suggestion: "Add at least one testable Given/When/Then style criterion.",
        });
      } else {
        const weakCriteria = item.acceptanceCriteria.filter((criterion) => criterion.split(" ").length < 5);
        for (const criterion of weakCriteria) {
          issues.push({
            category: "acceptance-criteria",
            severity: "warning",
            itemId: item.id,
            message: `Acceptance criterion may be too vague: \"${criterion}\".`,
            suggestion: "Use measurable language and expected outcomes.",
          });
        }
      }

      const ambiguous = AMBIGUOUS_TERMS.filter((term) =>
        `${item.title} ${item.description}`.toLowerCase().includes(term),
      );
      for (const term of ambiguous) {
        issues.push({
          category: "ambiguity",
          severity: "warning",
          itemId: item.id,
          message: `Potentially ambiguous term detected: \"${term}\".`,
          suggestion: "Replace with objective and measurable wording.",
        });
      }
    }

    const ids = new Set(input.workItems.map((item) => item.id));
    for (const item of input.workItems) {
      for (const dep of item.dependencies) {
        if (!ids.has(dep)) {
          issues.push({
            category: "dependencies",
            severity: "critical",
            itemId: item.id,
            message: `Dependency \"${dep}\" does not exist in the plan.`,
            suggestion: "Remove stale dependency or add the missing referenced work item.",
          });
        }
      }
    }

    const penalty = issues.reduce((sum, issue) => {
      if (issue.severity === "critical") return sum + 15;
      if (issue.severity === "warning") return sum + 5;
      return sum + 1;
    }, 0);

    return {
      score: Math.max(0, 100 - penalty),
      issues,
    };
  }
}
