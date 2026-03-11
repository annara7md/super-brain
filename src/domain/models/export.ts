export type ExportMode = "safe-write" | "regenerate" | "overwrite";

export interface ExportFile {
  path: string;
  content: string;
}

export interface ExportRequest {
  files: ExportFile[];
  mode: ExportMode;
  existingFiles: Record<string, string>;
}

export interface ExportResult {
  written: ExportFile[];
  skipped: { path: string; reason: string }[];
  conflicts: { path: string; existingChecksum: number; incomingChecksum: number }[];
}
