import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/connection";
import { users } from "@/lib/db/schema";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { validatePassword } from "@/lib/password-validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  apiSuccess,
  apiError,
  handleApiError,
  rateLimitedResponse,
  validationErrorResponse,
  dbNotConfiguredResponse,
  weakPasswordResponse,
} from "../shared";

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
    if (!checkRateLimit(ip, 5, 60 * 1000).allowed) return rateLimitedResponse();

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { email, username, name, lastName, password } = parsed.data;

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) return weakPasswordResponse(pwCheck.errors);

    const db = getDb();
    if (!db) return dbNotConfiguredResponse();

    const [existingEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail)
      return apiError(409, "EMAIL_TAKEN", "An account with this email already exists");

    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (existingUsername) return apiError(409, "USERNAME_TAKEN", "This username is already taken");

    const passwordHash = await hashPassword(password);
    const [inserted] = await db
      .insert(users)
      .values({ email, username, name, lastName, passwordHash })
      .returning();
    if (!inserted) return apiError(500, "CREATE_FAILED", "Failed to create user");

    const token = await createSession(inserted.id);
    await setSessionCookie(token);

    return apiSuccess(
      {
        user: {
          id: inserted.id,
          email: inserted.email,
          username: inserted.username,
          name: inserted.name,
          lastName: inserted.lastName,
        },
      },
      201,
    );
  } catch (error) {
    return handleApiError("auth/register", error);
  }
}
