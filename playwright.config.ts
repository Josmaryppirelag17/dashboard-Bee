import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "auth-setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
      dependencies: ["auth-setup"],
    },
    ...(isCI
      ? []
      : [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"], storageState: ".auth/user.json" },
            dependencies: ["auth-setup"],
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"], storageState: ".auth/user.json" },
            dependencies: ["auth-setup"],
          },
        ]),
  ],
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: !isCI,
  },
});
