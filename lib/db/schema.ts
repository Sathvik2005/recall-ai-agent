import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
export const conversations = pgTable("conversations", {
 id: uuid("id").defaultRandom().primaryKey(), title: text("title").notNull(),
 createdAt: timestamp("created_at",{withTimezone:true}).defaultNow().notNull(),
 updatedAt: timestamp("updated_at",{withTimezone:true}).defaultNow().notNull()
});
export const messages = pgTable("messages", {
 id: uuid("id").defaultRandom().primaryKey(),
 conversationId: uuid("conversation_id").notNull().references(()=>conversations.id,{onDelete:"cascade"}),
 role: text("role").notNull(), content: text("content").notNull(),
 createdAt: timestamp("created_at",{withTimezone:true}).defaultNow().notNull()
}, t=>[index("messages_conversation_created_idx").on(t.conversationId,t.createdAt)]);
export const researchRuns = pgTable("research_runs", {
 id: uuid("id").defaultRandom().primaryKey(),
 conversationId: uuid("conversation_id").references(()=>conversations.id,{onDelete:"set null"}),
 query: text("query").notNull(), status: text("status").notNull(),
 startedAt: timestamp("started_at",{withTimezone:true}).defaultNow().notNull(),
 completedAt: timestamp("completed_at",{withTimezone:true})
});
export const evidence = pgTable("evidence", {
 id: uuid("id").defaultRandom().primaryKey(),
 runId: uuid("run_id").notNull().references(()=>researchRuns.id,{onDelete:"cascade"}),
 url: text("url").notNull(), title: text("title").notNull(), snippet: text("snippet").notNull(),
 publishedAt: timestamp("published_at",{withTimezone:true}),
 observedAt: timestamp("observed_at",{withTimezone:true}).defaultNow().notNull(),
 contentHash: text("content_hash")
}, t=>[index("evidence_run_idx").on(t.runId)]);
export const memoryFacts = pgTable("memory_facts", {
 id: uuid("id").defaultRandom().primaryKey(),
 conversationId: uuid("conversation_id").references(()=>conversations.id,{onDelete:"set null"}),
 subject: text("subject").notNull(), predicate: text("predicate").notNull(), object: text("object").notNull(),
 sourceMessageId: uuid("source_message_id"),
 observedAt: timestamp("observed_at",{withTimezone:true}).defaultNow().notNull(),
 metadata: jsonb("metadata").$type<Record<string,unknown>>().default({})
}, t=>[index("memory_subject_idx").on(t.subject)]);
