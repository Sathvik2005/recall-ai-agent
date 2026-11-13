import { NextResponse } from "next/server";
import { asc,eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { conversations,messages } from "@/lib/db/schema";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 try {
  const {id}=await params;const db=getDb();
  const rows=await db.select().from(conversations).where(eq(conversations.id,id)).limit(1);
  if(!rows[0])return NextResponse.json({error:"Conversation not found."},{status:404});
  const history=await db.select().from(messages).where(eq(messages.conversationId,id)).orderBy(asc(messages.createdAt)).limit(100);
  return NextResponse.json({conversation:rows[0],messages:history.map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.content,sources:m.sources||[]}))});
 } catch(error){const message=error instanceof Error?error.message:"Conversation unavailable.";return NextResponse.json({error:message},{status:503});}
}
