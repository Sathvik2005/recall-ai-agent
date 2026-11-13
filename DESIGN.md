# RECALL — Design

## Product thesis
Most chat assistants treat each question as an isolated event. RECALL treats research as a timeline: the original question, the answer, the evidence observed at that time, and later observations remain connected. Its promise is: **remember what I asked, research what changed, and tell me what matters today.**

## Architecture
A single Next.js App Router deployment keeps the product easy to operate on Vercel. Route handlers validate requests, retrieve bounded conversation history, invoke a small TypeScript agent, and persist the answer and source observations. The agent exposes exactly one external capability: web search.

- UI: React, TypeScript, responsive chat and memory views.
- API: Next.js Node.js route handlers with Zod request validation.
- Orchestration: Vercel AI SDK tool-calling loop, capped at three searches per turn.
- Model adapter: OpenAI provider, configurable model name.
- Search adapter: Tavily with a 12-second timeout and runtime response validation.
- Persistence: Neon PostgreSQL and Drizzle ORM.
- Tests: Vitest for deterministic system-contract checks.

## Memory model
1. Episodic memory is the ordered message history. It answers what the user asked and when.
2. Research memory stores each research run and its source observations. \`observed_at\` is distinct from a source's publication date.
3. Semantic memory has a normalized fact table reserved for structured fact extraction. Automatic extraction is a deliberate follow-up, not simulated functionality.
4. Temporal comparison must compare saved historical evidence with fresh evidence. Missing history or inconclusive search results must be reported honestly.

Historical observations are append-only. A later price or feature update creates another observation; it must not mutate the old one.

## Reliability and safety
- Strict request schemas and bounded message history.
- One tool, at most three calls per turn, five results per query.
- Search timeout and response validation.
- No claim of exhaustive search.
- Search snippets are untrusted input; prompt injection in retrieved pages is ignored.
- Missing API configuration produces a clear service error.

## Trade-offs
A custom, small orchestrator is preferable to a multi-agent framework because there is one tool and a bounded control loop. SQL is preferable to a vector database for exact date and chronological retrieval. Semantic search or embeddings should be added only if benchmark results show that SQL/full-text retrieval cannot resolve topic references adequately.

## Known launch blockers
This repository is an evaluation-ready MVP foundation, not a security-reviewed multi-tenant SaaS. Before exposing it to untrusted public users, add authentication, tenant-scoped ownership checks, rate limits and quotas, origin/CSRF policy, conversation deletion/retention controls, observability, and a comprehensive benchmark suite. Do not store sensitive personal data in the unauthenticated deployment.

## Evaluation
Measure exact-date recall, entity resolution, temporal comparison correctness, citation precision, unsupported-claim rate, search calls per answer, and p50/p95 latency. Keep fixed historical fixtures and dated source snapshots so regressions are measurable.
