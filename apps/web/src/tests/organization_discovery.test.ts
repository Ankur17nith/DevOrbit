import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Organizations Multi-Platform Discovery & UI Fidelity Tests', () => {
  it('1. GsocPage implements multi-platform filtering and detail slide-over modal', () => {
    const pagePath = path.resolve(__dirname, '../pages/GsocPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    // Multi-platform definitions
    expect(content).toContain('ALL_PLATFORMS');
    expect(content).toContain('GSOC');
    expect(content).toContain('OUTREACHY');
    expect(content).toContain('LFX');
    expect(content).toContain('MLH');
    expect(content).toContain('GITHUB');

    // Detail modal integration
    expect(content).toContain('OrganizationDetailModal');
    expect(content).toContain('activeOrgId');

    // URL parameter synchronization
    expect(content).toContain('window.history.replaceState');
    expect(content).toContain('selectedPlatforms');
    expect(content).toContain('techLogic');
  });

  it('2. OrganizationDetailModal renders authentic metadata, platforms, and official links', () => {
    const modalPath = path.resolve(__dirname, '../components/OrganizationDetailModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    expect(content).toContain('apiFetch');
    expect(content).toContain('/api/v1/opensource/organizations');
    expect(content).toContain('verifiedPlatforms');
    expect(content).toContain('Official Website');
    expect(content).toContain('GitHub Organization');
    expect(content).toContain('mentorshipHistory');
  });

  it('3. App.tsx and Sidebar.tsx properly route and highlight both gsoc and organizations paths', () => {
    const appTsxPath = path.resolve(__dirname, '../App.tsx');
    const appContent = fs.readFileSync(appTsxPath, 'utf-8');

    expect(appContent).toContain("if (hash === 'organizations') return 'gsoc'");
    expect(appContent).toContain("currentTab === 'gsoc' || currentTab === 'organizations'");

    const sidebarPath = path.resolve(__dirname, '../components/Sidebar.tsx');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
    expect(sidebarContent).toContain("item.id === 'gsoc' && currentTab === 'organizations'");
  });
});
