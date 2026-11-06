export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: Date;
}

export interface GitHubUserValidation {
  valid: boolean;
  user: {
    login: string;
    name?: string;
    avatarUrl?: string;
    bio?: string;
    publicRepos?: number;
    totalPrivateRepos?: number;
  };
  scopes: string[];
  rateLimit: GitHubRateLimit;
}

export interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  private: boolean;
  fork: boolean;
  default_branch: string;
  topics?: string[];
  license?: { spdx_id?: string; name?: string } | null;
  pushed_at: string | null;
}

import { AppError } from '../../lib/errors.js';

export class GitHubApiError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    public rateLimit?: GitHubRateLimit,
    public isRateLimited: boolean = false
  ) {
    super(message, statusCode, { rateLimit, isRateLimited });
    this.name = 'GitHubApiError';
  }
}

export class GitHubClient {
  private baseUrl = 'https://api.github.com';

  private parseRateLimit(headers: Headers): GitHubRateLimit {
    const limit = parseInt(headers.get('x-ratelimit-limit') || '5000', 10);
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '5000', 10);
    const resetTimestamp = parseInt(headers.get('x-ratelimit-reset') || '0', 10);
    const reset = resetTimestamp > 0 ? new Date(resetTimestamp * 1000) : new Date(Date.now() + 3600000);
    return { limit, remaining, reset };
  }

  private parseScopes(headers: Headers): string[] {
    const rawScopes = headers.get('x-oauth-scopes') || '';
    return rawScopes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  /**
   * Validates a GitHub Personal Access Token or OAuth token by fetching authenticated user details.
   */
  async validateToken(token: string): Promise<GitHubUserValidation> {
    try {
      const res = await fetch(`${this.baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'DevOrbit-Platform/1.0',
        },
      });

      const rateLimit = this.parseRateLimit(res.headers);
      const scopes = this.parseScopes(res.headers);

      if (res.status === 401) {
        throw new GitHubApiError('GitHub token is invalid or has expired', 401, rateLimit);
      }

      if (res.status === 403 && rateLimit.remaining === 0) {
        throw new GitHubApiError(
          `GitHub API rate limit exceeded. Resets at ${rateLimit.reset.toISOString()}`,
          403,
          rateLimit,
          true
        );
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new GitHubApiError(
          (errorData as any).message || `GitHub API error (${res.status})`,
          res.status,
          rateLimit
        );
      }

      const data = (await res.json()) as any;
      return {
        valid: true,
        user: {
          login: data.login,
          name: data.name,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          publicRepos: data.public_repos,
          totalPrivateRepos: data.total_private_repos,
        },
        scopes,
        rateLimit,
      };
    } catch (err: any) {
      if (err instanceof GitHubApiError) throw err;
      throw new GitHubApiError(`Network connection to GitHub failed: ${err.message}`, 503);
    }
  }

  /**
   * Fetches repositories for the authenticated user with ETag caching support.
   */
  async fetchUserRepos(
    token: string,
    options: { etag?: string; page?: number; perPage?: number } = {}
  ): Promise<{
    repos: GitHubRepoResponse[];
    notModified: boolean;
    etag?: string;
    rateLimit: GitHubRateLimit;
  }> {
    const page = options.page || 1;
    const perPage = options.perPage || 100;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'DevOrbit-Platform/1.0',
    };

    if (options.etag) {
      headers['If-None-Match'] = options.etag;
    }

    try {
      const url = `${this.baseUrl}/user/repos?per_page=${perPage}&page=${page}&sort=pushed&affiliation=owner,collaborator`;
      const res = await fetch(url, { headers });

      const rateLimit = this.parseRateLimit(res.headers);
      const newEtag = res.headers.get('etag') || undefined;

      if (res.status === 304) {
        return {
          repos: [],
          notModified: true,
          etag: options.etag,
          rateLimit,
        };
      }

      if (res.status === 401) {
        throw new GitHubApiError('GitHub token is invalid or expired', 401, rateLimit);
      }

      if (res.status === 403 && rateLimit.remaining === 0) {
        throw new GitHubApiError('GitHub API rate limit exceeded', 403, rateLimit, true);
      }

      if (!res.ok) {
        throw new GitHubApiError(`Failed to fetch repos: ${res.statusText}`, res.status, rateLimit);
      }

      const data = (await res.json()) as GitHubRepoResponse[];
      return {
        repos: data,
        notModified: false,
        etag: newEtag,
        rateLimit,
      };
    } catch (err: any) {
      if (err instanceof GitHubApiError) throw err;
      throw new GitHubApiError(`Failed to fetch repositories: ${err.message}`, 503);
    }
  }

  /**
   * Fetches language breakdown in bytes for a repository.
   */
  async fetchRepoLanguages(token: string, owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/languages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'DevOrbit-Platform/1.0',
        },
      });

      if (!res.ok) return {};
      return (await res.json()) as Record<string, number>;
    } catch {
      return {};
    }
  }
}

export const githubClient = new GitHubClient();
