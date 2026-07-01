import type { Document } from "@/lib/types";
import { generateId } from "@/lib/db/store";

export interface CollectorSource {
  name: string;
  url: string;
  type: "external" | "internal";
}

export const COLLECTOR_SOURCES: CollectorSource[] = [
  { name: "GitHub", url: "https://github.com", type: "external" },
  { name: "arXiv", url: "https://arxiv.org", type: "external" },
  { name: "Chrome Status", url: "https://chromestatus.com", type: "external" },
  { name: "Playwright", url: "https://playwright.dev", type: "external" },
  { name: "Browserbase", url: "https://browserbase.com", type: "external" },
  { name: "Puppeteer", url: "https://pptr.dev", type: "external" },
  { name: "Fingerprint", url: "https://fingerprint.com/blog", type: "external" },
  { name: "DataDome", url: "https://datadome.co", type: "external" },
  { name: "HUMAN", url: "https://humansecurity.com", type: "external" },
  { name: "Cloudflare", url: "https://blog.cloudflare.com", type: "external" },
  { name: "Hacker News", url: "https://news.ycombinator.com", type: "external" },
];

interface SeedDocument {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  rawContent: string;
  summary: string;
  tags: string[];
  sourceType: "external" | "internal";
}

const SEED_DOCUMENTS: SeedDocument[] = [
  {
    title: "Playwright 1.52 adds CDP-based DOM planning hooks",
    source: "Playwright",
    url: "https://playwright.dev/docs/release-notes",
    publishedAt: "2026-06-28",
    rawContent:
      "Playwright 1.52 introduces experimental support for CDP DOM planning events, enabling agents to pre-compute DOM mutation sequences before execution. This creates distinguishable timing patterns in focus and mutation ordering compared to human interaction.",
    summary:
      "Playwright adds CDP DOM planning hooks that may create detectable automation timing signatures.",
    tags: ["playwright", "automation", "cdp", "dom"],
    sourceType: "external",
  },
  {
    title: "Chrome ships navigator.userAgentData high entropy hints expansion",
    source: "Chrome Status",
    url: "https://chromestatus.com/feature/12345",
    publishedAt: "2026-06-25",
    rawContent:
      "Chrome 128 expands high-entropy Client Hints including platform version and architecture. Anti-fingerprinting mitigations reduce entropy for privacy-preserving users but automation frameworks may request full hints via CDP.",
    summary: "Chrome expands Client Hints entropy; automation tools may bypass reduced fingerprint surface via CDP.",
    tags: ["chrome", "browser", "api", "fingerprinting"],
    sourceType: "external",
  },
  {
    title: "Browserbase: Agentic browsing at scale with pre-navigation DOM snapshots",
    source: "Browserbase",
    url: "https://browserbase.com/blog/agentic-browsing",
    publishedAt: "2026-06-20",
    rawContent:
      "Browserbase documents agentic browsing patterns where AI agents capture pre-navigation DOM snapshots and batch mutation plans. Session telemetry shows distinct event burst patterns vs organic user flows.",
    summary: "Browserbase agentic browsing creates batch DOM mutation patterns distinguishable from human sessions.",
    tags: ["browserbase", "agentic", "automation", "ai"],
    sourceType: "external",
  },
  {
    title: "arXiv: Detecting LLM-driven web agents via interaction entropy",
    source: "arXiv",
    url: "https://arxiv.org/abs/2606.12345",
    publishedAt: "2026-06-15",
    rawContent:
      "Research demonstrates that LLM-driven web agents exhibit lower interaction entropy and higher DOM mutation predictability. Proposed metrics include focus transition regularity and scroll acceleration uniformity.",
    summary: "Academic research identifies interaction entropy as a signal for LLM-driven web agents.",
    tags: ["research", "ai", "agentic", "entropy"],
    sourceType: "external",
  },
  {
    title: "DataDome launches real-time agentic session scoring API",
    source: "DataDome",
    url: "https://datadome.co/blog/agentic-scoring",
    publishedAt: "2026-06-10",
    rawContent:
      "DataDome announces agentic session scoring detecting AI browser agents via behavioral biometrics. Capabilities include DOM planning detection and synthetic pointer path analysis.",
    summary: "Competitor DataDome ships agentic session scoring — gap analysis needed for BioCatch parity.",
    tags: ["competitor", "datadome", "agentic", "scoring"],
    sourceType: "external",
  },
  {
    title: "GitHub: Puppeteer stealth plugin updates WebGL spoofing",
    source: "GitHub",
    url: "https://github.com/berstend/puppeteer-extra",
    publishedAt: "2026-06-05",
    rawContent:
      "puppeteer-extra-plugin-stealth v2.12 updates WebGL vendor/renderer spoofing and removes automation flags from navigator.webdriver. Evasion techniques increasingly target Client Hints consistency.",
    summary: "Puppeteer stealth plugin evolves evasion — WebGL and Client Hints consistency checks needed.",
    tags: ["puppeteer", "evasion", "stealth", "github"],
    sourceType: "external",
  },
  {
    title: "Internal: Bank A requests agentic bot detection for mobile web",
    source: "Salesforce",
    url: "internal://salesforce/case/78234",
    publishedAt: "2026-06-01",
    rawContent:
      "Bank A escalation: increasing agentic bot traffic on mobile web login flows. Requesting detection for AI-driven form filling with human-like timing. Similar request from Bank B last quarter.",
    summary: "Customer escalation — two banks requesting agentic bot detection on mobile web.",
    tags: ["customer", "mobile_web", "agentic", "internal"],
    sourceType: "internal",
  },
  {
    title: "Fingerprint Pro adds device intelligence for headless Chrome 128",
    source: "Fingerprint",
    url: "https://fingerprint.com/blog/headless-chrome-128",
    publishedAt: "2026-05-28",
    rawContent:
      "Fingerprint Pro updates headless Chrome 128 detection using combination of Client Hints, WebGL, and timing analysis. Claims 94% accuracy on Playwright sessions.",
    summary: "Competitor Fingerprint updates headless detection — benchmark against our Playwright separation.",
    tags: ["competitor", "fingerprint", "headless", "playwright"],
    sourceType: "external",
  },
  {
    title: "arXiv: Continuous authentication via keystroke and mouse dynamics",
    source: "arXiv",
    url: "https://arxiv.org/abs/2606.20011",
    publishedAt: "2026-06-18",
    rawContent:
      "Study shows keystroke dwell/flight timing and mouse velocity, acceleration, and curvature yield high-accuracy continuous authentication. Behavioral biometric drift reliably flags mid-session account takeover.",
    summary: "Research validates keystroke and mouse dynamics as behavioral biometrics for continuous authentication and ATO detection.",
    tags: ["research", "behavioral", "biometric", "keystroke", "mouse", "account takeover"],
    sourceType: "external",
  },
  {
    title: "W3C ships Device Motion and Sensor API updates for mobile web",
    source: "Chrome Status",
    url: "https://chromestatus.com/feature/devicemotion-2026",
    publishedAt: "2026-06-12",
    rawContent:
      "New browser API surface exposes higher-resolution accelerometer and gyroscope streams on mobile web. Enables device-motion behavioral signals and emulator detection via missing sensor noise.",
    summary: "New mobile sensor API enables device-motion biometrics and emulator detection.",
    tags: ["chrome", "browser api", "mobile", "sensor", "accelerometer", "gyroscope"],
    sourceType: "external",
  },
  {
    title: "Cloudflare details TLS JA4 and HTTP/2 fingerprinting at the edge",
    source: "Cloudflare",
    url: "https://blog.cloudflare.com/ja4-http2-fingerprinting",
    publishedAt: "2026-06-08",
    rawContent:
      "Cloudflare documents JA4 TLS ClientHello fingerprinting and HTTP/2 SETTINGS-frame analysis at the edge to catch clients whose TLS stack mismatches their claimed user-agent. Residential proxy and datacenter IP intelligence add reputation scoring.",
    summary: "Edge TLS/JA4 and HTTP2 fingerprinting plus IP reputation for network-layer bot detection.",
    tags: ["cloudflare", "edge", "cdn", "tls", "ja4", "http2", "proxy", "ip reputation"],
    sourceType: "external",
  },
  {
    title: "GitHub: Open-source canvas, WebGL and audio fingerprinting toolkit",
    source: "GitHub",
    url: "https://github.com/example/device-fingerprint-kit",
    publishedAt: "2026-06-03",
    rawContent:
      "Toolkit combines canvas pixel hashing, WebGL vendor/renderer, audio context, and font enumeration into a stable device fingerprint. SwiftShader and llvmpipe renderers reliably expose virtualized automation environments.",
    summary: "Device fingerprinting toolkit (canvas, WebGL, audio, fonts) surfaces virtualized bot environments.",
    tags: ["github", "device fingerprint", "canvas", "webgl", "audio", "font"],
    sourceType: "external",
  },
  {
    title: "Internal: Bank C escalation — remote-access scam losses on mobile app",
    source: "Salesforce",
    url: "internal://salesforce/case/79120",
    publishedAt: "2026-05-30",
    rawContent:
      "Bank C reports rising authorized push payment fraud from remote-access (AnyDesk/TeamViewer) and social-engineering scams. Victims are coached over the phone, showing long hesitation and dictated data entry on payment fields. Requesting screen-sharing and remote-control detection.",
    summary: "Customer escalation — remote-access and social-engineering scam detection needed on mobile app.",
    tags: ["customer", "scam", "remote access", "anydesk", "social engineering", "authorized push payment", "internal"],
    sourceType: "external",
  },
  {
    title: "Threat report: Residential-proxy credential stuffing and mule networks",
    source: "HUMAN",
    url: "https://humansecurity.com/threat/residential-proxy-2026",
    publishedAt: "2026-05-25",
    rawContent:
      "Report describes large-scale credential stuffing over residential proxies feeding money-mule account networks. Attackers reuse devices across accounts and paste credentials, while mules show low data familiarity when managing beneficiaries.",
    summary: "Credential stuffing over residential proxies feeding mule networks — device-sharing and familiarity signals apply.",
    tags: ["threat", "credential stuffing", "proxy", "mule", "device sharing", "behavioral"],
    sourceType: "external",
  },
];

export function collectDocuments(existingUrls: string[]): Document[] {
  const now = new Date().toISOString();
  const existing = new Set(existingUrls);

  return SEED_DOCUMENTS.filter((d) => !existing.has(d.url)).map((d) => ({
    id: generateId("doc"),
    title: d.title,
    source: d.source,
    url: d.url,
    publishedAt: d.publishedAt,
    collectedAt: now,
    rawContent: d.rawContent,
    summary: d.summary,
    tags: d.tags,
    sourceType: d.sourceType,
    createdAt: now,
  }));
}

export async function fetchFromSource(source: CollectorSource): Promise<Document[]> {
  // MVP: simulated collection from curated seed data filtered by source
  const now = new Date().toISOString();
  return SEED_DOCUMENTS.filter((d) => d.source === source.name).map((d) => ({
    id: generateId("doc"),
    title: d.title,
    source: d.source,
    url: d.url,
    publishedAt: d.publishedAt,
    collectedAt: now,
    rawContent: d.rawContent,
    summary: d.summary,
    tags: d.tags,
    sourceType: d.sourceType,
    createdAt: now,
  }));
}
