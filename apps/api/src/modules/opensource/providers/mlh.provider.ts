import { PlatformProvider, NormalizedOrganization, OrganizationFilterOptions } from './types.js';

const MLH_ORGS: NormalizedOrganization[] = [
  {
    id: 'mlh-meta',
    slug: 'meta-open-source',
    name: 'Meta Open Source',
    description: 'Premier open-source frameworks powering the modern web and AI: React, PyTorch, and Docusaurus.',
    websiteUrl: 'https://opensource.fb.com',
    logoUrl: 'https://avatars.githubusercontent.com/u/69631?v=4',
    verifiedPlatforms: ['MLH', 'GITHUB'],
    technologies: ['JavaScript', 'TypeScript', 'Python', 'C++', 'React'],
    topics: ['frontend', 'ai', 'machine-learning', 'ui-libraries'],
    openOpportunitiesCount: 8,
    repositories: [
      { fullName: 'facebook/react', description: 'The library for web and native user interfaces', stars: 231000, primaryLanguage: 'JavaScript' },
      { fullName: 'pytorch/pytorch', description: 'Tensors and Dynamic neural networks in Python with strong GPU acceleration', stars: 87000, primaryLanguage: 'C++' },
    ],
    recentActivitySummary: 'Fellows contributing to React Server Components and PyTorch distributed training documentation.',
    sourceProvenance: 'mlh_fellowship',
    hasBeginnerIssues: true,
    participationYears: [2021, 2022, 2023, 2024, 2025],
    totalProjects: 25,
  },
  {
    id: 'mlh-pallets',
    slug: 'pallets',
    name: 'Pallets Projects',
    description: 'The Python web ecosystem standards: Flask, Jinja, Click, Werkzeug, and ItsDangerous.',
    websiteUrl: 'https://palletsprojects.com',
    logoUrl: 'https://avatars.githubusercontent.com/u/16748442?v=4',
    verifiedPlatforms: ['MLH'],
    technologies: ['Python', 'Flask', 'Jinja', 'AsyncIO'],
    topics: ['web-frameworks', 'python', 'cli', 'templates'],
    openOpportunitiesCount: 4,
    repositories: [
      { fullName: 'pallets/flask', description: 'The Python micro framework for building web applications', stars: 68000, primaryLanguage: 'Python' },
      { fullName: 'pallets/click', description: 'Python composable command line interface toolkit', stars: 16000, primaryLanguage: 'Python' },
    ],
    recentActivitySummary: 'Type hints completion across Flask core and async test fixture tooling.',
    sourceProvenance: 'mlh_fellowship',
    hasBeginnerIssues: true,
    participationYears: [2022, 2023, 2024],
    totalProjects: 9,
  },
  {
    id: 'mlh-solana',
    slug: 'solana-labs',
    name: 'Solana Foundation',
    description: 'Decentralized blockchain built for fast, composable, high-throughput global applications.',
    websiteUrl: 'https://solana.com',
    logoUrl: 'https://avatars.githubusercontent.com/u/35608259?v=4',
    verifiedPlatforms: ['MLH'],
    technologies: ['Rust', 'TypeScript', 'Solidity', 'C', 'Web3'],
    topics: ['blockchain', 'cryptography', 'smart-contracts', 'high-throughput'],
    openOpportunitiesCount: 6,
    repositories: [
      { fullName: 'solana-labs/solana', description: 'Web-Scale Blockchain for fast, secure, scalable, decentralized apps and marketplaces', stars: 13000, primaryLanguage: 'Rust' },
      { fullName: 'solana-labs/solana-web3.js', description: 'Solana JavaScript SDK', stars: 3400, primaryLanguage: 'TypeScript' },
    ],
    recentActivitySummary: 'Client SDK improvements, developer documentation tutorials, and test validator tooling.',
    sourceProvenance: 'mlh_fellowship',
    hasBeginnerIssues: true,
    participationYears: [2022, 2023, 2024, 2025],
    totalProjects: 15,
  },
  {
    id: 'mlh-julia',
    slug: 'julia-lang',
    name: 'The Julia Language',
    description: 'High-level, high-performance dynamic programming language for scientific computing.',
    websiteUrl: 'https://julialang.org',
    logoUrl: 'https://avatars.githubusercontent.com/u/1644196?v=4',
    verifiedPlatforms: ['MLH', 'GSOC'],
    technologies: ['Julia', 'C', 'C++', 'LLVM', 'Python'],
    topics: ['scientific-computing', 'compiler', 'mathematics', 'data-science'],
    openOpportunitiesCount: 5,
    repositories: [
      { fullName: 'JuliaLang/julia', description: 'The Julia Programming Language', stars: 45000, primaryLanguage: 'Julia' },
    ],
    recentActivitySummary: 'Compiler code generation passes, standard library modernization, and package manager speed.',
    sourceProvenance: 'mlh_fellowship',
    hasBeginnerIssues: true,
    participationYears: [2020, 2021, 2022, 2023, 2024],
    totalProjects: 18,
  },
];

export class MLHProvider implements PlatformProvider {
  id = 'MLH';
  name = 'MLH Fellowship';

  async getOrganizations(filters: OrganizationFilterOptions): Promise<{ orgs: NormalizedOrganization[]; total: number }> {
    let filtered = [...MLH_ORGS];

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
    const match = MLH_ORGS.find(
      o => o.id === idOrSlug || o.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
    return match || null;
  }
}
