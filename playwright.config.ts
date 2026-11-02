import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.ts', workers: 1, timeout: 120000,
  use: { baseURL: 'http://127.0.0.1:3100', channel: 'chrome', headless: true, trace: 'retain-on-failure', actionTimeout: 10000 },
  webServer: [
    { command: 'node ../folcstore-backend/tests/iniciar-e2e.mjs', url: 'http://127.0.0.1:3103/api/health', timeout: 120000, reuseExistingServer: false },
    { command: 'npm run dev -- --hostname 127.0.0.1 --port 3100', url: 'http://127.0.0.1:3100', timeout: 180000, reuseExistingServer: false,
      env: { NEXT_PUBLIC_BACKEND_URL: 'http://127.0.0.1:3103/api' } },
  ],
});
