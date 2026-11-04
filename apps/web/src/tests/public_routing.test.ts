import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Public Routing & Navigation Architecture Tests', () => {
  it('1. App.tsx properly registers public and authenticated view routes', () => {
    const appTsxPath = path.resolve(__dirname, '../App.tsx');
    const content = fs.readFileSync(appTsxPath, 'utf-8');

    expect(content).toContain("PublicLandingPage");
    expect(content).toContain("LoginPage");
    expect(content).toContain("RegisterPage");
    expect(content).toContain("DocumentationPage");
    expect(content).toContain("DashboardPage");
    expect(content).toContain("IntegrationCenterPage");
    expect(content).toContain("OrbitAiPage");
  });

  it('2. Public landing page implements all primary sections and navigation targets', () => {
    const landingPath = path.resolve(__dirname, '../pages/PublicLandingPage.tsx');
    const content = fs.readFileSync(landingPath, 'utf-8');

    // Section anchor IDs and content blocks matching Figma
    expect(content).toContain('id="product"');
    expect(content).toContain('id="features"');
    expect(content).toContain('id="how-it-works"');
    expect(content).toContain('id="integrations"');
    expect(content).toContain('id="privacy"');
    expect(content).toContain('Your Skills. Your Code. Your Opportunities. One Universe.');
    expect(content).toContain('Your developer journey is scattered across too many tools.');
    expect(content).toContain('Bring your developer universe together.');
  });

  it('3. Documentation page includes complete architecture and system reference modules', () => {
    const docPath = path.resolve(__dirname, '../pages/DocumentationPage.tsx');
    const content = fs.readFileSync(docPath, 'utf-8');

    expect(content).toContain('Quick Start & Architecture Overview');
    expect(content).toContain('GitHub Direct OAuth & Repository Sync');
    expect(content).toContain('Orbit DSA & Spaced Repetition Engine');
    expect(content).toContain('Orbit AI Studio & Local Ollama Pairing');
    expect(content).toContain('Local-First Data Guarantees & Multi-User Isolation');
  });
});
