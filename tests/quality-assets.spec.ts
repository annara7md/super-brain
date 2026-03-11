import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "bun:test";

import { AgentHandoffService } from "../src/domain/services/AgentHandoffService";
import { BacklogService } from "../src/domain/services/BacklogService";
import { BriefAnalysisService } from "../src/domain/services/BriefAnalysisService";
import { ClarificationService } from "../src/domain/services/ClarificationService";
import { ExportService } from "../src/domain/services/ExportService";
import { RefinementService } from "../src/domain/services/RefinementService";
import { PlanContext } from "../src/domain/models/plan-artifacts";

const fixture = (relativePath: string): string =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("brief parsing and critical gap detection", () => {
  const service = new BriefAnalysisService();

  it("parses sections from a small fixture and identifies required-section/topic gaps", () => {
    const output = service.analyze({
      rawBrief: fixture("fixtures/briefs/small-brief.md"),
      requiredSections: ["Objective", "Risks", "Timeline"],
      criticalTopics: ["privacy", "security", "rollback"],
    });

    expect(output.sections.map((section) => section.heading)).toEqual([
      "Objective",
      "Context",
      "Constraints",
    ]);
    expect(output.summary.length).toBeGreaterThan(10);

    const missingTopics = output.criticalGaps.map((gap) => gap.topic);
    expect(missingTopics).toContain("Risks");
    expect(missingTopics).toContain("Timeline");
    expect(missingTopics).toContain("security");
    expect(missingTopics).toContain("rollback");
  });

  it("supports medium and large fixtures with multi-domain content and explicit missing-info sections", () => {
    const medium = service.analyze({
      rawBrief: fixture("fixtures/briefs/medium-brief.md"),
      requiredSections: ["Compliance", "Non-Goals"],
      criticalTopics: ["latency", "disaster recovery", "ownership model"],
    });

    const large = service.analyze({
      rawBrief: fixture("fixtures/briefs/large-brief.md"),
      requiredSections: ["Program Goal", "Launch Plan"],
      criticalTopics: ["accessibility", "peak concurrency", "outage windows"],
    });

    expect(medium.sections.length).toBeGreaterThanOrEqual(5);
    expect(medium.criticalGaps.some((gap) => gap.topic === "Non-Goals")).toBe(true);

    expect(large.sections.length).toBeGreaterThanOrEqual(7);
    expect(large.criticalGaps.some((gap) => gap.topic === "Launch Plan")).toBe(true);
  });
});

describe("clarification sequencing", () => {
  const service = new ClarificationService();

  it("enforces question ordering and accumulates trimmed answers", () => {
    const start = service.start({
      questions: [
        { id: "q1", question: "What is the latency SLO?", required: true },
        { id: "q2", question: "Who owns DR runbooks?", required: true },
      ],
    });

    expect(start.state.status).toBe("asking");
    expect(start.prompt).toBe("What is the latency SLO?");

    const afterQ1 = service.answer(start.state, { questionId: "q1", answer: "  P95 < 500ms  " });
    expect(afterQ1.completedQuestionId).toBe("q1");
    expect(afterQ1.state.answers.q1).toBe("P95 < 500ms");
    expect(afterQ1.prompt).toBe("Who owns DR runbooks?");

    expect(() =>
      service.answer(afterQ1.state, {
        questionId: "q1",
        answer: "duplicate answer",
      }),
    ).toThrowError(/Expected answer for question q2/);

    const done = service.answer(afterQ1.state, { questionId: "q2", answer: "SRE" });
    expect(done.state.status).toBe("complete");
    expect(done.prompt).toBeUndefined();
  });
});

describe("backlog and refinement generation", () => {
  const context: PlanContext = {
    objective: "Ship observability MVP",
    constraints: ["Single team", "Quarterly release"],
    assumptions: ["Telemetry SDK remains backward-compatible"],
    nonFunctionalRequirements: ["99.9% uptime"],
    workItems: [
      {
        id: "w3",
        title: "Dashboard",
        description: "Build admin dashboards",
        acceptanceCriteria: [],
        dependencies: ["w2"],
        priority: 3,
      },
      {
        id: "w1",
        title: "Ingestion API",
        description: "Collect events",
        acceptanceCriteria: ["Given signed requests, when payload posted, then API persists events"],
        dependencies: [],
        priority: 1,
      },
      {
        id: "w2",
        title: "Storage model",
        description: "Design tenant-aware schema",
        acceptanceCriteria: ["Given tenant id, when querying events, then only tenant scoped data returns"],
        dependencies: ["w1"],
        priority: 2,
      },
    ],
  };

  it("creates dependency-first ordered backlog with deterministic notes", () => {
    const artifact = new BacklogService().generate(context);

    expect(artifact.type).toBe("backlog");
    expect(artifact.orderedItems.map((item) => item.id)).toEqual(["w1", "w2", "w3"]);
    expect(artifact.orderedItems.map((item) => item.priority)).toEqual([1, 2, 3]);
    expect(artifact.notes).toEqual([
      "Ordering rules: dependency-first, then explicit priority, then title.",
      "Each item must remain deployable behind a feature flag when needed.",
    ]);
  });

  it("creates refinement artifact and enforces acceptance-criteria fallback rule", () => {
    const artifact = new RefinementService().generate(context);

    expect(artifact.type).toBe("refinement");
    const dashboard = artifact.orderedItems.find((item) => item.id === "w3");
    expect(dashboard?.acceptanceCriteria).toEqual(["Define measurable acceptance criteria"]);
    expect(artifact.notes).toEqual([
      "Assumption to validate: Telemetry SDK remains backward-compatible",
    ]);
  });
});

describe("AGENTS/SKILL generation markdown determinism and rule enforcement", () => {
  const service = new AgentHandoffService();

  it("produces deterministic markdown sections with expected workflow/reference/template rules", () => {
    const output = service.generate({
      projectName: "InsightHub",
      objective: "Generate deterministic planning artifacts from briefs and clarification loops.",
      repoConventions: [
        "Keep markdown output deterministic and section-ordered.",
        "Validate missing critical topics before generating delivery plans.",
      ],
      workflows: [
        "Parse and summarize incoming brief sections.",
        "Run clarification sequence for unresolved gaps.",
        "Generate requirements, refinement, and backlog artifacts.",
      ],
      references: [
        {
          title: "Domain map",
          path: "domain-map.md",
          purpose: "Captures healthcare, billing, and retail touchpoints.",
        },
      ],
      templates: [{ name: "backlog-template.md", body: "# Backlog Template\n" }],
    });

    const agents = output.files.find((file) => file.path === "AGENTS.md")?.content;
    const skill = output.files.find((file) => file.path === "SKILL.md")?.content;

    expect(agents).toContain("# AGENTS.md for InsightHub");
    expect(agents).toContain("## Workflows");
    expect(agents).toContain("- SKILL.md");

    expect(skill).toContain("# InsightHub skill");
    expect(skill).toContain("## Recommended workflow");
    expect(skill).toContain("1. Parse and summarize incoming brief sections.");
    expect(skill).toContain("## Required references");
    expect(skill).toContain("- references/domain-map.md");

    expect(output.files.map((file) => file.path)).toEqual([
      "AGENTS.md",
      "SKILL.md",
      "references/domain-map.md",
      "templates/backlog-template.md",
    ]);
  });
});

describe("export overwrite behavior", () => {
  const service = new ExportService();

  it("always writes incoming files and bypasses conflict bookkeeping in overwrite mode", () => {
    const result = service.execute({
      mode: "overwrite",
      existingFiles: {
        "AGENTS.md": "legacy",
        "SKILL.md": "legacy",
      },
      files: [
        { path: "AGENTS.md", content: "new-agents" },
        { path: "SKILL.md", content: "new-skill" },
      ],
    });

    expect(result.written.map((file) => file.path)).toEqual(["AGENTS.md", "SKILL.md"]);
    expect(result.skipped).toEqual([]);
    expect(result.conflicts).toEqual([]);
  });
});
