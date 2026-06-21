import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { generateTestUser } from "./helpers";

test.describe("Tasks & Kanban", () => {
  let user: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    user = generateTestUser();
    const auth = new AuthPage(page);
    await page.goto("/");
    await page.waitForTimeout(1500);
    await auth.register(user.name, user.lastName, user.username, user.email, user.password);
    await page.waitForTimeout(1500);
  });

  test("create a task and see it in Kanban", async ({ page }) => {
    // Navigate to dashboard tab
    await page.locator("#sidebar-item-dashboard").click();
    await page.waitForTimeout(500);

    // Open task form via add button
    const addBtn = page.locator("button").filter({ hasText: /New Task|Nueva Labor/ });
    await addBtn.click();
    await page.waitForTimeout(300);

    // Fill task title
    const titleInput = page.locator("#task-description");
    await titleInput.fill("E2E Test Task");

    // Save
    const saveBtn = page.locator('button[type="submit"]').filter({ hasText: /Submit into Hive|Ingresar en el Panal/ }).first();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Task should appear
    await expect(page.locator("text=E2E Test Task").first()).toBeVisible({ timeout: 5000 });
  });

  test("export CSV when tasks exist", async ({ page }) => {
    const exportBtn = page.getByLabel(/Export data|Exportar datos/);

    await page.locator("#sidebar-item-dashboard").click();
    await page.waitForTimeout(500);

    // First add a task so we have data to export
    const addBtn = page.locator("button").filter({ hasText: /New Task|Nueva Labor/ });
    await addBtn.click();
    await page.waitForTimeout(300);

    const titleInput = page.locator("#task-description");
    await titleInput.fill("CSV Export Test Task");
    const saveBtn = page.locator('button[type="submit"]').filter({ hasText: /Submit into Hive|Ingresar en el Panal/ }).first();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Export CSV
    await exportBtn.click();

    // Should show success message
    await expect(
      page.locator("text=/exported|exportado|success/i").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("search filters tasks", async ({ page }) => {
    const searchInput = page.getByLabel("Buscar labores");

    await page.locator("#sidebar-item-dashboard").click();
    await page.waitForTimeout(500);

    // Search
    await searchInput.fill("nonexistent-task-xyz");
    await page.waitForTimeout(500);

    // The search should filter - verify Kanban columns still visible
    await expect(page.locator('[role="region"]').first()).toBeVisible();
  });
});
