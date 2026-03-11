import {
  BriefAnalysisOutput,
  BriefInput,
  BriefSection,
  CriticalGap,
  Priority,
} from "../models/brief-analysis";

export class BriefAnalysisService {
  analyze(input: BriefInput): BriefAnalysisOutput {
    const sections = this.parseSections(input.rawBrief);

    const summary = sections
      .slice(0, 3)
      .map((section) => section.content)
      .join(" ")
      .trim()
      .slice(0, 280);

    const criticalGaps: CriticalGap[] = [];

    for (const requiredSection of input.requiredSections) {
      const found = sections.some(
        (section) => section.heading.toLowerCase() === requiredSection.toLowerCase(),
      );
      if (!found) {
        criticalGaps.push({
          topic: requiredSection,
          reason: `Required section \"${requiredSection}\" is missing from the brief.`,
          priority: "high",
        });
      }
    }

    for (const topic of input.criticalTopics) {
      const inSection = sections.some((section) => {
        const haystack = `${section.heading} ${section.content}`.toLowerCase();
        return haystack.includes(topic.toLowerCase());
      });

      if (!inSection) {
        criticalGaps.push({
          topic,
          reason: `Critical topic \"${topic}\" is not addressed.`,
          priority: this.priorityForTopic(topic),
        });
      }
    }

    return {
      sections,
      summary,
      criticalGaps,
    };
  }

  private parseSections(rawBrief: string): BriefSection[] {
    const normalized = rawBrief.replace(/\r\n/g, "\n").trim();
    if (!normalized) {
      return [];
    }

    const chunks = normalized
      .split(/\n(?=#|[A-Z][A-Za-z0-9\s]{2,}:)/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    return chunks.map((chunk, index) => {
      const lines = chunk.split("\n");
      const first = lines[0].trim();

      const heading = first.startsWith("#")
        ? first.replace(/^#+\s*/, "")
        : first.endsWith(":")
          ? first.slice(0, -1)
          : `Section ${index + 1}`;

      const content = first === heading || first.replace(/^#+\s*/, "") === heading
        ? lines.slice(1).join(" ").trim() || heading
        : lines.join(" ").trim();

      return { heading, content };
    });
  }

  private priorityForTopic(topic: string): Priority {
    const normalized = topic.toLowerCase();
    if (["security", "privacy", "compliance", "safety"].some((x) => normalized.includes(x))) {
      return "high";
    }
    if (["performance", "scalability", "reliability"].some((x) => normalized.includes(x))) {
      return "medium";
    }
    return "low";
  }
}
