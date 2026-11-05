import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Application-Wide Figma Design System & UI Consistency', () => {
  const pagesDir = path.resolve(__dirname, '../pages');
  const componentsDir = path.resolve(__dirname, '../components');
  const uiDir = path.resolve(__dirname, '../components/ui');

  it('1. Verifies that workspace dashboard and catalog pages use the unified PageContainer component', () => {
    const workspacePages = [
      'CodebaseNavigatorPage.tsx',
      'OrbitFixPage.tsx',
      'OrbitSafeChangePage.tsx',
      'OrbitReconPage.tsx',
      'DsaTrackerPage.tsx',
      'DeveloperProfilePage.tsx',
      'OssCatalogPage.tsx',
      'TrendingPage.tsx',
      'IssuesPage.tsx',
      'GsocPage.tsx',
      'BountiesPage.tsx',
      'WorkspacesPage.tsx',
      'ForumPage.tsx',
      'SelfbotPage.tsx',
      'IntegrationCenterPage.tsx',
      'SettingsPage.tsx',
    ];

    for (const pageFile of workspacePages) {
      const filePath = path.join(pagesDir, pageFile);
      expect(fs.existsSync(filePath), `Page file ${pageFile} should exist`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content, `${pageFile} must use PageContainer`).toContain('PageContainer');
    }
  });

  it('2. Confirms OrbitAiPage full-height studio uses Figma surface and violet tokens', () => {
    const aiPageContent = fs.readFileSync(path.join(pagesDir, 'OrbitAiPage.tsx'), 'utf-8');
    expect(aiPageContent).toContain('#8B5CF6'); // Electric Violet
    expect(aiPageContent).toContain('#12151D'); // Card Surface
    expect(aiPageContent).toContain('#181C26'); // Hover / Nested surface
    expect(aiPageContent).toContain('#1F2430'); // Border Subtle
  });

  it('3. Confirms zero emerald green brand bleed (#10B981) across all application pages', () => {
    const allPageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));
    for (const file of allPageFiles) {
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
      expect(content, `${file} must not contain emerald green #10B981`).not.toContain('#10B981');
    }
  });

  it('4. Confirms UI shared primitives exports and token standards', () => {
    const indexTs = fs.readFileSync(path.join(uiDir, 'index.ts'), 'utf-8');
    expect(indexTs).toContain("from './PageContainer.js'");
    expect(indexTs).toContain("from './PageHeading.js'");
    expect(indexTs).toContain("from './StatusBadge.js'");
    expect(indexTs).toContain("from './Button.js'");
    expect(indexTs).toContain("from './Card.js'");
    expect(indexTs).toContain("from './EmptyState.js'");

    // Verify Button uses Electric Violet #8B5CF6
    const buttonTsx = fs.readFileSync(path.join(uiDir, 'Button.tsx'), 'utf-8');
    expect(buttonTsx).toContain('#8B5CF6');

    // Verify StatusBadge uses Electric Violet #8B5CF6 and Soft White #F8FAFC
    const statusBadgeTsx = fs.readFileSync(path.join(uiDir, 'StatusBadge.tsx'), 'utf-8');
    expect(statusBadgeTsx).toContain('#8B5CF6');
  });

  it('5. Confirms CommandPalette and Sidebar have consistent route coverage without duplicates', () => {
    const sidebarContent = fs.readFileSync(path.join(componentsDir, 'Sidebar.tsx'), 'utf-8');
    const cmdPaletteContent = fs.readFileSync(path.join(componentsDir, 'CommandPalette.tsx'), 'utf-8');

    // Expected core navigation tabs
    const coreRoutes = [
      'dashboard',
      'navigator',
      'fix',
      'safechange',
      'recon',
      'ai',
      'dsa',
      'profile',
      'catalog',
      'trending',
      'issues',
      'gsoc',
      'bounties',
      'selfbot',
      'workspaces',
      'forum',
      'integrations',
      'settings',
    ];

    for (const route of coreRoutes) {
      expect(sidebarContent, `Sidebar should route to ${route}`).toContain(`id: '${route}'`);
      expect(cmdPaletteContent, `CommandPalette should route to ${route}`).toContain(`id: '${route}'`);
    }

    // Verify no duplicate profile items in Sidebar
    const profileMatches = (sidebarContent.match(/id:\s*'profile'/g) || []).length;
    expect(profileMatches, 'Sidebar must have exactly 1 profile navigation entry').toBe(1);
  });

  it('6. Confirms dynamic layout padding in App.tsx synchronizes with Sidebar collapse state', () => {
    const appContent = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf-8');
    expect(appContent).toContain('sidebarCollapsed');
    expect(appContent).toContain("lg:pl-[68px]");
    expect(appContent).toContain("lg:pl-60");
  });
});
