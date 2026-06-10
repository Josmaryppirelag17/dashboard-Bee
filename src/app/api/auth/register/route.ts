import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/connection";
import { users } from "@/lib/db/schema";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { validatePassword } from "@/lib/password-validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
  name: z.string().min(1, "Name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const result = checkRateLimit(ip, 5, 60 * 1000);
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
    const parsed = registerSchema.safeParse(body);

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

    const { email, username, name, lastName, password } = parsed.data;

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WEAK_PASSWORD",
            message: `Password must include: ${pwCheck.errors.join(", ")}`,
          },
        },
        { status: 400 },
      );
    }

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

    const [existingEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_TAKEN",
            message: "An account with this email already exists",
          },
        },
        { status: 409 },
      );
    }

    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USERNAME_TAKEN",
            message: "This username is already taken",
          },
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const [inserted] = await db
      .insert(users)
      .values({ email, username, name, lastName, passwordHash })
      .returning();

    if (!inserted) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "CREATE_FAILED", message: "Failed to create user" },
        },
        { status: 500 },
      );
    }

    const token = await createSession(inserted.id);
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: inserted.id,
            email: inserted.email,
            username: inserted.username,
            name: inserted.name,
            lastName: inserted.lastName,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[auth/register]", error);
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
