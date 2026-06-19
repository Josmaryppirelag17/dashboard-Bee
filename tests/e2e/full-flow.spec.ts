import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { generateTestUser } from "./helpers";

test.describe("Full User Journey", () => {
  test("complete workflow: register → create task → focus → export → logout", async ({ page }) => {
    const user = generateTestUser();
    const auth = new AuthPage(page);

    // 1. Register
    await page.goto("/");
    await page.waitForTimeout(1500);
    await auth.register(user.name, user.lastName, user.username, user.email, user.password);
    await page.waitForTimeout(1500);

    // Verify logged in
    let loggedIn = await page.evaluate(() => document.cookie.includes("bee_session_token"));
    expect(loggedIn).toBeTruthy();

    // 2. Create a task
    await page.locator("#sidebar-item-dashboard").click();
    await page.waitForTimeout(500);

    const addBtn = page.locator("button").filter({ hasText: /Add Task|Agregar Labor/ });
    await addBtn.click();
    await page.waitForTimeout(300);

    const titleInput = page.locator('input[placeholder*="task" i], #task-title').first();
    await titleInput.fill("Full Flow Test Task");
    const saveBtn = page.locator('button[type="submit"]').filter({ hasText: /Add|Agregar/ }).first();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    await expect(page.locator("text=Full Flow Test Task").first()).toBeVisible({ timeout: 5000 });

    // 3. Visit focus timer
    await page.locator("#sidebar-item-focus").click();
    await page.waitForTimeout(1000);
    await expect(page.getByText("25:00").first()).toBeVisible({ timeout: 5000 });

    // 4. Export CSV
    await page.locator("#sidebar-item-dashboard").click();
    await page.waitForTimeout(500);

    const exportBtn = page.getByLabel(/Export data|Exportar datos/);
    await exportBtn.click();
    await expect(
      page.locator("text=/exported|exportado|success/i").first(),
    ).toBeVisible({ timeout: 5000 });

    // 5. Logout
    await page.evaluate(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    });
    await page.reload();
    await page.waitForTimeout(1500);

    loggedIn = await page.evaluate(() => document.cookie.includes("bee_session_token"));
    expect(loggedIn).toBeFalsy();
  });
});
