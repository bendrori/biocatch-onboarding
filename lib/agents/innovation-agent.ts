import type { IdeaScores, Insight, ResearchTopic, SignalIdea } from "@/lib/types";
import { generateId } from "@/lib/db/store";
import { computeIdeaScore, impactToScore, difficultyToPenalty } from "@/lib/scoring";

interface IdeaTemplate {
  topicKeywords: string[];
  title: string;
  description: string;
  signalType: SignalIdea["signalType"];
  platforms: SignalIdea["platforms"];
  collectionLayer: SignalIdea["collectionLayer"];
  requiredData: string[];
  expectedValue: SignalIdea["expectedValue"];
  falsePositiveRisk: SignalIdea["falsePositiveRisk"];
  engineeringDifficulty: SignalIdea["engineeringDifficulty"];
  privacyRisk: SignalIdea["privacyRisk"];
  scores: IdeaScores;
}

const IDEA_TEMPLATES: IdeaTemplate[] = [
  {
    topicKeywords: ["dom planning", "agentic"],
    title: "Detect agentic browser DOM planning behavior",
    description:
      "Collect DOM mutation burst timing, focus transition order, and pre-navigation snapshot indicators to distinguish agentic browsers from human sessions.",
    signalType: "behavioral",
    platforms: ["web", "mobile_web"],
    collectionLayer: "JS SDK",
    requiredData: ["DOM mutations", "event timing", "focus changes", "mutation burst intervals"],
    expectedValue: "high",
    falsePositiveRisk: "medium",
    engineeringDifficulty: "medium",
    privacyRisk: "low",
    scores: {
      detectionValue: 0.9,
      novelty: 0.85,
      customerRelevance: 0.9,
      arrImpact: 0.85,
      engineeringCost: 0.4,
      latencyCost: 0.2,
      privacyRisk: 0.1,
      falsePositiveRisk: 0.35,
      crossPlatformPotential: 0.7,
      competitiveAdvantage: 0.8,
    },
  },
  {
    topicKeywords: ["interaction entropy", "agentic", "llm"],
    title: "Interaction entropy scoring for LLM-driven agents",
    description:
      "Compute session interaction entropy from pointer paths, scroll acceleration, and keystroke timing. LLM agents exhibit lower entropy than organic users.",
    signalType: "behavioral",
    platforms: ["web", "mobile_web"],
    collectionLayer: "JS SDK",
    requiredData: ["pointer events", "scroll data", "keystroke timing"],
    expectedValue: "high",
    falsePositiveRisk: "medium",
    engineeringDifficulty: "medium",
    privacyRisk: "low",
    scores: {
      detectionValue: 0.88,
      novelty: 0.9,
      customerRelevance: 0.85,
      arrImpact: 0.8,
      engineeringCost: 0.45,
      latencyCost: 0.25,
      privacyRisk: 0.15,
      falsePositiveRisk: 0.4,
      crossPlatformPotential: 0.75,
      competitiveAdvantage: 0.85,
    },
  },
  {
    topicKeywords: ["playwright", "automation", "puppeteer"],
    title: "CDP session fingerprint for automation frameworks",
    description:
      "Detect active CDP sessions and framework-specific API signatures (Playwright, Puppeteer) via timing side-channels and API availability probes.",
    signalType: "automation",
    platforms: ["web"],
    collectionLayer: "JS SDK",
    requiredData: ["CDP indicators", "API availability", "timing side-channels"],
    expectedValue: "high",
    falsePositiveRisk: "low",
    engineeringDifficulty: "low",
    privacyRisk: "low",
    scores: {
      detectionValue: 0.82,
      novelty: 0.6,
      customerRelevance: 0.75,
      arrImpact: 0.7,
      engineeringCost: 0.25,
      latencyCost: 0.15,
      privacyRisk: 0.1,
      falsePositiveRisk: 0.15,
      crossPlatformPotential: 0.5,
      competitiveAdvantage: 0.65,
    },
  },
  {
    topicKeywords: ["client hints", "fingerprint", "stealth"],
    title: "Client Hints consistency mismatch detection",
    description:
      "Compare low-entropy Client Hints from standard API vs high-entropy hints available via CDP. Inconsistency indicates automation or spoofing.",
    signalType: "environmental",
    platforms: ["web"],
    collectionLayer: "JS SDK",
    requiredData: ["navigator.userAgentData", "CDP hint override indicators"],
    expectedValue: "medium",
    falsePositiveRisk: "low",
    engineeringDifficulty: "medium",
    privacyRisk: "low",
    scores: {
      detectionValue: 0.75,
      novelty: 0.7,
      customerRelevance: 0.6,
      arrImpact: 0.55,
      engineeringCost: 0.35,
      latencyCost: 0.1,
      privacyRisk: 0.1,
      falsePositiveRisk: 0.2,
      crossPlatformPotential: 0.4,
      competitiveAdvantage: 0.6,
    },
  },
  {
    topicKeywords: ["customer", "mobile web", "agentic"],
    title: "Mobile web agentic form-filling detection",
    description:
      "Detect AI-driven form filling on mobile web with human-like timing. Combines touch event regularity, viewport interaction patterns, and field focus sequences.",
    signalType: "behavioral",
    platforms: ["mobile_web"],
    collectionLayer: "JS SDK",
    requiredData: ["touch events", "form interactions", "viewport data", "focus sequences"],
    expectedValue: "critical",
    falsePositiveRisk: "medium",
    engineeringDifficulty: "high",
    privacyRisk: "low",
    scores: {
      detectionValue: 0.92,
      novelty: 0.8,
      customerRelevance: 0.95,
      arrImpact: 0.9,
      engineeringCost: 0.6,
      latencyCost: 0.3,
      privacyRisk: 0.1,
      falsePositiveRisk: 0.4,
      crossPlatformPotential: 0.6,
      competitiveAdvantage: 0.75,
    },
  },
];

export function generateIdeas(
  topics: ResearchTopic[],
  insights: Insight[],
  existingTitles: string[]
): SignalIdea[] {
  const now = new Date().toISOString();
  const ideas: SignalIdea[] = [];
  const existing = new Set(existingTitles);

  for (const topic of topics) {
    const topicText = `${topic.title} ${topic.description}`.toLowerCase();

    for (const template of IDEA_TEMPLATES) {
      if (existing.has(template.title)) continue;

      const matches = template.topicKeywords.some((kw) => topicText.includes(kw));
      if (!matches) continue;

      const score = computeIdeaScore(template.scores);

      ideas.push({
        id: generateId("idea"),
        topicId: topic.id,
        title: template.title,
        description: template.description,
        signalType: template.signalType,
        platforms: template.platforms,
        collectionLayer: template.collectionLayer,
        requiredData: template.requiredData,
        expectedValue: template.expectedValue,
        falsePositiveRisk: template.falsePositiveRisk,
        engineeringDifficulty: template.engineeringDifficulty,
        privacyRisk: template.privacyRisk,
        score,
        status: "pending_review",
        pipelineStage: "idea",
        recommendedNextStep: score >= 70 ? "build_poc" : "more_research",
        createdAt: now,
      });

      existing.add(template.title);
    }
  }

  // Generate from high-confidence insights without topic match
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
