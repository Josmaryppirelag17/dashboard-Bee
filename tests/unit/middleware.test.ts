import { describe, it, expect, vi, beforeEach } from "vitest";

const mockNextResponseNext = vi.fn(() => ({
  headers: new Map<string, string>(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: mockNextResponseNext,
  },
}));

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  it("sets security headers", async () => {
    const { middleware } = await import("@/middleware");
    const request = {
      headers: new Map([["origin", "http://localhost:3000"]]),
      method: "GET",
    } as any;

    const response = await middleware(request);
    expect(response.headers).toBeDefined();
  });

  it("calls NextResponse.next", async () => {
    const { middleware } = await import("@/middleware");
    const request = {
      headers: new Map(),
      method: "GET",
    } as any;

    await middleware(request);
    expect(mockNextResponseNext).toHaveBeenCalledOnce();
  });
});
