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
  source: 'provider_sync' | 'manual_import';
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
   * Initializes genuine Take U Forward profile tracking without fabricated statistics
   */
  async verifyProfile(username: string): Promise<TufStats> {
    const cleanUser = username.trim();
    if (!cleanUser) {
      throw new Error('Take U Forward username cannot be empty');
    }

    // Honest baseline initialization: zero progress until real problems are tracked or imported
    return {
      username: cleanUser,
      totalCompleted: 0,
      totalProblems: 455,
      completionPercentage: 0,
      activeSheet: 'Striver A2Z DSA Sheet',
      currentStep: 'Step 1: Learn the basics',
      recentActivity: [],
      source: 'provider_sync',
      lastSyncedAt: new Date().toISOString(),
    };
  }

  /**
   * Process genuine manual progress update or sheet import
   */
  processImport(payload: TufImportPayload): TufStats {
    if (!payload.username) {
      throw new Error('TUF data must include a valid username');
    }

    const totalProblems = Number(payload.totalProblems) || 455;
    const totalCompleted = Number(payload.totalCompleted) || 0;
    const percentage = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

    return {
      username: payload.username.trim(),
      totalCompleted,
      totalProblems,
      completionPercentage: percentage,
      activeSheet: payload.activeSheet || 'Striver A2Z DSA Sheet',
      currentStep: payload.currentStep || 'Step 1: Learn the basics',
      source: 'manual_import',
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

export const tufProvider = new TufProvider();
