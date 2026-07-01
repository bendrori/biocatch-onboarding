import type { Document, Insight, Priority, ResearchTopic } from "@/lib/types";
import { generateId } from "@/lib/db/store";
import { priorityFromScore } from "@/lib/scoring";

interface TopicCluster {
  keywords: string[];
  title: string;
  description: string;
  companies: string[];
}

const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    keywords: ["dom planning", "dom mutation", "agentic", "browserbase"],
    title: "Agentic browser DOM planning detection",
    description:
      "Multiple sources indicate agentic browsers pre-plan DOM mutations. Playwright, Browserbase, and research papers converge on detectable timing and focus patterns.",
    companies: ["Microsoft", "Browserbase", "Google"],
  },
  {
    keywords: ["playwright", "puppeteer", "automation", "headless"],
    title: "Automation framework detection vectors",
    description:
      "Automation framework updates create both evasion risks and detection opportunities. Playwright and Puppeteer changes require continuous signal validation.",
    companies: ["Microsoft", "Google"],
  },
  {
    keywords: ["client hints", "fingerprint", "entropy", "stealth"],
    title: "Anti-fingerprinting and evasion arms race",
    description:
      "Browser privacy changes and stealth plugin updates create fingerprint inconsistency detection opportunities.",
    companies: ["Google", "Fingerprint", "DataDome"],
  },
  {
    keywords: ["customer", "bank", "agentic", "mobile web"],
    title: "Customer demand: agentic bot detection",
    description:
      "Multiple banking customers requesting agentic bot detection on mobile web login flows. High ARR impact and roadmap relevance.",
    companies: ["Bank A", "Bank B"],
  },
  {
    keywords: ["competitor", "datadome", "fingerprint", "scoring"],
    title: "Competitive agentic detection capabilities",
    description:
      "Competitors shipping agentic session scoring. BioCatch needs parity analysis and differentiation strategy.",
    companies: ["DataDome", "Fingerprint", "HUMAN"],
  },
];

export function correlateTopics(
  documents: Document[],
  insights: Insight[],
  existingTopics: ResearchTopic[]
): { topics: ResearchTopic[]; topicDocuments: { topicId: string; documentId: string }[] } {
  const now = new Date().toISOString();
  const topics: ResearchTopic[] = [];
  const topicDocuments: { topicId: string; documentId: string }[] = [];
  const existingTitles = new Set(existingTopics.map((t) => t.title));

  for (const cluster of TOPIC_CLUSTERS) {
    if (existingTitles.has(cluster.title)) continue;

    const matchedDocs = documents.filter((doc) => {
      const text = `${doc.title} ${doc.rawContent} ${doc.tags.join(" ")}`.toLowerCase();
      return cluster.keywords.some((kw) => text.includes(kw));
    });

    if (matchedDocs.length < 2) continue;

    const matchedInsights = insights.filter((i) =>
      matchedDocs.some((d) => d.id === i.documentId)
    );

    const avgConfidence =
      matchedInsights.length > 0
        ? matchedInsights.reduce((s, i) => s + i.confidence, 0) / matchedInsights.length
        : 0.5;

    const score = Math.round(avgConfidence * 100);
    const topicId = generateId("topic");

    topics.push({
      id: topicId,
      title: cluster.title,
      description: cluster.description,
      priority: priorityFromScore(score) as Priority,
      status: "active",
      relatedDocuments: matchedDocs.length,
      relatedCompanies: cluster.companies,
      relatedCustomers: cluster.keywords.includes("customer") ? ["Bank A", "Bank B"] : [],
      createdAt: now,
      updatedAt: now,
    });

    for (const doc of matchedDocs) {
      topicDocuments.push({ topicId, documentId: doc.id });
    }
  }

  return { topics, topicDocuments };
}
