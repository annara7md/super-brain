export interface AgentHandoffInput {
  projectName: string;
  objective: string;
  repoConventions: string[];
  workflows: string[];
  references: { title: string; path: string; purpose: string }[];
  templates: { name: string; body: string }[];
}

export interface HandoffFile {
  path: string;
  content: string;
}

export interface AgentHandoffOutput {
  files: HandoffFile[];
}
