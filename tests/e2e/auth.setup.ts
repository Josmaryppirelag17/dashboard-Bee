import { test as setup, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { generateTestUser } from "./helpers";
import path from "path";

const AUTH_FILE = path.resolve(".auth/user.json");

setup("authenticate as test user", async ({ page }) => {
  const user = generateTestUser();
  const auth = new AuthPage(page);

  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();

  // Wait for app to hydrate
  await page.waitForTimeout(2000);

  // Register a new user
  await auth.register(user.name, user.lastName, user.username, user.email, user.password);

  // Wait for auth cookie to be set
  await page.waitForTimeout(2000);

  // Verify logged in (httpOnly cookie, must use context().cookies())
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find((c) => c.name === "bee_session_token");
  expect(sessionCookie).toBeDefined();
  expect(sessionCookie!.value).toBeTruthy();

  // Save storage state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });

  // Store user info for test use
  await page.evaluate((u) => {
    localStorage.setItem("e2e_test_user", JSON.stringify(u));
  }, user);
});
