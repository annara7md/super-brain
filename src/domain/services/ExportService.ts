import { ExportFile, ExportRequest, ExportResult } from "../models/export";

export class ExportService {
  execute(request: ExportRequest): ExportResult {
    const written: ExportFile[] = [];
    const skipped: { path: string; reason: string }[] = [];
    const conflicts: { path: string; existingChecksum: number; incomingChecksum: number }[] = [];

    for (const file of request.files) {
      const existing = request.existingFiles[file.path];
      const hasExisting = typeof existing === "string";

      if (request.mode === "overwrite") {
        written.push(file);
        continue;
      }

      if (request.mode === "safe-write") {
        if (!hasExisting) {
          written.push(file);
        } else if (existing === file.content) {
          skipped.push({ path: file.path, reason: "No changes detected." });
        } else {
          conflicts.push({
            path: file.path,
            existingChecksum: this.checksum(existing),
            incomingChecksum: this.checksum(file.content),
          });
          skipped.push({ path: file.path, reason: "File exists with different content." });
        }
        continue;
      }

      if (request.mode === "regenerate") {
        if (!hasExisting || existing !== file.content) {
          written.push(file);
        } else {
          skipped.push({ path: file.path, reason: "Already up-to-date." });
        }
      }
    }

    return { written, skipped, conflicts };
  }

  private checksum(content: string): number {
    let hash = 0;
    for (let i = 0; i < content.length; i += 1) {
      hash = (hash * 31 + content.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
}
