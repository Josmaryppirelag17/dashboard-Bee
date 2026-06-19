import { Page, Locator } from "@playwright/test";

export class AuthPage {
  readonly page: Page;
  readonly submitBtn: Locator;
  readonly signInBtn: Locator;
  readonly signUpBtn: Locator;
  readonly modal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitBtn = page.locator('button[type="submit"]').last();
    this.signInBtn = page.getByRole("button", { name: /Sign In|Iniciar Sesión/ });
    this.signUpBtn = page.getByRole("tab", { name: /Sign Up|Registrarse/ });
    this.modal = page.getByRole("dialog");
  }

  get emailInputField(): Locator {
    return this.page.locator("#login-email");
  }

  get passwordInputField(): Locator {
    return this.page.locator("#login-password");
  }

  get regNameField(): Locator {
    return this.page.locator("#reg-name");
  }

  get regLastNameField(): Locator {
    return this.page.locator("#reg-lastName");
  }

  get regUsernameField(): Locator {
    return this.page.locator("#reg-username");
  }

  get regEmailField(): Locator {
    return this.page.locator("#reg-email");
  }

  get regPasswordField(): Locator {
    return this.page.locator("#reg-password");
  }

  get regConfirmField(): Locator {
    return this.page.locator("#reg-confirm");
  }

  get errorAlert(): Locator {
    return this.page.locator('[role="alert"]');
  }

  async openSignIn() {
    await this.signInBtn.click();
    await this.modal.waitFor({ state: "visible" });
  }

  async switchToSignUp() {
    await this.signUpBtn.click();
  }

  async login(email: string, password: string) {
    await this.openSignIn();
    await this.emailInputField.fill(email);
    await this.passwordInputField.fill(password);
    await this.submitBtn.click();
    await this.modal.waitFor({ state: "hidden", timeout: 10000 });
  }

  async register(name: string, lastName: string, username: string, email: string, password: string) {
    await this.openSignIn();
    await this.switchToSignUp();
    await this.regNameField.fill(name);
    await this.regLastNameField.fill(lastName);
    await this.regUsernameField.fill(username);
    await this.regEmailField.fill(email);
    await this.regPasswordField.fill(password);
    await this.regConfirmField.fill(password);
    await this.submitBtn.click();
    await this.modal.waitFor({ state: "hidden", timeout: 10000 });
  }
}
