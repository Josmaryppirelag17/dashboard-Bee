import { NextResponse } from "next/server";
import { getSessionToken, deleteSession, clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const token = await getSessionToken();

    if (token) {
      await deleteSession(token);
    }

    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    console.error("[auth/logout]", error);
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
