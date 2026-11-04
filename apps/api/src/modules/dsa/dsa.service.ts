import { prisma } from '../../config/index.js';
import { NotFoundError } from '../../lib/errors.js';

export class DsaService {
  async getProblems(query: {
    platform?: string;
    difficulty?: string;
    topic?: string;
    search?: string;
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.platform && query.platform !== 'All') {
      where.platform = query.platform.toUpperCase();
    }
    if (query.difficulty && query.difficulty !== 'All') {
      where.difficulty = query.difficulty.toUpperCase();
    }
    if (query.topic && query.topic !== 'All') {
      where.topic = query.topic;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { topic: { contains: query.search } },
        { subtopic: { contains: query.search } },
      ];
    }

    const [total, problems] = await Promise.all([
      prisma.dsaProblem.count({ where }),
      prisma.dsaProblem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ]);

    // If userId provided, hydrate with user's personal progress
    let userProgressMap: Record<string, any> = {};
    if (query.userId) {
      const progresses = await prisma.userDsaProgress.findMany({
        where: {
          userId: query.userId,
          problemId: { in: problems.map(p => p.id) },
        },
      });
      for (const p of progresses) {
        userProgressMap[p.problemId] = p;
      }
    }

    return {
      problems: problems.map(prob => ({
        ...prob,
        userProgress: userProgressMap[prob.id] || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateProblemProgress(userId: string, problemId: string, data: {
    status: 'TODO' | 'ATTEMPTED' | 'SOLVED' | 'REVISE';
    timeSpentSeconds?: number;
    hintUsed?: boolean;
    codeSnippet?: string;
    notes?: string;
  }) {
    const problem = await prisma.dsaProblem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundError('DSA problem not found');
    }

    let nextReviewDate: Date | null = null;
    if (data.status === 'REVISE') {
      nextReviewDate = new Date(Date.now() + 86400000 * 2); // 2 days spaced repetition
    } else if (data.status === 'SOLVED') {
      nextReviewDate = new Date(Date.now() + 86400000 * 7); // 7 days spaced repetition
    }

    return prisma.userDsaProgress.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {
        status: data.status,
        timeSpentSeconds: data.timeSpentSeconds ? { increment: data.timeSpentSeconds } : undefined,
        attemptsCount: { increment: 1 },
        hintUsed: data.hintUsed,
        codeSnippet: data.codeSnippet,
        notes: data.notes,
        nextReviewDate,
        lastSolvedAt: data.status === 'SOLVED' ? new Date() : undefined,
      },
      create: {
        userId,
        problemId,
        status: data.status,
        attemptsCount: 1,
        timeSpentSeconds: data.timeSpentSeconds || 0,
        hintUsed: data.hintUsed || false,
        codeSnippet: data.codeSnippet,
        notes: data.notes,
        nextReviewDate,
        lastSolvedAt: data.status === 'SOLVED' ? new Date() : null,
      },
      include: {
        problem: true,
      },
    });
  }

  async getUserAnalytics(userId: string) {
    const [totalProblems, userProgresses] = await Promise.all([
      prisma.dsaProblem.count(),
      prisma.userDsaProgress.findMany({
        where: { userId },
        include: { problem: true },
      }),
    ]);

    const solved = userProgresses.filter(p => p.status === 'SOLVED');
    const attempted = userProgresses.filter(p => p.status === 'ATTEMPTED');
    const revise = userProgresses.filter(p => p.status === 'REVISE');

    const difficultyBreakdown = {
      EASY: solved.filter(p => p.problem.difficulty === 'EASY').length,
      MEDIUM: solved.filter(p => p.problem.difficulty === 'MEDIUM').length,
      HARD: solved.filter(p => p.problem.difficulty === 'HARD').length,
    };

    // Topic breakdown and weakness analysis
    const topicStats: Record<string, { total: number; solved: number; revise: number }> = {};
    for (const p of userProgresses) {
      const t = p.problem.topic;
      if (!topicStats[t]) topicStats[t] = { total: 0, solved: 0, revise: 0 };
      topicStats[t].total += 1;
      if (p.status === 'SOLVED') topicStats[t].solved += 1;
      if (p.status === 'REVISE') topicStats[t].revise += 1;
    }

    const weakTopics = Object.entries(topicStats)
      .filter(([_, stats]) => stats.revise > 0 || (stats.total >= 2 && stats.solved / stats.total < 0.5))
      .map(([topic, stats]) => ({
        topic,
        solved: stats.solved,
        attempts: stats.total,
        recommendedAction: `Focus on revision in ${topic}`,
      }));

    // Daily revision queue
    const now = new Date();
    const revisionQueue = userProgresses.filter(p => p.nextReviewDate && p.nextReviewDate <= now);

    return {
      totalCatalogProblems: totalProblems,
      solvedCount: solved.length,
      attemptedCount: attempted.length,
      reviseCount: revise.length,
      completionRate: Math.round((solved.length / Math.max(1, totalProblems)) * 100),
      difficultyBreakdown,
      topicStats,
      weakTopics,
      revisionQueueCount: revisionQueue.length,
    };
  }

  async getRevisionQueue(userId: string) {
    const now = new Date();
    return prisma.userDsaProgress.findMany({
      where: {
        userId,
        OR: [
          { status: 'REVISE' },
          { nextReviewDate: { lte: now } },
        ],
      },
      include: {
        problem: true,
      },
      orderBy: { nextReviewDate: 'asc' },
    });
  }
}
