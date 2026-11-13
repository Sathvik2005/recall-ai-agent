import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { evidence,researchRuns } from "@/lib/db/schema";
export const runtime="nodejs";
export async function GET() {
 try {
  const db=getDb();const runs=await db.select().from(researchRuns).orderBy(desc(researchRuns.startedAt)).limit(50);
  const allEvidence=runs.length?await db.select().from(evidence).orderBy(desc(evidence.observedAt)).limit(100):[];
  return NextResponse.json({runs,evidence:allEvidence});
 } catch(error){const message=error instanceof Error?error.message:"Memory unavailable.";return NextResponse.json({error:message},{status:503});}
}
