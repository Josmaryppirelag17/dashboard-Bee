import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetDb = vi.fn();
const mockGetDbError = vi.fn();

const mockCheckRateLimit = vi.fn();
const mockGetClientIp = vi.fn();

const mockValidatePassword = vi.fn();

const mockHashPassword = vi.fn();
const mockVerifyPassword = vi.fn();
const mockCreateSession = vi.fn();
const mockSetSessionCookie = vi.fn();
const mockClearSessionCookie = vi.fn();
const mockGetSessionToken = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockDeleteSession = vi.fn();
const mockCreatePasswordResetToken = vi.fn();
const mockResetPasswordWithToken = vi.fn();

vi.mock("@/lib/db/connection", () => ({
  getDb: mockGetDb,
  getDbError: mockGetDbError,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIp: mockGetClientIp,
}));

vi.mock("@/lib/password-validation", () => ({
  validatePassword: mockValidatePassword,
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
  createSession: mockCreateSession,
  setSessionCookie: mockSetSessionCookie,
  clearSessionCookie: mockClearSessionCookie,
  getSessionToken: mockGetSessionToken,
  getCurrentUser: mockGetCurrentUser,
  deleteSession: mockDeleteSession,
  createPasswordResetToken: mockCreatePasswordResetToken,
  resetPasswordWithToken: mockResetPasswordWithToken,
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

function mockRequest(body?: unknown, url = "http://localhost:3000"): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function createMockDb() {
  const returning = vi.fn().mockResolvedValue([]);
  const limit = vi.fn().mockResolvedValue([]);

  const chain = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    limit,
    orderBy: vi.fn(() => chain),
    values: vi.fn(() => ({ returning })),
    set: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  };

  const db = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  };

  return { db, limit, returning };
}

beforeEach(() => {
  vi.resetAllMocks();
  mockCheckRateLimit.mockReturnValue({ allowed: true });
  mockGetClientIp.mockReturnValue("127.0.0.1");
  mockValidatePassword.mockReturnValue({ valid: true, errors: [] });
  mockGetDb.mockReturnValue(null);
  mockGetDbError.mockReturnValue(null);
  mockCreateSession.mockResolvedValue("default-tok");
  mockHashPassword.mockResolvedValue("default-hash");
  mockVerifyPassword.mockResolvedValue(false);
  mockGetCurrentUser.mockResolvedValue(null);
  mockGetSessionToken.mockResolvedValue(null);
  mockDeleteSession.mockResolvedValue(undefined);
  mockClearSessionCookie.mockResolvedValue(undefined);
  mockSetSessionCookie.mockResolvedValue(undefined);
  mockCreatePasswordResetToken.mockResolvedValue({ success: true, resetToken: "rt", resetUrl: "url" });
  mockResetPasswordWithToken.mockResolvedValue({ success: true });
});

describe("POST /api/auth/register", () => {
  const validBody = {
    email: "a@a.com",
    username: "user1",
    name: "Test",
    lastName: "User",
    password: "ValidPass1!",
  };

  it("returns 400 for invalid body", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(mockRequest({ email: "bad" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValueOnce({ allowed: false });
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(429);
    expect(mockGetClientIp).toHaveBeenCalled();
  });

  it("returns 400 when password is weak", async () => {
    mockValidatePassword.mockReturnValueOnce({ valid: false, errors: ["Una mayúscula"] });
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("WEAK_PASSWORD");
  });

  it("returns 503 when DB not configured", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(503);
  });

  it("returns 409 when email already exists", async () => {
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValueOnce([{ id: 1, email: "a@a.com" }]);
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error.code).toBe("EMAIL_TAKEN");
  });

  it("returns 409 when username already exists", async () => {
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 2, username: "user1" }]);
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error.code).toBe("USERNAME_TAKEN");
  });

  it("returns 500 when create fails", async () => {
    const { db, limit, returning } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValue([]);
    returning.mockResolvedValueOnce([]);
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.code).toBe("CREATE_FAILED");
  });

  it("returns 201 on successful registration", async () => {
    const { db, limit, returning } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValue([]);
    returning.mockResolvedValueOnce([{
      id: 1, email: "a@a.com", username: "user1", name: "Test", lastName: "User",
    }]);
    mockCreateSession.mockResolvedValueOnce("session-token");
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe("a@a.com");
    expect(mockSetSessionCookie).toHaveBeenCalledWith("session-token");
  });
});

describe("POST /api/auth/login", () => {
  const validBody = { email: "a@a.com", password: "ValidPass1!" };

  it("returns 400 for invalid body", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(mockRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValueOnce({ allowed: false });
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 503 when DB not configured", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(503);
  });

  it("returns 401 when user not found", async () => {
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValueOnce([]);
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 when password is wrong", async () => {
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValueOnce([{ id: 1, email: "a@a.com", username: "u", name: "T", lastName: "U", passwordHash: "hash" }]);
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 200 on successful login", async () => {
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValue(db);
    limit
      .mockResolvedValueOnce([{ id: 1, email: "a@a.com", username: "u", name: "T", lastName: "U", passwordHash: "hash" }])
      .mockResolvedValueOnce([{ id: 42, token: "session-token" }]);
    mockVerifyPassword.mockResolvedValueOnce(true);
    mockCreateSession.mockResolvedValueOnce("session-token");
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(mockRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.sessionId).toBe(42);
    expect(mockSetSessionCookie).toHaveBeenCalledWith("session-token");
  });
});

describe("GET /api/auth/session", () => {
  it("returns unauthenticated when no user", async () => {
    const { GET } = await import("@/app/api/auth/session/route");
    const res = await GET();
    const data = await res.json();
    expect(data.data.authenticated).toBe(false);
    expect(data.data.user).toBeNull();
  });

  it("returns authenticated with session", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ id: 1, email: "a@a.com", username: "u", name: "T", lastName: "U" });
    mockGetSessionToken.mockResolvedValueOnce("tok");
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValueOnce([{ id: 42, token: "tok" }]);
    const { GET } = await import("@/app/api/auth/session/route");
    const res = await GET();
    const data = await res.json();
    expect(data.data.authenticated).toBe(true);
    expect(data.data.sessionId).toBe(42);
  });

  it("returns authenticated without session id when token not in db", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ id: 1, email: "a@a.com" });
    mockGetSessionToken.mockResolvedValueOnce("tok");
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValueOnce([]);
    const { GET } = await import("@/app/api/auth/session/route");
    const res = await GET();
    const data = await res.json();
    expect(data.data.authenticated).toBe(true);
    expect(data.data.sessionId).toBeNull();
  });
});

describe("POST /api/auth/logout", () => {
  it("returns 200 and clears session", async () => {
    mockGetSessionToken.mockResolvedValueOnce("tok");
    const { POST } = await import("@/app/api/auth/logout/route");
    const res = await POST();
    expect(res.status).toBe(200);
    expect(mockDeleteSession).toHaveBeenCalledWith("tok");
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });

  it("returns 200 when no session token", async () => {
    const { POST } = await import("@/app/api/auth/logout/route");
    const res = await POST();
    expect(res.status).toBe(200);
    expect(mockDeleteSession).not.toHaveBeenCalled();
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });
});

describe("GET /api/auth/sessions", () => {
  it("returns 401 when not authenticated", async () => {
    const { GET } = await import("@/app/api/auth/sessions/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 503 when DB not configured", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ id: 1 });
    const { GET } = await import("@/app/api/auth/sessions/route");
    const res = await GET();
    expect(res.status).toBe(503);
  });

  it("returns sessions list", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ id: 1 });
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    const sessionsData = [
      { id: 10, token: "tok1", userId: 1 },
      { id: 11, token: "tok2", userId: 1 },
    ];
    db.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn().mockResolvedValueOnce(sessionsData),
        })),
      })),
    } as any);
    const { GET } = await import("@/app/api/auth/sessions/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.sessions).toHaveLength(2);
  });
});

describe("DELETE /api/auth/sessions", () => {
  it("returns 401 when not authenticated", async () => {
    const { DELETE } = await import("@/app/api/auth/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/auth/sessions?sessionId=1");
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("returns 503 when DB not configured", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ id: 1 });
    const { DELETE } = await import("@/app/api/auth/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/auth/sessions");
    const res = await DELETE(req);
    expect(res.status).toBe(503);
  });

  it("returns 404 when session not found", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ id: 1 });
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValueOnce([]);
    const { DELETE } = await import("@/app/api/auth/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/auth/sessions?sessionId=99");
    const res = await DELETE(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error.code).toBe("SESSION_NOT_FOUND");
  });

  it("revokes a specific session", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ id: 1 });
    const { db, limit } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    limit.mockResolvedValueOnce([{ id: 10, token: "tok", userId: 1 }]);
    const { DELETE } = await import("@/app/api/auth/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/auth/sessions?sessionId=10");
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(db.update).toHaveBeenCalled();
  });

  it("revokes all sessions when no sessionId", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ id: 1 });
    const { db } = createMockDb();
    mockGetDb.mockReturnValueOnce(db);
    const { DELETE } = await import("@/app/api/auth/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/auth/sessions");
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(db.update).toHaveBeenCalled();
  });
});

describe("POST /api/auth/forgot-password", () => {
  it("returns 400 for invalid email", async () => {
    const { POST } = await import("@/app/api/auth/forgot-password/route");
    const res = await POST(mockRequest({ email: "bad" }));
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValueOnce({ allowed: false });
    const { POST } = await import("@/app/api/auth/forgot-password/route");
    const res = await POST(mockRequest({ email: "a@a.com" }));
    expect(res.status).toBe(429);
  });

  it("returns 404 when email not found", async () => {
    mockCreatePasswordResetToken.mockResolvedValueOnce({ success: false, error: "No account found with that email" });
    const { POST } = await import("@/app/api/auth/forgot-password/route");
    const res = await POST(mockRequest({ email: "noone@t.com" }));
    expect(res.status).toBe(404);
  });

  it("returns 200 with resetUrl on success", async () => {
    mockCreatePasswordResetToken.mockResolvedValueOnce({ success: true, resetToken: "abc", resetUrl: "http://localhost:3000/auth/reset-password/abc" });
    const { POST } = await import("@/app/api/auth/forgot-password/route");
    const res = await POST(mockRequest({ email: "a@a.com" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.resetUrl).toContain("/auth/reset-password/abc");
  });
});

describe("POST /api/auth/reset-password", () => {
  it("returns 400 for invalid input", async () => {
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(mockRequest({ token: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValueOnce({ allowed: false });
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(mockRequest({ token: "t", password: "NewPass123!" }));
    expect(res.status).toBe(429);
  });

  it("returns 400 when password is weak", async () => {
    mockValidatePassword.mockReturnValueOnce({ valid: false, errors: ["Una mayúscula"] });
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(mockRequest({ token: "t", password: "short" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when reset fails", async () => {
    mockResetPasswordWithToken.mockResolvedValueOnce({ success: false, error: "Invalid or expired reset token" });
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(mockRequest({ token: "bad", password: "NewPass123!" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful reset", async () => {
    mockResetPasswordWithToken.mockResolvedValueOnce({ success: true });
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(mockRequest({ token: "valid-token", password: "NewPass123!" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.message).toBe("Password reset successfully");
  });
});
