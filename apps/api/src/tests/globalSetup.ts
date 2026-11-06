import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function setup() {
  const testDbPath = path.resolve(__dirname, '../../prisma/test.db');
  const databaseUrl = `file:${testDbPath}`;

  for (const suffix of ['', '-wal', '-shm']) {
    const f = `${testDbPath}${suffix}`;
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch {}
    }
  }

  process.env.DATABASE_URL = databaseUrl;
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
      DATABASE_URL: databaseUrl,
    },
  });

  execSync(`npx tsx src/database/seed.ts`, {
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      SEED_DEMO: 'false',
    },
  });
}
