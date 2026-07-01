import type { CatalogSignal, Insight, ResearchTopic, SignalIdea } from "@/lib/types";
import { generateId } from "@/lib/db/store";
import { computeIdeaScore } from "@/lib/scoring";
import { SIGNAL_CATALOG, getCatalogSignal } from "@/lib/agents/signal-catalog";

function materializeCatalogSignal(signal: CatalogSignal, topicId: string | null): SignalIdea {
  const now = new Date().toISOString();
  const score = computeIdeaScore(signal.scores);

  return {
    id: generateId("idea"),
    topicId,
    title: signal.name,
    description: signal.description,
    signalType: signal.signalType,
    platforms: signal.platforms,
    collectionLayer: signal.collectionLayer,
    requiredData: signal.requiredData,
    expectedValue: signal.expectedValue,
    falsePositiveRisk: signal.falsePositiveRisk,
    engineeringDifficulty: signal.engineeringDifficulty,
    privacyRisk: signal.privacyRisk,
    score,
    status: "pending_review",
    pipelineStage: "idea",
    recommendedNextStep: score >= 70 ? "build_poc" : "more_research",
    createdAt: now,
  };
}

export function generateIdeas(
  topics: ResearchTopic[],
  insights: Insight[],
  existingTitles: string[]
): SignalIdea[] {
  const ideas: SignalIdea[] = [];
  const existing = new Set(existingTitles);

  for (const topic of topics) {
    const topicText = `${topic.title} ${topic.description}`.toLowerCase();

    for (const signal of SIGNAL_CATALOG) {
      if (existing.has(signal.name)) continue;

      const matches = signal.matchKeywords.some((kw) => topicText.includes(kw));
      if (!matches) continue;

      ideas.push(materializeCatalogSignal(signal, topic.id));
      existing.add(signal.name);
    }
  }

  // Generate from high-confidence insights without a topic match
  const now = new Date().toISOString();
  for (const insight of insights.filter((i) => i.confidence >= 0.85)) {
    const title = `Signal from: ${insight.title}`;
    if (existing.has(title)) continue;

    ideas.push({
      id: generateId("idea"),
      topicId: null,
      title,
      description: insight.description,
      signalType: "behavioral",
      platforms: insight.affectedPlatforms,
      collectionLayer: "JS SDK",
      requiredData: insight.possibleSignals,
      expectedValue: insight.businessImpact,
      falsePositiveRisk: insight.falsePositiveRisk,
      engineeringDifficulty: insight.engineeringDifficulty,
      privacyRisk: "low",
      score: Math.round(insight.confidence * 100),
      status: "pending_review",
      pipelineStage: "idea",
      recommendedNextStep: "build_poc",
      createdAt: now,
    });
    existing.add(title);
  }

  return ideas;
}

/**
 * Materialize every signal in the catalog that is not already present as an
 * idea. Used to seed the full detection-signal universe beyond agentic sessions.
 */
export function generateAllCatalogIdeas(existingTitles: string[]): SignalIdea[] {
  const existing = new Set(existingTitles);
  const ideas: SignalIdea[] = [];

  for (const signal of SIGNAL_CATALOG) {
    if (existing.has(signal.name)) continue;
    ideas.push(materializeCatalogSignal(signal, null));
    existing.add(signal.name);
  }

  return ideas;
}

/** Materialize a single catalog signal into an idea by its catalog id. */
export function generateCatalogIdea(signalId: string): SignalIdea | null {
  const signal = getCatalogSignal(signalId);
  if (!signal) return null;
  return materializeCatalogSignal(signal, null);
}

export function generateIdeaFromInsight(insight: Insight, topicId: string | null): SignalIdea {
  const now = new Date().toISOString();
  const score = Math.round(insight.confidence * 100);

  return {
    id: generateId("idea"),
    topicId,
    title: insight.title,
    description: insight.description,
    signalType: "behavioral",
    platforms: insight.affectedPlatforms,
    collectionLayer: "JS SDK",
    requiredData: insight.possibleSignals,
    expectedValue: insight.businessImpact,
    falsePositiveRisk: insight.falsePositiveRisk,
    engineeringDifficulty: insight.engineeringDifficulty,
    privacyRisk: "low",
    score,
    status: "pending_review",
    pipelineStage: "idea",
    recommendedNextStep: score >= 70 ? "build_poc" : "more_research",
    createdAt: now,
  };
}
