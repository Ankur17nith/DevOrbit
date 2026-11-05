/**
 * DevOrbit Canonical Repository Normalizer & Validator
 * 
 * Enforces unified data contract for GitHub repositories across
 * Issues, Trending, Catalog, and Recommendations.
 * Ensures owner and identity fields are never null or "undefined".
 */

export interface CanonicalRepository {
  id: string;
  owner: string;
  ownerLogin: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  primaryLanguage: string | null;
  language?: string | null;
  stars: number;
  stargazersCount: number;
  forks: number;
  forksCount: number;
  topics: string[];
  defaultBranch: string;
  updatedAt: string;
  license?: string | null;
  isVerified?: boolean;
}

/**
 * Validates that a repository record contains non-empty, non-"undefined" owner and name.
 */
export function isValidRepository(repo: any): boolean {
  if (!repo || typeof repo !== 'object') return false;
  
  const owner = repo.ownerLogin || (typeof repo.owner === 'string' ? repo.owner : repo.owner?.login);
  const name = repo.name;
  const fullName = repo.fullName || repo.full_name;

  if (!owner || owner === 'undefined' || owner.trim().length === 0) return false;
  if (!name || name === 'undefined' || name.trim().length === 0) return false;
  if (fullName && fullName.startsWith('undefined/')) return false;

  return true;
}

/**
 * Normalizes any database, GitHub API, or catalog repository record
 * into the canonical CanonicalRepository representation.
 */
export function normalizeRepository(raw: any): CanonicalRepository {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Cannot normalize invalid or null repository record');
  }

  // 1. Determine owner
  let owner = '';
  if (typeof raw.owner === 'string' && raw.owner !== 'undefined' && raw.owner.trim().length > 0) {
    owner = raw.owner.trim();
  } else if (raw.owner?.login && raw.owner.login !== 'undefined') {
    owner = raw.owner.login.trim();
  } else if (typeof raw.ownerLogin === 'string' && raw.ownerLogin !== 'undefined') {
    owner = raw.ownerLogin.trim();
  }

  // 2. Determine name
  let name = '';
  if (typeof raw.name === 'string' && raw.name !== 'undefined' && raw.name.trim().length > 0) {
    name = raw.name.trim();
  }

  // 3. Fallback extraction from fullName or repoLink or htmlUrl
  const compositeIdentifier = raw.fullName || raw.full_name || raw.repoLink;
  if (compositeIdentifier && typeof compositeIdentifier === 'string' && compositeIdentifier.includes('/')) {
    const parts = compositeIdentifier.split('/');
    if ((!owner || owner === 'undefined') && parts[0] && parts[0] !== 'undefined') {
      owner = parts[0].trim();
    }
    if ((!name || name === 'undefined') && parts[1] && parts[1] !== 'undefined') {
      name = parts[1].trim();
    }
  }

  // Fallback from htmlUrl
  const urlCandidate = raw.htmlUrl || raw.html_url || raw.url;
  if ((!owner || !name) && urlCandidate && typeof urlCandidate === 'string' && urlCandidate.includes('github.com/')) {
    const urlParts = urlCandidate.split('github.com/')[1]?.split('/');
    if (urlParts && urlParts.length >= 2) {
      if (!owner && urlParts[0]) owner = urlParts[0].trim();
      if (!name && urlParts[1]) name = urlParts[1].replace(/#.*$/, '').trim();
    }
  }

  // Final check: Owner and name must never be undefined
  if (!owner || owner === 'undefined') {
    throw new Error(`Repository record missing valid owner: ${JSON.stringify(raw)}`);
  }
  if (!name || name === 'undefined') {
    throw new Error(`Repository record missing valid name: ${JSON.stringify(raw)}`);
  }

  const fullName = `${owner}/${name}`;
  const htmlUrl = raw.htmlUrl || raw.html_url || `https://github.com/${fullName}`;

  // Parse topics
  let topics: string[] = [];
  if (Array.isArray(raw.topics)) {
    topics = raw.topics.map((t: any) => (typeof t === 'string' ? t : t.name || String(t)));
  } else if (typeof raw.topicsJson === 'string') {
    try {
      const parsed = JSON.parse(raw.topicsJson);
      if (Array.isArray(parsed)) topics = parsed;
    } catch {}
  }

  return {
    id: raw.id || `github:${fullName}`,
    owner,
    ownerLogin: owner,
    name,
    fullName,
    htmlUrl,
    description: raw.description ?? null,
    primaryLanguage: raw.primaryLanguage || raw.language || null,
    language: raw.primaryLanguage || raw.language || null,
    stars: Number(raw.stars ?? raw.stargazersCount ?? raw.stargazers_count ?? 0),
    stargazersCount: Number(raw.stars ?? raw.stargazersCount ?? raw.stargazers_count ?? 0),
    forks: Number(raw.forks ?? raw.forksCount ?? raw.forks_count ?? 0),
    forksCount: Number(raw.forks ?? raw.forksCount ?? raw.forks_count ?? 0),
    topics,
    defaultBranch: raw.defaultBranch || raw.default_branch || 'main',
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),
    license: typeof raw.license === 'object' ? raw.license?.spdx_id || raw.license?.name : raw.license || null,
    isVerified: Boolean(raw.isVerified ?? false),
  };
}
