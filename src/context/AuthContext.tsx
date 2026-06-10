"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useHiveStore } from "@/store/useHiveStore";

interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    username: string,
    name: string,
    lastName: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/session");
      const json = await res.json();
      if (json.success && json.data.authenticated) {
        setUser(json.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (user) {
      useHiveStore.getState().setUserId(user.id);
      useHiveStore.getState().loadTasks();
    } else {
      useHiveStore.getState().setUserId(null);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.data.user);
        const store = useHiveStore.getState();
        store.setUserId(json.data.user.id);

        // Pull cloud data first (ensures cross-device persistence)
        await store.loadTasks();
        let cloudStats: Record<string, unknown> | null = null;
        try {
          const statsRes = await fetch("/api/stats");
          const statsJson = await statsRes.json();
          if (statsJson.success && statsJson.data) cloudStats = statsJson.data;
        } catch {
          /* stats fetch best-effort */
        }

        // Merge local + cloud, then push to cloud
        const state = useHiveStore.getState();
        const mergedStats = cloudStats
          ? {
              xp: Math.max(state.xp, (cloudStats.xp as number) ?? 0),
              level: Math.max(state.level, (cloudStats.level as number) ?? 1),
              totalFocusMins: Math.max(
                state.totalFocusMins,
                (cloudStats.totalFocusMins as number) ?? 0,
              ),
              streakCount: Math.max(state.streakCount, (cloudStats.streakCount as number) ?? 0),
              weeklyFocusMins: state.weeklyFocusMins,
              weeklyTasksCompleted: state.weeklyTasksCompleted,
              userBeeName: state.userBeeName || (cloudStats.userBeeName as string) || "",
              unlockedAchievements: state.unlockedAchievements,
              claimedQuests: state.claimedQuests,
            }
          : {
              xp: state.xp,
              level: state.level,
              totalFocusMins: state.totalFocusMins,
              streakCount: state.streakCount,
              weeklyFocusMins: state.weeklyFocusMins,
              weeklyTasksCompleted: state.weeklyTasksCompleted,
              userBeeName: state.userBeeName,
              unlockedAchievements: state.unlockedAchievements,
              claimedQuests: state.claimedQuests,
            };
        try {
          await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tasks: state.tasks.map((t) => ({ ...t, taskId: t.id })),
              stats: mergedStats,
            }),
          });
        } catch (e) {
          console.error("Sync after login failed:", e);
        }
        return { success: true };
      }
      return {
        success: false,
        error: json.error?.message ?? "Login failed",
      };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const register = useCallback(
    async (email: string, username: string, name: string, lastName: string, password: string) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, name, lastName, password }),
        });
        const json = await res.json();
        if (json.success) {
          setUser(json.data.user);
          const store = useHiveStore.getState();
          store.setUserId(json.data.user.id);

          const state = useHiveStore.getState();
          try {
            await fetch("/api/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tasks: state.tasks.map((t) => ({ ...t, taskId: t.id })),
                stats: {
                  xp: state.xp,
                  level: state.level,
                  totalFocusMins: state.totalFocusMins,
                  streakCount: state.streakCount,
                  weeklyFocusMins: state.weeklyFocusMins,
                  weeklyTasksCompleted: state.weeklyTasksCompleted,
                  userBeeName: state.userBeeName,
                  unlockedAchievements: state.unlockedAchievements,
                  claimedQuests: state.claimedQuests,
                },
              }),
            });
          } catch (e) {
            console.error("Sync after register failed:", e);
          }
          await store.loadTasks();
          return { success: true };
        }
        return {
          success: false,
          error: json.error?.message ?? "Registration failed",
        };
      } catch {
        return { success: false, error: "Network error" };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}
