# Known Limitations

> Current state of known project limitations. Not planned for resolution unless they become blockers.

---

## 3. Sentry DSNs hardcoded in `.env.*`

Files `.env.development`, `.env.production` and `.env.staging` contain hardcoded Sentry DSNs. They should be runtime environment variables only.

**Impact:** Low. Sentry DSNs are public by design.

---

## 4. Inconsistent rate limiting

Login has rate limiting (5/15min), Register (5/min), Forgot (3/min). Missing rate limiting on:

- Reset password
- Tasks API (POST/PUT/DELETE)

**Impact:** Low. For a portfolio project, risk is minimal.

---

## 5. No structured LoggerService

The project uses direct `console.error` instead of a structured logger with levels.

**Impact:** Low. Sufficient for debugging.

---

## 6. Analytics endpoint not configured

`src/lib/analytics.ts` has a client with queue and sendBeacon, but `NEXT_PUBLIC_ANALYTICS_ENDPOINT` is not set in any `.env`.

**Impact:** Low. Not critical for a portfolio.

---

## 7. Account lockout not implemented

Schema has `failedAttempts` and `lockedUntil` fields but the lockout logic is not implemented.

**Impact:** Low. Rate limiting already mitigates brute-force attacks.

---

## 8. Email verification not implemented

Schema has `emailVerified` and `emailToken` fields but no email verification flow.

**Impact:** Low. Not critical for a portfolio project.

---

## 9. No health check endpoint

No `/api/health` endpoint for monitoring.

**Impact:** Low. Vercel handles health checks internally.
