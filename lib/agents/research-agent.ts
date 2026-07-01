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
    keywords: ["edge", "cdn", "cloudflare", "worker", "tls", "ja3", "ja4", "http2", "quic"],
    type: "edge_cdn_opportunity",
    title: "CDN/Edge detection opportunity",
    description:
      "Edge-level signal collection or scoring opportunity identified. Evaluate Cloudflare Worker or CDN integration for server-side network signals (TLS/JA3, HTTP2, header order).",
    possibleSignals: ["edgeRequestTiming", "tlsFingerprint", "headerAnomaly", "http2Fingerprint"],
    platforms: ["edge", "backend"],
    confidence: 0.7,
    businessImpact: "high",
    engineeringDifficulty: "high",
    falsePositiveRisk: "low",
  },
  {
    keywords: [
      "navigator.",
      "new api",
      "web api",
      "browser api",
      "chrome ships",
      "chrome adds",
      "webkit",
      "performance api",
    ],
    type: "new_browser_api",
    title: "New browser API collection opportunity",
    description:
      "A newly shipped browser API exposes additional entropy or behavior that BioCatch can collect as a device or environmental signal. Evaluate cross-browser availability and spoofing resistance.",
    possibleSignals: ["navigatorSurface", "performanceEntries", "apiAvailabilityProbe"],
    platforms: ["web", "mobile_web"],
    confidence: 0.72,
    businessImpact: "high",
    engineeringDifficulty: "medium",
    falsePositiveRisk: "low",
  },
  {
    keywords: [
      "android",
      "ios",
      "swift",
      "kotlin",
      "flutter",
      "react native",
      "sensor",
      "accelerometer",
      "gyroscope",
    ],
    type: "new_mobile_api",
    title: "New mobile API / sensor opportunity",
    description:
      "Mobile OS or SDK change exposes new sensor or platform data. Assess device-motion, sensor-calibration, and emulator-detection signal opportunities for the mobile SDKs.",
    possibleSignals: ["sensorCalibration", "deviceMotion", "emulatorArtifacts"],
    platforms: ["ios", "android", "mobile_web"],
    confidence: 0.7,
    businessImpact: "high",
    engineeringDifficulty: "medium",
    falsePositiveRisk: "low",
  },
  {
    keywords: [
      "keystroke",
      "mouse",
      "pointer",
      "touch",
      "swipe",
      "behavioral",
      "biometric",
      "typing",
      "gesture",
    ],
    type: "sdk_collection_opportunity",
    title: "Behavioral biometrics collection opportunity",
    description:
      "Source describes an interaction modality that can be captured as behavioral biometrics (keystroke, mouse, touch, motion). High reuse potential across web and mobile SDKs.",
    possibleSignals: ["keystrokeDynamics", "mouseDynamics", "touchDynamics", "deviceMotion"],
    platforms: ["web", "mobile_web", "ios", "android"],
    confidence: 0.78,
    businessImpact: "high",
    engineeringDifficulty: "low",
    falsePositiveRisk: "medium",
  },
  {
    keywords: ["canvas", "webgl", "audio", "font", "device fingerprint", "hardwareconcurrency"],
    type: "sdk_collection_opportunity",
    title: "Device fingerprint collection opportunity",
    description:
      "Source references a device-fingerprinting surface (canvas, WebGL, audio, fonts). Evaluate as a stable device-identity signal and for exposing virtualized environments.",
    possibleSignals: ["canvasHash", "webglRenderer", "audioFingerprint", "fontEnumeration"],
    platforms: ["web", "mobile_web"],
    confidence: 0.7,
    businessImpact: "medium",
    engineeringDifficulty: "low",
    falsePositiveRisk: "low",
  },
  {
    keywords: [
      "remote access",
      "teamviewer",
      "anydesk",
      "screen share",
      "screen sharing",
      "scam",
      "social engineering",
      "authorized push payment",
      "app fraud",
    ],
    type: "backend_scoring_opportunity",
    title: "Scam & remote-access detection opportunity",
    description:
      "Source relates to remote-access fraud or social-engineering scams. High-value detection combining input-latency, screen-sharing, and hesitation signals with backend scoring.",
    possibleSignals: ["remoteAccessLatency", "screenShareIndicators", "paymentFieldHesitation"],
    platforms: ["web", "mobile_web", "ios", "android"],
    confidence: 0.85,
    businessImpact: "critical",
    engineeringDifficulty: "high",
    falsePositiveRisk: "medium",
  },
  {
    keywords: [
      "account takeover",
      "ato",
      "money mule",
      "mule",
      "credential stuffing",
      "new account fraud",
      "synthetic identity",
    ],
    type: "backend_scoring_opportunity",
    title: "Fraud-pattern scoring opportunity",
    description:
      "Source describes a fraud pattern (ATO, mule, credential stuffing, new-account fraud). Correlate behavioral, device, and network signals into a backend risk score.",
    possibleSignals: ["behavioralDrift", "deviceSharingGraph", "loginVelocity", "dataFamiliarity"],
    platforms: ["web", "mobile_web", "backend"],
    confidence: 0.82,
    businessImpact: "critical",
    engineeringDifficulty: "high",
    falsePositiveRisk: "medium",
  },
  {
    keywords: ["proxy", "vpn", "residential proxy", "ip reputation", "datacenter"],
    type: "backend_scoring_opportunity",
    title: "Network intelligence scoring opportunity",
    description:
      "Source references proxy/VPN or IP-reputation techniques. Evaluate IP intelligence and edge network fingerprints as inputs to session risk scoring.",
    possibleSignals: ["ipReputation", "proxyClassification", "asnRisk"],
    platforms: ["edge", "backend"],
    confidence: 0.72,
    businessImpact: "high",
    engineeringDifficulty: "medium",
    falsePositiveRisk: "medium",
  },
  {
    keywords: ["explainability", "explainable", "reason code", "model interpretability"],
    type: "explainability_improvement",
    title: "Detection explainability improvement",
    description:
      "Source describes explainability or reason-code techniques. Improve analyst-facing explanations of why a session was flagged, increasing trust and adoption.",
    possibleSignals: ["reasonCodes", "signalContributions"],
    platforms: ["backend"],
    confidence: 0.6,
    businessImpact: "medium",
    engineeringDifficulty: "medium",
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
