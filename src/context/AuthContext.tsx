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
        const state = useHiveStore.getState();
        const {
          tasks,
          xp,
          level,
          totalFocusMins,
          streakCount,
          weeklyFocusMins,
          weeklyTasksCompleted,
          userBeeName,
          unlockedAchievements,
          claimedQuests,
        } = state;
        try {
          await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tasks: tasks.map((t) => ({ ...t, taskId: t.id })),
              stats: {
                xp,
                level,
                totalFocusMins,
                streakCount,
                weeklyFocusMins,
                weeklyTasksCompleted,
                userBeeName,
                unlockedAchievements,
                claimedQuests,
              },
            }),
          });
        } catch (e) {
          console.error("Sync after login failed:", e);
        }
        useHiveStore.getState().setUserId(json.data.user.id);
        useHiveStore.getState().loadTasks();
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
          const state = useHiveStore.getState();
          const {
            tasks,
            xp,
            level,
            totalFocusMins,
            streakCount,
            weeklyFocusMins,
            weeklyTasksCompleted,
            userBeeName,
            unlockedAchievements,
            claimedQuests,
          } = state;
          try {
            await fetch("/api/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tasks: tasks.map((t) => ({ ...t, taskId: t.id })),
                stats: {
                  xp,
                  level,
                  totalFocusMins,
                  streakCount,
                  weeklyFocusMins,
                  weeklyTasksCompleted,
                  userBeeName,
                  unlockedAchievements,
                  claimedQuests,
                },
              }),
            });
          } catch (e) {
            console.error("Sync after register failed:", e);
          }
          useHiveStore.getState().setUserId(json.data.user.id);
          useHiveStore.getState().loadTasks();
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
