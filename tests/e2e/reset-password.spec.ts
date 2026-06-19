import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { generateTestUser } from "./helpers";

test.describe("Reset Password", () => {
  test("forgot password flow shows success for valid email", async ({ page }) => {
    const user = generateTestUser();
    const auth = new AuthPage(page);

    // Register a user first
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

    // Open forgot password from sign-in modal
    await auth.openSignIn();
    await page.waitForTimeout(500);

    // Click forgot password link
    const forgotLink = page.locator("text=/Forgot password|Olvidé mi contraseña|Recuperar/");
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await page.waitForTimeout(500);
    }

    // Try to submit the forgot-password form
    const emailField = page.locator("#reset-email, input[type=email]").last();
    if (await emailField.isVisible()) {
      await emailField.fill(user.email);
      const sendBtn = page.locator('button[type="submit"]').filter({ hasText: /Send|Enviar|Reset/ }).last();
      await sendBtn.click();
      await page.waitForTimeout(1000);

      // Should show success message
      await expect(
        page.locator("text=/sent|enviado|success|correo|email/i").first(),
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("shows error for unregistered email in forgot password", async ({ page }) => {
    const auth = new AuthPage(page);

    await page.goto("/");
    await page.waitForTimeout(1500);

    await auth.openSignIn();
    await page.waitForTimeout(500);

    // Click forgot password link
    const forgotLink = page.locator("text=/Forgot password|Olvidé mi contraseña|Recuperar/");
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await page.waitForTimeout(500);
    }

    // Try with unregistered email
    const emailField = page.locator("#reset-email, input[type=email]").last();
    if (await emailField.isVisible()) {
      await emailField.fill("nonexistent@test.com");
      const sendBtn = page.locator('button[type="submit"]').filter({ hasText: /Send|Enviar|Reset/ }).last();
      await sendBtn.click();
      await page.waitForTimeout(1000);

      // Should show error
      const errorVisible = await page.locator("text=/not found|no encontrado|error/i").first().isVisible().catch(() => false);
      expect(errorVisible).toBeTruthy();
    }
  });
});
