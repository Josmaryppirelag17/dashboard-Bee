import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetDb = vi.fn();
const mockGetDbError = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("@/lib/db/connection", () => ({
  getDb: mockGetDb,
  getDbError: mockGetDbError,
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

function mockRequest(body?: unknown): NextRequest {
  return new NextRequest("http://localhost:3000", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const mockUser = { id: 1, email: "a@a.com" };

beforeEach(() => {
  vi.resetAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockGetDb.mockReturnValue(null);
  mockGetDbError.mockReturnValue(null);
});

describe("POST /api/sync", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/sync/route");
    const res = await POST(mockRequest({ tasks: [] }));
    expect(res.status).toBe(401);
  });

  it("returns 503 when DB not configured", async () => {
    const { POST } = await import("@/app/api/sync/route");
    const res = await POST(mockRequest({ tasks: [] }));
    expect(res.status).toBe(503);
  });

  function makeDb() {
    return {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
    };
  }

  function chainWithLimit(result: unknown) {
    return {
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValueOnce(result),
        })),
      })),
    };
  }

  function chainWithoutLimit(result: unknown) {
    return {
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValueOnce(result),
      })),
    };
  }

  it("syncs tasks and stats, returns cloud data", async () => {
    const db = makeDb();
    mockGetDb.mockReturnValue(db);

    const cloudTasks = [
      { taskId: "t1", title: "Synced Task", completed: false, priority: "MEDIUM", category: "", pollenUnits: 1, columnId: "todo", notes: null, dueDate: null },
    ];

    const cloudStats = [{
      xp: 10, level: 1, totalFocusMins: 0, streakCount: 0,
      weeklyFocusMins: "[0,0,0,0,0,0,0]", weeklyTasksCompleted: "[0,0,0,0,0,0,0]",
      userBeeName: null, unlockedAchievements: "[]", claimedQuests: "[]",
    }];

    db.select
      .mockReturnValueOnce(chainWithLimit([]))
      .mockReturnValueOnce(chainWithoutLimit(cloudTasks))
      .mockReturnValueOnce(chainWithLimit(cloudStats));

    db.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

    const { POST } = await import("@/app/api/sync/route");
    const body = {
      tasks: [{ taskId: "t1", title: "Synced Task", completed: false }],
      stats: { xp: 10 },
    };
    const res = await POST(mockRequest(body));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.tasks).toHaveLength(1);
    expect(data.data.stats).not.toBeNull();
    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalledTimes(2);
  });

  it("returns null stats when no stats exist", async () => {
    const db = makeDb();
    mockGetDb.mockReturnValue(db);

    db.select
      .mockReturnValueOnce(chainWithoutLimit([]))
      .mockReturnValueOnce(chainWithLimit([]));

    const { POST } = await import("@/app/api/sync/route");
    const res = await POST(mockRequest({ tasks: [] }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.tasks).toHaveLength(0);
    expect(data.data.stats).toBeNull();
  });
});
