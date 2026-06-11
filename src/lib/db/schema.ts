import { serial, varchar, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";

const bee = pgSchema("bee");

export const users = bee.table("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").default(false),
  emailToken: varchar("email_token", { length: 255 }),
  failedAttempts: integer("failed_attempts").default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  role: varchar("role", { length: 20 }).default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const passwordResetTokens = bee.table("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const sessions = bee.table("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const tasks = bee.table("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  taskId: varchar("task_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  completed: boolean("completed").default(false),
  priority: varchar("priority", { length: 20 }).default("MEDIUM"),
  category: varchar("category", { length: 100 }).default(""),
  pollenUnits: integer("pollen_units").default(1),
  columnId: varchar("column_id", { length: 50 }).default("todo"),
  notes: text("notes"),
  dueDate: varchar("due_date", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const userStats = bee.table("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  totalFocusMins: integer("total_focus_mins").default(0),
  streakCount: integer("streak_count").default(0),
  weeklyFocusMins: varchar("weekly_focus_mins", { length: 500 }).default("[0,0,0,0,0,0,0]"),
  weeklyTasksCompleted: varchar("weekly_tasks_completed", { length: 500 }).default(
    "[0,0,0,0,0,0,0]",
  ),
  userBeeName: varchar("user_bee_name", { length: 100 }).default(""),
  unlockedAchievements: text("unlocked_achievements").default("[]"),
  claimedQuests: text("claimed_quests").default("[]"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const auditLogs = bee.table("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type UserStat = typeof userStats.$inferSelect;
export type NewUserStat = typeof userStats.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
