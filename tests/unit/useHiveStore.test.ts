import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHiveStore } from "@/store/useHiveStore";

const mockTasks: any[] = [];
const mockDb = {
  tasks: {
    add: vi.fn((task: any) => {
      mockTasks.push(task);
      return task.id;
    }),
    update: vi.fn((id: string, changes: any) => {
      const idx = mockTasks.findIndex((t) => t.id === id);
      if (idx >= 0) Object.assign(mockTasks[idx], changes);
    }),
    delete: vi.fn((id: string) => {
      mockTasks.splice(
        mockTasks.findIndex((t: any) => t.id === id),
        1,
      );
    }),
    bulkAdd: vi.fn((items: any[]) => {
      mockTasks.push(...items);
    }),
    toArray: vi.fn(() => Promise.resolve([...mockTasks])),
    clear: vi.fn(() => {
      mockTasks.length = 0;
    }),
  },
};

vi.mock("@/lib/db", () => ({
  db: mockDb,
  BeehiveDatabase: class {},
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockTasks.length = 0;
  localStorage.clear();

  useHiveStore.setState({
    tasks: [],
    activeTab: "dashboard",
    selectedMetricId: "focus-time",
    isSidebarCollapsed: false,
    savingStatus: "idle",
    streakCount: 0,
    totalFocusMins: 0,
    language: "es",
    inAppHelpOpen: false,
    searchQuery: "",
    weeklyFocusMins: [0, 0, 0, 0, 0, 0, 0],
    weeklyTasksCompleted: [0, 0, 0, 0, 0, 0, 0],
    hydrated: false,
    xp: 0,
    level: 1,
    userBeeName: "TestBee",
    unlockedAchievements: [],
    claimedQuests: [],
  });
});

describe("useHiveStore", () => {
  describe("initial state", () => {
    it("has default values", () => {
      const state = useHiveStore.getState();
      expect(state.tasks).toEqual([]);
      expect(state.activeTab).toBe("dashboard");
      expect(state.language).toBe("es");
      expect(state.xp).toBe(0);
      expect(state.level).toBe(1);
      expect(state.hydrated).toBe(false);
    });
  });

  describe("sync setters", () => {
    it("setActiveTab", () => {
      useHiveStore.getState().setActiveTab("focus");
      expect(useHiveStore.getState().activeTab).toBe("focus");
    });

    it("setSelectedMetricId", () => {
      useHiveStore.getState().setSelectedMetricId("completed-tasks");
      expect(useHiveStore.getState().selectedMetricId).toBe("completed-tasks");
    });

    it("setSidebarCollapsed", () => {
      useHiveStore.getState().setSidebarCollapsed(true);
      expect(useHiveStore.getState().isSidebarCollapsed).toBe(true);
    });

    it("setInAppHelpOpen", () => {
      useHiveStore.getState().setInAppHelpOpen(true);
      expect(useHiveStore.getState().inAppHelpOpen).toBe(true);
    });

    it("setSearchQuery", () => {
      useHiveStore.getState().setSearchQuery("test");
      expect(useHiveStore.getState().searchQuery).toBe("test");
    });

    it("setSavingStatus", () => {
      useHiveStore.getState().setSavingStatus("saving");
      expect(useHiveStore.getState().savingStatus).toBe("saving");
    });

    it("setUserBeeName persists to localStorage", () => {
      useHiveStore.getState().setUserBeeName("WorkerBee");
      expect(useHiveStore.getState().userBeeName).toBe("WorkerBee");
      expect(localStorage.getItem("beehive_userBeeName")).toBe("WorkerBee");
    });

    it("setStreakCount persists to localStorage", () => {
      useHiveStore.getState().setStreakCount(5);
      expect(useHiveStore.getState().streakCount).toBe(5);
      expect(localStorage.getItem("beehive_streakCount")).toBe("5");
    });

    it("setLanguage changes language", () => {
      useHiveStore.getState().setLanguage("en");
      expect(useHiveStore.getState().language).toBe("en");
      expect(localStorage.getItem("beehive_language")).toBe("en");
    });
  });

  describe("hydrate", () => {
    it("loads persisted values from localStorage", async () => {
      localStorage.setItem("beehive_streakCount", "10");
      localStorage.setItem("beehive_totalFocusMins", "120");
      localStorage.setItem("beehive_language", "en");
      localStorage.setItem("beehive_xp", "500");
      localStorage.setItem("beehive_level", "3");
      localStorage.setItem("beehive_userBeeName", "QueenBee");
      localStorage.setItem("beehive_unlockedAchievements", JSON.stringify(["first-task"]));
      localStorage.setItem("beehive_claimedQuests", JSON.stringify(["q1"]));
      localStorage.setItem("beehive_weeklyFocusMins", JSON.stringify([10, 20, 30, 0, 0, 0, 0]));

      useHiveStore.getState().hydrate();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(useHiveStore.getState().hydrated).toBe(true);
      expect(useHiveStore.getState().streakCount).toBe(10);
      expect(useHiveStore.getState().totalFocusMins).toBe(120);
      expect(useHiveStore.getState().language).toBe("en");
      expect(useHiveStore.getState().xp).toBe(500);
      expect(useHiveStore.getState().level).toBe(3);
      expect(useHiveStore.getState().unlockedAchievements).toEqual(["first-task"]);
      expect(useHiveStore.getState().claimedQuests).toEqual(["q1"]);
    });

    it("does not hydrate twice", () => {
      useHiveStore.getState().hydrate();
      useHiveStore.getState().hydrate();
      expect(mockDb.tasks.add).not.toHaveBeenCalled();
    });
  });

  describe("async DB operations", () => {
    it("addTask adds to db and state", async () => {
      await useHiveStore.getState().addTask("New Task", "MEDIUM" as any, "Work", 2);
      const state = useHiveStore.getState();
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0]!.title).toBe("New Task");
      expect(state.tasks[0]!.columnId).toBe("todo");
      expect(mockDb.tasks.add).toHaveBeenCalledOnce();
    });

    it("addTask sanitizes title", async () => {
      await useHiveStore
        .getState()
        .addTask("<script>alert('xss')</script>", "MEDIUM" as any, "Work", 2);
      const state = useHiveStore.getState();
      expect(state.tasks[0]!.title).toBe(
        "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;",
      );
    });

    it("addTask skips empty title", async () => {
      await useHiveStore.getState().addTask("", "MEDIUM" as any, "Work", 2);
      expect(useHiveStore.getState().tasks).toHaveLength(0);
      expect(mockDb.tasks.add).not.toHaveBeenCalled();
    });

    it("addTask triggers first-task achievement on first task", async () => {
      await useHiveStore.getState().addTask("First", "MEDIUM" as any, "Work", 1);
      expect(useHiveStore.getState().unlockedAchievements).toContain("first-tasks");
    });

    it("deleteTask removes from db and state", async () => {
      await useHiveStore.getState().addTask("Task to delete", "MEDIUM" as any, "Work", 1);
      const taskId = useHiveStore.getState().tasks[0]!.id;
      await useHiveStore.getState().deleteTask(taskId);
      expect(useHiveStore.getState().tasks).toHaveLength(0);
      expect(mockDb.tasks.delete).toHaveBeenCalledWith(taskId);
    });

    it("toggleTask toggles completion", async () => {
      await useHiveStore.getState().addTask("Toggle me", "MEDIUM" as any, "Work", 2);
      const taskId = useHiveStore.getState().tasks[0]!.id;
      await useHiveStore.getState().toggleTask(taskId);
      expect(useHiveStore.getState().tasks[0]!.completed).toBe(true);
      expect(useHiveStore.getState().tasks[0]!.columnId).toBe("completed");
    });

    it("toggleTask toggles back from completed", async () => {
      await useHiveStore.getState().addTask("Toggle me", "MEDIUM" as any, "Work", 2);
      const taskId = useHiveStore.getState().tasks[0]!.id;
      await useHiveStore.getState().toggleTask(taskId);
      await useHiveStore.getState().toggleTask(taskId);
      expect(useHiveStore.getState().tasks[0]!.completed).toBe(false);
      expect(useHiveStore.getState().tasks[0]!.columnId).toBe("todo");
    });

    it("toggleTask does nothing for unknown task", async () => {
      await useHiveStore.getState().toggleTask("nonexistent");
      expect(useHiveStore.getState().tasks).toHaveLength(0);
    });

    it("updateTaskColumn moves task between columns", async () => {
      await useHiveStore.getState().addTask("Move me", "MEDIUM" as any, "Work", 1);
      const taskId = useHiveStore.getState().tasks[0]!.id;
      await useHiveStore.getState().updateTaskColumn(taskId, "in_progress");
      expect(useHiveStore.getState().tasks[0]!.columnId).toBe("in_progress");
      expect(useHiveStore.getState().tasks[0]!.completed).toBe(false);
      await useHiveStore.getState().updateTaskColumn(taskId, "completed");
      expect(useHiveStore.getState().tasks[0]!.columnId).toBe("completed");
      expect(useHiveStore.getState().tasks[0]!.completed).toBe(true);
    });

    it("updateTaskNotes updates notes", async () => {
      await useHiveStore.getState().addTask("Note me", "MEDIUM" as any, "Work", 1);
      const taskId = useHiveStore.getState().tasks[0]!.id;
      await useHiveStore.getState().updateTaskNotes(taskId, "Important notes");
      expect(useHiveStore.getState().tasks[0]!.notes).toBe("Important notes");
    });

    it("clearCompletedTasks removes all completed", async () => {
      await useHiveStore.getState().addTask("Keep", "MEDIUM" as any, "Work", 1);
      await useHiveStore.getState().addTask("Remove", "MEDIUM" as any, "Work", 1);
      useHiveStore.setState({
        tasks: useHiveStore
          .getState()
          .tasks.map((t) =>
            t.title === "Remove" ? { ...t, completed: true, columnId: "completed" as const } : t,
          ),
      });
      expect(useHiveStore.getState().tasks.filter((t) => t.columnId === "completed")).toHaveLength(
        1,
      );
      await useHiveStore.getState().clearCompletedTasks();
      expect(useHiveStore.getState().tasks).toHaveLength(1);
      expect(useHiveStore.getState().tasks[0]!.title).toBe("Keep");
    });

    it("clearCompletedTasks does nothing if none completed", async () => {
      await useHiveStore.getState().addTask("Only", "MEDIUM" as any, "Work", 1);
      useHiveStore.getState().clearCompletedTasks();
      const state = useHiveStore.getState();
      expect(state.tasks).toHaveLength(1);
    });
  });

  describe("recordFocusSession", () => {
    it("increments totalFocusMins and streakCount", () => {
      useHiveStore.getState().recordFocusSession(25);
      const state = useHiveStore.getState();
      expect(state.totalFocusMins).toBe(25);
      expect(state.streakCount).toBe(1);
    });

    it("accumulates weekly focus minutes", () => {
      useHiveStore.getState().recordFocusSession(30);
      useHiveStore.getState().recordFocusSession(15);
      const state = useHiveStore.getState();
      expect(state.totalFocusMins).toBe(45);
      expect(state.streakCount).toBe(2);
    });

    it("persists to localStorage", () => {
      useHiveStore.getState().recordFocusSession(25);
      expect(localStorage.getItem("beehive_totalFocusMins")).toBe("25");
      expect(localStorage.getItem("beehive_streakCount")).toBe("1");
    });
  });

  describe("addXP", () => {
    it("adds xp and levels up when threshold exceeded", () => {
      useHiveStore.getState().addXP(150);
      const state = useHiveStore.getState();
      expect(state.level).toBe(2);
      expect(state.xp).toBe(0);
    });

    it("accumulates xp without leveling up", () => {
      useHiveStore.getState().addXP(50);
      const state = useHiveStore.getState();
      expect(state.xp).toBe(50);
      expect(state.level).toBe(1);
    });

    it("persists xp and level to localStorage", () => {
      useHiveStore.getState().addXP(75);
      expect(localStorage.getItem("beehive_xp")).toBe("75");
      expect(localStorage.getItem("beehive_level")).toBe("1");
    });
  });

  describe("achievements and quests", () => {
    it("unlockAchievement adds to list", () => {
      useHiveStore.getState().unlockAchievement("first-task");
      expect(useHiveStore.getState().unlockedAchievements).toContain("first-task");
    });

    it("unlockAchievement does not duplicate", () => {
      useHiveStore.getState().unlockAchievement("first-task");
      useHiveStore.getState().unlockAchievement("first-task");
      expect(useHiveStore.getState().unlockedAchievements).toHaveLength(1);
    });

    it("unlockAchievement persists to localStorage", () => {
      useHiveStore.getState().unlockAchievement("first-task");
      expect(localStorage.getItem("beehive_unlockedAchievements")).toBe(
        JSON.stringify(["first-task"]),
      );
    });

    it("claimQuest adds to claimed list", () => {
      useHiveStore.getState().claimQuest("quest-1");
      expect(useHiveStore.getState().claimedQuests).toContain("quest-1");
    });

    it("claimQuest does not duplicate", () => {
      useHiveStore.getState().claimQuest("quest-1");
      useHiveStore.getState().claimQuest("quest-1");
      expect(useHiveStore.getState().claimedQuests).toHaveLength(1);
    });

    it("isQuestClaimed returns correct status", () => {
      expect(useHiveStore.getState().isQuestClaimed("quest-1")).toBe(false);
      useHiveStore.getState().claimQuest("quest-1");
      expect(useHiveStore.getState().isQuestClaimed("quest-1")).toBe(true);
    });
  });

  describe("importTasks", () => {
    it("imports tasks in bulk", async () => {
      const imported = [
        {
          title: "Imported 1",
          completed: false,
          priority: "MEDIUM",
          category: "Work",
          pollenUnits: 2,
          columnId: "todo",
          notes: "",
        },
        {
          title: "Imported 2",
          completed: true,
          priority: "HIGH",
          category: "Work",
          pollenUnits: 5,
          columnId: "completed",
          notes: "Done",
        },
      ];
      await useHiveStore.getState().importTasks(imported as any);
      const state = useHiveStore.getState();
      expect(state.tasks).toHaveLength(2);
      expect(mockDb.tasks.bulkAdd).toHaveBeenCalledOnce();
      expect(state.unlockedAchievements).toContain("comb-imported");
    });
  });

  describe("triggerSavingState", () => {
    it("sets status to saving then saved then idle", async () => {
      vi.useFakeTimers();
      const operation = vi.fn().mockResolvedValue(undefined);
      const promise = useHiveStore.getState().triggerSavingState(operation);
      expect(useHiveStore.getState().savingStatus).toBe("saving");
      await promise;
      expect(useHiveStore.getState().savingStatus).toBe("saved");
      vi.advanceTimersByTime(1800);
      expect(useHiveStore.getState().savingStatus).toBe("idle");
      vi.useRealTimers();
    });

    it("sets status to idle on error", async () => {
      const { error: originalError } = console;
      console.error = vi.fn();
      const operation = vi.fn().mockRejectedValue(new Error("DB error"));
      await useHiveStore.getState().triggerSavingState(operation);
      expect(useHiveStore.getState().savingStatus).toBe("idle");
      console.error = originalError;
    });
  });
});
