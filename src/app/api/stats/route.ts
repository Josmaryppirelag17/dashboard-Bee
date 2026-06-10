import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/connection";
import { userStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
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

    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, user.id)).limit(1);

    if (!stats) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        xp: stats.xp ?? 0,
        level: stats.level ?? 1,
        totalFocusMins: stats.totalFocusMins ?? 0,
        streakCount: stats.streakCount ?? 0,
        weeklyFocusMins: JSON.parse(stats.weeklyFocusMins ?? "[0,0,0,0,0,0,0]"),
        weeklyTasksCompleted: JSON.parse(stats.weeklyTasksCompleted ?? "[0,0,0,0,0,0,0]"),
        userBeeName: stats.userBeeName ?? "",
        unlockedAchievements: JSON.parse(stats.unlockedAchievements ?? "[]"),
        claimedQuests: JSON.parse(stats.claimedQuests ?? "[]"),
      },
    });
  } catch (error) {
    console.error("[api/stats]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 },
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ["xp", "level", "totalFocusMins", "streakCount", "userBeeName"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.weeklyFocusMins !== undefined) {
      updateData.weeklyFocusMins = JSON.stringify(body.weeklyFocusMins);
    }
    if (body.weeklyTasksCompleted !== undefined) {
      updateData.weeklyTasksCompleted = JSON.stringify(body.weeklyTasksCompleted);
    }
    if (body.unlockedAchievements !== undefined) {
      updateData.unlockedAchievements = JSON.stringify(body.unlockedAchievements);
    }
    if (body.claimedQuests !== undefined) {
      updateData.claimedQuests = JSON.stringify(body.claimedQuests);
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

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("[api/stats]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
