import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import { app } from '../app.js';
import { AstParser } from '../modules/navigator/ast_parser.js';
import { GraphBuilder } from '../modules/navigator/graph_builder.js';
import { NavigatorService, NAVIGATOR_ROOT } from '../modules/navigator/navigator.service.js';

describe('Orbit Codebase Navigator & AST Indexing Tests (Milestone M5)', () => {
  const service = new NavigatorService();
  const repoRoot = NAVIGATOR_ROOT;
  let authToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `navigator_test_${Date.now()}@devorbit.test`,
        username: `nav_tester_${Date.now()}`,
        password: 'NavPassword123!',
        name: 'Nav Tester',
      });
    authToken = res.body.data.token;
  });

  // 1. Language Detection
  it('1. Correctly classifies file extensions into language categories', () => {
    expect(AstParser.detectLanguage('src/app.ts')).toBe('typescript');
    expect(AstParser.detectLanguage('components/Button.tsx')).toBe('typescript');
    expect(AstParser.detectLanguage('scripts/deploy.js')).toBe('javascript');
    expect(AstParser.detectLanguage('ai/model.py')).toBe('python');
    expect(AstParser.detectLanguage('daemon/main.go')).toBe('go');
    expect(AstParser.detectLanguage('src/lib.rs')).toBe('rust');
    expect(AstParser.detectLanguage('package.json')).toBe('json');
    expect(AstParser.detectLanguage('README.md')).toBe('markdown');
  });

  // 2. TypeScript AST Parsing
  it('2. Extracts functions, classes, interfaces, methods, imports, and exports via TypeScript Compiler AST', () => {
    const tsCode = `
import { Router } from 'express';
import { helper } from './utils';

export interface UserConfig {
  id: string;
  enabled: boolean;
}

export type Status = 'active' | 'inactive';

export class Engine {
  public start(): void {
    console.log('started');
  }
}

export function computeMetric(a: number, b: number): number {
  return a + b;
}

export const API_VERSION = 'v1';
`;

    const parsed = AstParser.parseFile('test/sample.ts', '/abs/test/sample.ts', tsCode);
    expect(parsed.language).toBe('typescript');
    expect(parsed.imports).toContain('express');
    expect(parsed.imports).toContain('./utils');

    const symbolNames = parsed.symbols.map(s => s.name);
    expect(symbolNames).toContain('UserConfig');
    expect(symbolNames).toContain('Status');
    expect(symbolNames).toContain('Engine');
    expect(symbolNames).toContain('Engine.start');
    expect(symbolNames).toContain('computeMetric');
    expect(symbolNames).toContain('API_VERSION');

    const computeFn = parsed.symbols.find(s => s.name === 'computeMetric');
    expect(computeFn?.kind).toBe('function');
    expect(computeFn?.exported).toBe(true);
    expect(computeFn?.startLine).toBeGreaterThan(0);
    expect(computeFn?.endLine).toBeGreaterThanOrEqual(computeFn?.startLine || 0);

    const iface = parsed.symbols.find(s => s.name === 'UserConfig');
    expect(iface?.kind).toBe('interface');
    expect(iface?.exported).toBe(true);
  });

  // 3. Multi-Language Parsing (Python, Go, Rust)
  it('3. Extracts symbols from Python, Go, and Rust files', () => {
    const pyCode = `
import os
from datetime import datetime

class DataPipeline:
    def process(self):
        pass

def calculate_checksum(data):
    return hash(data)
`;
    const pyParsed = AstParser.parseFile('pipeline.py', '/abs/pipeline.py', pyCode);
    expect(pyParsed.language).toBe('python');
    expect(pyParsed.symbols.some(s => s.name === 'DataPipeline' && s.kind === 'class')).toBe(true);
    expect(pyParsed.symbols.some(s => s.name === 'calculate_checksum' && s.kind === 'function')).toBe(true);

    const goCode = `
package main
import "fmt"

type Worker struct {
    ID int
}

func NewWorker(id int) *Worker {
    return &Worker{ID: id}
}
`;
    const goParsed = AstParser.parseFile('worker.go', '/abs/worker.go', goCode);
    expect(goParsed.language).toBe('go');
    expect(goParsed.symbols.some(s => s.name === 'Worker' && s.kind === 'struct')).toBe(true);
    expect(goParsed.symbols.some(s => s.name === 'NewWorker' && s.kind === 'function')).toBe(true);

    const rsCode = `
use std::collections::HashMap;

pub struct CacheManager {
    size: usize,
}

pub fn initialize() -> bool {
    true
}
`;
    const rsParsed = AstParser.parseFile('cache.rs', '/abs/cache.rs', rsCode);
    expect(rsParsed.language).toBe('rust');
    expect(rsParsed.symbols.some(s => s.name === 'CacheManager' && s.kind === 'struct')).toBe(true);
    expect(rsParsed.symbols.some(s => s.name === 'initialize' && s.kind === 'function')).toBe(true);
  });

  // 4. Dependency Graph & Mermaid Generation
  it('4. Constructs dependency graph and valid Mermaid flowchart from parsed files', () => {
    const fileA = AstParser.parseFile(
      'src/controller.ts',
      '/abs/src/controller.ts',
      `import { Service } from './service';\nexport class Controller {}`
    );
    const fileB = AstParser.parseFile(
      'src/service.ts',
      '/abs/src/service.ts',
      `export class Service {}`
    );

    const graph = GraphBuilder.buildGraph([fileA, fileB]);
    expect(graph.nodes.length).toBe(2);
    expect(graph.edges.length).toBe(1);
    expect(graph.edges[0].from).toBe('src/controller.ts');
    expect(graph.edges[0].to).toBe('src/service.ts');
    expect(graph.mermaid).toContain('flowchart TD');
    expect(graph.mermaid).toContain('src_controller_ts');
  });

  // 5. Full Repository Indexing via NavigatorService
  it('5. Indexes repository structure, counts files and lines, and builds hierarchical file tree', async () => {
    const summary = await service.indexRepository(repoRoot);
    expect(summary.totalFiles).toBeGreaterThan(15);
    expect(summary.totalLines).toBeGreaterThan(1000);
    expect(summary.totalSymbols).toBeGreaterThan(50);
    expect(summary.languages['typescript']).toBeDefined();
    expect(summary.fileTree.children?.length).toBeGreaterThan(0);
  });

  // 6. Source-Grounded Symbol Search with exact line links
  it('6. Searches symbols and provides source-grounded links with line ranges', () => {
    const results = service.searchSymbols('NavigatorService');
    expect(results.length).toBeGreaterThanOrEqual(1);
    const match = results[0];
    expect(match.name).toBe('NavigatorService');
    expect(match.link).toMatch(/#L\d+-L\d+/);
  });

  // 7. File Details and Content Retrieval
  it('7. Retrieves file outline and raw content for preview', async () => {
    const details = await service.getFileDetails('apps/api/src/server.ts');
    expect(details.content).toContain('DevOrbit API server');
    expect(details.fileIndex?.language).toBe('typescript');
  });

  // 8. End-to-End HTTP API Endpoints
  it('8. Serves Navigator API endpoints (/summary, /symbols, /graph, /file)', async () => {
    const summaryRes = await request(app)
      .get('/api/v1/navigator/summary')
      .set('Authorization', `Bearer ${authToken}`);
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.success).toBe(true);
    expect(summaryRes.body.data.totalFiles).toBeGreaterThan(0);

    const searchRes = await request(app)
      .get('/api/v1/navigator/symbols?q=AstParser')
      .set('Authorization', `Bearer ${authToken}`);
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.success).toBe(true);
    expect(searchRes.body.data.count).toBeGreaterThan(0);

    const graphRes = await request(app)
      .get('/api/v1/navigator/graph')
      .set('Authorization', `Bearer ${authToken}`);
    expect(graphRes.status).toBe(200);
    expect(graphRes.body.success).toBe(true);
    expect(graphRes.body.data.mermaid).toContain('flowchart TD');

    const fileRes = await request(app)
      .get('/api/v1/navigator/file?filePath=apps/api/src/server.ts')
      .set('Authorization', `Bearer ${authToken}`);
    expect(fileRes.status).toBe(200);
    expect(fileRes.body.success).toBe(true);
    expect(fileRes.body.data.content).toBeDefined();
  });
});
