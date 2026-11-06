import { prisma } from '../../../config/index.js';
import { PlatformProvider, NormalizedOrganization, OrganizationFilterOptions } from './types.js';

export class GSoCProvider implements PlatformProvider {
  id = 'GSOC';
  name = 'Google Summer of Code';

  async getOrganizations(filters: OrganizationFilterOptions): Promise<{ orgs: NormalizedOrganization[]; total: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 24));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { technologiesJson: { contains: filters.search } },
      ];
    }

    if (filters.technologies && filters.technologies.length > 0) {
      if (filters.techLogic === 'AND') {
        where.AND = filters.technologies.map(tech => ({
          technologiesJson: { contains: tech },
        }));
      } else {
        where.OR = [
          ...(where.OR || []),
          ...filters.technologies.map(tech => ({
            technologiesJson: { contains: tech },
          })),
        ];
      }
    }

    if (filters.year) {
      where.participationYearsJson = { contains: String(filters.year) };
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

    // Query real repositories matching these orgs
    const orgSlugs = orgs.map(o => o.slug);
    const realRepos = await prisma.ossRepository.findMany({
      where: {
        owner: { in: orgSlugs },
      },
    });

    const reposByOwner = new Map<string, typeof realRepos>();
    for (const r of realRepos) {
      const list = reposByOwner.get(r.owner) || [];
      list.push(r);
      reposByOwner.set(r.owner, list);
    }

    const mappedOrgs: NormalizedOrganization[] = orgs.map(o => {
      let technologies: string[] = [];
      let participationYears: number[] = [];
      try {
        if (o.technologiesJson) technologies = JSON.parse(o.technologiesJson);
      } catch {}
      try {
        if (o.participationYearsJson) participationYears = JSON.parse(o.participationYearsJson);
      } catch {}

      const websiteUrl = o.website && o.website.startsWith('http') ? o.website : null;
      const orgRepos = reposByOwner.get(o.slug) || [];

      return {
        id: o.id,
        slug: o.slug,
        name: o.name,
        description: o.description || 'Google Summer of Code open source organization.',
        websiteUrl,
        logoUrl: o.logoUrl || null,
        verifiedPlatforms: ['GSOC'],
        technologies,
        topics: technologies.slice(0, 5),
        openOpportunitiesCount: 0,
        repositories: orgRepos.map(r => ({
          fullName: r.fullName,
          name: r.name,
          owner: r.owner,
          description: r.description || undefined,
          primaryLanguage: r.language || undefined,
          stars: r.stargazersCount,
          forks: r.forksCount,
        })),
        recentActivitySummary: `${o.totalProjects} open source mentorship projects completed.`,
        sourceProvenance: 'gsoc_archive',
        hasBeginnerIssues: false,
        participationYears,
        totalProjects: o.totalProjects,
      };
    });

    return { orgs: mappedOrgs, total };
  }

  async getOrganization(idOrSlug: string): Promise<NormalizedOrganization | null> {
    const org = await prisma.ossOrganization.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!org) return null;

    let technologies: string[] = [];
    let participationYears: number[] = [];
    try {
      if (org.technologiesJson) technologies = JSON.parse(org.technologiesJson);
    } catch {}
    try {
      if (org.participationYearsJson) participationYears = JSON.parse(org.participationYearsJson);
    } catch {}

    const websiteUrl = org.website && org.website.startsWith('http') ? org.website : null;

    // Find real repositories
    const realRepos = await prisma.ossRepository.findMany({
      where: { owner: org.slug },
    });

    // Check if beginner issues exist
    const beginnerIssuesCount = await prisma.ossIssue.count({
      where: {
        state: 'open',
        repository: { owner: org.slug },
        labelsJson: { contains: 'good first issue' },
      },
    });

    return {
      id: org.id,
      slug: org.slug,
      name: org.name,
      description: org.description || 'Google Summer of Code open source organization.',
      websiteUrl,
      logoUrl: org.logoUrl || null,
      verifiedPlatforms: ['GSOC'],
      technologies,
      topics: technologies.slice(0, 5),
      openOpportunitiesCount: beginnerIssuesCount,
      repositories: realRepos.map(r => ({
        fullName: r.fullName,
        name: r.name,
        owner: r.owner,
        description: r.description || undefined,
        primaryLanguage: r.language || undefined,
        stars: r.stargazersCount,
        forks: r.forksCount,
      })),
      recentActivitySummary: `${org.totalProjects} open source mentorship projects completed.`,
      sourceProvenance: 'gsoc_archive',
      hasBeginnerIssues: beginnerIssuesCount > 0,
      participationYears,
      totalProjects: org.totalProjects,
    };
  }
}
