import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessionTracker } from "@/hooks/useSessionTracker";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useSessionTracker", () => {
  it("initializes with deviceId and isOnline true", () => {
    const { result } = renderHook(() => useSessionTracker());
    expect(result.current.deviceId).toMatch(/^device_/);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.activeDuration).toBe(0);
  });

  it("persists deviceId in localStorage", () => {
    const { unmount } = renderHook(() => useSessionTracker());
    const deviceId = localStorage.getItem("beehive_deviceId");
    expect(deviceId).toMatch(/^device_/);
    unmount();
  });

  it("reuses existing deviceId from localStorage", () => {
    localStorage.setItem("beehive_deviceId", "device_existing123");
    const { result } = renderHook(() => useSessionTracker());
    expect(result.current.deviceId).toBe("device_existing123");
  });

  it("returns formatted duration as minutes when under 1 hour", () => {
    const { result } = renderHook(() => useSessionTracker());
    expect(result.current.formattedDuration).toBe("0m");
  });

  it("updates activeDuration after heartbeat interval", async () => {
    const { result } = renderHook(() => useSessionTracker());

    act(() => {
      vi.advanceTimersByTime(31_000);
    });

    expect(result.current.activeDuration).toBeGreaterThan(0);
  });
});
