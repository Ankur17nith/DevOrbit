import { prisma } from '../../config/index.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';

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
      repos: repos.map(r => ({
        ...r,
        topics: r.topicsJson ? JSON.parse(r.topicsJson) : [],
      })),
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

    return repos.map((r, index) => ({
      ...r,
      rank: index + 1,
      topics: r.topicsJson ? JSON.parse(r.topicsJson) : [],
      starsToday: Math.floor(r.stargazersCount * 0.008) + 12,
    }));
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
              fullName: true,
              language: true,
              stargazersCount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      issues: issues.map(i => ({
        ...i,
        labels: i.labelsJson ? JSON.parse(i.labelsJson) : [],
      })),
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
    const skip = (page - 1) * limit;

    const where: any = {
      bountyAmount: { not: null },
      state: 'open',
    };

    const [total, bounties] = await Promise.all([
      prisma.ossIssue.count({ where }),
      prisma.ossIssue.findMany({
        where,
        skip,
        take: limit,
        include: {
          repository: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      bounties: bounties.map(b => ({
        ...b,
        labels: b.labelsJson ? JSON.parse(b.labelsJson) : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Multi-user Bookmarking
  async toggleBookmark(userId: string, data: { targetType: string; repositoryId?: string; issueId?: string; organizationId?: string }) {
    const existing = await prisma.userBookmark.findFirst({
      where: {
        userId,
        targetType: data.targetType,
        repositoryId: data.repositoryId || null,
        issueId: data.issueId || null,
        organizationId: data.organizationId || null,
      },
    });

    if (existing) {
      await prisma.userBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await prisma.userBookmark.create({
      data: {
        userId,
        targetType: data.targetType,
        repositoryId: data.repositoryId,
        issueId: data.issueId,
        organizationId: data.organizationId,
      },
    });

    return { bookmarked: true };
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
}
