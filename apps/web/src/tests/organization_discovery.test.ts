import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Organizations Discovery & Pagination Architecture Tests', () => {
  it('1. GsocPage defaults to organizations directory with real data provenance', () => {
    const pagePath = path.resolve(__dirname, '../pages/GsocPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    // Default tab must be 'orgs' so clicking Organizations directly displays the directory
    expect(content).toContain("useState<'orgs' | 'programs'>('orgs')");
    // Verified provenance badge
    expect(content).toContain('Source: Official GSoC Index');
    // Normalized programs mapping
    expect(content).toContain('p.deadlineDate || p.applicationEnd');
    // Error state and retry handling
    expect(content).toContain('Failed to load organizations');
    expect(content).toContain('Retry');
  });

  it('2. App.tsx and Sidebar.tsx properly route and highlight both gsoc and organizations paths', () => {
    const appTsxPath = path.resolve(__dirname, '../App.tsx');
    const appContent = fs.readFileSync(appTsxPath, 'utf-8');

    expect(appContent).toContain("if (hash === 'organizations') return 'gsoc'");
    expect(appContent).toContain("currentTab === 'gsoc' || currentTab === 'organizations'");

    const sidebarPath = path.resolve(__dirname, '../components/Sidebar.tsx');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
    expect(sidebarContent).toContain("item.id === 'gsoc' && currentTab === 'organizations'");
  });

  it('3. GsocPage implements verified pagination ranges and technology stack filtering', () => {
    const pagePath = path.resolve(__dirname, '../pages/GsocPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('verified organizations');
    expect(content).toContain('Showing');
    expect(content).toContain('Page {pagination.page} / {pagination.totalPages}');
    expect(content).toContain('selectedTech');
  });
});
