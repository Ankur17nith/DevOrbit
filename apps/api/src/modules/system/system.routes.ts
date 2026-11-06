import { Router, Response, NextFunction } from 'express';
import os from 'os';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError } from '../../lib/errors.js';

export const systemRouter = Router();

let prevCpuUsage = process.cpuUsage();
let prevCpuTime = Date.now();

// Telemetry & Live Resource Status
systemRouter.get('/status', async (_req, res) => {
  const mem = process.memoryUsage();
  const currentCpuUsage = process.cpuUsage(prevCpuUsage);
  const now = Date.now();
  const timeDelta = (now - prevCpuTime) * 1000;
  const totalCpuTime = currentCpuUsage.user + currentCpuUsage.system;
  const cpuCores = Math.max(1, os.cpus().length);
  const cpuPercent = timeDelta > 0 ? Math.min(100, Math.round((totalCpuTime / (timeDelta * cpuCores)) * 1000) / 10) : 0;

  prevCpuUsage = process.cpuUsage();
  prevCpuTime = now;

  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  res.json({
    success: true,
    data: {
      cpuPercent,
      memoryRssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      memoryHeapMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
      uptimeSeconds: Math.round(process.uptime()),
      dbConnected,
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

import { z } from 'zod';

const restoreBackupSchema = z.object({
  backup: z.object({
    version: z.string(),
    exportDate: z.string().optional(),
    user: z.any().optional(),
    dsaProgress: z.array(
      z.object({
        problemSlug: z.string().max(100),
        status: z.enum(['TODO', 'ATTEMPTED', 'SOLVED', 'REVISE']).default('SOLVED'),
        solutionMode: z.enum(['INDEPENDENT', 'WITH_HINTS', 'WITH_EDITORIAL', 'WITH_AI', 'REATTEMPTED', 'FAILED']).nullable().optional(),
        confidenceRating: z.number().min(0).max(5).nullable().optional(),
        repetitionCount: z.number().int().min(0).nullable().optional(),
        easeFactor: z.number().min(1.3).max(3.0).nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
        codeSnippet: z.string().max(10000).nullable().optional(),
      })
    ).max(5000).default([]),
    skills: z.array(
      z.object({
        skillName: z.string().max(100),
        category: z.string().max(50),
        confidenceScore: z.number().min(0).max(100),
        verifiedEvidenceJson: z.string().max(5000).nullable().optional(),
      })
    ).max(5000).optional(),
    bookmarks: z.array(
      z.object({
        targetType: z.string().max(50),
        targetId: z.string().max(100),
      })
    ).max(5000).optional(),
    preferences: z.object({
      theme: z.string().max(20).nullable().optional(),
      ecoMode: z.boolean().nullable().optional(),
      notifyDesktop: z.boolean().nullable().optional(),
      notifyTelegram: z.boolean().nullable().optional(),
    }).nullable().optional(),
  }).passthrough(),
});

// Restore User Backup
systemRouter.post('/restore', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parseResult = restoreBackupSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new BadRequestError(parseResult.error.errors[0]?.message || 'Invalid DevOrbit backup payload');
    }

    const { backup } = parseResult.data;

    const result = await prisma.$transaction(async (tx) => {
      let restoredProgressCount = 0;
      let restoredSkillsCount = 0;
      let restoredBookmarksCount = 0;

      // 1. Restore DSA progress
      for (const item of backup.dsaProgress) {
        if (!item.problemSlug) continue;
        const problem = await tx.dsaProblem.findFirst({
          where: { slug: item.problemSlug },
        });
        if (problem) {
          await tx.userDsaProgress.upsert({
            where: { userId_problemId: { userId, problemId: problem.id } },
            update: {
              status: item.status,
              solutionMode: item.solutionMode || 'INDEPENDENT',
              confidenceRating: item.confidenceRating,
              repetitionCount: item.repetitionCount ?? undefined,
              easeFactor: item.easeFactor ?? undefined,
              notes: item.notes,
              codeSnippet: item.codeSnippet,
            },
            create: {
              userId,
              problemId: problem.id,
              status: item.status,
              solutionMode: item.solutionMode || 'INDEPENDENT',
              confidenceRating: item.confidenceRating,
              repetitionCount: item.repetitionCount ?? 0,
              easeFactor: item.easeFactor ?? 2.5,
              notes: item.notes,
              codeSnippet: item.codeSnippet,
            },
          });
          restoredProgressCount++;
        }
      }

      // 2. Restore Skills
      if (backup.skills && backup.skills.length > 0) {
        for (const skill of backup.skills) {
          await tx.userSkillProfile.upsert({
            where: { userId_skillName: { userId, skillName: skill.skillName } },
            update: {
              category: skill.category,
              confidenceScore: skill.confidenceScore,
              verifiedEvidenceJson: skill.verifiedEvidenceJson,
            },
            create: {
              userId,
              skillName: skill.skillName,
              category: skill.category,
              confidenceScore: skill.confidenceScore,
              verifiedEvidenceJson: skill.verifiedEvidenceJson,
            },
          });
          restoredSkillsCount++;
        }
      }

      // 3. Restore Preferences
      if (backup.preferences) {
        await tx.userPreference.upsert({
          where: { userId },
          update: {
            theme: backup.preferences.theme ?? undefined,
            ecoMode: backup.preferences.ecoMode ?? undefined,
            notifyDesktop: backup.preferences.notifyDesktop ?? undefined,
            notifyTelegram: backup.preferences.notifyTelegram ?? undefined,
          },
          create: {
            userId,
            theme: backup.preferences.theme || 'dark',
            ecoMode: backup.preferences.ecoMode ?? true,
            notifyDesktop: backup.preferences.notifyDesktop ?? true,
            notifyTelegram: backup.preferences.notifyTelegram ?? false,
          },
        });
      }

      // 4. Restore Bookmarks
      if (backup.bookmarks && backup.bookmarks.length > 0) {
        for (const b of backup.bookmarks) {
          let repositoryId: string | undefined;
          let issueId: string | undefined;
          let organizationId: string | undefined;

          if (b.targetType === 'REPO') {
            const repo = await tx.ossRepository.findUnique({ where: { id: b.targetId } });
            if (repo) repositoryId = repo.id;
          } else if (b.targetType === 'ISSUE') {
            const issue = await tx.ossIssue.findUnique({ where: { id: b.targetId } });
            if (issue) issueId = issue.id;
          } else if (b.targetType === 'GSOC_ORG') {
            const org = await tx.ossOrganization.findUnique({ where: { id: b.targetId } });
            if (org) organizationId = org.id;
          }

          if (repositoryId || issueId || organizationId) {
            const existing = await tx.userBookmark.findFirst({
              where: {
                userId,
                targetType: b.targetType,
                repositoryId: repositoryId || null,
                issueId: issueId || null,
                organizationId: organizationId || null,
              },
            });
            if (!existing) {
              await tx.userBookmark.create({
                data: {
                  userId,
                  targetType: b.targetType,
                  repositoryId,
                  issueId,
                  organizationId,
                },
              });
              restoredBookmarksCount++;
            }
          }
        }
      }

      return { restoredProgressCount, restoredSkillsCount, restoredBookmarksCount };
    });

    res.json({
      success: true,
      message: `Backup restored successfully (${result.restoredProgressCount} DSA problem records recovered).`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
