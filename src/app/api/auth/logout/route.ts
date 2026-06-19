import { getSessionToken, deleteSession, clearSessionCookie } from "@/lib/auth";
import { apiSuccess, handleApiError } from "../shared";

export async function POST() {
  try {
    const token = await getSessionToken();
    if (token) await deleteSession(token);
    await clearSessionCookie();
    return apiSuccess({ message: "Logged out successfully" });
  } catch (error) {
    return handleApiError("auth/logout", error);
  }
}
