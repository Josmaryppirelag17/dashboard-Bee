import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/connection";
import { tasks as tasksSchema } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  apiSuccess,
  handleApiError,
  dbNotConfiguredResponse,
  unauthorizedResponse,
  requireUser,
  badRequestResponse,
  validationErrorResponse,
  rateLimitedResponse,
  mapTask,
} from "../auth/shared";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
const COLUMNS = ["todo", "in_progress", "completed"] as const;

const createTaskSchema = z.object({
  taskId: z.string().min(1, "taskId is required").max(255),
  title: z.string().min(1, "title is required").max(500),
  completed: z.boolean().optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: z.string().max(100).optional(),
  pollenUnits: z.number().int().min(0).max(9999).optional(),
  columnId: z.enum(COLUMNS).optional(),
  notes: z.string().optional().nullable(),
  dueDate: z.string().max(50).optional().nullable(),
});

const updateTaskSchema = z.object({
  taskId: z.string().min(1, "taskId is required").max(255),
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: z.string().max(100).optional(),
  pollenUnits: z.number().int().min(0).max(9999).optional(),
  columnId: z.enum(COLUMNS).optional(),
  notes: z.string().optional().nullable(),
  dueDate: z.string().max(50).optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return unauthorizedResponse();
    if (!checkRateLimit(`tasks:${user.id}`, 120, 60 * 1000).allowed)
      return rateLimitedResponse();

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const rows = await db.select().from(tasksSchema).where(eq(tasksSchema.userId, user.id));
    return apiSuccess(rows.map(mapTask));
  } catch (error) {
    return handleApiError("api/tasks", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return unauthorizedResponse();
    if (!checkRateLimit(`tasks:${user.id}`, 120, 60 * 1000).allowed)
      return rateLimitedResponse();

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success)
      return validationErrorResponse(parsed.error.issues.map((i) => i.message).join(", "));

    const { taskId, title, completed, priority, category, pollenUnits, columnId, notes, dueDate } =
      parsed.data;

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

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

    return apiSuccess({ taskId }, 201);
  } catch (error) {
    return handleApiError("api/tasks", error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return unauthorizedResponse();
    if (!checkRateLimit(`tasks:${user.id}`, 120, 60 * 1000).allowed)
      return rateLimitedResponse();

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success)
      return validationErrorResponse(parsed.error.issues.map((i) => i.message).join(", "));

    const { taskId, ...updates } = parsed.data;

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const allowedFields = [
      "title",
      "completed",
      "priority",
      "category",
      "pollenUnits",
      "columnId",
      "notes",
      "dueDate",
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }

    if (Object.keys(updateData).length === 0) return badRequestResponse("No fields to update");

    await db
      .update(tasksSchema)
      .set(updateData)
      .where(and(eq(tasksSchema.userId, user.id), eq(tasksSchema.taskId, taskId)));

    return apiSuccess({ taskId });
  } catch (error) {
    return handleApiError("api/tasks", error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return unauthorizedResponse();
    if (!checkRateLimit(`tasks:${user.id}`, 120, 60 * 1000).allowed)
      return rateLimitedResponse();

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    if (!taskId) return badRequestResponse("taskId query param is required");

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    await db
      .delete(tasksSchema)
      .where(and(eq(tasksSchema.userId, user.id), eq(tasksSchema.taskId, taskId)));

    return apiSuccess(null);
  } catch (error) {
    return handleApiError("api/tasks", error);
  }
}
