import fs from 'fs';
import path from 'path';
import { PlatformProvider, NormalizedOrganization, OrganizationFilterOptions } from './types.js';

let staticDataCache: Record<string, { source: string; retrievedAt: string; organizations: NormalizedOrganization[] }> | null = null;

function loadStaticData() {
  if (staticDataCache) return staticDataCache;
  const dataPath = path.resolve(__dirname, '../../../database/data/static_organizations.json');
  try {
    if (fs.existsSync(dataPath)) {
      staticDataCache = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } else {
      staticDataCache = {};
    }
  } catch {
    staticDataCache = {};
  }
  return staticDataCache!;
}

export class StaticProvider implements PlatformProvider {
  constructor(
    public id: string,
    public name: string,
    private platformKey: string
  ) {}

  private getOrgs(): NormalizedOrganization[] {
    const data = loadStaticData();
    const entry = data[this.platformKey];
    return entry?.organizations || [];
  }

  async getOrganizations(filters: OrganizationFilterOptions): Promise<{ orgs: NormalizedOrganization[]; total: number }> {
    let filtered = [...this.getOrgs()];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        o => o.name.toLowerCase().includes(q) ||
             o.description.toLowerCase().includes(q) ||
             o.technologies.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters.technologies && filters.technologies.length > 0) {
      const techList = filters.technologies.map(t => t.toLowerCase());
      if (filters.techLogic === 'AND') {
        filtered = filtered.filter(o => {
          const oTech = o.technologies.map(t => t.toLowerCase());
          return techList.every(t => oTech.includes(t));
        });
      } else {
        filtered = filtered.filter(o => {
          const oTech = o.technologies.map(t => t.toLowerCase());
          return techList.some(t => oTech.includes(t));
        });
      }
    }

    if (filters.year) {
      filtered = filtered.filter(o => o.participationYears.includes(Number(filters.year)));
    }

    if (filters.hasBeginnerIssues) {
      filtered = filtered.filter(o => o.hasBeginnerIssues);
    }

    const total = filtered.length;
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(1000, Math.max(1, filters.limit || 24));
    const skip = (page - 1) * limit;

    return {
      orgs: filtered.slice(skip, skip + limit),
      total,
    };
  }

  async getOrganization(idOrSlug: string): Promise<NormalizedOrganization | null> {
    const target = idOrSlug.toLowerCase();
    const org = this.getOrgs().find(o => o.id.toLowerCase() === target || o.slug.toLowerCase() === target);
    return org || null;
  }
}
