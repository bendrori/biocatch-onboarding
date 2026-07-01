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

const globalStore = globalThis as typeof globalThis & {
  __signalforgeDb?: Database;
};

/** Cloudflare Workers have no persistent writable filesystem — use in-memory store. */
function shouldUseMemoryStore(): boolean {
  return (
    process.env.CF_PAGES === "1" ||
    process.env.CLOUDFLARE_PAGES === "1" ||
    process.env.CF_WORKER === "1" ||
    typeof (globalThis as { Cloudflare?: unknown }).Cloudflare !== "undefined"
  );
}

function readMemoryDb(): Database {
  if (!globalStore.__signalforgeDb) {
    globalStore.__signalforgeDb = { ...emptyDb };
  }
  return globalStore.__signalforgeDb;
}

function writeMemoryDb(db: Database): void {
  globalStore.__signalforgeDb = db;
}

function canUseFilesystem(): boolean {
  if (shouldUseMemoryStore()) return false;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function ensureDb(): Database {
  if (!canUseFilesystem()) {
    return readMemoryDb();
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb, null, 2));
    return { ...emptyDb };
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return { ...emptyDb, ...JSON.parse(raw) };
}

function saveDb(db: Database): void {
  if (!canUseFilesystem()) {
    writeMemoryDb(db);
    return;
  }

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
