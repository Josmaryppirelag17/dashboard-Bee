import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { generateTestUser } from "./helpers";

test.describe("Authentication", () => {
  test("register a new user", async ({ page }) => {
    const user = generateTestUser();
    const auth = new AuthPage(page);

    await page.goto("/");
    await page.waitForTimeout(1500);

    await auth.register(user.name, user.lastName, user.username, user.email, user.password);

    // Should be logged in (modal closed, cookie set)
    const loggedIn = await page.evaluate(() => document.cookie.includes("bee_session_token"));
    expect(loggedIn).toBeTruthy();
  });

  test("login with existing credentials", async ({ page }) => {
    const user = generateTestUser();
    const auth = new AuthPage(page);

    // First register
    await page.goto("/");
    await page.waitForTimeout(1500);
    await auth.register(user.name, user.lastName, user.username, user.email, user.password);
    await page.waitForTimeout(1000);

    // Logout
    await page.evaluate(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    });
    await page.reload();
    await page.waitForTimeout(1500);

    // Login
    await auth.login(user.email, user.password);

    const loggedIn = await page.evaluate(() => document.cookie.includes("bee_session_token"));
    expect(loggedIn).toBeTruthy();
  });

  test("show error on invalid login", async ({ page }) => {
    const auth = new AuthPage(page);

    await page.goto("/");
    await page.waitForTimeout(1500);

    await auth.openSignIn();
    await auth.emailInputField.fill("invalid@example.com");
    await auth.passwordInputField.fill("wrongpass1!");
    await auth.submitBtn.click();

    await expect(auth.errorAlert).toBeVisible({ timeout: 5000 });
  });

  test("show validation errors on empty register form", async ({ page }) => {
    const auth = new AuthPage(page);

    await page.goto("/");
    await page.waitForTimeout(1500);

    await auth.openSignIn();
    await auth.switchToSignUp();
    await auth.submitBtn.click();

    // Should see validation errors
    const errorTexts = await page.locator("text=/obligatorio|required|mínimo|minimum/i").count();
    expect(errorTexts).toBeGreaterThan(0);
  });
});
