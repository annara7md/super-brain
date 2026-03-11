import { PlanArtifact, PlanContext } from "../models/plan-artifacts";
import { orderWorkItems } from "./PlanOrdering";

export class RequirementsService {
  generate(context: PlanContext): PlanArtifact {
    return {
      type: "requirements",
      title: `Requirements - ${context.objective}`,
      orderedItems: orderWorkItems(context.workItems),
      notes: [
        ...context.constraints.map((constraint) => `Constraint: ${constraint}`),
        ...context.nonFunctionalRequirements.map((nfr) => `NFR: ${nfr}`),
      ],
    };
  }
}
