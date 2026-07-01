import type { Poc, SignalIdea, ValidationRun } from "@/lib/types";
import { generateId } from "@/lib/db/store";

interface ValidationProfile {
  baseAccuracy: number;
  baseFPR: number;
  baseFNR: number;
  latencyMs: number;
  memoryKb: number;
}

function getValidationProfile(idea: SignalIdea): ValidationProfile {
  const scoreFactor = idea.score / 100;

  return {
    baseAccuracy: 0.75 + scoreFactor * 0.2,
    baseFPR: 0.08 - scoreFactor * 0.05,
    baseFNR: 0.18 - scoreFactor * 0.08,
    latencyMs: idea.engineeringDifficulty === "high" ? 8 : idea.engineeringDifficulty === "medium" ? 4 : 2,
    memoryKb: idea.engineeringDifficulty === "high" ? 24 : idea.engineeringDifficulty === "medium" ? 12 : 6,
  };
}

function jitter(value: number, range: number): number {
  return Math.max(0, Math.min(1, value + (Math.random() - 0.5) * range));
}

export function runValidation(idea: SignalIdea, poc: Poc): ValidationRun {
  const profile = getValidationProfile(idea);
  const now = new Date().toISOString();

  const accuracy = jitter(profile.baseAccuracy, 0.06);
  const falsePositiveRate = jitter(profile.baseFPR, 0.04);
  const falseNegativeRate = jitter(profile.baseFNR, 0.06);

  let recommendation: ValidationRun["recommendation"];
  if (accuracy >= 0.88 && falsePositiveRate <= 0.05) {
    recommendation = "production_candidate";
  } else if (accuracy >= 0.82 && falsePositiveRate <= 0.08) {
    recommendation = "ready_for_sdk";
  } else if (accuracy >= 0.75) {
    recommendation = "poc_passed";
  } else if (accuracy >= 0.6) {
    recommendation = "needs_more_data";
  } else {
    recommendation = "rejected";
  }

  return {
    id: generateId("validation"),
    pocId: poc.id,
    ideaId: idea.id,
    accuracy: Math.round(accuracy * 1000) / 1000,
    falsePositiveRate: Math.round(falsePositiveRate * 1000) / 1000,
    falseNegativeRate: Math.round(falseNegativeRate * 1000) / 1000,
    latencyMs: profile.latencyMs + Math.floor(Math.random() * 3),
    memoryKb: profile.memoryKb + Math.floor(Math.random() * 4),
    cpuImpact: profile.latencyMs > 6 ? "medium" : "low",
    privacyRisk: idea.privacyRisk,
    recommendation,
    sessionCounts: {
      realBrowser: 150 + Math.floor(Math.random() * 50),
      playwright: 100 + Math.floor(Math.random() * 30),
      puppeteer: 50 + Math.floor(Math.random() * 20),
    },
    createdAt: now,
  };
}

export function simulatePlaywrightVsBrowser(idea: SignalIdea): {
  browserMeanScore: number;
  playwrightMeanScore: number;
  separation: number;
} {
  const scoreFactor = idea.score / 100;
  const browserMeanScore = 0.15 + Math.random() * 0.1;
  const playwrightMeanScore = 0.55 + scoreFactor * 0.35 + Math.random() * 0.1;
  const separation = playwrightMeanScore - browserMeanScore;

  return {
    browserMeanScore: Math.round(browserMeanScore * 1000) / 1000,
    playwrightMeanScore: Math.round(playwrightMeanScore * 1000) / 1000,
    separation: Math.round(separation * 1000) / 1000,
  };
}
