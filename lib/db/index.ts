import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
type Database = ReturnType<typeof drizzle<typeof schema>>;
let cached: Database | undefined;
export function getDb() {
 const url=process.env.DATABASE_URL;
 if(!url) throw new Error("DATABASE_URL is not configured. Add a Neon PostgreSQL connection string.");
 if(!cached) cached=drizzle(neon(url),{schema});
 return cached;
}
