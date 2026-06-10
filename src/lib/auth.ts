import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/connection";
import { users, sessions, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

const SESSION_COOKIE = "bee_session_token";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  return token?.value ?? null;
}

export async function getCurrentUser() {
  const db = getDb();
  if (!db) return null;

  const token = await getSessionToken();
  if (!token) return null;

  const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

  if (!session) return null;
  if (new Date() > session.expiresAt) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    lastName: user.lastName,
    createdAt: user.createdAt,
  };
}

export async function deleteSession(token: string) {
  const db = getDb();
  if (!db) return;

  await db.delete(sessions).where(eq(sessions.token, token));
}

async function generateResetTokenString(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createPasswordResetToken(
  email: string,
): Promise<
  { success: true; resetToken: string; resetUrl: string } | { success: false; error: string }
> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  try {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    if (userResult.length === 0) {
      return { success: false, error: "No account found with that email" };
    }

    const user = userResult[0]!;
    const token = await generateResetTokenString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

    return { success: true, resetToken: token, resetUrl };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create reset token";
    return { success: false, error: msg };
  }
}

export async function validateResetToken(
  token: string,
): Promise<{ success: true; userId: number } | { success: false; error: string }> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  try {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(eq(passwordResetTokens.token, token), gt(passwordResetTokens.expiresAt, new Date())),
      )
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    const resetTokenRecord = result[0]!;
    if (resetTokenRecord.usedAt) {
      return { success: false, error: "Reset token has already been used" };
    }

    return { success: true, userId: resetTokenRecord.userId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to validate reset token";
    return { success: false, error: msg };
  }
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  try {
    const validation = await validateResetToken(token);
    if (!validation.success) return validation;

    const passwordHash = await hashPassword(newPassword);

    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash }).where(eq(users.id, validation.userId));
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.token, token));
      await tx.delete(sessions).where(eq(sessions.userId, validation.userId));
    });

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reset password";
    return { success: false, error: msg };
  }
}
