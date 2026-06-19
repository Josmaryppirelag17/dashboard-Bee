import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();

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

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /api/analytics", () => {
  it("returns 400 for invalid event payload", async () => {
    const { POST } = await import("@/app/api/analytics/route");
    const res = await POST(mockRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 200 and tracks event", async () => {
    const { POST } = await import("@/app/api/analytics/route");
    const res = await POST(mockRequest({ event: "page_view", properties: { page: "/" } }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.tracked).toBe(true);
    expect(data.data.deduplicated).toBeUndefined();
  });

  it("deduplicates rapid identical events", async () => {
    const { POST } = await import("@/app/api/analytics/route");
    await POST(mockRequest({ event: "click", properties: { button: "submit" } }));
    const res = await POST(mockRequest({ event: "click", properties: { button: "submit" } }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.deduplicated).toBe(true);
  });
});
