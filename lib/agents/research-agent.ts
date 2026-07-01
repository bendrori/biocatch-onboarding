import type { Document, Insight, InsightType, Platform } from "@/lib/types";
import { generateId } from "@/lib/db/store";

interface InsightRule {
  keywords: string[];
  type: InsightType;
  title: string;
  description: string;
  possibleSignals: string[];
  platforms: Platform[];
  confidence: number;
  businessImpact: "critical" | "high" | "medium" | "low";
  engineeringDifficulty: "high" | "medium" | "low";
  falsePositiveRisk: "critical" | "high" | "medium" | "low";
}

const INSIGHT_RULES: InsightRule[] = [
  {
    keywords: ["dom planning", "dom mutation", "mutation plan"],
    type: "agentic_browser_behavior",
    title: "DOM planning behavior detection opportunity",
    description:
      "Agentic browsers pre-plan DOM mutations creating distinguishable timing and focus patterns. BioCatch can collect mutation burst timing, focus transition order, and pre-navigation snapshot indicators.",
    possibleSignals: ["domMutationBurstTiming", "focusTransitionOrder", "preNavigationSnapshot"],
    platforms: ["web", "mobile_web"],
    confidence: 0.85,
    businessImpact: "high",
    engineeringDifficulty: "medium",
    falsePositiveRisk: "medium",
  },
  {
    keywords: ["playwright", "puppeteer", "automation", "cdp"],
    type: "automation_framework_change",
    title: "Automation framework capability change",
    description:
      "Automation framework update may introduce new evasion vectors or detection opportunities. Evaluate CDP usage patterns and framework-specific API calls.",
    possibleSignals: ["cdpSessionActive", "automationFrameworkSignature", "webdriverFlag"],
    platforms: ["web"],
    confidence: 0.78,
    businessImpact: "high",
    engineeringDifficulty: "low",
    falsePositiveRisk: "low",
  },
  {
    keywords: ["client hints", "useragentdata", "fingerprint", "entropy"],
    type: "anti_fingerprinting_change",
    title: "Browser fingerprinting surface change",
    description:
      "Browser privacy changes affect fingerprint entropy. Automation tools may request high-entropy hints via CDP bypassing reduced surface — inconsistency detection opportunity.",
    possibleSignals: ["clientHintsConsistency", "entropyMismatch", "cdpHintOverride"],
    platforms: ["web", "mobile_web"],
    confidence: 0.72,
    businessImpact: "medium",
    engineeringDifficulty: "medium",
    falsePositiveRisk: "low",
  },
  {
    keywords: ["agentic", "llm", "ai agent", "ai-driven"],
    type: "agentic_browser_behavior",
    title: "Agentic AI browser session detection",
    description:
      "AI-driven browsing sessions exhibit lower interaction entropy and more predictable scroll/pointer patterns. Collection opportunity for behavioral biometrics.",
    possibleSignals: ["interactionEntropy", "scrollAccelerationUniformity", "pointerPathPredictability"],
    platforms: ["web", "mobile_web"],
    confidence: 0.88,
    businessImpact: "critical",
    engineeringDifficulty: "medium",
    falsePositiveRisk: "medium",
  },
  {
    keywords: ["competitor", "datadome", "fingerprint", "human", "castle"],
    type: "competitor_capability",
    title: "Competitive capability gap analysis",
    description:
      "Competitor launched or updated detection capability. BioCatch should evaluate parity, differentiation, and potential customer impact.",
    possibleSignals: [],
    platforms: ["web"],
    confidence: 0.9,
    businessImpact: "high",
    engineeringDifficulty: "low",
    falsePositiveRisk: "low",
  },
  {
    keywords: ["customer", "bank", "escalation", "request"],
    type: "customer_deployment_pattern",
    title: "Repeated customer detection request",
    description:
      "Multiple customers requesting similar detection capability. High customer relevance — prioritize signal research and PoC.",
    possibleSignals: [],
    platforms: ["web", "mobile_web"],
    confidence: 0.95,
    businessImpact: "critical",
    engineeringDifficulty: "medium",
    falsePositiveRisk: "medium",
  },
  {
    keywords: ["stealth", "evasion", "spoofing", "webdriver"],
    type: "bot_evasion_technique",
    title: "Bot evasion technique update",
    description:
      "New or updated evasion technique detected in automation tooling. Requires counter-signal development and validation against evasion toolkit.",
    possibleSignals: ["webglSpoofDetection", "navigatorConsistency", "stealthPluginSignature"],
    platforms: ["web"],
    confidence: 0.8,
    businessImpact: "high",
    engineeringDifficulty: "medium",
    falsePositiveRisk: "low",
  },
  {
    keywords: ["edge", "cdn", "cloudflare", "worker"],
    type: "edge_cdn_opportunity",
    title: "CDN/Edge detection opportunity",
    description:
      "Edge-level signal collection or scoring opportunity identified. Evaluate Cloudflare Worker or CDN integration for server-side behavioral signals.",
    possibleSignals: ["edgeRequestTiming", "tlsFingerprint", "headerAnomaly"],
    platforms: ["edge"],
    confidence: 0.65,
    businessImpact: "medium",
    engineeringDifficulty: "high",
    falsePositiveRisk: "low",
  },
];

export function extractInsights(document: Document): Insight[] {
  const text = `${document.title} ${document.rawContent} ${document.summary} ${document.tags.join(" ")}`.toLowerCase();
  const now = new Date().toISOString();
  const insights: Insight[] = [];

  for (const rule of INSIGHT_RULES) {
    const matched = rule.keywords.some((kw) => text.includes(kw));
    if (matched) {
      insights.push({
        id: generateId("insight"),
        documentId: document.id,
        type: rule.type,
        title: rule.title,
        description: rule.description,
        possibleSignals: rule.possibleSignals,
        affectedPlatforms: rule.platforms,
        confidence: rule.confidence,
        businessImpact: rule.businessImpact,
        engineeringDifficulty: rule.engineeringDifficulty,
        falsePositiveRisk: rule.falsePositiveRisk,
        createdAt: now,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: generateId("insight"),
      documentId: document.id,
      type: "sdk_collection_opportunity",
      title: "General SDK collection review",
      description: `Document "${document.title}" may contain SDK-relevant changes. Manual review recommended for ${document.source}.`,
      possibleSignals: [],
      affectedPlatforms: ["web"],
      confidence: 0.4,
      businessImpact: "low",
      engineeringDifficulty: "low",
      falsePositiveRisk: "low",
      createdAt: now,
    });
  }

  return insights;
}

export function extractInsightsFromDocuments(documents: Document[]): Insight[] {
  return documents.flatMap(extractInsights);
}
