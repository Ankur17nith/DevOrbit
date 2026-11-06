import { execSync } from 'child_process';
import path from 'path';

export async function setup() {
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.RATE_LIMIT_AUTH_MAX = '500';
  process.env.RATE_LIMIT_SYNC_MAX = '500';
  process.env.RATE_LIMIT_AI_MAX = '500';
  process.env.CODEFORCES_MIN_INTERVAL_MS = '50';
  process.env.NODE_ENV = 'test';

  const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
  execSync(`npx prisma db push --force-reset --schema="${schemaPath}"`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db',
    },
  });

  execSync(`npx tsx src/database/seed.ts`, {
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db',
      SEED_DEMO: 'false',
    },
  });
}
