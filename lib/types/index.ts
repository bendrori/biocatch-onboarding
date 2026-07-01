export type SourceType = "external" | "internal";
export type Priority = "critical" | "high" | "medium" | "low";
export type ImpactLevel = "critical" | "high" | "medium" | "low";
export type DifficultyLevel = "high" | "medium" | "low";
export type Platform = "web" | "mobile_web" | "ios" | "android" | "edge" | "backend";
export type CollectionLayer = "JS SDK" | "iOS SDK" | "Android SDK" | "CDN/Edge" | "Backend";
export type SignalType = "behavioral" | "device" | "network" | "environmental" | "automation";

export type InsightType =
  | "new_browser_api"
  | "new_mobile_api"
  | "automation_framework_change"
  | "agentic_browser_behavior"
  | "anti_fingerprinting_change"
  | "bot_evasion_technique"
  | "competitor_capability"
  | "customer_deployment_pattern"
  | "sdk_collection_opportunity"
  | "backend_scoring_opportunity"
  | "edge_cdn_opportunity"
  | "explainability_improvement";

export type IdeaStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "poc_in_progress"
  | "validating"
  | "validated"
  | "production_ready"
  | "shipped";

export type PipelineStage =
  | "collected"
  | "insight"
  | "topic"
  | "idea"
  | "poc"
  | "validation"
  | "rfc"
  | "jira"
  | "shipped";

export type ValidationRecommendation =
  | "rejected"
  | "needs_more_data"
  | "poc_passed"
  | "ready_for_sdk"
  | "ready_for_backend"
  | "ready_for_pilot"
  | "production_candidate";

export type PocType = "javascript" | "android" | "ios" | "cdn_worker" | "backend" | "simulator";

export type ArtifactType = "rfc" | "jira_epic" | "sdk_plan" | "backend_plan" | "release_notes" | "qa_plan";

export interface Document {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  collectedAt: string;
  rawContent: string;
  summary: string;
  tags: string[];
  sourceType: SourceType;
  createdAt: string;
}

export interface Insight {
  id: string;
  documentId: string;
  type: InsightType;
  title: string;
  description: string;
  possibleSignals: string[];
  affectedPlatforms: Platform[];
  confidence: number;
  businessImpact: ImpactLevel;
  engineeringDifficulty: DifficultyLevel;
  falsePositiveRisk: ImpactLevel;
  createdAt: string;
}

export interface ResearchTopic {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: "open" | "active" | "resolved" | "archived";
  relatedDocuments: number;
  relatedCompanies: string[];
  relatedCustomers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TopicDocument {
  topicId: string;
  documentId: string;
}

export interface SignalIdea {
  id: string;
  topicId: string | null;
  title: string;
  description: string;
  signalType: SignalType;
  platforms: Platform[];
  collectionLayer: CollectionLayer;
  requiredData: string[];
  expectedValue: ImpactLevel;
  falsePositiveRisk: ImpactLevel;
  engineeringDifficulty: DifficultyLevel;
  privacyRisk: ImpactLevel;
  score: number;
  status: IdeaStatus;
  pipelineStage: PipelineStage;
  recommendedNextStep: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface IdeaScores {
  detectionValue: number;
  novelty: number;
  customerRelevance: number;
  arrImpact: number;
  engineeringCost: number;
  latencyCost: number;
  privacyRisk: number;
  falsePositiveRisk: number;
  crossPlatformPotential: number;
  competitiveAdvantage: number;
}

export interface Poc {
  id: string;
  ideaId: string;
  type: PocType;
  files: PocFile[];
  instructions: string;
  status: "generating" | "ready" | "failed";
  createdAt: string;
}

export interface PocFile {
  path: string;
  content: string;
}

export interface ValidationRun {
  id: string;
  pocId: string;
  ideaId: string;
  accuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  latencyMs: number;
  memoryKb: number;
  cpuImpact: DifficultyLevel;
  privacyRisk: ImpactLevel;
  recommendation: ValidationRecommendation;
  sessionCounts: {
    realBrowser: number;
    playwright: number;
    puppeteer: number;
  };
  createdAt: string;
}

export interface ProductionArtifact {
  id: string;
  ideaId: string;
  artifactType: ArtifactType;
  title: string;
  content: string;
  jiraUrl?: string;
  status: "draft" | "pending_approval" | "approved" | "published";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  details: string;
  createdAt: string;
}

export interface DashboardStats {
  documentsCollectedThisWeek: number;
  ideasGenerated: number;
  pocsCreated: number;
  validatedSignals: number;
  productionCandidates: number;
  customerRequestsCovered: number;
  pendingApprovals: number;
  activeTopics: number;
}

export interface PipelineItem {
  id: string;
  title: string;
  stage: PipelineStage;
  score?: number;
  updatedAt: string;
}

export interface AgentRun {
  id: string;
  agent: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  summary: string;
  itemsProcessed: number;
}
