import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly exportBtn: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.exportBtn = page.getByLabel(/Export data|Exportar datos/);
    this.searchInput = page.getByLabel("Buscar labores");
  }

  get welcomeBanner(): Locator {
    return this.page.locator("text=Welcome to the swarm").or(this.page.locator("text=Bienvenido al enjambre"));
  }

  get taskFormTitleInput(): Locator {
    return this.page.locator('input[placeholder*="task" i], #task-title').first();
  }

  get addTaskBtn(): Locator {
    return this.page.locator("button").filter({ hasText: /Add Task|Agregar Labor/ });
  }

  get saveTaskBtn(): Locator {
    return this.page.locator('button[type="submit"]').filter({ hasText: /Add|Agregar/ }).first();
  }

  async addTask(title: string) {
    await this.addTaskBtn.click();
    await this.taskFormTitleInput.fill(title);
    await this.saveTaskBtn.click();
  }

  async searchTasks(query: string) {
    await this.searchInput.fill(query);
  }

  async exportCSV() {
    await this.exportBtn.click();
  }
}
