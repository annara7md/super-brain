import { PlanArtifact, PlanContext } from "../models/plan-artifacts";
import { orderWorkItems } from "./PlanOrdering";

export class BacklogService {
  generate(context: PlanContext): PlanArtifact {
    const ordered = orderWorkItems(context.workItems).map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

    return {
      type: "backlog",
      title: `Backlog - ${context.objective}`,
      orderedItems: ordered,
      notes: [
        "Ordering rules: dependency-first, then explicit priority, then title.",
        "Each item must remain deployable behind a feature flag when needed.",
      ],
    };
  }
}
