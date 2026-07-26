import { defineConfig, devices } from "@playwright/test";

const PORT = 5174;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node tests/build.mjs && node tests/server.mjs",
    port: PORT,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
