import { prisma } from '../../config/index.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import { normalizeRepository, isValidRepository } from './repository.normalizer.js';
import { recommendationEngine } from '../recommendations/recommendation.engine.js';
import { matchSkillToken } from '../../lib/skill_matcher.js';
import { safeJson } from '../../lib/json.js';

export class OpenSourceService {
  async getCatalog(query: {
    page?: number;
    limit?: number;
    search?: string;
    language?: string;
    topic?: string;
    sortBy?: 'stars' | 'forks' | 'issues' | 'recent';
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }
    if (query.language && query.language !== 'All') {
      where.language = { equals: query.language };
    }
    if (query.topic) {
      where.topicsJson = { contains: query.topic };
    }

    let orderBy: any = { stargazersCount: 'desc' };
    if (query.sortBy === 'forks') orderBy = { forksCount: 'desc' };
    if (query.sortBy === 'issues') orderBy = { openIssuesCount: 'desc' };
    if (query.sortBy === 'recent') orderBy = { updatedAt: 'desc' };

    const [total, repos] = await Promise.all([
      prisma.ossRepository.count({ where }),
      prisma.ossRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    return {
      repos: repos.map(r => {
        try {
          return normalizeRepository(r);
        } catch {
          return {
            ...r,
            ownerLogin: r.owner,
            topics: r.topicsJson ? JSON.parse(r.topicsJson) : [],
          };
        }
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTrending(query: { language?: string; timeframe?: string }) {
    const where: any = {};
    if (query.language && query.language !== 'All') {
      where.language = { equals: query.language };
    }

    const repos = await prisma.ossRepository.findMany({
      where,
      take: 25,
      orderBy: { stargazersCount: 'desc' },
    });

    return repos.map((r, index) => {
      let normalized;
      try {
        normalized = normalizeRepository(r);
      } catch {
        normalized = {
          ...r,
          ownerLogin: r.owner,
          topics: r.topicsJson ? JSON.parse(r.topicsJson) : [],
        };
      }
      return {
        ...normalized,
        rank: index + 1,
        provenance: 'github_rest_index',
      };
    });
  }

  async getIssues(query: {
    page?: number;
    limit?: number;
    language?: string;
    difficulty?: string;
    label?: string;
    search?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { state: 'open' };
    if (query.language && query.language !== 'All') {
      where.repository = { language: { equals: query.language } };
    }
    if (query.difficulty && query.difficulty !== 'All') {
      where.difficulty = query.difficulty.toLowerCase();
    }
    if (query.search) {
      where.title = { contains: query.search };
    }
    if (query.label) {
      where.labelsJson = { contains: query.label };
    }

    const [total, issues] = await Promise.all([
      prisma.ossIssue.count({ where }),
      prisma.ossIssue.findMany({
        where,
        skip,
        take: limit,
        include: {
          repository: {
            select: {
              id: true,
              fullName: true,
              name: true,
              owner: true,
              language: true,
              stargazersCount: true,
              forksCount: true,
              description: true,
              topicsJson: true,
              license: true,
              defaultBranch: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      issues: issues.map(i => {
        let normalizedRepo = null;
        if (i.repository) {
          try {
            normalizedRepo = normalizeRepository(i.repository);
          } catch {
            const parts = (i.repository.fullName || '').split('/');
            const owner = parts[0] || i.repository.owner || 'unknown';
            const name = parts[1] || i.repository.name || 'unknown';
            normalizedRepo = {
              id: i.repository.id,
              owner,
              ownerLogin: owner,
              name,
              fullName: `${owner}/${name}`,
              htmlUrl: `https://github.com/${owner}/${name}`,
              description: i.repository.description || null,
              primaryLanguage: i.repository.language || null,
              stars: i.repository.stargazersCount || 0,
              forks: i.repository.forksCount || 0,
              topics: [],
              defaultBranch: 'main',
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return {
          ...i,
          repository: normalizedRepo,
          labels: i.labelsJson ? JSON.parse(i.labelsJson) : [],
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGsocOrgs(query: {
    search?: string;
    technology?: string;
    year?: number;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 24));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
        { technologiesJson: { contains: query.search } },
      ];
    }
    if (query.technology) {
      where.technologiesJson = { contains: query.technology };
    }
    if (query.year) {
      where.participationYearsJson = { contains: String(query.year) };
    }

    const [total, orgs] = await Promise.all([
      prisma.ossOrganization.count({ where }),
      prisma.ossOrganization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { totalProjects: 'desc' },
      }),
    ]);

    return {
      orgs: orgs.map(o => ({
        ...o,
        technologies: o.technologiesJson ? JSON.parse(o.technologiesJson) : [],
        participationYears: o.participationYearsJson ? JSON.parse(o.participationYearsJson) : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBounties(query: { page?: number; limit?: number; minAmount?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));

    const where: any = {
      bountyAmount: { not: null },
      state: 'open',
    };

    const parseBountyValue = (val: string | null | undefined): number => {
      if (!val) return 0;
      const cleaned = val.replace(/[^0-9.kKmM]/g, '');
      if (cleaned.toLowerCase().endsWith('k')) return (parseFloat(cleaned) || 0) * 1000;
      if (cleaned.toLowerCase().endsWith('m')) return (parseFloat(cleaned) || 0) * 1000000;
      return parseFloat(cleaned) || 0;
    };

    const bounties = await prisma.ossIssue.findMany({
      where,
      include: {
        repository: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let mapped = bounties.map(b => {
      let normalizedRepo = null;
      if (b.repository) {
        try {
          normalizedRepo = normalizeRepository(b.repository);
        } catch {
          normalizedRepo = b.repository;
        }
      }
      return {
        ...b,
        bountyValue: parseBountyValue(b.bountyAmount),
        repository: normalizedRepo,
        labels: safeJson(b.labelsJson, []),
      };
    });

    if (query.minAmount !== undefined && !isNaN(Number(query.minAmount))) {
      mapped = mapped.filter(b => b.bountyValue >= Number(query.minAmount));
    }

    const total = mapped.length;
    const skip = (page - 1) * limit;
    const paginated = mapped.slice(skip, skip + limit);

    return {
      bounties: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Multi-user Bookmarking
  async toggleBookmark(userId: string, data: { targetType: string; repositoryId?: string; issueId?: string; organizationId?: string; targetId?: string }) {
    const rawType = data.targetType?.toUpperCase();
    const targetType = rawType === 'REPO' ? 'REPOSITORY' : rawType;
    const validTypes = ['REPOSITORY', 'ISSUE', 'ORGANIZATION'];
    if (!validTypes.includes(targetType)) {
      throw new BadRequestError('Invalid bookmark targetType. Must be REPOSITORY, ISSUE, or ORGANIZATION');
    }

    const repositoryId = data.repositoryId || (targetType === 'REPOSITORY' ? data.targetId : undefined);
    const issueId = data.issueId || (targetType === 'ISSUE' ? data.targetId : undefined);
    const organizationId = data.organizationId || (targetType === 'ORGANIZATION' ? data.targetId : undefined);

    if (targetType === 'REPOSITORY') {
      if (!repositoryId) throw new BadRequestError('repositoryId is required for REPOSITORY bookmark');
      const repo = await prisma.ossRepository.findUnique({ where: { id: repositoryId } });
      if (!repo) throw new NotFoundError('Target repository not found');
    } else if (targetType === 'ISSUE') {
      if (!issueId) throw new BadRequestError('issueId is required for ISSUE bookmark');
      const issue = await prisma.ossIssue.findUnique({ where: { id: issueId } });
      if (!issue) throw new NotFoundError('Target issue not found');
    } else if (targetType === 'ORGANIZATION') {
      if (!organizationId) throw new BadRequestError('organizationId is required for ORGANIZATION bookmark');
      const org = await prisma.ossOrganization.findFirst({
        where: { OR: [{ id: organizationId }, { slug: organizationId }] },
      });
      if (!org) throw new NotFoundError('Target organization not found');
    }

    return await prisma.$transaction(async tx => {
      const existing = await tx.userBookmark.findFirst({
        where: {
          userId,
          targetType,
          repositoryId: repositoryId || null,
          issueId: issueId || null,
          organizationId: organizationId || null,
        },
      });

      if (existing) {
        await tx.userBookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false };
      }

      await tx.userBookmark.create({
        data: {
          userId,
          targetType,
          repositoryId: repositoryId || null,
          issueId: issueId || null,
          organizationId: organizationId || null,
        },
      });

      return { bookmarked: true };
    });
  }

  async getUserBookmarks(userId: string) {
    return prisma.userBookmark.findMany({
      where: { userId },
      include: {
        repository: true,
        issue: {
          include: { repository: true },
        },
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GitHub Selfbot module
  async getSelfbotConfig(userId: string, repositoryFullName: string) {
    return prisma.selfbotConfig.findUnique({
      where: {
        userId_repositoryFullName: {
          userId,
          repositoryFullName,
        },
      },
      include: {
        logs: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateSelfbotConfig(userId: string, data: {
    repositoryFullName: string;
    welcomeMessage?: string;
    welcomeEnabled?: boolean;
    goodbyeMessage?: string;
    goodbyeEnabled?: boolean;
    slashCommands?: Record<string, string>;
    isEnabled?: boolean;
  }) {
    return prisma.selfbotConfig.upsert({
      where: {
        userId_repositoryFullName: {
          userId,
          repositoryFullName: data.repositoryFullName,
        },
      },
      update: {
        welcomeMessage: data.welcomeMessage,
        welcomeEnabled: data.welcomeEnabled,
        goodbyeMessage: data.goodbyeMessage,
        goodbyeEnabled: data.goodbyeEnabled,
        slashCommandsJson: data.slashCommands ? JSON.stringify(data.slashCommands) : undefined,
        isEnabled: data.isEnabled,
      },
      create: {
        userId,
        repositoryFullName: data.repositoryFullName,
        welcomeMessage: data.welcomeMessage || '👋 Welcome to the repository! Thanks for opening an issue or PR.',
        welcomeEnabled: data.welcomeEnabled || false,
        goodbyeMessage: data.goodbyeMessage || 'Thank you for your contributions!',
        goodbyeEnabled: data.goodbyeEnabled || false,
        slashCommandsJson: JSON.stringify(data.slashCommands || { '/guide': 'Please check our CONTRIBUTING.md guide.' }),
        isEnabled: data.isEnabled || false,
      },
    });
  }

  // -----------------------------------------------------------
  // CONTRIBUTION PIPELINE & LIFECYCLE
  // -----------------------------------------------------------

  async getPipeline(userId: string, stage?: string) {
    const where: any = { userId };
    if (stage && stage !== 'ALL') {
      where.stage = stage;
    }

    const items = await prisma.contributionPipelineItem.findMany({
      where,
      include: {
        issue: {
          include: {
            repository: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return items.map(item => ({
      ...item,
      issue: {
        ...item.issue,
        labels: item.issue.labelsJson ? JSON.parse(item.issue.labelsJson) : [],
        repository: {
          ...item.issue.repository,
          topics: item.issue.repository.topicsJson ? JSON.parse(item.issue.repository.topicsJson) : [],
        },
      },
    }));
  }

  async addToPipeline(userId: string, data: {
    issueId: string;
    stage?: string;
    priority?: string;
    notes?: string;
    deadline?: string;
  }) {
    const issue = await prisma.ossIssue.findUnique({ where: { id: data.issueId } });
    if (!issue) {
      throw new NotFoundError('Target open source issue not found');
    }

    const stage = data.stage || 'SHORTLISTED';
    const priority = data.priority || 'MEDIUM';

    return prisma.contributionPipelineItem.upsert({
      where: {
        userId_issueId: {
          userId,
          issueId: data.issueId,
        },
      },
      create: {
        userId,
        issueId: data.issueId,
        stage,
        priority,
        notes: data.notes || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      update: {
        stage,
        priority,
        notes: data.notes || undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
      include: {
        issue: {
          include: { repository: true },
        },
      },
    });
  }

  async updatePipelineStage(userId: string, pipelineItemId: string, data: {
    stage: string;
    prUrl?: string;
    notes?: string;
    priority?: string;
  }) {
    const item = await prisma.contributionPipelineItem.findUnique({
      where: { id: pipelineItemId },
      include: { issue: { include: { repository: true } } },
    });

    if (!item || item.userId !== userId) {
      throw new NotFoundError('Contribution pipeline item not found');
    }

    if (data.prUrl) {
      try {
        const parsed = new URL(data.prUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          throw new BadRequestError(`Invalid PR URL protocol: ${parsed.protocol}. Only HTTP and HTTPS URLs are allowed.`);
        }
      } catch (err: any) {
        if (err instanceof BadRequestError) throw err;
        throw new BadRequestError(`Invalid PR URL format: ${data.prUrl}`);
      }
    }

    const updated = await prisma.contributionPipelineItem.update({
      where: { id: pipelineItemId },
      data: {
        stage: data.stage,
        prUrl: data.prUrl || item.prUrl,
        notes: data.notes !== undefined ? data.notes : item.notes,
        priority: data.priority || item.priority,
      },
      include: {
        issue: { include: { repository: true } },
      },
    });

    // If transitioned into merged, automatically celebrate and record in notification table
    if (data.stage === 'MERGED' && item.stage !== 'MERGED') {
      await prisma.notification.create({
        data: {
          userId,
          title: '🎉 Contribution Merged into Main!',
          message: `Your PR for "${item.issue.title}" has been successfully merged into ${item.issue.repository.fullName}.`,
          type: 'OPPORTUNITY',
          linkUrl: data.prUrl || item.issue.url,
        },
      });
    }

    return updated;
  }

  async removeFromPipeline(userId: string, pipelineItemId: string) {
    const item = await prisma.contributionPipelineItem.findUnique({
      where: { id: pipelineItemId },
    });

    if (!item || item.userId !== userId) {
      throw new NotFoundError('Pipeline item not found');
    }

    await prisma.contributionPipelineItem.delete({
      where: { id: pipelineItemId },
    });

    return { removed: true };
  }

  // -----------------------------------------------------------
  // EXPLAINABLE SKILL MATCHING FOR ISSUES
  // -----------------------------------------------------------

  async matchIssueSkills(userId: string, issueId: string) {
    const issue = await prisma.ossIssue.findUnique({
      where: { id: issueId },
      include: { repository: true },
    });

    if (!issue) {
      throw new NotFoundError('Issue not found');
    }

    const userSkills = await prisma.userSkillProfile.findMany({
      where: { userId },
    });

    const repoLanguage = issue.repository.language;
    const repoTopics: string[] = safeJson(issue.repository.topicsJson, []);
    const rawLabels = safeJson<any[]>(issue.labelsJson, []);
    const issueLabels: string[] = rawLabels.map((l: any) => (typeof l === 'string' ? l : l.name || '')).filter(Boolean);

    // Analyze requirements
    const requiredSkills: string[] = [];
    if (repoLanguage) requiredSkills.push(repoLanguage);

    for (const topic of repoTopics) {
      requiredSkills.push(topic);
    }
    for (const label of issueLabels) {
      if (['react', 'typescript', 'rust', 'go', 'python', 'docker', 'graphql'].includes(label.toLowerCase())) {
        requiredSkills.push(label);
      }
    }

    const matchedSkills: Array<{ skillName: string; confidence: number; evidenceCount: number }> = [];
    const missingSkills: string[] = [];

    let totalScore = 0;
    const langSkill = userSkills.find(s => matchSkillToken(s.skillName, repoLanguage || ''));

    if (langSkill) {
      const langContribution = Math.round(55 * (langSkill.confidenceScore / 100));
      totalScore += langContribution;
      matchedSkills.push({
        skillName: langSkill.skillName,
        confidence: langSkill.confidenceScore,
        evidenceCount: safeJson<any[]>(langSkill.verifiedEvidenceJson, []).length || 1,
      });
    } else if (repoLanguage) {
      missingSkills.push(repoLanguage);
    }

    // Match topic skills using tokenized matcher
    for (const userSkill of userSkills) {
      if (repoLanguage && matchSkillToken(userSkill.skillName, repoLanguage)) continue;
      const matchesTopic = repoTopics.some(t => matchSkillToken(t, userSkill.skillName));
      const matchesLabel = issueLabels.some(l => matchSkillToken(l, userSkill.skillName));

      if (matchesTopic || matchesLabel) {
        totalScore += Math.round(20 * (userSkill.confidenceScore / 100));
        matchedSkills.push({
          skillName: userSkill.skillName,
          confidence: userSkill.confidenceScore,
          evidenceCount: safeJson<any[]>(userSkill.verifiedEvidenceJson, []).length || 1,
        });
      }
    }

    const matchScore = Math.min(98, Math.max(15, totalScore));
    let difficultyEstimate = 'INTERMEDIATE';
    if (issue.difficulty === 'beginner' || issueLabels.some(l => l.toLowerCase().includes('good first issue'))) {
      difficultyEstimate = 'BEGINNER';
    } else if (issue.difficulty === 'advanced') {
      difficultyEstimate = 'ADVANCED';
    }

    const explanation = matchedSkills.length > 0
      ? `${matchScore}% match based on your verified ${matchedSkills.map(s => `${s.skillName} (${s.confidence}%)`).join(', ')} codebase evidence.`
      : `Baseline match: You have not yet synced repository evidence in ${repoLanguage || 'the target language'}.`;

    return {
      issueId,
      issueTitle: issue.title,
      repository: issue.repository.fullName,
      matchScore,
      matchedSkills,
      missingSkills,
      difficultyEstimate,
      explanation,
    };
  }

  /**
   * Evidence-based opportunity recommendation engine
   * Matches open issues against user's verified GitHub skills, languages and topic interests
   */
  async getRecommendedOpportunities(userId: string, limit = 10) {
    const scoredList = await recommendationEngine.getRecommendations(userId, { limit });
    return scoredList.map(item => ({
      ...item.issue,
      matchScore: item.score,
      score: item.score,
      category: item.category,
      factors: item.factors,
      explanation: item.explanation,
      matchedEvidence: item.matchedEvidence,
      recommendationId: item.id,
    }));
  }

  // -----------------------------------------------------------
  // OSS PROGRAMS & OPPORTUNITY MONITORING
  // -----------------------------------------------------------

  async getPrograms() {
    const programs = await prisma.ossProgram.findMany({
      include: {
        _count: {
          select: { orgs: true },
        },
      },
      orderBy: { deadlineDate: 'asc' },
    });

    const now = new Date();

    return programs.map(p => {
      let status = p.status;
      if (p.deadlineDate && p.deadlineDate < now) {
        status = 'ENDED';
      }

      return {
        ...p,
        status,
        timeline: p.timelineJson ? JSON.parse(p.timelineJson) : [],
      };
    });
  }

  async monitorOpportunities(userId: string) {
    const pipelineItems = await prisma.contributionPipelineItem.findMany({
      where: {
        userId,
        stage: { in: ['SHORTLISTED', 'EXPLORING', 'PREPARING', 'WORKING'] },
        deadline: { not: null },
      },
      include: {
        issue: { include: { repository: true } },
      },
    });

    const now = new Date();
    const notificationsCreated = [];

    for (const item of pipelineItems) {
      if (item.deadline) {
        const diffHours = (item.deadline.getTime() - now.getTime()) / (1000 * 3600);
        // Alert if deadline within 72 hours
        if (diffHours > 0 && diffHours <= 72) {
          const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
          const alertTitle = `⏰ Deadline Approaching: ${item.issue.repository.fullName}`;
          const existing = await prisma.notification.findFirst({
            where: {
              userId,
              type: 'OPPORTUNITY',
              title: alertTitle,
              createdAt: { gte: oneDayAgo },
            },
          });

          if (!existing) {
            const notif = await prisma.notification.create({
              data: {
                userId,
                title: alertTitle,
                message: `Target deadline for "${item.issue.title}" is in ${Math.round(diffHours)} hours (${item.priority} priority).`,
                type: 'OPPORTUNITY',
                linkUrl: item.issue.url,
              },
            });
            notificationsCreated.push(notif);
          }
        }
      }
    }

    return {
      monitoredItemsCount: pipelineItems.length,
      alertsDispatched: notificationsCreated.length,
      alerts: notificationsCreated,
    };
  }
}
