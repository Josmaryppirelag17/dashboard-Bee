import { describe, it, expect } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  const maxAttempts = 3;
  const windowMs = 1000;

  it("allows first request", () => {
    const result = checkRateLimit("ip-allow-first", maxAttempts, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(maxAttempts - 1);
    expect(result.limit).toBe(maxAttempts);
  });

  it("decrements remaining on each request", () => {
    const ip = "ip-decrement";
    checkRateLimit(ip, maxAttempts, windowMs);
    checkRateLimit(ip, maxAttempts, windowMs);
    const third = checkRateLimit(ip, maxAttempts, windowMs);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks after exceeding max attempts", () => {
    const ip = "ip-block";
    for (let i = 0; i < maxAttempts; i++) {
      checkRateLimit(ip, maxAttempts, 5000);
    }
    const blocked = checkRateLimit(ip, maxAttempts, 5000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    const ip = "ip-reset";
    for (let i = 0; i < maxAttempts; i++) {
      checkRateLimit(ip, maxAttempts, 50);
    }
    const blocked = checkRateLimit(ip, maxAttempts, 50);
    expect(blocked.allowed).toBe(false);

    await new Promise((r) => setTimeout(r, 60));
    const reset = checkRateLimit(ip, maxAttempts, 50);
    expect(reset.allowed).toBe(true);
    expect(reset.remaining).toBe(maxAttempts - 1);
  });

  it("tracks different IPs separately", () => {
    checkRateLimit("ip-a", maxAttempts, 1000);
    checkRateLimit("ip-a", maxAttempts, 1000);
    checkRateLimit("ip-a", maxAttempts, 1000);
    expect(checkRateLimit("ip-a", maxAttempts, 1000).allowed).toBe(false);
    expect(checkRateLimit("ip-b", maxAttempts, 1000).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("returns x-forwarded-for first value", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "10.0.0.2" },
    });
    expect(getClientIp(req)).toBe("10.0.0.2");
  });

  it("returns unknown when no header present", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});
