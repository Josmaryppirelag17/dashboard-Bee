import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/connection";
import { tasks as tasksSchema } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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

    const rows = await db.select().from(tasksSchema).where(eq(tasksSchema.userId, user.id));

    const data = rows.map((r) => ({
      id: r.taskId,
      title: r.title,
      completed: r.completed ?? false,
      priority: r.priority as "LOW" | "MEDIUM" | "HIGH",
      category: r.category ?? "",
      pollenUnits: r.pollenUnits ?? 1,
      columnId: r.columnId as "todo" | "in_progress" | "completed",
      notes: r.notes ?? undefined,
      dueDate: r.dueDate ?? undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[api/tasks]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, title, completed, priority, category, pollenUnits, columnId, notes, dueDate } =
      body;

    if (!taskId || !title) {
      return NextResponse.json(
        { success: false, error: "taskId and title are required" },
        { status: 400 },
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 },
      );
    }

    await db.insert(tasksSchema).values({
      userId: user.id,
      taskId,
      title,
      completed: completed ?? false,
      priority: priority ?? "MEDIUM",
      category: category ?? "",
      pollenUnits: pollenUnits ?? 1,
      columnId: columnId ?? "todo",
      notes: notes ?? null,
      dueDate: dueDate ?? null,
    });

    return NextResponse.json({ success: true, data: { taskId } });
  } catch (error) {
    console.error("[api/tasks]", error);
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
    const { taskId, ...updates } = body;

    if (!taskId) {
      return NextResponse.json({ success: false, error: "taskId is required" }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 },
      );
    }

    const allowedFields = [
      "title",
      "completed",
      "priority",
      "category",
      "pollenUnits",
      "columnId",
      "notes",
      "dueDate",
    ];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    await db
      .update(tasksSchema)
      .set(updateData)
      .where(and(eq(tasksSchema.userId, user.id), eq(tasksSchema.taskId, taskId)));

    return NextResponse.json({ success: true, data: { taskId } });
  } catch (error) {
    console.error("[api/tasks]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "taskId query param is required" },
        { status: 400 },
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 },
      );
    }

    await db
      .delete(tasksSchema)
      .where(and(eq(tasksSchema.userId, user.id), eq(tasksSchema.taskId, taskId)));

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("[api/tasks]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
