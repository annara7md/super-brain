import { AgentHandoffInput, AgentHandoffOutput, HandoffFile } from "../models/handoff";

export class AgentHandoffService {
  generate(input: AgentHandoffInput): AgentHandoffOutput {
    const files: HandoffFile[] = [
      {
        path: "AGENTS.md",
        content: this.buildAgents(input),
      },
      {
        path: "SKILL.md",
        content: this.buildSkill(input),
      },
    ];

    for (const reference of input.references) {
      files.push({
        path: `references/${reference.path}`,
        content: `# ${reference.title}\n\nPurpose: ${reference.purpose}\n`,
      });
    }

    for (const template of input.templates) {
      files.push({
        path: `templates/${template.name}`,
        content: template.body,
      });
    }

    return { files };
  }

  private buildAgents(input: AgentHandoffInput): string {
    return [
      `# AGENTS.md for ${input.projectName}`,
      "",
      `Objective: ${input.objective}`,
      "",
      "## Repository conventions",
      ...input.repoConventions.map((convention) => `- ${convention}`),
      "",
      "## Workflows",
      ...input.workflows.map((workflow) => `- ${workflow}`),
      "",
      "## Handoff content",
      "- SKILL.md",
      "- references/*",
      "- templates/*",
    ].join("\n");
  }

  private buildSkill(input: AgentHandoffInput): string {
    return [
      `# ${input.projectName} skill`,
      "",
      "## Intent",
      input.objective,
      "",
      "## Recommended workflow",
      ...input.workflows.map((workflow, index) => `${index + 1}. ${workflow}`),
      "",
      "## Required references",
      ...input.references.map((reference) => `- references/${reference.path}`),
      "",
      "## Templates",
      ...input.templates.map((template) => `- templates/${template.name}`),
    ].join("\n");
  }
}
