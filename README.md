# RECALL

**An agent that remembers what you asked, researches what changed, and tells you what matters today.**

RECALL is a stateful research assistant for temporal questions: revisiting an earlier decision, identifying the entities discussed, checking fresh web evidence, and distinguishing what was known then from what is known now.

## Stack
Next.js 15 · TypeScript · Vercel AI SDK · OpenAI · Tavily · Neon PostgreSQL · Drizzle · Zod · Vitest.

## Local development
1. Use Node.js 20.9 or newer.
2. Copy \`.env.example\` to \`.env.local\`.
3. Set \`OPENAI_API_KEY\`, \`TAVILY_API_KEY\`, and \`DATABASE_URL\`.
4. Install dependencies: \`npm install\`.
5. Apply the SQL migration in \`drizzle/0000_initial.sql\` to your Neon database.
6. Run \`npm run dev\` and open http://localhost:3000.

## Vercel deployment
Import this repository into Vercel. Add the three environment variables above and deploy with the Next.js preset. Apply the SQL migration before using chat. Never commit secrets.

## Agent contract
The agent receives a bounded window of conversation history and the current user message. It can call only \`web_search\`, with a hard maximum of three searches per turn. Search results are validated, time-limited, stored as immutable evidence observations, and returned as clickable citations. The model must say when historical context is absent and classify temporal comparisons as confirmed, not found in checked sources, or inconclusive.

## API
- \`POST /api/chat\` — \`{ "message": "...", "conversationId": "optional UUID" }\`
- \`GET /api/conversations\` — latest conversations
- \`GET /api/conversations/:id\` — conversation history
- \`GET /api/memory\` — recent research runs and evidence observations

## Quality checks
\`npm run typecheck\` · \`npm run lint\` · \`npm test\` · \`npm run build\`.

## Security scope
This is an internship challenge MVP, not a security-reviewed multi-tenant SaaS. It currently has no authentication or tenant isolation. Anyone who can reach the deployment may interact with the shared data store. Keep it private during evaluation; add authentication, per-user ownership, rate limiting, abuse controls, retention/deletion, and monitoring before public multi-user use. See [DESIGN.md](./DESIGN.md) for architecture and trade-offs.
