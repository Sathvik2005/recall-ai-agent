# RECALL evaluation plan

Use a fixed fixture set before changing prompts, retrieval, or orchestration. Record the model/provider version, fixture, tool calls, answer, citations, and latency for every run.

## Core dimensions
- **Exact-date recall:** did the answer identify the correct user message and local calendar date?
- **Cross-thread retrieval:** did it recover the right topic from a different conversation?
- **Entity resolution:** did pronouns such as "those five tools" resolve to the correct set?
- **Temporal comparison:** did the answer distinguish the stored historical observation from current evidence?
- **Citation precision:** does every cited claim map to a returned source?
- **Abstention quality:** does RECALL admit missing history or insufficient evidence?
- **Efficiency:** number of searches and p50/p95 end-to-end latency.

## Initial acceptance gates
- Zero fabricated historical messages on the fixed memory fixtures.
- Every current factual claim that requires web research has a source citation.
- Maximum three web-search calls per user turn.
- Missing memory produces an explicit limitation, not a guess.
- A lack of evidence is reported as inconclusive, not as proof that nothing changed.

## Fixture set
See \`eval/fixtures.json\`. The fixture timestamps use India Standard Time to exercise local-date interpretation. Extend the set with price changes, product release notes, conflicting sources, empty search results, and malformed provider payloads.
