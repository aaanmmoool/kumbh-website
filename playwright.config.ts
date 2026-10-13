import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end checks run against the production build (`npm run build` first).
 * They use the Chrome already installed on the machine, so no browser download is needed.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    channel: process.env.PW_CHANNEL ?? 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], channel: process.env.PW_CHANNEL ?? 'chrome' } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
})
