import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBeeStats } from "@/hooks/useBeeStats";

const mockStore = {
  totalFocusMins: 500,
  streakCount: 7,
  language: "en",
};

vi.mock("@/store/useHiveStore", () => ({
  useHiveStore: (selector: (state: any) => any) => {
    const state = {
      totalFocusMins: mockStore.totalFocusMins,
      streakCount: mockStore.streakCount,
      recordFocusSession: vi.fn(),
      setStreakCount: vi.fn(),
      language: mockStore.language,
    };
    return selector(state);
  },
}));

beforeEach(() => {
  mockStore.totalFocusMins = 500;
  mockStore.streakCount = 7;
  mockStore.language = "en";
});

describe("useBeeStats", () => {
  it("returns totalFocusMins and streakCount", () => {
    const { result } = renderHook(() => useBeeStats());
    expect(result.current.totalFocusMins).toBe(500);
    expect(result.current.streakCount).toBe(7);
  });

  it("computes hiveRank based on totalFocusMins in English", () => {
    mockStore.totalFocusMins = 100;
    const { result, rerender } = renderHook(() => useBeeStats());
    expect(result.current.hiveRank).toBe("Focus Larva");

    mockStore.totalFocusMins = 300;
    rerender();
    expect(result.current.hiveRank).toBe("Elite Worker");

    mockStore.totalFocusMins = 500;
    rerender();
    expect(result.current.hiveRank).toBe("Super Producer");
  });

  it("computes hiveRank in Spanish", () => {
    mockStore.language = "es";
    mockStore.totalFocusMins = 100;
    const { result, rerender } = renderHook(() => useBeeStats());
    expect(result.current.hiveRank).toBe("Larva de Foco");

    mockStore.totalFocusMins = 300;
    rerender();
    expect(result.current.hiveRank).toBe("Obrera de Élite");

    mockStore.totalFocusMins = 500;
    rerender();
    expect(result.current.hiveRank).toBe("Súper Productor");
  });

  it("computes activeStatusText based on streakCount in English", () => {
    mockStore.streakCount = 1;
    const { result, rerender } = renderHook(() => useBeeStats());
    expect(result.current.activeStatusText).toBe("Start a focus interval to awaken the swarm.");

    mockStore.streakCount = 5;
    rerender();
    expect(result.current.activeStatusText).toBe("Excellent gathering rhythm.");

    mockStore.streakCount = 10;
    rerender();
    expect(result.current.activeStatusText).toBe("Hive is ablaze with consistency!");
  });

  it("computes activeStatusText in Spanish", () => {
    mockStore.language = "es";
    mockStore.streakCount = 1;
    const { result, rerender } = renderHook(() => useBeeStats());
    expect(result.current.activeStatusText).toBe("Inicia un intervalo de foco para levantar el enjambre.");

    mockStore.streakCount = 5;
    rerender();
    expect(result.current.activeStatusText).toBe("Excelente ritmo de acopio.");

    mockStore.streakCount = 10;
    rerender();
    expect(result.current.activeStatusText).toBe("¡Colmena en llamas por constancia!");
  });

  it("provides recordFocusSession wrapper", () => {
    const { result } = renderHook(() => useBeeStats());
    expect(typeof result.current.recordFocusSession).toBe("function");
  });

  it("provides setStreakCount", () => {
    const { result } = renderHook(() => useBeeStats());
    expect(typeof result.current.setStreakCount).toBe("function");
  });
});
