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

const DB_FILENAME = "biocatch-sdk-foundry.json";
const LEGACY_DB_FILENAME = "signalforge.json";

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
  __sdkFoundryDb?: Database;
};

function readMemoryDb(): Database {
  if (!globalStore.__sdkFoundryDb) {
    globalStore.__sdkFoundryDb = structuredClone(emptyDb);
  }
  return globalStore.__sdkFoundryDb;
}

function writeMemoryDb(db: Database): void {
  globalStore.__sdkFoundryDb = db;
}

/** Best-effort disk persistence for local Node.js dev; skipped on Cloudflare Edge. */
function tryPersistToDisk(db: Database): void {
  try {
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const dataDir = path.join(process.cwd(), "data");
    const dbFile = path.join(dataDir, DB_FILENAME);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  } catch {
    // Edge runtime / read-only filesystem — in-memory only.
  }
}

function tryLoadFromDisk(): Database | null {
  try {
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const dataDir = path.join(process.cwd(), "data");
    const dbFile = path.join(dataDir, DB_FILENAME);
    const legacyFile = path.join(dataDir, LEGACY_DB_FILENAME);
    const fileToLoad = fs.existsSync(dbFile) ? dbFile : legacyFile;
    if (!fs.existsSync(fileToLoad)) return null;
    const raw = fs.readFileSync(fileToLoad, "utf-8");
    return { ...emptyDb, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function ensureDb(): Database {
  const memory = readMemoryDb();
  if (memory.documents.length > 0 || memory.signalIdeas.length > 0) {
    return memory;
  }

  const fromDisk = tryLoadFromDisk();
  if (fromDisk) {
    writeMemoryDb(fromDisk);
    return fromDisk;
  }

  return memory;
}

function saveDb(db: Database): void {
  writeMemoryDb(db);
  tryPersistToDisk(db);
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
    saveDb(structuredClone(emptyDb));
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
