import { prisma } from '../../config/index.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import { sheetImporter } from './adapters/sheet_importer.js';

export type SolutionMode = 'INDEPENDENT' | 'WITH_HINTS' | 'WITH_EDITORIAL' | 'WITH_AI' | 'REATTEMPTED' | 'FAILED';

export interface ProgressUpdateInput {
  status: 'TODO' | 'ATTEMPTED' | 'SOLVED' | 'REVISE';
  solutionMode?: SolutionMode;
  confidenceRating?: number; // 1 to 5 (SM-2 recall scale)
  timeSpentSeconds?: number;
  hintUsed?: boolean;
  codeSnippet?: string;
  notes?: string;
  repeatedMistakes?: string[];
}

export class DsaService {
  /**
   * Calculates mastery score (0-100%) based on true independent solving vs assistance.
   */
  private calculateMasteryScore(mode?: SolutionMode, status: string = 'SOLVED'): number {
    if (status !== 'SOLVED') return 0.0;
    switch (mode) {
      case 'INDEPENDENT': return 100.0;
      case 'REATTEMPTED': return 75.0;
      case 'WITH_HINTS': return 65.0;
      case 'WITH_EDITORIAL': return 35.0;
      case 'WITH_AI': return 20.0;
      case 'FAILED': return 0.0;
      default: return 70.0;
    }
  }

  /**
   * Spaced Repetition Scheduling using SuperMemo SM-2 transparent algorithm.
   */
  private calculateSm2Schedule(rating: number, currentRepetition: number, currentEaseFactor: number, currentInterval: number) {
    let repetitionCount = currentRepetition;
    let easeFactor = currentEaseFactor;
    let interval = currentInterval;

    // SM-2 Rating scale:
    // 5 - perfect response
    // 4 - correct response after hesitation
    // 3 - correct response recalled with serious difficulty
    // 2 - incorrect response; where the correct one seemed easy to recall
    // 1 - incorrect response; the correct one remembered
    // 0 - complete blackout

    if (rating >= 3) {
      if (repetitionCount === 0) {
        interval = 1;
      } else if (repetitionCount === 1) {
        interval = 6;
      } else {
        interval = Math.round(currentInterval * easeFactor);
      }
      repetitionCount += 1;
    } else {
      repetitionCount = 0;
      interval = 1;
    }

    // Ease factor adjustment: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = Math.max(1.3, Number((easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))).toFixed(2)));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      repetitionCount,
      easeFactor,
      reviewIntervalDays: interval,
      nextReviewDate,
    };
  }

  async getProblems(query: {
    platform?: string;
    difficulty?: string;
    topic?: string;
    sheetCategory?: string;
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
    if (query.sheetCategory && query.sheetCategory !== 'All') {
      where.sheetCategory = query.sheetCategory;
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

    // Hydrate with user's personal progress
    let userProgressMap: Record<string, any> = {};
    if (query.userId) {
      const progresses = await prisma.userDsaProgress.findMany({
        where: {
          userId: query.userId,
          problemId: { in: problems.map(p => p.id) },
        },
      });
      for (const p of progresses) {
        userProgressMap[p.problemId] = {
          ...p,
          repeatedMistakes: p.repeatedMistakesJson ? JSON.parse(p.repeatedMistakesJson) : [],
        };
      }
    }

    return {
      problems: problems.map(prob => ({
        ...prob,
        tags: prob.tagsJson ? JSON.parse(prob.tagsJson) : [],
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

  async updateProblemProgress(userId: string, problemId: string, data: ProgressUpdateInput) {
    const problem = await prisma.dsaProblem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundError('DSA problem not found');
    }

    const existingProgress = await prisma.userDsaProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });

    const solutionMode = data.solutionMode || (data.hintUsed ? 'WITH_HINTS' : 'INDEPENDENT');
    const masteryScore = this.calculateMasteryScore(solutionMode, data.status);
    const confidenceRating = data.confidenceRating !== undefined ? data.confidenceRating : (data.status === 'SOLVED' ? 4 : 2);

    const prevRepetition = existingProgress?.repetitionCount || 0;
    const prevEase = existingProgress?.easeFactor || 2.5;
    const prevInterval = existingProgress?.reviewIntervalDays || 1;

    // Only compute new SM-2 schedule if problem is marked SOLVED
    const sm2 = data.status === 'SOLVED'
      ? this.calculateSm2Schedule(confidenceRating, prevRepetition, prevEase, prevInterval)
      : {
          repetitionCount: prevRepetition,
          easeFactor: prevEase,
          reviewIntervalDays: prevInterval,
          nextReviewDate: existingProgress?.nextReviewDate || null,
        };

    const repeatedMistakesJson = data.repeatedMistakes
      ? JSON.stringify(data.repeatedMistakes)
      : existingProgress?.repeatedMistakesJson || null;

    return prisma.userDsaProgress.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: {
        status: data.status,
        solutionMode,
        masteryScore,
        confidenceRating,
        repetitionCount: sm2.repetitionCount,
        easeFactor: sm2.easeFactor,
        reviewIntervalDays: sm2.reviewIntervalDays,
        repeatedMistakesJson,
        timeSpentSeconds: data.timeSpentSeconds ? { increment: data.timeSpentSeconds } : undefined,
        attemptsCount: { increment: 1 },
        hintUsed: data.hintUsed ?? (solutionMode === 'WITH_HINTS'),
        codeSnippet: data.codeSnippet !== undefined ? data.codeSnippet : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        nextReviewDate: sm2.nextReviewDate,
        lastSolvedAt: data.status === 'SOLVED' ? new Date() : undefined,
      },
      create: {
        userId,
        problemId,
        status: data.status,
        solutionMode,
        masteryScore,
        confidenceRating,
        repetitionCount: sm2.repetitionCount,
        easeFactor: sm2.easeFactor,
        reviewIntervalDays: sm2.reviewIntervalDays,
        repeatedMistakesJson,
        attemptsCount: 1,
        timeSpentSeconds: data.timeSpentSeconds || 0,
        hintUsed: data.hintUsed ?? (solutionMode === 'WITH_HINTS'),
        codeSnippet: data.codeSnippet || null,
        notes: data.notes || null,
        nextReviewDate: sm2.nextReviewDate,
        lastSolvedAt: data.status === 'SOLVED' ? new Date() : null,
      },
      include: { problem: true },
    });
  }

  async submitSpacedReview(userId: string, problemId: string, rating: number) {
    if (rating < 0 || rating > 5) {
      throw new BadRequestError('Confidence rating must be between 0 (Blackout) and 5 (Perfect)');
    }

    const progress = await prisma.userDsaProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
      include: { problem: true },
    });

    if (!progress) {
      throw new NotFoundError('Problem progress record not found');
    }

    const sm2 = this.calculateSm2Schedule(
      rating,
      progress.repetitionCount,
      progress.easeFactor,
      progress.reviewIntervalDays
    );

    const updated = await prisma.userDsaProgress.update({
      where: { id: progress.id },
      data: {
        confidenceRating: rating,
        repetitionCount: sm2.repetitionCount,
        easeFactor: sm2.easeFactor,
        reviewIntervalDays: sm2.reviewIntervalDays,
        nextReviewDate: sm2.nextReviewDate,
        status: rating >= 3 ? 'SOLVED' : 'REVISE',
      },
      include: { problem: true },
    });

    return updated;
  }

  async getRevisionQueue(userId: string) {
    const now = new Date();
    const items = await prisma.userDsaProgress.findMany({
      where: {
        userId,
        OR: [
          { status: 'REVISE' },
          { status: 'SOLVED', nextReviewDate: { lte: now } },
        ],
      },
      include: { problem: true },
      orderBy: { nextReviewDate: 'asc' },
    });

    return {
      dueCount: items.length,
      items: items.map(item => ({
        ...item,
        isOverdue: item.nextReviewDate ? item.nextReviewDate < now : true,
      })),
    };
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

    // Solution mode breakdown
    const solutionModeCounts = {
      INDEPENDENT: userProgresses.filter(p => p.solutionMode === 'INDEPENDENT').length,
      WITH_HINTS: userProgresses.filter(p => p.solutionMode === 'WITH_HINTS').length,
      WITH_EDITORIAL: userProgresses.filter(p => p.solutionMode === 'WITH_EDITORIAL').length,
      WITH_AI: userProgresses.filter(p => p.solutionMode === 'WITH_AI').length,
      REATTEMPTED: userProgresses.filter(p => p.solutionMode === 'REATTEMPTED').length,
    };

    // Calculate true independent mastery index (0 - 100)
    let totalMasteryWeight = 0;
    for (const p of solved) {
      totalMasteryWeight += p.masteryScore;
    }
    const averageMasteryScore = solved.length > 0 ? Number((totalMasteryWeight / solved.length).toFixed(1)) : 0.0;

    const difficultyBreakdown = {
      EASY: solved.filter(p => p.problem.difficulty === 'EASY').length,
      MEDIUM: solved.filter(p => p.problem.difficulty === 'MEDIUM').length,
      HARD: solved.filter(p => p.problem.difficulty === 'HARD').length,
    };

    // Topic breakdown and weakness analysis
    const topicStats: Record<string, { total: number; solved: number; independent: number; revise: number; avgMastery: number }> = {};
    const mistakesCountMap: Record<string, number> = {};

    for (const p of userProgresses) {
      const t = p.problem.topic;
      if (!topicStats[t]) {
        topicStats[t] = { total: 0, solved: 0, independent: 0, revise: 0, avgMastery: 0 };
      }
      topicStats[t].total += 1;
      if (p.status === 'SOLVED') {
        topicStats[t].solved += 1;
        if (p.solutionMode === 'INDEPENDENT') topicStats[t].independent += 1;
      }
      if (p.status === 'REVISE') topicStats[t].revise += 1;

      if (p.repeatedMistakesJson) {
        try {
          const mistakes = JSON.parse(p.repeatedMistakesJson) as string[];
          for (const m of mistakes) {
            mistakesCountMap[m] = (mistakesCountMap[m] || 0) + 1;
          }
        } catch {}
      }
    }

    // Weak topics: low solve rate OR high revise OR low independent mastery
    const weakTopics = Object.entries(topicStats)
      .filter(([_, stats]) => stats.revise > 0 || (stats.total >= 1 && (stats.independent / stats.total) < 0.5))
      .map(([topic, stats]) => ({
        topic,
        solved: stats.solved,
        independentSolved: stats.independent,
        totalAttempts: stats.total,
        independentRatio: stats.total > 0 ? Number(((stats.independent / stats.total) * 100).toFixed(0)) : 0,
        recommendedAction: `Reinforce ${topic} through independent solving`,
      }));

    // Daily revision queue
    const now = new Date();
    const revisionQueue = userProgresses.filter(p => p.status === 'REVISE' || (p.nextReviewDate && p.nextReviewDate <= now));

    return {
      totalCatalogProblems: totalProblems,
      solvedCount: solved.length,
      attemptedCount: attempted.length,
      reviseCount: revise.length,
      completionRate: Math.round((solved.length / Math.max(1, totalProblems)) * 100),
      averageMasteryScore,
      difficultyBreakdown,
      solutionModeCounts,
      topicStats,
      weakTopics,
      repeatedMistakes: Object.entries(mistakesCountMap).map(([mistake, count]) => ({ mistake, count })),
      revisionQueueCount: revisionQueue.length,
    };
  }

  async getRecommendations(userId: string) {
    const analytics = await this.getUserAnalytics(userId);
    const solvedProblemIds = (
      await prisma.userDsaProgress.findMany({
        where: { userId, status: 'SOLVED' },
        select: { problemId: true },
      })
    ).map(p => p.problemId);

    // Pick top weak topic if any, otherwise default to core topic
    const targetTopic = analytics.weakTopics.length > 0
      ? analytics.weakTopics[0].topic
      : 'Array';

    // Find recommended problems in target topic that user hasn't solved yet
    const recommendations = await prisma.dsaProblem.findMany({
      where: {
        id: { notIn: solvedProblemIds },
        topic: targetTopic,
      },
      take: 4,
      orderBy: { difficulty: 'asc' },
    });

    return {
      focusTopic: targetTopic,
      reason: analytics.weakTopics.length > 0 ? 'Targeted topic weakness recovery' : 'Foundational mastery recommendation',
      problems: recommendations,
    };
  }

  async importProblems(type: 'CSV' | 'JSON', content: string | any[], defaultCategory: string = 'CUSTOM') {
    if (type === 'CSV') {
      return sheetImporter.importFromCsv(content as string, defaultCategory);
    } else {
      let parsed = content;
      if (typeof content === 'string') {
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = content;
        }
      }
      return sheetImporter.importFromJson(parsed as any[], defaultCategory);
    }
  }
}

export const dsaService = new DsaService();
