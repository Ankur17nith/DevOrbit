import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Figma Brand Identity & Design Tokens Conformance', () => {
  it('1. CSS globals contains mandatory Figma palette tokens', () => {
    const globalsCssPath = path.resolve(__dirname, '../styles/globals.css');
    const cssContent = fs.readFileSync(globalsCssPath, 'utf-8');

    // Mandatory Figma Brand Colors
    expect(cssContent).toContain('--orbit-black: #0B0D12');
    expect(cssContent).toContain('--electric-violet: #8B5CF6');
    expect(cssContent).toContain('--soft-white: #F8FAFC');
    expect(cssContent).toContain('--signal-gray: #686D79');
    expect(cssContent).toContain('--surface: #12151D');
    expect(cssContent).toContain('--border-subtle: #1F2430');
  });

  it('2. Tailwind configuration extends figma color namespace', () => {
    const tailwindConfigPath = path.resolve(__dirname, '../../tailwind.config.js');
    const tailwindContent = fs.readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindContent).toContain("darkSection: '#0B0D12'");
    expect(tailwindContent).toContain("violet: '#8B5CF6'");
    expect(tailwindContent).toContain("borderLight: '#E2E8F0'");
    expect(tailwindContent).toContain("publicBg: '#FFFFFF'");
  });

  it('3. Confirms zero emerald green brand bleed (#10B981) in critical design tokens', () => {
    const globalsCssPath = path.resolve(__dirname, '../styles/globals.css');
    const cssContent = fs.readFileSync(globalsCssPath, 'utf-8');

    // The primary accent variable must NEVER be emerald green
    const primaryLine = cssContent.split('\n').find(l => l.includes('--primary:') && !l.includes('--primary-hover'));
    expect(primaryLine).toBeDefined();
    expect(primaryLine).not.toContain('#10B981');
    expect(primaryLine).toContain('#8B5CF6'); // Electric violet
  });
});
