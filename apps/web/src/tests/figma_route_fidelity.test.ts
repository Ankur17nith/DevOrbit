import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Figma Route Fidelity & Visual Validation Tests', () => {
  const pagesDir = path.resolve(__dirname, '../pages');
  const validationDir = path.resolve(__dirname, '../../../../docs/design/visual-validation');

  it('1. Verifies that all 17 authenticated application pages exist and import PageContainer', () => {
    const appPages = [
      'DashboardPage.tsx',
      'CodebaseNavigatorPage.tsx',
      'OrbitFixPage.tsx',
      'OrbitSafeChangePage.tsx',
      'OrbitReconPage.tsx',
      'OrbitAiPage.tsx',
      'DsaTrackerPage.tsx',
      'DeveloperProfilePage.tsx',
      'OssCatalogPage.tsx',
      'TrendingPage.tsx',
      'GsocPage.tsx',
      'IssuesPage.tsx',
      'BountiesPage.tsx',
      'SelfbotPage.tsx',
      'WorkspacesPage.tsx',
      'ForumPage.tsx',
      'IntegrationCenterPage.tsx',
      'SettingsPage.tsx',
    ];

    for (const page of appPages) {
      const filePath = path.join(pagesDir, page);
      expect(fs.existsSync(filePath), `Page file ${page} should exist`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content, `${page} must import and render PageContainer`).toContain('PageContainer');
    }
  });

  it('2. Confirms that all application pages strictly avoid emerald green (#10B981)', () => {
    const allPages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));
    for (const page of allPages) {
      const content = fs.readFileSync(path.join(pagesDir, page), 'utf-8');
      expect(content, `${page} must not contain emerald green #10B981`).not.toContain('#10B981');
    }
  });

  it('3. Confirms that Open Source pages reflect Figma eyebrows and accurate provenance', () => {
    const ossPages = ['OssCatalogPage.tsx', 'TrendingPage.tsx', 'GsocPage.tsx', 'IssuesPage.tsx', 'BountiesPage.tsx', 'SelfbotPage.tsx'];
    for (const p of ossPages) {
      const content = fs.readFileSync(path.join(pagesDir, p), 'utf-8');
      expect(content, `${p} should have Open source eyebrow`).toContain('Open source');
      expect(content, `${p} should contain honest provenance disclaimer`).toContain('Results require a connected source. DevOrbit does not fabricate issues, amounts, deadlines, or activity.');
    }
  });

  it('4. Confirms that IntegrationCenterPage covers all 6 canonical developer integrations', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'IntegrationCenterPage.tsx'), 'utf-8');
    expect(content).toContain('GitHub');
    expect(content).toContain('OAuth');
    expect(content).toContain('Codeforces');
    expect(content).toContain('Username API');
    expect(content).toContain('LeetCode');
    expect(content).toContain('GraphQL API');
    expect(content).toContain('Take U Forward');
    expect(content).toContain('Progress Import');
    expect(content).toContain('Ollama Local Service');
    expect(content).toContain('Local service');
    expect(content).toContain('DSA Curriculums');
  });

  it('5. Confirms that SettingsPage covers all 7 Figma sections', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'SettingsPage.tsx'), 'utf-8');
    const sections = ['General', 'Account', 'Security', 'Privacy', 'Notifications', 'AI Settings', 'Data & Backups'];
    for (const s of sections) {
      expect(content).toContain(s);
    }
  });

  it('6. Verifies that high-resolution visual validation captures exist on disk', () => {
    expect(fs.existsSync(validationDir), 'visual-validation directory must exist').toBe(true);

    const requiredScreenshots = [
      'dashboard_1440px.png',
      'navigator_1440px.png',
      'fix_1440px.png',
      'safechange_1440px.png',
      'recon_1440px.png',
      'ai_1440px.png',
      'dsa_1440px.png',
      'profile_1440px.png',
      'catalog_1440px.png',
      'trending_1440px.png',
      'organizations_1440px.png',
      'issues_1440px.png',
      'bounties_1440px.png',
      'contributions_1440px.png',
      'workspaces_1440px.png',
      'community_1440px.png',
      'integrations_1440px.png',
      'settings_1440px.png',
      'documentation_1440px.png',
      'dashboard_1024px.png',
      'dashboard_768px.png',
      'dashboard_390px.png',
      'catalog_1024px.png',
      'catalog_768px.png',
      'catalog_390px.png',
    ];

    for (const shot of requiredScreenshots) {
      const shotPath = path.join(validationDir, shot);
      expect(fs.existsSync(shotPath), `Screenshot ${shot} should exist`).toBe(true);
      const stat = fs.statSync(shotPath);
      expect(stat.size, `Screenshot ${shot} must be non-empty image (> 10KB)`).toBeGreaterThan(10000);
    }
  });
});
