import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/connection";
import { userStats } from "@/lib/db/schema";
import {
  apiSuccess,
  handleApiError,
  dbNotConfiguredResponse,
  unauthorizedResponse,
  requireUser,
  mapStats,
} from "../auth/shared";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return unauthorizedResponse();

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, user.id)).limit(1);

    return apiSuccess(stats ? mapStats(stats) : null);
  } catch (error) {
    return handleApiError("api/stats", error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const updateData: Record<string, unknown> = {};
    const directFields = ["xp", "level", "totalFocusMins", "streakCount", "userBeeName"];
    for (const field of directFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const jsonFields = [
      "weeklyFocusMins",
      "weeklyTasksCompleted",
      "unlockedAchievements",
      "claimedQuests",
    ];
    for (const field of jsonFields) {
      if (body[field] !== undefined) updateData[field] = JSON.stringify(body[field]);
    }

    const [existing] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, user.id))
      .limit(1);

    if (existing) {
      await db.update(userStats).set(updateData).where(eq(userStats.userId, user.id));
    } else {
      await db.insert(userStats).values({
        userId: user.id,
        ...updateData,
      } as typeof userStats.$inferInsert);
    }

    return apiSuccess(null);
  } catch (error) {
    return handleApiError("api/stats", error);
  }
}
