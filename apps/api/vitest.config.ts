import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    globalSetup: ['./src/tests/globalSetup.ts'],
    env: {
      DATABASE_URL: 'file:./test.db',
      RATE_LIMIT_AUTH_MAX: '500',
      RATE_LIMIT_SYNC_MAX: '500',
      RATE_LIMIT_AI_MAX: '500',
      CODEFORCES_MIN_INTERVAL_MS: '50',
      NODE_ENV: 'test',
    },
  },
});
