# BioCatch SDK Foundry

Autonomous research and innovation platform that continuously discovers, analyzes, validates, and converts new signals into production-ready BioCatch detection capabilities.

**This is not a chatbot.** This is an internal autonomous R&D lab.

## Vision

Move faster from:

**Research → Signal idea → PoC → Validation → SDK/backend implementation → Documentation → Jira/release readiness**

## MVP Features

- **Knowledge Collector** — GitHub, arXiv, Chrome Status, Playwright, Browserbase, competitor blogs
- **Research Understanding Agent** — Structured detection insight extraction
- **Correlation Engine** — Groups related findings into research topics
- **Innovation Agent** — Generates ranked signal ideas with scoring
- **PoC Generator** — JavaScript signal code with tests
- **Validation Lab** — Playwright vs browser session metrics
- **Production Readiness Agent** — RFC and Jira epic generation
- **Dashboard** — Executive view, research feed, ideas, topics, validation, pipeline
- **Human Approval Gates** — Required before PoC, validation, RFC, and production actions

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (dark-first)
- Zustand for client state
- File-based JSON persistence (MVP; PostgreSQL-ready schema)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the dashboard.

### First Run

1. Click **Run Daily Pipeline** in the sidebar
2. Browse **Research Feed** for collected documents and insights
3. Review **Signal Ideas** and approve high-scoring ideas
4. Generate PoC → Run Validation → Generate RFC

## Architecture

| Module | Description |
|--------|-------------|
| Knowledge Collector | Ingests external/internal technical documents |
| Research Agent | Extracts detection-relevant insights |
| Knowledge Graph | Connects entities (Phase 2) |
| Correlation Engine | Groups findings into research topics |
| Innovation Agent | Generates and scores signal ideas |
| PoC Generator | Creates sandbox JavaScript signal code |
| Validation Lab | Tests signals against automation sessions |
| Production Agent | Creates RFCs, Jira epics, implementation plans |
| Dashboard | Human review and approval workflow |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/pipeline` | GET/POST | Dashboard stats / run daily pipeline |
| `/api/documents` | GET | Collected documents |
| `/api/insights` | GET | Extracted insights |
| `/api/topics` | GET | Research topics |
| `/api/ideas` | GET | Signal ideas |
| `/api/ideas/[id]/approve` | POST | Approve idea (human gate) |
| `/api/pocs/generate` | POST | Generate JavaScript PoC |
| `/api/validation` | GET/POST | Validation results / run validation |
| `/api/artifacts` | GET/POST | Production artifacts / generate RFC |

## Security

- No secrets in prompts
- No customer PII sent to external LLMs
- All write actions require human approval
- Audit trail for every generated artifact
- Sandbox execution for generated PoC code

## License

Internal BioCatch use only.
