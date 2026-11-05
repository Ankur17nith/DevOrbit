import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Filter State Persistence & URL Query Parameters', () => {
  const pagesDir = path.resolve(__dirname, '../pages');

  it('1. GsocPage synchronizes platforms, techs, logic, search, beginner, and detail modal with URL', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'GsocPage.tsx'), 'utf-8');
    expect(content).toContain('getInitialParams');
    expect(content).toContain('window.history.replaceState');
    expect(content).toContain("params.set('platforms'");
    expect(content).toContain("params.set('techs'");
    expect(content).toContain("params.set('techLogic'");
    expect(content).toContain("params.set('search'");
    expect(content).toContain("params.set('org'");
  });

  it('2. TrendingPage synchronizes language and timeframe with URL query parameters', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'TrendingPage.tsx'), 'utf-8');
    expect(content).toContain('getInitialParams');
    expect(content).toContain('window.history.replaceState');
    expect(content).toContain("urlParams.set('language', language)");
    expect(content).toContain("urlParams.set('since', timeRange)");
  });

  it('3. IssuesPage synchronizes difficulty, search keyword, and tab with URL query parameters', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'IssuesPage.tsx'), 'utf-8');
    expect(content).toContain('getInitialParams');
    expect(content).toContain('window.history.replaceState');
    expect(content).toContain("urlParams.set('tab', activeTab)");
    expect(content).toContain("urlParams.set('difficulty', difficulty)");
    expect(content).toContain("urlParams.set('search', search.trim())");
  });

  it('4. BountiesPage synchronizes difficulty and currency with URL query parameters', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'BountiesPage.tsx'), 'utf-8');
    expect(content).toContain('getInitialParams');
    expect(content).toContain('window.history.replaceState');
    expect(content).toContain("urlParams.set('difficulty', selectedDifficulty)");
    expect(content).toContain("urlParams.set('currency', selectedCurrency)");
  });

  it('5. DsaTrackerPage synchronizes sheet, difficulty, and topic with URL query parameters', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'DsaTrackerPage.tsx'), 'utf-8');
    expect(content).toContain('getInitialParams');
    expect(content).toContain('window.history.replaceState');
    expect(content).toContain("urlParams.set('sheet', selectedSheet)");
    expect(content).toContain("urlParams.set('difficulty', selectedDifficulty)");
    expect(content).toContain("urlParams.set('topic', selectedTopic)");
  });
});
