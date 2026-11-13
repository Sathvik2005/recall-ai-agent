import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
export const runtime="nodejs";
export async function GET() {
 try {const rows=await getDb().select().from(conversations).orderBy(desc(conversations.updatedAt)).limit(50);return NextResponse.json({conversations:rows});}
 catch(error){const message=error instanceof Error?error.message:"Database unavailable.";return NextResponse.json({error:message},{status:503});}
}
