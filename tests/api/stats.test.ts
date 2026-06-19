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
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function createMockDb() {
  const chain = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    limit: vi.fn().mockResolvedValue([]),
    orderBy: vi.fn(() => chain),
    values: vi.fn(() => ({ returning: vi.fn().mockResolvedValue([]) })),
    set: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  };

  const db = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
  };

  return { db };
}

const mockUser = { id: 1, email: "a@a.com" };

beforeEach(() => {
  vi.resetAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockGetDb.mockReturnValue(null);
  mockGetDbError.mockReturnValue(null);
});

describe("GET /api/stats", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/stats/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 503 when DB not configured", async () => {
    const { GET } = await import("@/app/api/stats/route");
    const res = await GET();
    expect(res.status).toBe(503);
  });

  it("returns null when no stats exist", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    db.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValueOnce([]),
        })),
      })),
    });
    const { GET } = await import("@/app/api/stats/route");
    const res = await GET();
    const data = await res.json();
    expect(data.data).toBeNull();
  });

  it("returns mapped stats", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    db.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValueOnce([{
            xp: 100,
            level: 3,
            totalFocusMins: 1200,
            streakCount: 5,
            weeklyFocusMins: "[10,20,30,0,0,0,0]",
            weeklyTasksCompleted: "[1,2,3,0,0,0,0]",
            userBeeName: "Busy Bee",
            unlockedAchievements: '["first_task"]',
            claimedQuests: '["quest_1"]',
          }]),
        })),
      })),
    });
    const { GET } = await import("@/app/api/stats/route");
    const res = await GET();
    const data = await res.json();
    expect(data.data.xp).toBe(100);
    expect(data.data.level).toBe(3);
    expect(data.data.userBeeName).toBe("Busy Bee");
  });
});

describe("PUT /api/stats", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    const { PUT } = await import("@/app/api/stats/route");
    const res = await PUT(mockRequest({ xp: 50 }));
    expect(res.status).toBe(401);
  });

  it("returns 503 when DB not configured", async () => {
    const { PUT } = await import("@/app/api/stats/route");
    const res = await PUT(mockRequest({ xp: 50 }));
    expect(res.status).toBe(503);
  });

  it("updates existing stats", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValue(db);
    db.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValueOnce([{ userId: 1, xp: 100 }]),
        })),
      })),
    });
    const { PUT } = await import("@/app/api/stats/route");
    const res = await PUT(mockRequest({ xp: 200, level: 5 }));
    expect(res.status).toBe(200);
    expect(db.update).toHaveBeenCalled();
  });

  it("inserts new stats when none exist", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValue(db);
    db.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValueOnce([]),
        })),
      })),
    });
    const { PUT } = await import("@/app/api/stats/route");
    const res = await PUT(mockRequest({ xp: 50, level: 1 }));
    expect(res.status).toBe(200);
    expect(db.insert).toHaveBeenCalled();
  });

  it("handles JSON fields (weeklyFocusMins)", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValue(db);
    db.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValueOnce([{ userId: 1 }]),
        })),
      })),
    });
    const { PUT } = await import("@/app/api/stats/route");
    const res = await PUT(mockRequest({ weeklyFocusMins: [1, 2, 3, 4, 5, 6, 7] }));
    expect(res.status).toBe(200);
  });
});
