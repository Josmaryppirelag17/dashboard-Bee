import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/connection";
import { tasks as tasksSchema, userStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 },
      );
    }

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
        if (localStats[key] !== undefined) {
          statsUpdate[key] = JSON.stringify(localStats[key]);
        }
      }
      const directFields = ["xp", "level", "totalFocusMins", "streakCount", "userBeeName"];
      for (const key of directFields) {
        if (localStats[key] !== undefined) {
          statsUpdate[key] = localStats[key];
        }
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

    return NextResponse.json({
      success: true,
      data: {
        tasks: cloudTasks.map((r) => ({
          id: r.taskId,
          title: r.title,
          completed: r.completed ?? false,
          priority: r.priority as "LOW" | "MEDIUM" | "HIGH",
          category: r.category ?? "",
          pollenUnits: r.pollenUnits ?? 1,
          columnId: r.columnId as "todo" | "in_progress" | "completed",
          notes: r.notes ?? undefined,
          dueDate: r.dueDate ?? undefined,
        })),
        stats: cloudStats
          ? {
              xp: cloudStats.xp ?? 0,
              level: cloudStats.level ?? 1,
              totalFocusMins: cloudStats.totalFocusMins ?? 0,
              streakCount: cloudStats.streakCount ?? 0,
              weeklyFocusMins: JSON.parse(cloudStats.weeklyFocusMins ?? "[0,0,0,0,0,0,0]"),
              weeklyTasksCompleted: JSON.parse(
                cloudStats.weeklyTasksCompleted ?? "[0,0,0,0,0,0,0]",
              ),
              userBeeName: cloudStats.userBeeName ?? "",
              unlockedAchievements: JSON.parse(cloudStats.unlockedAchievements ?? "[]"),
              claimedQuests: JSON.parse(cloudStats.claimedQuests ?? "[]"),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[api/sync]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
