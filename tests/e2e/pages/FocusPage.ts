import { Page, Locator } from "@playwright/test";

export class FocusPage {
  readonly page: Page;
  readonly playBtn: Locator;
  readonly pauseBtn: Locator;
  readonly resetBtn: Locator;
  readonly timer: Locator;
  readonly workMinutesBtns: Locator;
  readonly focusTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.playBtn = page.locator('button[aria-pressed="false"]').filter({ has: page.locator("text=Focus, Enfocar") });
    this.pauseBtn = page.locator('button[aria-pressed="true"]');
    this.resetBtn = page.getByLabel(/Reset timer|Reiniciar temporizador/);
    this.timer = page.getByRole("timer");
    this.workMinutesBtns = page.locator("button").filter({ hasText: /15m|25m|45m|60m/ });
    this.focusTab = page.locator("#sidebar-item-focus");
  }

  get timerDisplay(): Locator {
    return this.timer.locator("text=/\\d{2}:\\d{2}/");
  }

  async navigate() {
    await this.focusTab.click();
  }

  async startTimer() {
    await this.playBtn.click();
  }

  async pauseTimer() {
    await this.pauseBtn.click();
  }

  async resetTimer() {
    await this.resetBtn.click();
  }

  async setWorkMinutes(mins: number) {
    await this.page.locator("button").filter({ hasText: `${mins}m` }).first().click();
  }

  get isTimerRunning(): Promise<boolean> {
    return this.page.evaluate(() => {
      const btn = document.querySelector('button[aria-pressed="true"]');
      return btn !== null;
    });
  }
}
