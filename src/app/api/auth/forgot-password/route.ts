import { NextRequest } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  apiSuccess,
  apiError,
  handleApiError,
  rateLimitedResponse,
  validationErrorResponse,
} from "../shared";

const schema = z.object({
  email: z.string().email().max(255),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, 3, 60 * 1000).allowed) return rateLimitedResponse();

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationErrorResponse("Invalid email address");

    const result = await createPasswordResetToken(parsed.data.email);
    if (!result.success) return apiError(404, "NOT_FOUND", result.error);

    return apiSuccess({ resetUrl: result.resetUrl });
  } catch (error) {
    return handleApiError("auth/forgot-password", error);
  }
}
