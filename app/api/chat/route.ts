import { NextRequest,NextResponse } from "next/server";
import { asc,desc,eq } from "drizzle-orm";
import { chatRequestSchema } from "@/lib/validation/chat";
import { runAgent } from "@/lib/agent/run";
import { getDb } from "@/lib/db";
import { conversations,messages,researchRuns,evidence } from "@/lib/db/schema";
export const runtime="nodejs";
export const maxDuration=60;
export async function POST(request:NextRequest) {
 try {
  const parsed=chatRequestSchema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"Invalid request",details:parsed.error.flatten()},{status:400});
  const {message,conversationId,timeZone}=parsed.data;const db=getDb();let conversation;
  if(conversationId) {
   const rows=await db.select().from(conversations).where(eq(conversations.id,conversationId)).limit(1);
   conversation=rows[0];if(!conversation)return NextResponse.json({error:"Conversation not found."},{status:404});
  } else {
   const rows=await db.insert(conversations).values({title:message.slice(0,72)}).returning();conversation=rows[0];
  }
  const previous=await db.select().from(messages).where(eq(messages.conversationId,conversation.id)).orderBy(asc(messages.createdAt)).limit(32);
  const globalMemory=await db.select({role:messages.role,content:messages.content,createdAt:messages.createdAt,title:conversations.title})
   .from(messages).innerJoin(conversations,eq(messages.conversationId,conversations.id))
   .orderBy(desc(messages.createdAt)).limit(80);
  await db.insert(messages).values({conversationId:conversation.id,role:"user",content:message});
  const history=previous.map(row=>({role:row.role==="assistant"?"assistant" as const:"user" as const,content:row.content}));
  const zone=timeZone&&/^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+-]+)*$/.test(timeZone)?timeZone:"UTC";
  const memoryContext=globalMemory.reverse().map(row=>{
   let stamp:string;
   try{stamp=new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:zone}).format(row.createdAt);}
   catch{stamp=row.createdAt.toISOString();}
   return "["+stamp+" | "+row.title+"] "+(row.role==="assistant"?"RECALL: ":"USER: ")+row.content.slice(0,1400);
  }).join("\n");
  const run=await runAgent(message,history,memoryContext);
  await db.insert(messages).values({conversationId:conversation.id,role:"assistant",content:run.text});
  await db.update(conversations).set({updatedAt:new Date()}).where(eq(conversations.id,conversation.id));
  if(run.searched) {
   const saved=await db.insert(researchRuns).values({conversationId:conversation.id,query:message,status:"completed",completedAt:new Date()}).returning();
   if(saved[0]&&run.sources.length)await db.insert(evidence).values(run.sources.map(source=>({
    runId:saved[0].id,url:source.url,title:source.title,snippet:source.snippet,
    publishedAt:source.publishedAt&&!Number.isNaN(Date.parse(source.publishedAt))?new Date(source.publishedAt):null
   })));
  }
  return NextResponse.json({conversationId:conversation.id,answer:run.text,sources:run.sources,searched:run.searched});
 } catch(error) {
  console.error("[api/chat]",error);const message=error instanceof Error?error.message:"Unexpected server error.";
  return NextResponse.json({error:message},{status:message.includes("not configured")?503:500});
 }
}
