export type Question = {
  id: string;
  prompt: string;
  helperText?: string;
};

export type AnswerMap = Record<string, string>;

export type ArtifactPreview = {
  id: string;
  title: string;
  type: string;
  description?: string;
  content: string;
};

export type ExportMode = "overwrite" | "update";

export type RegenerationOption = {
  id: string;
  label: string;
  selected: boolean;
};
