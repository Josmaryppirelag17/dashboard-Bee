import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBeePersistence } from "@/hooks/useBeePersistence";

const mockState = {
  savingStatus: "idle" as "idle" | "saving" | "saved",
};

vi.mock("@/store/useHiveStore", () => ({
  useHiveStore: (selector: (state: any) => any) => {
    const state = { savingStatus: mockState.savingStatus };
    return selector(state);
  },
}));

describe("useBeePersistence", () => {
  it("returns isIdle true when savingStatus is idle", () => {
    mockState.savingStatus = "idle";
    const { result } = renderHook(() => useBeePersistence());
    expect(result.current.savingStatus).toBe("idle");
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isSaved).toBe(false);
  });

  it("returns isSaving true when savingStatus is saving", () => {
    mockState.savingStatus = "saving";
    const { result } = renderHook(() => useBeePersistence());
    expect(result.current.isSaving).toBe(true);
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isSaved).toBe(false);
  });

  it("returns isSaved true when savingStatus is saved", () => {
    mockState.savingStatus = "saved";
    const { result } = renderHook(() => useBeePersistence());
    expect(result.current.isSaved).toBe(true);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isIdle).toBe(false);
  });
});
