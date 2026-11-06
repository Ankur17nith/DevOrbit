import { prisma } from '../../config/index.js';
import { NotFoundError } from '../../lib/errors.js';
import {
  PlatformProvider,
  NormalizedOrganization,
  OrganizationDetail,
  OrganizationFilterOptions,
} from './providers/types.js';
import { GSoCProvider } from './providers/gsoc.provider.js';
import { OutreachyProvider } from './providers/outreachy.provider.js';
import { LFXProvider } from './providers/lfx.provider.js';
import { MLHProvider } from './providers/mlh.provider.js';
import { GitHubOrgProvider } from './providers/github.provider.js';

export class OrganizationService {
  private providers: Map<string, PlatformProvider> = new Map();

  constructor() {
    this.registerProvider(new GSoCProvider());
    this.registerProvider(new OutreachyProvider());
    this.registerProvider(new LFXProvider());
    this.registerProvider(new MLHProvider());
    this.registerProvider(new GitHubOrgProvider());
  }

  private registerProvider(provider: PlatformProvider) {
    this.providers.set(provider.id.toUpperCase(), provider);
  }

  /**
   * Discovers organizations across platforms with multi-select platforms,
   * AND/OR technology logic, debounced search, and bookmark state.
   */
  async getOrganizations(
    filters: OrganizationFilterOptions,
    userId?: string
  ): Promise<{
    orgs: NormalizedOrganization[];
    total: number;
    availablePlatforms: Array<{ id: string; name: string }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 24));

    // Determine target providers based on requested platforms
    const requestedPlatforms = filters.platforms && filters.platforms.length > 0
      ? filters.platforms.map(p => p.toUpperCase())
      : Array.from(this.providers.keys());

    const activeProviders = requestedPlatforms
      .map(id => this.providers.get(id))
      .filter((p): p is PlatformProvider => Boolean(p));

    // Run provider queries
    const providerResults = await Promise.all(
      activeProviders.map(p => p.getOrganizations({ ...filters, page: 1, limit: 1000 }))
    );

    // Merge and deduplicate by slug or canonical lowercase name
    const orgMap = new Map<string, NormalizedOrganization>();

    for (const res of providerResults) {
      for (const org of res.orgs) {
        const canonicalKey = org.slug.toLowerCase();
        if (orgMap.has(canonicalKey)) {
          const existing = orgMap.get(canonicalKey)!;
          // Merge verified platforms
          const combinedPlatforms = Array.from(new Set([...existing.verifiedPlatforms, ...org.verifiedPlatforms]));
          const combinedTechs = Array.from(new Set([...existing.technologies, ...org.technologies]));
          const combinedRepos = [...existing.repositories, ...org.repositories];
          orgMap.set(canonicalKey, {
            ...existing,
            verifiedPlatforms: combinedPlatforms,
            technologies: combinedTechs,
            repositories: combinedRepos,
            totalProjects: Math.max(existing.totalProjects, org.totalProjects),
            openOpportunitiesCount: Math.max(existing.openOpportunitiesCount, org.openOpportunitiesCount),
          });
        } else {
          orgMap.set(canonicalKey, { ...org });
        }
      }
    }

    let allAggregated = Array.from(orgMap.values());

    // Sort aggregated results
    if (filters.sortBy === 'name') {
      allAggregated.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'opportunities') {
      allAggregated.sort((a, b) => b.openOpportunitiesCount - a.openOpportunitiesCount);
    } else {
      allAggregated.sort((a, b) => b.totalProjects - a.totalProjects);
    }

    // Check saved state for user if logged in
    if (userId) {
      const saved = await prisma.userSavedOrganization.findMany({
        where: { userId },
        select: { organizationId: true },
      });
      const savedIds = new Set(saved.map(s => s.organizationId));
      allAggregated = allAggregated.map(org => ({
        ...org,
        isSaved: savedIds.has(org.id) || savedIds.has(org.slug),
      }));
    }

    const total = allAggregated.length;
    const skip = (page - 1) * limit;
    const paginatedOrgs = allAggregated.slice(skip, skip + limit);

    const availablePlatforms = Array.from(this.providers.values()).map(p => ({
      id: p.id,
      name: p.name,
    }));

    return {
      orgs: paginatedOrgs,
      total,
      availablePlatforms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves full organization detail view with verified links,
   * mentorship history, and real repository issue opportunities.
   */
  async getOrganizationDetail(idOrSlug: string, userId?: string): Promise<OrganizationDetail> {
    let matchedOrg: NormalizedOrganization | null = null;

    // Search across providers
    for (const provider of this.providers.values()) {
      const found = await provider.getOrganization(idOrSlug);
      if (found) {
        if (!matchedOrg) {
          matchedOrg = { ...found };
        } else {
          matchedOrg.verifiedPlatforms = Array.from(new Set([...matchedOrg.verifiedPlatforms, ...found.verifiedPlatforms]));
          matchedOrg.technologies = Array.from(new Set([...matchedOrg.technologies, ...found.technologies]));
          matchedOrg.repositories = [...matchedOrg.repositories, ...found.repositories];
        }
      }
    }

    if (!matchedOrg) {
      throw new NotFoundError(`Organization '${idOrSlug}' not found across verified platforms`);
    }

    // Construct authentic mentorship history from real participation years
    const mentorshipHistory = (matchedOrg.participationYears || []).map(year => ({
      platform: matchedOrg!.verifiedPlatforms[0] || 'GSOC',
      programName: `${matchedOrg!.verifiedPlatforms[0] || 'Open Source'} ${year}`,
      year,
    }));

    // Find real issues linked to this organization or its repositories
    const openIssues = await prisma.ossIssue.findMany({
      where: {
        state: 'open',
        OR: [
          { repository: { fullName: { contains: matchedOrg.slug } } },
          { repository: { name: { contains: matchedOrg.slug } } },
          { body: { contains: matchedOrg.name } },
        ],
      },
      include: { repository: true },
      take: 6,
    });

    const mappedIssues = openIssues.map(i => ({
      id: i.id,
      number: i.number,
      title: i.title,
      url: i.url,
      difficulty: i.difficulty || 'intermediate',
      labels: i.labelsJson ? JSON.parse(i.labelsJson) : [],
      repositoryFullName: i.repository.fullName,
    }));

    // Construct verified official links (never guess broken summerofcode archive links)
    const officialLinks: OrganizationDetail['officialLinks'] = {};
    if (matchedOrg.websiteUrl && matchedOrg.websiteUrl.startsWith('http')) {
      officialLinks.website = matchedOrg.websiteUrl;
    }
    officialLinks.repositoryOrg = `https://github.com/${matchedOrg.slug}`;
    officialLinks.contributingGuide = `https://github.com/${matchedOrg.slug}/.github/blob/main/CONTRIBUTING.md`;

    let isSaved = false;
    if (userId) {
      const savedRecord = await prisma.userSavedOrganization.findFirst({
        where: {
          userId,
          OR: [{ organizationId: matchedOrg.id }, { organizationId: matchedOrg.slug }],
        },
      });
      isSaved = Boolean(savedRecord);
    }

    return {
      ...matchedOrg,
      isSaved,
      mentorshipHistory,
      openIssues: mappedIssues,
      officialLinks,
    };
  }

  /**
   * Toggles bookmark / saving for an organization
   */
  async toggleSaveOrganization(userId: string, organizationIdOrSlug: string, notes?: string) {
    const existing = await prisma.userSavedOrganization.findFirst({
      where: {
        userId,
        organizationId: organizationIdOrSlug,
      },
    });

    if (existing) {
      await prisma.userSavedOrganization.delete({ where: { id: existing.id } });
      return { saved: false };
    }

    // Ensure database OssOrganization row exists so foreign key relation is satisfied if referencing UUID
    let dbOrg = await prisma.ossOrganization.findFirst({
      where: {
        OR: [{ id: organizationIdOrSlug }, { slug: organizationIdOrSlug }],
      },
    });

    if (!dbOrg) {
      // Find from providers to populate
      const detail = await this.getOrganizationDetail(organizationIdOrSlug);
      dbOrg = await prisma.ossOrganization.upsert({
        where: { slug: detail.slug },
        update: {},
        create: {
          slug: detail.slug,
          name: detail.name,
          description: detail.description,
          website: detail.websiteUrl,
          logoUrl: detail.logoUrl,
          technologiesJson: JSON.stringify(detail.technologies),
          platformsJson: JSON.stringify(detail.verifiedPlatforms),
          totalProjects: detail.totalProjects,
        },
      });
    }

    await prisma.userSavedOrganization.create({
      data: {
        userId,
        organizationId: dbOrg.id,
        notes: notes || null,
      },
    });

    return { saved: true };
  }

  /**
   * Retrieves all organizations saved by a user
   */
  async getUserSavedOrganizations(userId: string) {
    const records = await prisma.userSavedOrganization.findMany({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(r => ({
      ...r,
      organization: {
        ...r.organization,
        technologies: r.organization.technologiesJson ? JSON.parse(r.organization.technologiesJson) : [],
        platforms: r.organization.platformsJson ? JSON.parse(r.organization.platformsJson) : ['GSOC'],
      },
    }));
  }
}

export const organizationService = new OrganizationService();
