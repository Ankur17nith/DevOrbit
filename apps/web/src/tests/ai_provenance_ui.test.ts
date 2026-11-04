import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Orbit AI Provenance & Fallback UI Tests', () => {
  it('1. OrbitAiPage enforces explicit fallback badge vs real model badge', () => {
    const aiPagePath = path.resolve(__dirname, '../pages/OrbitAiPage.tsx');
    const content = fs.readFileSync(aiPagePath, 'utf-8');

    // Provenance badge tests
    expect(content).toContain('Generated via Deterministic Rule Engine (Offline Fallback)');
    expect(content).toContain('Local Neural Model:');
    expect(content).toContain('m.isFallback');
  });

  it('2. OrbitAiPage provides actionable Ollama offline banner with copy command', () => {
    const aiPagePath = path.resolve(__dirname, '../pages/OrbitAiPage.tsx');
    const content = fs.readFileSync(aiPagePath, 'utf-8');

    expect(content).toContain('Local Ollama is unreachable. Run');
    expect(content).toContain('ollama run qwen2.5-coder');
    expect(content).toContain('copyOllamaCmd');
  });

  it('3. OrbitAiPage dynamically displays model selector with offline fallback option', () => {
    const aiPagePath = path.resolve(__dirname, '../pages/OrbitAiPage.tsx');
    const content = fs.readFileSync(aiPagePath, 'utf-8');

    expect(content).toContain('Deterministic Rule Engine (Offline Fallback)');
    expect(content).toContain('Offline / Fallback Mode');
    expect(content).toContain('Local Ollama Connected (11434)');
  });
});
