import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(255),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip, 3, 60 * 1000);
    if (!rateLimit.allowed) {
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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email address" } },
        { status: 400 },
      );
    }

    const result = await createPasswordResetToken(parsed.data.email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: result.error } },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: { resetUrl: result.resetUrl } });
  } catch (error) {
    console.error("[auth/forgot-password]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      },
      { status: 500 },
    );
  }
}
