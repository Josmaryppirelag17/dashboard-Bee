import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/connection";
import { users } from "@/lib/db/schema";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { eq, or } from "drizzle-orm";

const loginSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const result = checkRateLimit(ip, 5, 15 * 60 * 1000);
    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many attempts. Try again later.",
          },
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.errors.map((e) => e.message).join(", "),
          },
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DB_NOT_CONFIGURED",
            message: "Database connection not available",
          },
        },
        { status: 503 },
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, email)))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email/username or password",
          },
        },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email/username or password",
          },
        },
        { status: 401 },
      );
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          lastName: user.lastName,
        },
      },
    });
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 },
    );
  }
}
