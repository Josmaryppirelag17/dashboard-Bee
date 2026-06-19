import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { FocusPage } from "./pages/FocusPage";
import { generateTestUser } from "./helpers";

test.describe("Focus Timer", () => {
  test.beforeEach(async ({ page }) => {
    const user = generateTestUser();
    const auth = new AuthPage(page);
    await page.goto("/");
    await page.waitForTimeout(1500);
    await auth.register(user.name, user.lastName, user.username, user.email, user.password);
    await page.waitForTimeout(1500);
  });

  test("timer controls render and respond", async ({ page }) => {
    const focus = new FocusPage(page);

    // Navigate to focus tab
    await focus.navigate();
    await page.waitForTimeout(1000);

    // Timer should be visible and show initial time
    await expect(page.getByText("25:00").first()).toBeVisible({ timeout: 5000 });

    // Change work duration to 15m
    await focus.setWorkMinutes(15);
    await page.waitForTimeout(500);
    await expect(page.getByText("15:00").first()).toBeVisible({ timeout: 3000 });
  });

  test("start and pause timer", async ({ page }) => {
    const focus = new FocusPage(page);

    await focus.navigate();
    await page.waitForTimeout(1000);

    // Set to 15m for faster test
    await focus.setWorkMinutes(15);
    await page.waitForTimeout(300);

    // Click play/focus button
    const playBtn = page.locator("button").filter({ hasText: /Focus|Enfocar/ }).first();
    await playBtn.click();
    await page.waitForTimeout(1500);

    // Timer should be running - verify pause button appears
    const pauseBtn = page.locator("button").filter({ hasText: /Pause|Pausa/i });
    await expect(pauseBtn).toBeVisible({ timeout: 3000 });

    // Pause
    await pauseBtn.click();
    await page.waitForTimeout(500);

    // Focus button should be back
    await expect(playBtn).toBeVisible({ timeout: 3000 });
  });

  test("reset timer resets to configured time", async ({ page }) => {
    const focus = new FocusPage(page);

    await focus.navigate();
    await page.waitForTimeout(1000);

    // Note the initial time
    const initialTime = await page.getByText(/\d{2}:\d{2}/).first().textContent();

    // Start timer
    const playBtn = page.locator("button").filter({ hasText: /Focus|Enfocar/ }).first();
    await playBtn.click();
    await page.waitForTimeout(2000);

    // Reset
    await focus.resetTimer();
    await page.waitForTimeout(500);

    // Timer should be back to initial value (not running)
    const resetTime = await page.getByText(/\d{2}:\d{2}/).first().textContent();
    expect(resetTime).toBe(initialTime);
  });
});
