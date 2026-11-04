import { Router, Response, NextFunction } from 'express';
import os from 'os';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError } from '../../lib/errors.js';

export const systemRouter = Router();

let prevCpuUsage = process.cpuUsage();
let prevCpuTime = Date.now();

// Telemetry & Live Resource Status
systemRouter.get('/status', (_req, res) => {
  const mem = process.memoryUsage();
  const currentCpuUsage = process.cpuUsage(prevCpuUsage);
  const now = Date.now();
  const timeDelta = (now - prevCpuTime) * 1000;
  const totalCpuTime = currentCpuUsage.user + currentCpuUsage.system;
  const cpuCores = Math.max(1, os.cpus().length);
  const cpuPercent = timeDelta > 0 ? Math.min(100, Math.round((totalCpuTime / (timeDelta * cpuCores)) * 1000) / 10) : 0.8;

  prevCpuUsage = process.cpuUsage();
  prevCpuTime = now;

  res.json({
    success: true,
    data: {
      cpuPercent: Math.max(0.2, cpuPercent),
      memoryRssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      memoryHeapMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
      uptimeSeconds: Math.round(process.uptime()),
      dbConnected: true,
      ecoMode: true,
      platform: process.platform,
    },
  });
});

// Detailed Health & Readiness
systemRouter.get('/health', async (_req, res) => {
  const start = Date.now();
  let dbOk = false;
  let dbLatencyMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
    dbLatencyMs = Date.now() - start;
  } catch {
    dbOk = false;
  }

  res.json({
    status: dbOk ? 'ok' : 'degraded',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'sqlite',
      status: dbOk ? 'connected' : 'disconnected',
      latencyMs: dbLatencyMs,
    },
    system: {
      arch: os.arch(),
      platform: process.platform,
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
    },
  });
});

// Export User Backup
systemRouter.get('/backup', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const [user, dsaProgress, skills, bookmarks, preferences] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, email: true, name: true, createdAt: true },
      }),
      prisma.userDsaProgress.findMany({
        where: { userId },
        include: { problem: true },
      }),
      prisma.userSkillProfile.findMany({
        where: { userId },
      }),
      prisma.userBookmark.findMany({
        where: { userId },
      }),
      prisma.userPreference.findUnique({
        where: { userId },
      }),
    ]);

    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user,
      preferences,
      dsaProgress: dsaProgress.map(p => ({
        problemSlug: p.problem.slug,
        platform: p.problem.platform,
        status: p.status,
        solutionMode: p.solutionMode,
        confidenceRating: p.confidenceRating,
        repetitionCount: p.repetitionCount,
        easeFactor: p.easeFactor,
        notes: p.notes,
        codeSnippet: p.codeSnippet,
      })),
      skills: skills.map(s => ({
        skillName: s.skillName,
        category: s.category,
        confidenceScore: s.confidenceScore,
        verifiedEvidenceJson: s.verifiedEvidenceJson,
      })),
      bookmarks: bookmarks.map(b => ({
        targetType: b.targetType,
        targetId: b.repositoryId || b.issueId || b.organizationId || b.id,
      })),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=devorbit-backup-${user?.username || 'user'}-${Date.now()}.json`);
    res.json({ success: true, data: backupData });
  } catch (err) {
    next(err);
  }
});

// Restore User Backup
systemRouter.post('/restore', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { backup } = req.body;
    if (!backup || !backup.version || !Array.isArray(backup.dsaProgress)) {
      throw new BadRequestError('Invalid DevOrbit backup payload');
    }

    let restoredProgressCount = 0;

    for (const item of backup.dsaProgress) {
      if (!item.problemSlug) continue;
      const problem = await prisma.dsaProblem.findFirst({
        where: { slug: item.problemSlug },
      });
      if (problem) {
        await prisma.userDsaProgress.upsert({
          where: { userId_problemId: { userId, problemId: problem.id } },
          update: {
            status: item.status || 'SOLVED',
            solutionMode: item.solutionMode || 'INDEPENDENT',
            confidenceRating: item.confidenceRating,
            notes: item.notes,
            codeSnippet: item.codeSnippet,
          },
          create: {
            userId,
            problemId: problem.id,
            status: item.status || 'SOLVED',
            solutionMode: item.solutionMode || 'INDEPENDENT',
            confidenceRating: item.confidenceRating,
            notes: item.notes,
            codeSnippet: item.codeSnippet,
          },
        });
        restoredProgressCount++;
      }
    }

    res.json({
      success: true,
      message: `Backup restored successfully (${restoredProgressCount} DSA problem records recovered).`,
      data: { restoredProgressCount },
    });
  } catch (err) {
    next(err);
  }
});
