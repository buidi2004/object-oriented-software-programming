import { defineConfig, devices } from '@playwright/test';

/** Port riêng cho E2E — tránh xung đột với `npm run dev` (3000) đang chạy. */
const E2E_PORT = process.env.PLAYWRIGHT_PORT ?? '3000';
const baseURL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
