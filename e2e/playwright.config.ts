import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
  },
  webServer: [
    {
      command: 'node ../../node_modules/vite/bin/vite.js --port 3000 --strictPort',
      port: 3000,
      cwd: '../packages/react-buyer',
      timeout: 30_000,
      reuseExistingServer: true,
    },
    {
      command: 'node ../../node_modules/vite/bin/vite.js --port 3001 --strictPort',
      port: 3001,
      cwd: '../packages/react-supplier',
      timeout: 30_000,
      reuseExistingServer: true,
    },
  ],
})
