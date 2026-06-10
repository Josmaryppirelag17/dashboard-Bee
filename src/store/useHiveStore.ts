"use client";

import { create } from "zustand";
import { Task, PriorityLevel, ColumnId } from "../types";
import { sanitizeInput } from "../utils/sanitize";
import { secureRandomIndex } from "../utils/random";
import type { BeehiveDatabase } from "../lib/db";
import { api } from "../lib/api-client";

interface HiveState {
  tasks: Task[];
  activeTab: string;
  selectedMetricId: string;
  isSidebarCollapsed: boolean;
  savingStatus: "idle" | "saving" | "saved";
  streakCount: number;
  totalFocusMins: number;
  inAppHelpOpen: boolean;
  searchQuery: string;
  weeklyFocusMins: number[];
  weeklyTasksCompleted: number[];
  language: "es" | "en";
  hydrated: boolean;

  xp: number;
  level: number;
  userBeeName: string;
  unlockedAchievements: string[];
  claimedQuests: string[];

  userId: number | null;

  triggerSavingState: (operation: () => Promise<void>) => Promise<void>;
  setSearchQuery: (query: string) => void;
  hydrate: () => void;
  loadTasks: () => Promise<void>;
  addTask: (
    title: string,
    priority: PriorityLevel,
    category: string,
    pollenUnits: number,
  ) => Promise<void>;
  updateTaskColumn: (taskId: string, targetColumnId: ColumnId) => Promise<void>;
  updateTaskNotes: (taskId: string, notes: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  recordFocusSession: (minutes: number) => void;
  setStreakCount: (count: number) => void;
  setSavingStatus: (status: "idle" | "saving" | "saved") => void;
  setActiveTab: (tab: string) => void;
  setSelectedMetricId: (id: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setInAppHelpOpen: (open: boolean) => void;
  setLanguage: (lang: "es" | "en") => void;

  addXP: (amount: number) => void;
  setUserBeeName: (name: string) => void;
  unlockAchievement: (id: string) => void;
  claimQuest: (questId: string) => void;
  isQuestClaimed: (questId: string) => boolean;
  importTasks: (importedTasks: Omit<Task, "id">[]) => Promise<void>;
  setUserId: (id: number | null) => void;
}

const safeLocalGet = (key: string, fallback: string): string => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    /* private browsing */ return fallback;
  }
};
const safeJSONGet = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    /* storage unavailable */ return fallback;
  }
};

let _dbCache: BeehiveDatabase | null = null;

async function getDB(): Promise<BeehiveDatabase> {
  if (!_dbCache) {
    _dbCache = (await import("../lib/db")).db;
  }
  return _dbCache;
}

let saveStatusTimeout: NodeJS.Timeout | null = null;

const defaultBeeName = "ObreraZumbadora_" + (secureRandomIndex(900) + 100);

export const useHiveStore = create<HiveState>((set, get) => ({
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
  userId: null,
  userBeeName: defaultBeeName,
  unlockedAchievements: [] as string[],
  claimedQuests: [] as string[],

  hydrate: () => {
    if (get().hydrated) return;
    requestIdleCallback(() => {
      set({
        streakCount: parseInt(safeLocalGet("beehive_streakCount", "0"), 10),
        totalFocusMins: parseInt(safeLocalGet("beehive_totalFocusMins", "0"), 10),
        language: safeLocalGet("beehive_language", "es") as "es" | "en",
        weeklyFocusMins: safeJSONGet("beehive_weeklyFocusMins", [0, 0, 0, 0, 0, 0, 0]),
        weeklyTasksCompleted: safeJSONGet("beehive_weeklyTasksCompleted", [0, 0, 0, 0, 0, 0, 0]),
        xp: parseInt(safeLocalGet("beehive_xp", "0"), 10),
        level: parseInt(safeLocalGet("beehive_level", "1"), 10),
        userBeeName: safeLocalGet("beehive_userBeeName", defaultBeeName),
        unlockedAchievements: safeJSONGet("beehive_unlockedAchievements", []),
        claimedQuests: safeJSONGet("beehive_claimedQuests", []),
        hydrated: true,
      });
    });
  },

  setSavingStatus: (savingStatus) => set({ savingStatus }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedMetricId: (selectedMetricId) => set({ selectedMetricId }),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setInAppHelpOpen: (inAppHelpOpen) => set({ inAppHelpOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLanguage: (language) => {
    try {
      localStorage.setItem("beehive_language", language);
    } catch {
      /* private browsing */
    }
    set({ language });
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(554.37, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      /* audio not available */
    }
  },

  triggerSavingState: async (operation: () => Promise<void>) => {
    set({ savingStatus: "saving" });
    try {
      await operation();
      set({ savingStatus: "saved" });
      if (saveStatusTimeout) clearTimeout(saveStatusTimeout);
      saveStatusTimeout = setTimeout(() => {
        set({ savingStatus: "idle" });
      }, 1800);
    } catch (err) {
      console.error("Dexie database transaction failed:", err);
      set({ savingStatus: "idle" });
    }
  },

  loadTasks: async () => {
    const { userId } = get();
    if (userId) {
      try {
        const res = await api.get<{ success: boolean; data: Task[] }>("/api/tasks");
        if (res.success) {
          set({ tasks: res.data });
        }
      } catch (e) {
        console.error("Failed to load tasks from cloud:", e);
      }
    } else {
      const db = await getDB();
      const list = await db.tasks.toArray();
      set({ tasks: list });
    }
  },

  addTask: async (title, priority, category, pollenUnits) => {
    const sanitizedTitle = sanitizeInput(title);
    if (!sanitizedTitle) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: sanitizedTitle,
      completed: false,
      priority,
      category,
      pollenUnits,
      columnId: "todo",
    };

    const { userId } = get();
    if (userId) {
      await get().triggerSavingState(async () => {
        await api.post("/api/tasks", {
          taskId: newTask.id,
          title: newTask.title,
          completed: newTask.completed,
          priority: newTask.priority,
          category: newTask.category,
          pollenUnits: newTask.pollenUnits,
          columnId: newTask.columnId,
        });
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      });
    } else {
      await get().triggerSavingState(async () => {
        const db = await getDB();
        await db.tasks.add(newTask);
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      });
    }

    get().unlockAchievement("wax-creator");
    if (get().tasks.length === 1) {
      get().unlockAchievement("first-tasks");
    }
  },

  updateTaskColumn: async (taskId, targetColumnId) => {
    const isCompletedColumn = targetColumnId === "completed";
    const { userId } = get();

    await get().triggerSavingState(async () => {
      if (userId) {
        await api.put("/api/tasks", {
          taskId,
          columnId: targetColumnId,
          completed: isCompletedColumn,
        });
      } else {
        const db = await getDB();
        await db.tasks.update(taskId, {
          columnId: targetColumnId,
          completed: isCompletedColumn,
        });
      }

      set((state) => {
        const found = state.tasks.find((t) => t.id === taskId);
        const wasCompleted = found?.completed || false;
        const nextTasks = state.tasks.map((t) =>
          t.id === taskId ? { ...t, columnId: targetColumnId, completed: isCompletedColumn } : t,
        );

        const nextWeeklyTasks = [...state.weeklyTasksCompleted];
        if (isCompletedColumn && !wasCompleted) {
          const dayIdx = (new Date().getDay() + 6) % 7;
          nextWeeklyTasks[dayIdx] = (nextWeeklyTasks[dayIdx] || 0) + 1;
          try {
            localStorage.setItem("beehive_weeklyTasksCompleted", JSON.stringify(nextWeeklyTasks));
          } catch {
            /* private browsing */
          }

          const pollenOfTask = found?.pollenUnits || 1;
          setTimeout(() => {
            get().unlockAchievement("harvest-honey");
            if (pollenOfTask >= 5) {
              get().unlockAchievement("mighty-forager");
            }
          }, 50);
        }

        return {
          tasks: nextTasks,
          weeklyTasksCompleted: nextWeeklyTasks,
        };
      });
    });
  },

  updateTaskNotes: async (taskId, notes) => {
    const { userId } = get();
    await get().triggerSavingState(async () => {
      if (userId) {
        await api.put("/api/tasks", { taskId, notes });
      } else {
        const db = await getDB();
        await db.tasks.update(taskId, { notes });
      }
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, notes } : t)),
      }));
    });
  },

  toggleTask: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextCompleted = !task.completed;
    const nextColumnId: ColumnId = nextCompleted ? "completed" : "todo";
    const { userId } = get();

    await get().triggerSavingState(async () => {
      if (userId) {
        await api.put("/api/tasks", { taskId, completed: nextCompleted, columnId: nextColumnId });
      } else {
        const db = await getDB();
        await db.tasks.update(taskId, {
          completed: nextCompleted,
          columnId: nextColumnId,
        });
      }

      set((state) => {
        const nextTasks = state.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: nextCompleted, columnId: nextColumnId } : t,
        );

        const nextWeeklyTasks = [...state.weeklyTasksCompleted];
        if (nextCompleted) {
          const dayIdx = (new Date().getDay() + 6) % 7;
          nextWeeklyTasks[dayIdx] = (nextWeeklyTasks[dayIdx] || 0) + 1;
          try {
            localStorage.setItem("beehive_weeklyTasksCompleted", JSON.stringify(nextWeeklyTasks));
          } catch {
            /* private browsing */
          }

          const pollenOfTask = task.pollenUnits || 1;
          setTimeout(() => {
            get().unlockAchievement("harvest-honey");
            if (pollenOfTask >= 5) {
              get().unlockAchievement("mighty-forager");
            }
          }, 50);
        }

        return {
          tasks: nextTasks,
          weeklyTasksCompleted: nextWeeklyTasks,
        };
      });
    });
  },

  deleteTask: async (taskId) => {
    const { userId } = get();
    await get().triggerSavingState(async () => {
      if (userId) {
        await api.delete(`/api/tasks?taskId=${encodeURIComponent(taskId)}`);
      } else {
        const db = await getDB();
        await db.tasks.delete(taskId);
      }
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    });
  },

  clearCompletedTasks: async () => {
    const completedIds = get()
      .tasks.filter((t) => t.columnId === "completed")
      .map((t) => t.id);
    if (completedIds.length === 0) return;

    const { userId } = get();
    await get().triggerSavingState(async () => {
      if (userId) {
        await Promise.all(
          completedIds.map((id) => api.delete(`/api/tasks?taskId=${encodeURIComponent(id)}`)),
        );
      } else {
        const db = await getDB();
        await Promise.all(completedIds.map((id) => db.tasks.delete(id)));
      }
      set((state) => ({
        tasks: state.tasks.filter((t) => t.columnId !== "completed"),
      }));
    });
  },

  recordFocusSession: (minutes) => {
    set((state) => {
      const nextMins = state.totalFocusMins + minutes;
      const nextStreak = state.streakCount + 1;
      const dayIdx = (new Date().getDay() + 6) % 7;
      const nextWeeklyFocus = [...state.weeklyFocusMins];
      nextWeeklyFocus[dayIdx] = (nextWeeklyFocus[dayIdx] || 0) + minutes;

      try {
        localStorage.setItem("beehive_totalFocusMins", String(nextMins));
        localStorage.setItem("beehive_streakCount", String(nextStreak));
        localStorage.setItem("beehive_weeklyFocusMins", JSON.stringify(nextWeeklyFocus));
      } catch {
        /* private browsing */
      }

      const { userId } = get();
      if (userId) {
        api
          .put("/api/stats", {
            totalFocusMins: nextMins,
            streakCount: nextStreak,
            weeklyFocusMins: nextWeeklyFocus,
          })
          .catch(() => {});
      }

      setTimeout(() => {
        get().unlockAchievement("pomodoro-first");
        if (nextMins >= 100) {
          get().unlockAchievement("deep-worker");
        }
      }, 50);

      return {
        totalFocusMins: nextMins,
        streakCount: nextStreak,
        weeklyFocusMins: nextWeeklyFocus,
      };
    });
  },

  setStreakCount: (streakCount) => {
    try {
      localStorage.setItem("beehive_streakCount", String(streakCount));
    } catch {
      /* private browsing */
    }
    set({ streakCount });
    const { userId } = get();
    if (userId) {
      api.put("/api/stats", { streakCount }).catch(() => {});
    }
  },

  addXP: (amount) => {
    set((state) => {
      const nextXp = state.xp + amount;
      let nextLevel = state.level;
      let leveledUp = false;
      let finalXp = nextXp;

      while (finalXp >= nextLevel * 150) {
        finalXp -= nextLevel * 150;
        nextLevel += 1;
        leveledUp = true;
      }

      try {
        localStorage.setItem("beehive_xp", String(finalXp));
        localStorage.setItem("beehive_level", String(nextLevel));
      } catch {
        /* private browsing */
      }

      const { userId } = get();
      if (userId) {
        api.put("/api/stats", { xp: finalXp, level: nextLevel }).catch(() => {});
      }

      if (leveledUp) {
        try {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const audioCtx = new AudioCtx();
          const playNote = (freq: number, start: number, duration: number) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.08, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(start);
            osc.stop(start + duration);
          };
          playNote(523.25, audioCtx.currentTime, 0.15);
          playNote(659.25, audioCtx.currentTime + 0.15, 0.15);
          playNote(783.99, audioCtx.currentTime + 0.3, 0.15);
          playNote(1046.5, audioCtx.currentTime + 0.45, 0.4);
        } catch {
          /* private browsing */
        }
      } else {
        try {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const audioCtx = new AudioCtx();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.08);
        } catch {
          /* private browsing */
        }
      }

      return {
        xp: finalXp,
        level: nextLevel,
      };
    });
  },

  setUserBeeName: (userBeeName) => {
    try {
      localStorage.setItem("beehive_userBeeName", userBeeName);
    } catch {
      /* private browsing */
    }
    set({ userBeeName });
    const { userId } = get();
    if (userId) {
      api.put("/api/stats", { userBeeName }).catch(() => {});
    }
  },

  unlockAchievement: (id) => {
    const list = get().unlockedAchievements;
    if (list.includes(id)) return;

    const nextList = [...list, id];
    try {
      localStorage.setItem("beehive_unlockedAchievements", JSON.stringify(nextList));
    } catch {
      /* private browsing */
    }
    set({ unlockedAchievements: nextList });

    const { userId } = get();
    if (userId) {
      api.put("/api/stats", { unlockedAchievements: nextList }).catch(() => {});
    }

    setTimeout(() => {
      get().addXP(100);
    }, 50);
  },

  importTasks: async (importedTasks) => {
    const { userId } = get();
    await get().triggerSavingState(async () => {
      if (userId) {
        const dbTasks = importedTasks.map((t, idx) => ({
          taskId: `task-${Date.now()}-${idx}`,
          title: t.title,
          completed: t.completed,
          priority: t.priority,
          category: t.category,
          pollenUnits: t.pollenUnits,
          columnId: t.columnId,
          notes: t.notes,
          dueDate: t.dueDate,
        }));
        for (const task of dbTasks) {
          await api.post("/api/tasks", task);
        }
        await get().loadTasks();
      } else {
        const db = await getDB();
        const dbTasks: Task[] = importedTasks.map((t, idx) => ({
          ...t,
          id: `task-${Date.now()}-${idx}`,
        }));
        await db.tasks.bulkAdd(dbTasks);
        const list = await db.tasks.toArray();
        set({ tasks: list });
      }
    });

    get().unlockAchievement("comb-imported");
  },

  claimQuest: (questId: string) => {
    const claimed = get().claimedQuests;
    if (claimed.includes(questId)) return;
    const nextClaimed = [...claimed, questId];
    try {
      localStorage.setItem("beehive_claimedQuests", JSON.stringify(nextClaimed));
    } catch {
      /* private browsing */
    }
    set({ claimedQuests: nextClaimed });
    const { userId } = get();
    if (userId) {
      api.put("/api/stats", { claimedQuests: nextClaimed }).catch(() => {});
    }
  },

  isQuestClaimed: (questId: string) => {
    return get().claimedQuests.includes(questId);
  },

  setUserId: (id) => set({ userId: id }),
}));
