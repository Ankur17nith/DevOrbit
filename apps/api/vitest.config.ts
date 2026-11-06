import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    globalSetup: ['./src/tests/globalSetup.ts'],
    env: {
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'devorbit_test_jwt_secret_must_be_at_least_32_characters_long_2026',
      GITHUB_TOKEN_ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      RATE_LIMIT_AUTH_MAX: '500',
      RATE_LIMIT_SYNC_MAX: '500',
      RATE_LIMIT_AI_MAX: '500',
      CODEFORCES_MIN_INTERVAL_MS: '50',
      NODE_ENV: 'test',
    },
  },
});
