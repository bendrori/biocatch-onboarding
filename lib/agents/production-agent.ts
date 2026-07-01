import type { ProductionArtifact, SignalIdea, ValidationRun } from "@/lib/types";
import { generateId } from "@/lib/db/store";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function generateRfc(idea: SignalIdea, validation?: ValidationRun): ProductionArtifact {
  const slug = slugify(idea.title);
  const now = new Date().toISOString();

  const content = `# RFC: ${idea.title}

**Status:** Draft — Pending Engineering Review
**Author:** BioCatch SDK Foundry Production Agent
**Created:** ${now.split("T")[0]}
**Collection Layer:** ${idea.collectionLayer}
**Platforms:** ${idea.platforms.join(", ")}

---

## Summary

${idea.description}

## Motivation

This signal addresses growing agentic browser and automation threats. ${
    idea.expectedValue === "critical" || idea.expectedValue === "high"
      ? "High business impact with strong customer demand."
      : "Moderate business impact with strategic detection value."
  }

## Signal Specification

| Property | Value |
|----------|-------|
| Signal Type | ${idea.signalType} |
| Collection Layer | ${idea.collectionLayer} |
| Expected Value | ${idea.expectedValue} |
| False Positive Risk | ${idea.falsePositiveRisk} |
| Engineering Difficulty | ${idea.engineeringDifficulty} |
| Privacy Risk | ${idea.privacyRisk} |
| Innovation Score | ${idea.score}/100 |

### Required Data Points
${idea.requiredData.map((d) => `- ${d}`).join("\n")}

## Validation Results

${
  validation
    ? `| Metric | Value |
|--------|-------|
| Accuracy | ${(validation.accuracy * 100).toFixed(1)}% |
| False Positive Rate | ${(validation.falsePositiveRate * 100).toFixed(1)}% |
| False Negative Rate | ${(validation.falseNegativeRate * 100).toFixed(1)}% |
| Latency | ${validation.latencyMs}ms |
| Memory | ${validation.memoryKb}KB |
| Recommendation | ${validation.recommendation} |

Sessions tested: ${validation.sessionCounts.realBrowser} real browser, ${validation.sessionCounts.playwright} Playwright, ${validation.sessionCounts.puppeteer} Puppeteer.`
    : "Validation pending — run Validation Lab before production implementation."
}

## Implementation Plan

### Phase 1: JS SDK Collector
1. Add signal collector module
2. Add protobuf field definition
3. Unit tests for collector logic
4. Feature flag: \`signal.${slug}.enabled\`

### Phase 2: Backend Integration
1. Add parser for new protobuf field
2. Add model feature extraction
3. Add scoring integration
4. Dashboard explainability widget

### Phase 3: QA & Rollout
1. Playwright regression suite
2. FP/FN analysis on production shadow mode
3. Gradual rollout via feature flag
4. Customer pilot (if applicable)

## Security & Privacy

- No PII collected by this signal
- All data processed per BioCatch privacy classification policy
- Sandbox-validated PoC code only
- Human approval required before production deployment

## Open Questions

1. Mobile web parity timeline?
2. Backend model retraining schedule?
3. Customer communication plan for explainability?

## Approval Gates

- [ ] Research approval
- [ ] PoC validation passed
- [ ] Engineering RFC review
- [ ] Security review
- [ ] Privacy review
- [ ] Feature flag proposal approved
`;

  return {
    id: generateId("artifact"),
    ideaId: idea.id,
    artifactType: "rfc",
    title: `RFC: ${idea.title}`,
    content,
    status: "pending_approval",
    createdAt: now,
  };
}

export function generateJiraEpic(idea: SignalIdea): ProductionArtifact {
  const slug = slugify(idea.title);
  const now = new Date().toISOString();

  const content = `# Epic: ${idea.title}

## Epic Description
${idea.description}

## Tasks

1. **[SDK]** Add JS SDK collector for ${slug}
2. **[SDK]** Add protobuf field for signal data
3. **[Backend]** Add backend parser for new field
4. **[Backend]** Add model feature extraction
5. **[Platform]** Add feature flag \`signal.${slug}.enabled\`
6. **[QA]** Add Playwright vs browser validation tests
7. **[QA]** Add FP/FN regression suite
8. **[Product]** Add dashboard explainability widget
9. **[Docs]** Add internal documentation
10. **[Docs]** Add release notes entry

## Labels
biocatch-sdk-foundry, detection, ${idea.signalType}, ${idea.platforms.join(", ")}

## Priority
${idea.expectedValue === "critical" ? "P0" : idea.expectedValue === "high" ? "P1" : "P2"}

## Story Points Estimate
${idea.engineeringDifficulty === "high" ? "21" : idea.engineeringDifficulty === "medium" ? "13" : "8"}
`;

  return {
    id: generateId("artifact"),
    ideaId: idea.id,
    artifactType: "jira_epic",
    title: `Epic: ${idea.title}`,
    content,
    jiraUrl: `https://biocatch.atlassian.net/browse/SF-${Math.floor(Math.random() * 9000 + 1000)}`,
    status: "draft",
    createdAt: now,
  };
}

export function generateProductionArtifacts(
  idea: SignalIdea,
  validation?: ValidationRun
): ProductionArtifact[] {
  return [generateRfc(idea, validation), generateJiraEpic(idea)];
}
