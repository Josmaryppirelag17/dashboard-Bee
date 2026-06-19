import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, or } from "drizzle-orm";
import { getDb } from "@/lib/db/connection";
import { users, sessions } from "@/lib/db/schema";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  apiSuccess,
  apiError,
  handleApiError,
  rateLimitedResponse,
  validationErrorResponse,
  dbNotConfiguredResponse,
} from "../shared";

const loginSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, 5, 15 * 60 * 1000).allowed) return rateLimitedResponse();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { email, password } = parsed.data;

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, email)))
      .limit(1);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return apiError(401, "INVALID_CREDENTIALS", "Invalid email/username or password");
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    let sessionId: number | null = null;
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    if (session) sessionId = session.id;

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        lastName: user.lastName,
      },
      sessionId,
    });
  } catch (error) {
    return handleApiError("auth/login", error);
  }
}
