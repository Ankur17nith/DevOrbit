/**
 * Multi-Platform Organization Discovery System Interfaces & Types
 */

export interface OrganizationRepositoryRef {
  fullName: string;
  name?: string;
  owner?: string;
  stars?: number;
  forks?: number;
  description?: string;
  primaryLanguage?: string;
  url?: string;
}

export interface NormalizedOrganization {
  id: string;
  slug: string;
  name: string;
  description: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  verifiedPlatforms: string[]; // e.g. ['GSOC', 'OUTREACHY', 'LFX', 'MLH', 'GITHUB']
  technologies: string[];
  topics: string[];
  openOpportunitiesCount: number;
  repositories: OrganizationRepositoryRef[];
  recentActivitySummary: string;
  sourceProvenance: string;
  hasBeginnerIssues: boolean;
  participationYears: number[];
  totalProjects: number;
  isSaved?: boolean;
}

export interface OrganizationDetail extends NormalizedOrganization {
  mentorshipHistory: Array<{
    platform: string;
    programName: string;
    year: number;
    projectCount?: number;
    stipendEligible?: boolean;
  }>;
  openIssues: Array<{
    id: string;
    number: number;
    title: string;
    url: string;
    difficulty?: string;
    labels: string[];
    repositoryFullName: string;
  }>;
  officialLinks: {
    website?: string;
    repositoryOrg?: string;
    contributingGuide?: string;
    communityChat?: string;
  };
}

export interface OrganizationFilterOptions {
  platforms?: string[];
  technologies?: string[];
  techLogic?: 'AND' | 'OR';
  search?: string;
  hasBeginnerIssues?: boolean;
  year?: number;
  page?: number;
  limit?: number;
  sortBy?: 'projects' | 'name' | 'opportunities';
}

export interface PlatformProvider {
  id: string; // GSOC, OUTREACHY, LFX, MLH, GITHUB
  name: string;
  getOrganizations(filters: OrganizationFilterOptions): Promise<{ orgs: NormalizedOrganization[]; total: number }>;
  getOrganization(idOrSlug: string): Promise<NormalizedOrganization | null>;
}
