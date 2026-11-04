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

// Singleton Prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (config.nodeEnv !== 'production') {
  global.prisma = prisma;
}
