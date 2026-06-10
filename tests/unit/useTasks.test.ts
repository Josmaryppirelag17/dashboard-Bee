import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTasks } from "@/hooks/useTasks";

let mockTasks: any[] = [
  {
    id: "t1",
    title: "Task A",
    completed: false,
    columnId: "todo",
    category: "Work",
    pollenUnits: 2,
    priority: "MEDIUM",
  },
  {
    id: "t2",
    title: "Task B",
    completed: false,
    columnId: "in_progress",
    category: "Work",
    pollenUnits: 3,
    priority: "HIGH",
  },
  {
    id: "t3",
    title: "Task C",
    completed: true,
    columnId: "completed",
    category: "Personal",
    pollenUnits: 5,
    priority: "LOW",
  },
  {
    id: "t4",
    title: "Task D",
    completed: false,
    columnId: "todo",
    category: "Personal",
    pollenUnits: 1,
    priority: "MEDIUM",
  },
  {
    id: "t5",
    title: "Task E",
    completed: true,
    columnId: "completed",
    category: "Work",
    pollenUnits: 4,
    priority: "HIGH",
  },
];

const mockAddTask = vi.fn();
const mockToggleTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockClearCompleted = vi.fn();

vi.mock("@/store/useHiveStore", () => ({
  useHiveStore: (selector: (state: any) => any) => {
    const state = {
      tasks: mockTasks,
      addTask: mockAddTask,
      toggleTask: mockToggleTask,
      deleteTask: mockDeleteTask,
      clearCompletedTasks: mockClearCompleted,
    };
    return selector(state);
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockTasks = [
    {
      id: "t1",
      title: "Task A",
      completed: false,
      columnId: "todo",
      category: "Work",
      pollenUnits: 2,
      priority: "MEDIUM",
    },
    {
      id: "t2",
      title: "Task B",
      completed: false,
      columnId: "in_progress",
      category: "Work",
      pollenUnits: 3,
      priority: "HIGH",
    },
    {
      id: "t3",
      title: "Task C",
      completed: true,
      columnId: "completed",
      category: "Personal",
      pollenUnits: 5,
      priority: "LOW",
    },
    {
      id: "t4",
      title: "Task D",
      completed: false,
      columnId: "todo",
      category: "Personal",
      pollenUnits: 1,
      priority: "MEDIUM",
    },
    {
      id: "t5",
      title: "Task E",
      completed: true,
      columnId: "completed",
      category: "Work",
      pollenUnits: 4,
      priority: "HIGH",
    },
  ];
});

describe("useTasks", () => {
  it("returns all tasks", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toHaveLength(5);
    expect(result.current.totalTasksCount).toBe(5);
  });

  it("computes completedTasksCount", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.completedTasksCount).toBe(2);
  });

  it("computes taskCompletionRate", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.taskCompletionRate).toBe(40);
  });

  it("returns 0 completion rate when no tasks", () => {
    mockTasks = [];
    const { result } = renderHook(() => useTasks());
    expect(result.current.taskCompletionRate).toBe(0);
  });

  it("computes totalPollenProduced from completed tasks", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.totalPollenProduced).toBe(9);
  });

  it("extracts unique categories", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.categories).toEqual(["Work", "Personal"]);
  });

  describe("filteredTasks", () => {
    it("shows all when statusFilter is 'all'", () => {
      const { result } = renderHook(() => useTasks());
      expect(result.current.filteredTasks).toHaveLength(5);
    });

    it("filters by pending", () => {
      const { result } = renderHook(() => useTasks());
      act(() => result.current.setStatusFilter("pending"));
      expect(result.current.filteredTasks).toHaveLength(3);
    });

    it("filters by completed", () => {
      const { result } = renderHook(() => useTasks());
      act(() => result.current.setStatusFilter("completed"));
      expect(result.current.filteredTasks).toHaveLength(2);
    });

    it("filters by category", () => {
      const { result } = renderHook(() => useTasks());
      act(() => result.current.setCategoryFilter("Personal"));
      expect(result.current.filteredTasks).toHaveLength(2);
    });

    it("combines status and category filters", () => {
      const { result } = renderHook(() => useTasks());
      act(() => result.current.setStatusFilter("pending"));
      act(() => result.current.setCategoryFilter("Work"));
      expect(result.current.filteredTasks).toHaveLength(2);
    });
  });

  describe("wrapper actions", () => {
    it("toggleTask calls store toggleTask", async () => {
      const { result } = renderHook(() => useTasks());
      await act(() => result.current.toggleTask("t1"));
      expect(mockToggleTask).toHaveBeenCalledWith("t1");
    });

    it("addTask calls store addTask", async () => {
      const { result } = renderHook(() => useTasks());
      await act(() => result.current.addTask("New", "MEDIUM" as any, "Work", 2));
      expect(mockAddTask).toHaveBeenCalledWith("New", "MEDIUM", "Work", 2);
    });

    it("deleteTask calls store deleteTask", async () => {
      const { result } = renderHook(() => useTasks());
      await act(() => result.current.deleteTask("t1"));
      expect(mockDeleteTask).toHaveBeenCalledWith("t1");
    });

    it("clearCompletedTasks calls store clearCompletedTasks", async () => {
      const { result } = renderHook(() => useTasks());
      await act(() => result.current.clearCompletedTasks());
      expect(mockClearCompleted).toHaveBeenCalledOnce();
    });
  });
});
