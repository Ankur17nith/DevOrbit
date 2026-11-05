import { describe, it, expect } from 'vitest';
import { normalizeRepository, isValidRepository } from '../modules/opensource/repository.normalizer.js';
import { repairStoredRepositories } from '../modules/opensource/repair_repositories.js';
import { OpenSourceService } from '../modules/opensource/opensource.service.js';

describe('Canonical Repository Normalization & Data Integrity', () => {
  it('normalizes standard GitHub repository records correctly', () => {
    const raw = {
      id: 'repo-1',
      name: 'react',
      owner: { login: 'facebook' },
      description: 'The React library',
      language: 'JavaScript',
      stargazers_count: 230000,
      forks_count: 45000,
      topics: ['react', 'ui', 'frontend'],
      default_branch: 'main',
    };

    const normalized = normalizeRepository(raw);
    expect(normalized.owner).toBe('facebook');
    expect(normalized.ownerLogin).toBe('facebook');
    expect(normalized.name).toBe('react');
    expect(normalized.fullName).toBe('facebook/react');
    expect(normalized.htmlUrl).toBe('https://github.com/facebook/react');
    expect(normalized.stars).toBe(230000);
    expect(normalized.forks).toBe(45000);
    expect(normalized.primaryLanguage).toBe('JavaScript');
    expect(normalized.topics).toContain('react');
    expect(isValidRepository(normalized)).toBe(true);
  });

  it('correctly parses owner and name from composite repoLink or fullName', () => {
    const raw = {
      name: 'angular',
      repoLink: 'angular/angular',
      stargazers_count: 101000,
    };

    const normalized = normalizeRepository(raw);
    expect(normalized.owner).toBe('angular');
    expect(normalized.name).toBe('angular');
    expect(normalized.fullName).toBe('angular/angular');
    expect(normalized.htmlUrl).toBe('https://github.com/angular/angular');
    expect(isValidRepository(normalized)).toBe(true);
  });

  it('rejects records that contain undefined or invalid owners', () => {
    const malformed = {
      name: 'broken-repo',
      owner: 'undefined',
      fullName: 'undefined/broken-repo',
    };

    expect(isValidRepository(malformed)).toBe(false);
    expect(() => normalizeRepository(malformed)).toThrow(/missing valid owner/);
  });

  it('extracts owner and repo from html_url when owner is missing', () => {
    const raw = {
      html_url: 'https://github.com/ClankerNation/OpenAgents/issues/41',
      stars: 50,
    };

    const normalized = normalizeRepository(raw);
    expect(normalized.owner).toBe('ClankerNation');
    expect(normalized.name).toBe('OpenAgents');
    expect(normalized.fullName).toBe('ClankerNation/OpenAgents');
  });

  it('verifies that stored repositories in database have valid owners and zero undefined values', async () => {
    const service = new OpenSourceService();
    const trending = await service.getTrending({});
    
    expect(trending.length).toBeGreaterThan(0);
    for (const repo of trending) {
      expect(repo.owner).toBeDefined();
      expect(repo.owner).not.toBe('undefined');
      expect(repo.owner.length).toBeGreaterThan(0);
      expect(repo.fullName).not.toContain('undefined');
      expect(repo.fullName).toBe(`${repo.owner}/${repo.name}`);
    }

    const issuesRes = await service.getIssues({ limit: 10 });
    expect(issuesRes.issues.length).toBeGreaterThan(0);
    for (const issue of issuesRes.issues) {
      if (issue.repository) {
        expect(issue.repository.owner).toBeDefined();
        expect(issue.repository.owner).not.toBe('undefined');
        expect(issue.repository.fullName).not.toContain('undefined');
      }
    }
  });
});
