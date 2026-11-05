import { PlatformProvider, NormalizedOrganization, OrganizationFilterOptions } from './types.js';

const GITHUB_DIRECT_ORGS: NormalizedOrganization[] = [
  {
    id: 'gh-vercel',
    slug: 'vercel',
    name: 'Vercel',
    description: 'Enables frontend developers to build fast, delightful web experiences: Next.js, Turbopack, and AI SDK.',
    websiteUrl: 'https://vercel.com',
    logoUrl: 'https://avatars.githubusercontent.com/u/14985020?v=4',
    verifiedPlatforms: ['GITHUB'],
    technologies: ['TypeScript', 'Rust', 'React', 'Next.js', 'Node.js'],
    topics: ['web', 'frontend', 'serverless', 'edge', 'developer-tools'],
    openOpportunitiesCount: 15,
    repositories: [
      { fullName: 'vercel/next.js', description: 'The React Framework for the Web', stars: 128000, primaryLanguage: 'JavaScript' },
      { fullName: 'vercel/turbo', description: 'Incremental bundler and build system for JavaScript and TypeScript', stars: 26000, primaryLanguage: 'Rust' },
      { fullName: 'vercel/ai', description: 'Build AI-powered applications with React, Svelte, Vue, and Solid', stars: 14000, primaryLanguage: 'TypeScript' },
    ],
    recentActivitySummary: 'Next.js 15 canary releases, Turbopack memory optimizations, and AI SDK tool calling.',
    sourceProvenance: 'github_direct',
    hasBeginnerIssues: true,
    participationYears: [2022, 2023, 2024, 2025],
    totalProjects: 40,
  },
  {
    id: 'gh-supabase',
    slug: 'supabase',
    name: 'Supabase',
    description: 'The open source Firebase alternative: Postgres database, Authentication, instant APIs, Edge Functions, and Realtime.',
    websiteUrl: 'https://supabase.com',
    logoUrl: 'https://avatars.githubusercontent.com/u/54469796?v=4',
    verifiedPlatforms: ['GITHUB'],
    technologies: ['TypeScript', 'Go', 'Elixir', 'PostgreSQL', 'Rust'],
    topics: ['database', 'backend', 'realtime', 'auth', 'postgres'],
    openOpportunitiesCount: 11,
    repositories: [
      { fullName: 'supabase/supabase', description: 'The open source Firebase alternative', stars: 74000, primaryLanguage: 'TypeScript' },
      { fullName: 'supabase/realtime', description: 'Broadcast, Presence, and Postgres CDC over WebSockets', stars: 6200, primaryLanguage: 'Elixir' },
    ],
    recentActivitySummary: 'Database branch preview workflows, pgvector indexing enhancements, and edge runtime support.',
    sourceProvenance: 'github_direct',
    hasBeginnerIssues: true,
    participationYears: [2021, 2022, 2023, 2024, 2025],
    totalProjects: 28,
  },
  {
    id: 'gh-tailwindlabs',
    slug: 'tailwindlabs',
    name: 'Tailwind Labs',
    description: 'Creators of Tailwind CSS: utility-first CSS framework for rapid modern UI development.',
    websiteUrl: 'https://tailwindcss.com',
    logoUrl: 'https://avatars.githubusercontent.com/u/67104415?v=4',
    verifiedPlatforms: ['GITHUB'],
    technologies: ['Rust', 'TypeScript', 'CSS', 'JavaScript'],
    topics: ['css', 'design-systems', 'compiler', 'frontend'],
    openOpportunitiesCount: 7,
    repositories: [
      { fullName: 'tailwindlabs/tailwindcss', description: 'A utility-first CSS framework for rapid UI development', stars: 84000, primaryLanguage: 'Rust' },
      { fullName: 'tailwindlabs/headlessui', description: 'Completely unstyled, fully accessible UI components', stars: 24000, primaryLanguage: 'TypeScript' },
    ],
    recentActivitySummary: 'Tailwind CSS v4 Oxide engine written in Rust with lightning-fast rebuild speeds.',
    sourceProvenance: 'github_direct',
    hasBeginnerIssues: true,
    participationYears: [2022, 2023, 2024, 2025],
    totalProjects: 16,
  },
  {
    id: 'gh-oven-sh',
    slug: 'oven-sh',
    name: 'Bun (Oven)',
    description: 'Incredibly fast all-in-one JavaScript runtime, bundler, test runner, and package manager.',
    websiteUrl: 'https://bun.sh',
    logoUrl: 'https://avatars.githubusercontent.com/u/98482436?v=4',
    verifiedPlatforms: ['GITHUB'],
    technologies: ['Zig', 'C++', 'JavaScript', 'WebKit'],
    topics: ['runtime', 'javascript', 'compiler', 'bundler', 'high-performance'],
    openOpportunitiesCount: 9,
    repositories: [
      { fullName: 'oven-sh/bun', description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager', stars: 76000, primaryLanguage: 'Zig' },
    ],
    recentActivitySummary: 'Node.js API compatibility improvements, Windows stability, and standalone executable bundling.',
    sourceProvenance: 'github_direct',
    hasBeginnerIssues: true,
    participationYears: [2022, 2023, 2024, 2025],
    totalProjects: 22,
  },
  {
    id: 'gh-prisma',
    slug: 'prisma',
    name: 'Prisma',
    description: 'Next-generation ORM for Node.js and TypeScript, making database workflows productive and intuitive.',
    websiteUrl: 'https://www.prisma.io',
    logoUrl: 'https://avatars.githubusercontent.com/u/17219288?v=4',
    verifiedPlatforms: ['GITHUB'],
    technologies: ['TypeScript', 'Rust', 'SQL', 'GraphQL'],
    topics: ['orm', 'database', 'typescript', 'sql', 'backend'],
    openOpportunitiesCount: 8,
    repositories: [
      { fullName: 'prisma/prisma', description: 'Next-generation ORM for Node.js & TypeScript', stars: 40000, primaryLanguage: 'TypeScript' },
    ],
    recentActivitySummary: 'Prisma Optimize query analytics, typed client generation, and driver adapter performance.',
    sourceProvenance: 'github_direct',
    hasBeginnerIssues: true,
    participationYears: [2021, 2022, 2023, 2024],
    totalProjects: 20,
  },
];

export class GitHubOrgProvider implements PlatformProvider {
  id = 'GITHUB';
  name = 'GitHub Open Source';

  async getOrganizations(filters: OrganizationFilterOptions): Promise<{ orgs: NormalizedOrganization[]; total: number }> {
    let filtered = [...GITHUB_DIRECT_ORGS];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        o => o.name.toLowerCase().includes(q) ||
             o.description.toLowerCase().includes(q) ||
             o.technologies.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters.technologies && filters.technologies.length > 0) {
      const reqTechs = filters.technologies.map(t => t.toLowerCase());
      if (filters.techLogic === 'AND') {
        filtered = filtered.filter(o =>
          reqTechs.every(req => o.technologies.some(t => t.toLowerCase().includes(req)))
        );
      } else {
        filtered = filtered.filter(o =>
          reqTechs.some(req => o.technologies.some(t => t.toLowerCase().includes(req)))
        );
      }
    }

    if (filters.hasBeginnerIssues) {
      filtered = filtered.filter(o => o.hasBeginnerIssues);
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 24));
    const skip = (page - 1) * limit;

    const orgs = filtered.slice(skip, skip + limit);
    return { orgs, total: filtered.length };
  }

  async getOrganization(idOrSlug: string): Promise<NormalizedOrganization | null> {
    const match = GITHUB_DIRECT_ORGS.find(
      o => o.id === idOrSlug || o.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
    return match || null;
  }
}
