import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { createLogger } from "@/lib/logger";

const log = createLogger("db/connection");

const DATABASE_URL = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let dbError: Error | null = null;

export function getDb() {
  if (dbError) return null;
  if (!DATABASE_URL) {
    log.warn("DATABASE_URL not set");
    return null;
  }
  if (!db) {
    try {
      const sql = neon(DATABASE_URL);
      db = drizzle(sql, { schema });
    } catch (err) {
      dbError = err instanceof Error ? err : new Error("Failed to initialize DB");
      log.error("Failed to initialize database", dbError);
      return null;
    }
  }
  return db;
}

export function getDbError(): string | null {
  return dbError?.message ?? null;
}
