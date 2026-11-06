import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { App } from '../App.js';
import fs from 'fs';
import path from 'path';

describe('Public Routing & Navigation Architecture Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false, data: null }),
      text: async () => JSON.stringify({ success: false }),
      headers: new Headers({ 'content-type': 'application/json' }),
    }));
    localStorage.clear();
  });

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

  it('4. Real render: renders PublicLandingPage on default root route', async () => {
    window.location.hash = '';
    window.history.pushState({}, '', '/');

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText(/Your Skills\. Your Code\. Your Opportunities\. One Universe\./i)).toBeInTheDocument();
  });

  it('5. Real render: renders LoginPage when navigated to #login', async () => {
    window.location.hash = '#login';

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByRole('heading', { name: /Sign in to DevOrbit/i })).toBeInTheDocument();
  });

  it('6. Real render: renders DocumentationPage when navigated to #docs', async () => {
    window.location.hash = '#docs';

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByRole('heading', { name: /Quick Start & Architecture Overview/i })).toBeInTheDocument();
  });
});
