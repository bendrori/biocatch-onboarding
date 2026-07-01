import { collectDocuments } from "@/lib/agents/collector";
import { correlateTopics } from "@/lib/agents/correlation-engine";
import { generateIdeas } from "@/lib/agents/innovation-agent";
import { generatePoc } from "@/lib/agents/poc-generator";
import { generateProductionArtifacts } from "@/lib/agents/production-agent";
import { extractInsightsFromDocuments } from "@/lib/agents/research-agent";
import { runValidation } from "@/lib/agents/validation-agent";
import { addAuditLog, db, generateId } from "@/lib/db/store";
import type { AgentRun, DashboardStats } from "@/lib/types";

export interface PipelineResult {
  agentRun: AgentRun;
  stats: {
    documentsAdded: number;
    insightsAdded: number;
    topicsAdded: number;
    ideasAdded: number;
  };
}

export function runDailyPipeline(): PipelineResult {
  const startedAt = new Date().toISOString();
  const runId = generateId("run");

  const current = db.read();
  const existingUrls = current.documents.map((d) => d.url);

  const newDocuments = collectDocuments(existingUrls);
  const newInsights = extractInsightsFromDocuments(newDocuments);
  const { topics: newTopics, topicDocuments: newTopicDocs } = correlateTopics(
    [...current.documents, ...newDocuments],
    [...current.insights, ...newInsights],
    current.researchTopics
  );
  const existingIdeaTitles = current.signalIdeas.map((i) => i.title);
  const newIdeas = generateIdeas(
    newTopics.length > 0 ? newTopics : current.researchTopics,
    newInsights,
    existingIdeaTitles
  );

  db.write((d) => ({
    ...d,
    documents: [...newDocuments, ...d.documents],
    insights: [...newInsights, ...d.insights],
    researchTopics: [...newTopics, ...d.researchTopics],
    topicDocuments: [...newTopicDocs, ...d.topicDocuments],
    signalIdeas: [...newIdeas, ...d.signalIdeas],
  }));

  const completedAt = new Date().toISOString();
  const agentRun: AgentRun = {
    id: runId,
    agent: "Daily Research Pipeline",
    status: "completed",
    startedAt,
    completedAt,
    summary: `Collected ${newDocuments.length} documents, extracted ${newInsights.length} insights, created ${newTopics.length} topics, generated ${newIdeas.length} ideas.`,
    itemsProcessed: newDocuments.length + newInsights.length + newIdeas.length,
  };

  db.write((d) => ({ ...d, agentRuns: [agentRun, ...d.agentRuns] }));
  addAuditLog("pipeline_run", "agent_run", runId, agentRun.summary);

  return {
    agentRun,
    stats: {
      documentsAdded: newDocuments.length,
      insightsAdded: newInsights.length,
      topicsAdded: newTopics.length,
      ideasAdded: newIdeas.length,
    },
  };
}

export function approveIdea(ideaId: string, approvedBy: string): boolean {
  const current = db.read();
  const idea = current.signalIdeas.find((i) => i.id === ideaId);
  if (!idea) return false;

  const now = new Date().toISOString();
  db.write((d) => ({
    ...d,
    signalIdeas: d.signalIdeas.map((i) =>
      i.id === ideaId
        ? {
            ...i,
            status: "approved" as const,
            pipelineStage: "poc" as const,
            approvedAt: now,
            approvedBy,
          }
        : i
    ),
  }));

  addAuditLog("idea_approved", "signal_idea", ideaId, `Approved by ${approvedBy}`, approvedBy);
  return true;
}

export function rejectIdea(ideaId: string, rejectedBy: string): boolean {
  const current = db.read();
  if (!current.signalIdeas.find((i) => i.id === ideaId)) return false;

  db.write((d) => ({
    ...d,
    signalIdeas: d.signalIdeas.map((i) =>
      i.id === ideaId ? { ...i, status: "rejected" as const } : i
    ),
  }));

  addAuditLog("idea_rejected", "signal_idea", ideaId, `Rejected by ${rejectedBy}`, rejectedBy);
  return true;
}

export function generatePocForIdea(ideaId: string): { pocId: string } | null {
  const current = db.read();
  const idea = current.signalIdeas.find((i) => i.id === ideaId);
  if (!idea || idea.status !== "approved") return null;

  const existingPoc = current.pocs.find((p) => p.ideaId === ideaId);
  if (existingPoc) return { pocId: existingPoc.id };

  const poc = generatePoc(idea);

  db.write((d) => ({
    ...d,
    pocs: [poc, ...d.pocs],
    signalIdeas: d.signalIdeas.map((i) =>
      i.id === ideaId ? { ...i, status: "poc_in_progress" as const, pipelineStage: "poc" as const } : i
    ),
  }));

  addAuditLog("poc_generated", "poc", poc.id, `PoC generated for idea ${ideaId}`);
  return { pocId: poc.id };
}

export function runValidationForIdea(ideaId: string): { validationId: string } | null {
  const current = db.read();
  const idea = current.signalIdeas.find((i) => i.id === ideaId);
  const poc = current.pocs.find((p) => p.ideaId === ideaId);
  if (!idea || !poc) return null;

  const validation = runValidation(idea, poc);
  const isPassed =
    validation.recommendation === "poc_passed" ||
    validation.recommendation === "ready_for_sdk" ||
    validation.recommendation === "production_candidate";

  db.write((d) => ({
    ...d,
    validationRuns: [validation, ...d.validationRuns],
    signalIdeas: d.signalIdeas.map((i) =>
      i.id === ideaId
        ? {
            ...i,
            status: isPassed ? ("validated" as const) : ("validating" as const),
            pipelineStage: "validation" as const,
          }
        : i
    ),
  }));

  addAuditLog("validation_run", "validation_run", validation.id, `Validation for idea ${ideaId}`);
  return { validationId: validation.id };
}

export function generateRfcForIdea(ideaId: string): { artifactIds: string[] } | null {
  const current = db.read();
  const idea = current.signalIdeas.find((i) => i.id === ideaId);
  if (!idea) return null;

  const validation = current.validationRuns.find((v) => v.ideaId === ideaId);
  const existingRfc = current.productionArtifacts.find(
    (a) => a.ideaId === ideaId && a.artifactType === "rfc"
  );
  if (existingRfc) return { artifactIds: [existingRfc.id] };

  const artifacts = generateProductionArtifacts(idea, validation);

  db.write((d) => ({
    ...d,
    productionArtifacts: [...artifacts, ...d.productionArtifacts],
    signalIdeas: d.signalIdeas.map((i) =>
      i.id === ideaId
        ? {
            ...i,
            status: "production_ready" as const,
            pipelineStage: "rfc" as const,
          }
        : i
    ),
  }));

  addAuditLog("rfc_generated", "production_artifact", artifacts[0].id, `RFC for idea ${ideaId}`);
  return { artifactIds: artifacts.map((a) => a.id) };
}

export function getDashboardStats(): DashboardStats {
  const current = db.read();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const docsThisWeek = current.documents.filter(
    (d) => new Date(d.collectedAt) >= weekAgo
  ).length;

  return {
    documentsCollectedThisWeek: docsThisWeek,
    ideasGenerated: current.signalIdeas.length,
    pocsCreated: current.pocs.length,
    validatedSignals: current.validationRuns.filter(
      (v) =>
        v.recommendation === "poc_passed" ||
        v.recommendation === "ready_for_sdk" ||
        v.recommendation === "production_candidate"
    ).length,
    productionCandidates: current.signalIdeas.filter(
      (i) => i.status === "production_ready" || i.pipelineStage === "rfc"
    ).length,
    customerRequestsCovered: current.researchTopics.filter((t) => t.relatedCustomers.length > 0)
      .length,
    pendingApprovals: current.signalIdeas.filter((i) => i.status === "pending_review").length,
    activeTopics: current.researchTopics.filter((t) => t.status === "active").length,
  };
}

export function seedInitialData(): void {
  const current = db.read();
  if (current.documents.length > 0) return;
  runDailyPipeline();
}
