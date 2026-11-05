import { describe, it, expect } from 'vitest';

function getCleanRepoName(repo?: { fullName?: string; owner?: string; name?: string }, url?: string): string {
  if (repo?.fullName && !repo.fullName.startsWith('undefined/')) {
    return repo.fullName;
  }
  if (repo?.owner && repo?.name && repo.owner !== 'undefined' && repo.name !== 'undefined') {
    return `${repo.owner}/${repo.name}`;
  }
  if (url && url.includes('github.com/')) {
    const extracted = url.split('github.com/')[1]?.split('/issues/')[0];
    if (extracted && !extracted.includes('undefined')) return extracted;
  }
  return 'github/repository';
}

function getCleanTrendingRepo(repo: any): { owner: string; name: string; fullName: string } {
  const owner = (repo.owner && repo.owner !== 'undefined') 
    ? repo.owner 
    : (repo.fullName && !repo.fullName.startsWith('undefined/') ? repo.fullName.split('/')[0] : 'github');
  const name = (repo.name && repo.name !== 'undefined') 
    ? repo.name 
    : (repo.fullName && !repo.fullName.startsWith('undefined/') ? repo.fullName.split('/')[1] : 'repository');
  const fullName = repo.fullName && !repo.fullName.startsWith('undefined/') 
    ? repo.fullName 
    : `${owner}/${name}`;
  return { owner, name, fullName };
}

describe('Frontend Repository UI Contracts & Fallbacks', () => {
  it('never produces "undefined" for corrupted repository objects in issues', () => {
    const corruptedRepo = { fullName: 'undefined/angular', owner: 'undefined', name: 'angular' };
    const issueUrl = 'https://github.com/angular/angular/issues/843';

    const clean = getCleanRepoName(corruptedRepo, issueUrl);
    expect(clean).toBe('angular/angular');
    expect(clean).not.toContain('undefined');
  });

  it('correctly handles undefined or null repositories gracefully', () => {
    expect(getCleanRepoName(undefined, undefined)).toBe('github/repository');
    expect(getCleanRepoName({ fullName: 'facebook/react' })).toBe('facebook/react');
  });

  it('guarantees trending repo formatter never produces undefined owner', () => {
    const badRepo = { owner: 'undefined', name: 'dubbo', fullName: 'undefined/dubbo' };
    const formatted = getCleanTrendingRepo(badRepo);
    expect(formatted.owner).not.toBe('undefined');
    expect(formatted.fullName).not.toContain('undefined');

    const validRepo = { owner: 'apache', name: 'dubbo', fullName: 'apache/dubbo' };
    const validFormatted = getCleanTrendingRepo(validRepo);
    expect(validFormatted.owner).toBe('apache');
    expect(validFormatted.name).toBe('dubbo');
    expect(validFormatted.fullName).toBe('apache/dubbo');
  });
});
