import { getCurrentUser, getSessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db/connection";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, handleApiError } from "../shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    let sessionId: number | null = null;
    if (user) {
      const token = await getSessionToken();
      if (token) {
        const db = getDb();
        if (db) {
          const [session] = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, token))
            .limit(1);
          if (session) sessionId = session.id;
        }
      }
    }
    return apiSuccess({ authenticated: !!user, user, sessionId });
  } catch (error) {
    return handleApiError("auth/session", error);
  }
}
