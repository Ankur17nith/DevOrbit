import { PlatformProvider, NormalizedOrganization, OrganizationFilterOptions } from './types.js';

const LFX_ORGS: NormalizedOrganization[] = [
  {
    id: 'lfx-cncf',
    slug: 'cncf',
    name: 'Cloud Native Computing Foundation (CNCF)',
    description: 'The open source foundation building cloud native computing platforms: Kubernetes, Prometheus, Envoy, and Helm.',
    websiteUrl: 'https://www.cncf.io',
    logoUrl: 'https://avatars.githubusercontent.com/u/13434793?v=4',
    verifiedPlatforms: ['LFX', 'GSOC'],
    technologies: ['Go', 'Rust', 'Kubernetes', 'eBPF', 'Docker'],
    topics: ['cloud-native', 'containers', 'observability', 'networking'],
    openOpportunitiesCount: 12,
    repositories: [
      { fullName: 'kubernetes/kubernetes', description: 'Production-Grade Container Scheduling and Management', stars: 114000, primaryLanguage: 'Go' },
      { fullName: 'prometheus/prometheus', description: 'The Prometheus monitoring system and time series database', stars: 57000, primaryLanguage: 'Go' },
    ],
    recentActivitySummary: 'Spring & Fall mentorship terms across Kubernetes SIGs, Envoy WASM, and Cilium eBPF.',
    sourceProvenance: 'lfx_index',
    hasBeginnerIssues: true,
    participationYears: [2021, 2022, 2023, 2024, 2025],
    totalProjects: 36,
  },
  {
    id: 'lfx-hyperledger',
    slug: 'hyperledger',
    name: 'Hyperledger Foundation',
    description: 'Open source enterprise blockchain technologies hosted by The Linux Foundation.',
    websiteUrl: 'https://www.hyperledger.org',
    logoUrl: 'https://avatars.githubusercontent.com/u/16142750?v=4',
    verifiedPlatforms: ['LFX'],
    technologies: ['Go', 'Java', 'Rust', 'TypeScript', 'Solidity'],
    topics: ['blockchain', 'cryptography', 'distributed-ledger', 'enterprise'],
    openOpportunitiesCount: 6,
    repositories: [
      { fullName: 'hyperledger/fabric', description: 'Hyperledger Fabric enterprise blockchain platform', stars: 15400, primaryLanguage: 'Go' },
      { fullName: 'hyperledger/besu', description: 'An enterprise-grade Ethereum client in Java', stars: 2200, primaryLanguage: 'Java' },
    ],
    recentActivitySummary: 'Mentorship in zero-knowledge proofs, smart contract tooling, and identity management.',
    sourceProvenance: 'lfx_index',
    hasBeginnerIssues: true,
    participationYears: [2022, 2023, 2024, 2025],
    totalProjects: 14,
  },
  {
    id: 'lfx-openssf',
    slug: 'openssf',
    name: 'Open Source Security Foundation (OpenSSF)',
    description: 'Securing the open source software supply chain through automated tools and best practices.',
    websiteUrl: 'https://openssf.org',
    logoUrl: 'https://avatars.githubusercontent.com/u/69792612?v=4',
    verifiedPlatforms: ['LFX'],
    technologies: ['Go', 'Python', 'Rust', 'GitHub Actions', 'Security'],
    topics: ['security', 'supply-chain', 'sbom', 'vulnerability-management'],
    openOpportunitiesCount: 5,
    repositories: [
      { fullName: 'ossf/scorecard', description: 'Automated security tool to evaluate open source security postures', stars: 5800, primaryLanguage: 'Go' },
      { fullName: 'sigstore/cosign', description: 'Code signing and transparency for software artifacts', stars: 4500, primaryLanguage: 'Go' },
    ],
    recentActivitySummary: 'Supply chain provenance tooling, automated security linter extensions, and SLSA compliance.',
    sourceProvenance: 'lfx_index',
    hasBeginnerIssues: true,
    participationYears: [2023, 2024, 2025],
    totalProjects: 10,
  },
  {
    id: 'lfx-zephyr',
    slug: 'zephyr-project',
    name: 'Zephyr Project',
    description: 'A scalable real-time operating system (RTOS) supporting multiple hardware architectures for IoT.',
    websiteUrl: 'https://www.zephyrproject.org',
    logoUrl: 'https://avatars.githubusercontent.com/u/15006622?v=4',
    verifiedPlatforms: ['LFX'],
    technologies: ['C', 'Python', 'Assembly', 'CMake', 'Embedded'],
    topics: ['iot', 'rtos', 'hardware', 'embedded', 'microcontrollers'],
    openOpportunitiesCount: 4,
    repositories: [
      { fullName: 'zephyrproject-rtos/zephyr', description: 'Primary Zephyr RTOS source tree', stars: 10800, primaryLanguage: 'C' },
    ],
    recentActivitySummary: 'Hardware peripheral drivers, BLE Bluetooth mesh stack optimizations, and POSIX compliance.',
    sourceProvenance: 'lfx_index',
    hasBeginnerIssues: true,
    participationYears: [2022, 2023, 2024],
    totalProjects: 12,
  },
  {
    id: 'lfx-graphql',
    slug: 'graphql-foundation',
    name: 'GraphQL Foundation',
    description: 'Driving the ecosystem of GraphQL specifications, reference implementations, and tooling.',
    websiteUrl: 'https://graphql.org',
    logoUrl: 'https://avatars.githubusercontent.com/u/12972006?v=4',
    verifiedPlatforms: ['LFX'],
    technologies: ['TypeScript', 'JavaScript', 'Rust', 'Python', 'GraphQL'],
    topics: ['api', 'specifications', 'query-language', 'developer-tools'],
    openOpportunitiesCount: 4,
    repositories: [
      { fullName: 'graphql/graphql-js', description: 'Reference implementation of GraphQL for JavaScript', stars: 20100, primaryLanguage: 'TypeScript' },
    ],
    recentActivitySummary: 'Composite schema validation, client code generators, and streaming parser improvements.',
    sourceProvenance: 'lfx_index',
    hasBeginnerIssues: true,
    participationYears: [2022, 2023, 2024],
    totalProjects: 8,
  },
];

export class LFXProvider implements PlatformProvider {
  id = 'LFX';
  name = 'LFX Mentorship';

  async getOrganizations(filters: OrganizationFilterOptions): Promise<{ orgs: NormalizedOrganization[]; total: number }> {
    let filtered = [...LFX_ORGS];

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
    const match = LFX_ORGS.find(
      o => o.id === idOrSlug || o.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
    return match || null;
  }
}
