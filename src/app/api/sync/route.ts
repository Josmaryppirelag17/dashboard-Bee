import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/connection";
import { tasks as tasksSchema, userStats } from "@/lib/db/schema";
import {
  apiSuccess,
  handleApiError,
  dbNotConfiguredResponse,
  unauthorizedResponse,
  requireUser,
  mapTask,
  mapStats,
} from "../auth/shared";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return unauthorizedResponse();

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const body = await request.json();
    const { tasks: localTasks, stats: localStats } = body;

    if (localTasks && Array.isArray(localTasks)) {
      await db.delete(tasksSchema).where(eq(tasksSchema.userId, user.id));

      if (localTasks.length > 0) {
        const inserts: (typeof tasksSchema.$inferInsert)[] = localTasks.map(
          (t: Record<string, unknown>) => ({
            userId: user.id,
            taskId: String(t.taskId ?? t.id ?? ""),
            title: String(t.title ?? ""),
            completed: Boolean(t.completed ?? false),
            priority: String(t.priority ?? "MEDIUM"),
            category: String(t.category ?? ""),
            pollenUnits: Number(t.pollenUnits ?? 1),
            columnId: String(t.columnId ?? "todo"),
            notes: t.notes != null ? String(t.notes) : null,
            dueDate: t.dueDate != null ? String(t.dueDate) : null,
          }),
        );
        await db.insert(tasksSchema).values(inserts);
      }
    }

    if (localStats && typeof localStats === "object") {
      const statsUpdate: Record<string, unknown> = {};
      const stringFields = [
        "weeklyFocusMins",
        "weeklyTasksCompleted",
        "unlockedAchievements",
        "claimedQuests",
      ];
      for (const key of stringFields) {
        if (localStats[key] !== undefined) statsUpdate[key] = JSON.stringify(localStats[key]);
      }
      const directFields = ["xp", "level", "totalFocusMins", "streakCount", "userBeeName"];
      for (const key of directFields) {
        if (localStats[key] !== undefined) statsUpdate[key] = localStats[key];
      }

      if (Object.keys(statsUpdate).length > 0) {
        const [existing] = await db
          .select()
          .from(userStats)
          .where(eq(userStats.userId, user.id))
          .limit(1);

        if (existing) {
          await db.update(userStats).set(statsUpdate).where(eq(userStats.userId, user.id));
        } else {
          await db.insert(userStats).values({
            userId: user.id,
            ...statsUpdate,
          } as typeof userStats.$inferInsert);
        }
      }
    }

    const cloudTasks = await db.select().from(tasksSchema).where(eq(tasksSchema.userId, user.id));
    const [cloudStats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, user.id))
      .limit(1);

    return apiSuccess({
      tasks: cloudTasks.map(mapTask),
      stats: cloudStats ? mapStats(cloudStats) : null,
    });
  } catch (error) {
    return handleApiError("api/sync", error);
  }
}
