import fs from "fs";
import path from "path";
import type {
  AuditLog,
  AgentRun,
  Document,
  Insight,
  Poc,
  ProductionArtifact,
  ResearchTopic,
  SignalIdea,
  TopicDocument,
  ValidationRun,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "signalforge.json");

interface Database {
  documents: Document[];
  insights: Insight[];
  researchTopics: ResearchTopic[];
  topicDocuments: TopicDocument[];
  signalIdeas: SignalIdea[];
  pocs: Poc[];
  validationRuns: ValidationRun[];
  productionArtifacts: ProductionArtifact[];
  auditLogs: AuditLog[];
  agentRuns: AgentRun[];
}

const emptyDb: Database = {
  documents: [],
  insights: [],
  researchTopics: [],
  topicDocuments: [],
  signalIdeas: [],
  pocs: [],
  validationRuns: [],
  productionArtifacts: [],
  auditLogs: [],
  agentRuns: [],
};

function ensureDb(): Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb, null, 2));
    return { ...emptyDb };
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return { ...emptyDb, ...JSON.parse(raw) };
}

function saveDb(db: Database): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const db = {
  read(): Database {
    return ensureDb();
  },

  write(updater: (db: Database) => Database): Database {
    const current = ensureDb();
    const updated = updater(current);
    saveDb(updated);
    return updated;
  },

  reset(): void {
    saveDb({ ...emptyDb });
  },
};

export function addAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  actor = "system"
): AuditLog {
  const log: AuditLog = {
    id: generateId("audit"),
    action,
    entityType,
    entityId,
    details,
    actor,
    createdAt: new Date().toISOString(),
  };
  db.write((d) => ({ ...d, auditLogs: [log, ...d.auditLogs] }));
  return log;
}
