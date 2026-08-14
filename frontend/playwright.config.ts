import { defineConfig, devices } from '@playwright/test';

/** Port riêng cho E2E — tránh xung đột với `npm run dev` (3000) đang chạy. */
const E2E_PORT = process.env.PLAYWRIGHT_PORT ?? '3002';
const baseURL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `NODE_OPTIONS='--max-old-space-size=4096' npx next dev --turbo --port ${E2E_PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
