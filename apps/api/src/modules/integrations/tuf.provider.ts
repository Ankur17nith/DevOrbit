import { prisma } from '../../config/index.js';

export interface TufStats {
  username: string;
  totalCompleted: number;
  totalProblems: number;
  completionPercentage: number;
  activeSheet: string;
  currentStep?: string;
  recentActivity?: {
    problemName: string;
    topic: string;
    completedAt: string;
  }[];
  source: 'manual';
  lastSyncedAt: string;
}

export interface TufImportPayload {
  username: string;
  totalCompleted?: number;
  totalProblems?: number;
  activeSheet?: string;
  currentStep?: string;
}

export class TufProvider {
  /**
   * Initializes genuine Take U Forward manual tracking without claiming provider sync
   */
  async verifyProfile(username: string): Promise<TufStats> {
    const cleanUser = username.trim();
    if (!cleanUser) {
      throw new Error('Take U Forward username cannot be empty');
    }

    const totalProblems = await prisma.dsaProblem.count({
      where: { sheetCategory: 'STRIVER_A2Z' },
    });

    return {
      username: cleanUser,
      totalCompleted: 0,
      totalProblems,
      completionPercentage: 0,
      activeSheet: 'Striver A2Z DSA Sheet',
      currentStep: 'Step 1: Learn the basics',
      recentActivity: [],
      source: 'manual',
      lastSyncedAt: new Date().toISOString(),
    };
  }

  /**
   * Process genuine manual progress update
   */
  async processImport(payload: TufImportPayload): Promise<TufStats> {
    if (!payload.username) {
      throw new Error('TUF data must include a valid username');
    }

    const totalProblems = payload.totalProblems !== undefined && payload.totalProblems !== null
      ? Number(payload.totalProblems)
      : await prisma.dsaProblem.count({ where: { sheetCategory: 'STRIVER_A2Z' } });

    const totalCompleted = Number(payload.totalCompleted) || 0;
    const percentage = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

    return {
      username: payload.username.trim(),
      totalCompleted,
      totalProblems,
      completionPercentage: percentage,
      activeSheet: payload.activeSheet || 'Striver A2Z DSA Sheet',
      currentStep: payload.currentStep || 'Step 1: Learn the basics',
      source: 'manual',
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

export const tufProvider = new TufProvider();
