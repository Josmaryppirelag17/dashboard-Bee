import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHiveProjection } from "@/hooks/useHiveProjection";

const mockState = {
  tasks: [] as any[],
  language: "en" as string,
};

vi.mock("@/store/useHiveStore", () => ({
  useHiveStore: (selector: (state: any) => any) => {
    const state = {
      tasks: mockState.tasks,
      language: mockState.language,
    };
    return selector(state);
  },
}));

beforeEach(() => {
  mockState.tasks = [];
  mockState.language = "en";
});

describe("useHiveProjection", () => {
  it("returns zero tasks when empty", () => {
    const { result } = renderHook(() => useHiveProjection());
    expect(result.current.totalTasksCount).toBe(0);
    expect(result.current.completedTasksCount).toBe(0);
    expect(result.current.pendingTasksCount).toBe(0);
  });

  it("counts completed and pending tasks", () => {
    mockState.tasks = [
      { id: "1", columnId: "completed" },
      { id: "2", columnId: "todo" },
      { id: "3", columnId: "in_progress" },
    ];
    const { result } = renderHook(() => useHiveProjection());
    expect(result.current.totalTasksCount).toBe(3);
    expect(result.current.completedTasksCount).toBe(1);
    expect(result.current.pendingTasksCount).toBe(2);
  });

  it("calculates remaining days based on pace", () => {
    mockState.tasks = [
      { id: "1", columnId: "completed" },
      { id: "2", columnId: "todo" },
      { id: "3", columnId: "todo" },
    ];
    const { result } = renderHook(() => useHiveProjection(2));
    expect(result.current.remainingDays).toBe(1);
    expect(result.current.dailyPace).toBe(2);
  });

  it("uses default pace of 1.5", () => {
    mockState.tasks = [{ id: "1", columnId: "todo" }];
    const { result } = renderHook(() => useHiveProjection());
    expect(result.current.dailyPace).toBe(1.5);
    expect(result.current.remainingDays).toBe(0.7);
  });

  it("clamps pace to minimum of 1.0", () => {
    mockState.tasks = [{ id: "1", columnId: "todo" }];
    const { result } = renderHook(() => useHiveProjection(0));
    expect(result.current.dailyPace).toBe(1);
  });

  it("provides advice in English when no tasks remain", () => {
    const { result } = renderHook(() => useHiveProjection());
    expect(result.current.advice).toContain("Excellent! All pollen has been gathered");
  });

  it("provides advice in English for remaining tasks more than 1 day out", () => {
    mockState.tasks = [
      { id: "1", columnId: "todo" },
      { id: "2", columnId: "todo" },
      { id: "3", columnId: "todo" },
    ];
    const { result } = renderHook(() => useHiveProjection(1.5));
    expect(result.current.advice).toContain("Estimated to harvest everything");
    expect(result.current.advice).toContain("1.5 tasks/day");
  });

  it("provides advice in Spanish", () => {
    mockState.tasks = [
      { id: "1", columnId: "todo" },
      { id: "2", columnId: "todo" },
      { id: "3", columnId: "todo" },
    ];
    mockState.language = "es";
    const { result } = renderHook(() => useHiveProjection());
    expect(result.current.advice).toContain("Estimas cosechar todo");
  });
});
