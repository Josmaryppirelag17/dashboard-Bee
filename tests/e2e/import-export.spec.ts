import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { generateTestUser } from "./helpers";

test.describe("Import / Export", () => {
  test.beforeEach(async ({ page }) => {
    const user = generateTestUser();
    const auth = new AuthPage(page);
    await page.goto("/");
    await page.waitForTimeout(1500);
    await auth.register(user.name, user.lastName, user.username, user.email, user.password);
    await page.waitForTimeout(1500);
  });

  test("export CSV when tasks exist", async ({ page }) => {
    await page.locator("#sidebar-item-dashboard").click();
    await page.waitForTimeout(500);

    // Add a task
    const addBtn = page.locator("button").filter({ hasText: /New Task|Nueva Labor/ });
    await addBtn.click();
    await page.waitForTimeout(300);

    const titleInput = page.locator("#task-description");
    await titleInput.fill("CSV Export Task");
    const saveBtn = page.locator('button[type="submit"]').filter({ hasText: /Submit into Hive|Ingresar en el Panal/ }).first();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Export CSV
    const exportBtn = page.getByLabel(/Export data|Exportar datos/);
    await exportBtn.click();

    await expect(
      page.locator("text=/exported|exportado|success|éxito/i").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows empty export error when no tasks exist", async ({ page }) => {
    await page.locator("#sidebar-item-dashboard").click();
    await page.waitForTimeout(500);

    // Try to export without tasks
    const exportBtn = page.getByLabel(/Export data|Exportar datos/);
    await exportBtn.click();

    await expect(
      page.locator("text=/no hay|empty|no tasks|sin labores/i").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("import CSV button is accessible", async ({ page }) => {
    await page.locator("#sidebar-item-dashboard").click();
    await page.waitForTimeout(500);

    // Look for import functionality
    const importBtn = page.locator("button").filter({ hasText: /Import CSV|Importar CSV/ });
    await expect(importBtn).toBeVisible({ timeout: 5000 });
    await importBtn.click();
    await page.waitForTimeout(500);

    // File input exists in DOM (hidden until triggered by button)
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });
});
