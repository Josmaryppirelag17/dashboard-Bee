import { Page } from "@playwright/test";

export function generateTestUser() {
  const ts = Date.now();
  return {
    name: `Test${ts}`,
    lastName: `User${ts}`,
    username: `e2e_test_${ts}`,
    email: `e2e_${ts}@test.com`,
    password: "TestPass1!",
  };
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some((c) => c.name === "bee_session_token");
}
