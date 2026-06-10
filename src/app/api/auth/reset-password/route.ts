import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/auth";
import { validatePassword } from "@/lib/password-validation";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" } },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

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
    const result = await resetPasswordWithToken(token, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "RESET_FAILED", message: result.error } },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: { message: "Password reset successfully" } });
  } catch (error) {
    console.error("[auth/reset-password]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      },
      { status: 500 },
    );
  }
}
