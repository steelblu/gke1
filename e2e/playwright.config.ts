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
      command: 'cd packages/react-buyer && npx vite --port 3000 --strictPort',
      port: 3000,
      cwd: process.cwd(),
      timeout: 30_000,
      reuseExistingServer: true,
    },
    {
      command: 'cd packages/react-supplier && npx vite --port 3001 --strictPort',
      port: 3001,
      cwd: process.cwd(),
      timeout: 30_000,
      reuseExistingServer: true,
    },
  ],
})
