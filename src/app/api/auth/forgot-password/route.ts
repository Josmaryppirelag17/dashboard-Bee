import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/auth";

const schema = z.object({
  email: z.string().email().max(255),
});

export async function POST(request: NextRequest) {
  try {
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
