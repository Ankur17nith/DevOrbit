import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./devorbit.db',
  jwtSecret: process.env.JWT_SECRET || 'devorbit_jwt_secret_local_key_change_in_production_2026',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
