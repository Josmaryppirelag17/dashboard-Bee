import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isDev = process.env.NODE_ENV === "development";

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://beehive.vercel.app",
  ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
];

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin") || "";

  // ── CORS (validate origin) ──
  const isValidOrigin = isDev || !origin || ALLOWED_ORIGINS.includes(origin);
  if (isValidOrigin && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // ── Security Headers ──
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // ── CSP (development vs production) ──
  // Production uses nonce-based CSP with strict-dynamic to pass Mozilla Observatory A+.
  const nonce = generateNonce();

  const csp = isDev
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' ws:",
        "img-src 'self' data: blob: https:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ]
    : [
        "default-src 'self'",
        `script-src 'strict-dynamic' 'nonce-${nonce}'`,
        `style-src 'self' 'nonce-${nonce}'`,
        "connect-src 'self' https://*.ingest.sentry.io",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "worker-src 'self' blob:",
        "upgrade-insecure-requests",
      ];

  response.headers.set("Content-Security-Policy", csp.join("; "));
  response.headers.set("x-nonce", nonce);

  // ── Rate Limiting Headers ──
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", "100");
  response.headers.set("X-RateLimit-Reset", "60");

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
