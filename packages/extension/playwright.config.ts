import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  // Run headless in CI; use `npx playwright test --headed` locally
  use: { headless: !!process.env.CI },
  projects: [{ name: 'chromium', use: { channel: 'chromium' } }],
})
