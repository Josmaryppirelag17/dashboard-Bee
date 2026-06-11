import { NextRequest } from "next/server";
import { eq, and, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/connection";
import { sessions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import {
  apiSuccess,
  apiError,
  handleApiError,
  unauthorizedResponse,
  dbNotConfiguredResponse,
} from "../shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const userSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, user.id),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .orderBy(sessions.createdAt);

    return apiSuccess({ sessions: userSessions });
  } catch (error) {
    return handleApiError("auth/sessions", error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const [session] = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.id, Number(sessionId)), eq(sessions.userId, user.id)))
        .limit(1);

      if (!session) {
        return apiError(404, "SESSION_NOT_FOUND", "Session not found");
      }

      await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, session.id));
    } else {
      await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(and(eq(sessions.userId, user.id), isNull(sessions.revokedAt)));
    }

    return apiSuccess({ message: "Sessions revoked successfully" });
  } catch (error) {
    return handleApiError("auth/sessions", error);
  }
}
