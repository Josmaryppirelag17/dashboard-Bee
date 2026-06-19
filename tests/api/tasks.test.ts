import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetDb = vi.fn();
const mockGetDbError = vi.fn();
const mockCheckRateLimit = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("@/lib/db/connection", () => ({
  getDb: mockGetDb,
  getDbError: mockGetDbError,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
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

function mockRequest(body?: unknown, url = "http://localhost:3000"): NextRequest {
  return new NextRequest(url, {
    method: body ? "POST" : "GET",
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
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  };

  return { db };
}

const mockUser = { id: 1, email: "a@a.com", username: "u", name: "T", lastName: "U" };

beforeEach(() => {
  vi.resetAllMocks();
  mockCheckRateLimit.mockReturnValue({ allowed: true });
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockGetDb.mockReturnValue(null);
  mockGetDbError.mockReturnValue(null);
});

describe("GET /api/tasks", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/tasks/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValueOnce({ allowed: false });
    const { GET } = await import("@/app/api/tasks/route");
    const res = await GET();
    expect(res.status).toBe(429);
  });

  it("returns 503 when DB not configured", async () => {
    const { GET } = await import("@/app/api/tasks/route");
    const res = await GET();
    expect(res.status).toBe(503);
  });

  it("returns tasks list", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    const tasks = [
      { taskId: "t1", title: "Task 1", completed: false, priority: "HIGH", category: "dev", pollenUnits: 5, columnId: "todo", notes: null, dueDate: null },
      { taskId: "t2", title: "Task 2", completed: true, priority: "LOW", category: "", pollenUnits: 1, columnId: "completed", notes: "note", dueDate: "2025-01-01" },
    ];
    db.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValueOnce(tasks),
      })),
    } as any);
    const { GET } = await import("@/app/api/tasks/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(2);
    expect(data.data[0].id).toBe("t1");
    expect(data.data[1].id).toBe("t2");
  });
});

describe("POST /api/tasks", () => {
  const validBody = {
    taskId: "t1",
    title: "New Task",
    priority: "MEDIUM",
    columnId: "todo",
  };

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/tasks/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    const { POST } = await import("@/app/api/tasks/route");
    const res = await POST(mockRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 503 when DB not configured", async () => {
    const { POST } = await import("@/app/api/tasks/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(503);
  });

  it("returns 201 on success", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    const { POST } = await import("@/app/api/tasks/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.taskId).toBe("t1");
  });
});

describe("PUT /api/tasks", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    const { PUT } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId: "t1", title: "Updated" }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    const { PUT } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when no fields to update", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    const { PUT } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId: "t1" }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("BAD_REQUEST");
  });

  it("returns 200 on success", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    const { PUT } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId: "t1", title: "Updated", completed: true }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.taskId).toBe("t1");
  });
});

describe("DELETE /api/tasks", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    const { DELETE } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000/api/tasks?taskId=t1");
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when taskId missing", async () => {
    const { DELETE } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000/api/tasks");
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful delete", async () => {
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    const { DELETE } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000/api/tasks?taskId=t1");
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(db.delete).toHaveBeenCalled();
  });
});
