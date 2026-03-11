import { PlanArtifact, PlanContext } from "../models/plan-artifacts";
import { orderWorkItems } from "./PlanOrdering";

export class RefinementService {
  generate(context: PlanContext): PlanArtifact {
    const ordered = orderWorkItems(context.workItems).map((item) => ({
      ...item,
      acceptanceCriteria: item.acceptanceCriteria.length
        ? item.acceptanceCriteria
        : ["Define measurable acceptance criteria"],
    }));

    return {
      type: "refinement",
      title: `Refinement - ${context.objective}`,
      orderedItems: ordered,
      notes: context.assumptions.map((assumption) => `Assumption to validate: ${assumption}`),
    };
  }
}
