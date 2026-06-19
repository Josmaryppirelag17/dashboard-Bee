import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, handleApiError, validationErrorResponse } from "../auth/shared";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/analytics");

const trackSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional(),
});

const PAGE_LIMIT = 1000;
const pageViews = new Map<string, { count: number; lastSeen: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse("Invalid event payload");

    const { event, properties } = parsed.data;
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";

    const key = `${ip}:${event}`;
    const existing = pageViews.get(key);
    const now = Date.now();

    if (existing && now - existing.lastSeen < 1000) {
      return apiSuccess({ tracked: true, deduplicated: true });
    }

    if (pageViews.size >= PAGE_LIMIT) {
      const sorted = [...pageViews.entries()].sort((a, b) => a[1].lastSeen - b[1].lastSeen);
      const oldest = sorted[0];
      if (oldest) pageViews.delete(oldest[0]);
    }

    pageViews.set(key, { count: (existing?.count ?? 0) + 1, lastSeen: now });

    if (process.env.NODE_ENV === "development") {
      log.info(event, properties);
    }

    return apiSuccess({ tracked: true });
  } catch (error) {
    return handleApiError("api/analytics", error);
  }
}
