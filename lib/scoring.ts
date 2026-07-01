import type { IdeaScores, ImpactLevel } from "@/lib/types";

const impactWeight: Record<ImpactLevel, number> = {
  critical: 1,
  high: 0.8,
  medium: 0.5,
  low: 0.2,
};

const difficultyPenalty: Record<string, number> = {
  high: 0.3,
  medium: 0.15,
  low: 0.05,
};

export function computeIdeaScore(scores: IdeaScores): number {
  const positive =
    scores.detectionValue * 0.2 +
    scores.novelty * 0.15 +
    scores.customerRelevance * 0.15 +
    scores.arrImpact * 0.15 +
    scores.crossPlatformPotential * 0.1 +
    scores.competitiveAdvantage * 0.1;

  const negative =
    scores.engineeringCost * 0.05 +
    scores.latencyCost * 0.05 +
    scores.privacyRisk * 0.03 +
    scores.falsePositiveRisk * 0.02;

  return Math.round(Math.max(0, Math.min(100, (positive - negative) * 100)));
}

export function impactToScore(level: ImpactLevel): number {
  return impactWeight[level];
}

export function difficultyToPenalty(level: string): number {
  return difficultyPenalty[level] ?? 0.15;
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Weak";
  return "Low";
}

export function priorityFromScore(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}
