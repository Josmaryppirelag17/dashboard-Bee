import { NextResponse } from "next/server";
import { getDbError } from "@/lib/db/connection";
import { getCurrentUser } from "@/lib/auth";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/shared");

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export function handleApiError(tag: string, error: unknown) {
  log.error(`[${tag}]`, error);
  const dbErr = getDbError();
  return apiError(
    500,
    "INTERNAL_ERROR",
    dbErr ? `Database error: ${dbErr}` : "An unexpected error occurred",
  );
}

export function rateLimitedResponse() {
  return apiError(429, "RATE_LIMITED", "Too many attempts. Try again later.");
}

export function validationErrorResponse(message: string) {
  return apiError(400, "VALIDATION_ERROR", message);
}

export function dbNotConfiguredResponse() {
  return apiError(503, "DB_NOT_CONFIGURED", "Database connection not available");
}

export function weakPasswordResponse(errors: string[]) {
  return apiError(400, "WEAK_PASSWORD", `Password must include: ${errors.join(", ")}`);
}

export function unauthorizedResponse() {
  return apiError(401, "UNAUTHORIZED", "Authentication required");
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

export function badRequestResponse(message: string) {
  return apiError(400, "BAD_REQUEST", message);
}

export function mapTask(r: {
  taskId: string;
  title: string;
  completed: boolean | null;
  priority: string | null;
  category: string | null;
  pollenUnits: number | null;
  columnId: string | null;
  notes: string | null;
  dueDate: string | null;
}) {
  return {
    id: r.taskId,
    title: r.title,
    completed: r.completed ?? false,
    priority: r.priority as "LOW" | "MEDIUM" | "HIGH",
    category: r.category ?? "",
    pollenUnits: r.pollenUnits ?? 1,
    columnId: r.columnId as "todo" | "in_progress" | "completed",
    notes: r.notes ?? undefined,
    dueDate: r.dueDate ?? undefined,
  };
}

export function mapStats(s: {
  xp: number | null;
  level: number | null;
  totalFocusMins: number | null;
  streakCount: number | null;
  weeklyFocusMins: string | null;
  weeklyTasksCompleted: string | null;
  userBeeName: string | null;
  unlockedAchievements: string | null;
  claimedQuests: string | null;
}) {
  return {
    xp: s.xp ?? 0,
    level: s.level ?? 1,
    totalFocusMins: s.totalFocusMins ?? 0,
    streakCount: s.streakCount ?? 0,
    weeklyFocusMins: JSON.parse(s.weeklyFocusMins ?? "[0,0,0,0,0,0,0]"),
    weeklyTasksCompleted: JSON.parse(s.weeklyTasksCompleted ?? "[0,0,0,0,0,0,0]"),
    userBeeName: s.userBeeName ?? "",
    unlockedAchievements: JSON.parse(s.unlockedAchievements ?? "[]"),
    claimedQuests: JSON.parse(s.claimedQuests ?? "[]"),
  };
}
