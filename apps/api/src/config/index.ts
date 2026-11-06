import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const rawJwtSecret = process.env.JWT_SECRET;
if (!rawJwtSecret || rawJwtSecret.length < 32) {
  throw new Error('FATAL CONFIGURATION ERROR: JWT_SECRET must be explicitly set and be at least 32 characters long in all environments.');
}

const rawCors = process.env.CORS_ORIGIN || 'http://localhost:5173';
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./devorbit.db',
  jwtSecret: rawJwtSecret,
  corsOrigin: rawCors,
  corsOrigins: rawCors.split(',').map(s => s.trim()).filter(Boolean),
};

export function validateProductionSafeguards(env: Record<string, string | undefined> = process.env) {
  if (env.NODE_ENV === 'production') {
    const secret = env.JWT_SECRET;
    if (!secret || secret.length < 32 || secret.includes('default') || secret.includes('change_in_production') || secret.includes('devorbit_jwt_secret_local_key')) {
      throw new Error('FATAL SECURITY ERROR: In production, JWT_SECRET must be explicitly set to a cryptographically strong secret of at least 32 characters.');
    }
    const cors = env.CORS_ORIGIN;
    if (!cors || cors === '*' || cors.trim() === '') {
      throw new Error('FATAL SECURITY ERROR: In production, CORS_ORIGIN must be explicitly configured to trusted origins and cannot be wildcard (*).');
    }
    const encKey = env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (encKey && !/^[0-9a-fA-F]{64}$/.test(encKey)) {
      throw new Error('FATAL SECURITY ERROR: In production, GITHUB_TOKEN_ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes).');
    }
  }
}

validateProductionSafeguards();

// Singleton Prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (config.nodeEnv !== 'production') {
  global.prisma = prisma;
}

export async function initPrismaSqlite() {
  try {
    await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
    await prisma.$queryRawUnsafe('PRAGMA foreign_keys = ON;');
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000;');
  } catch {
    // Graceful fallback for non-sqlite or read-only environments
  }
}

initPrismaSqlite().catch(() => {});
