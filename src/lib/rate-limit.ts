const store = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(ip: string, maxAttempts: number, windowMs: number): RateLimitResult {
  if (process.env.DISABLE_RATE_LIMIT) {
    return { allowed: true, limit: maxAttempts, remaining: maxAttempts, resetAt: Date.now() + windowMs };
  }
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      limit: maxAttempts,
      remaining: maxAttempts - 1,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, limit: maxAttempts, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    limit: maxAttempts,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt,
  };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
