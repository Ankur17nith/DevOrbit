import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { applyPatch } from 'diff';
import { RootCauseEngine } from './root_cause_engine.js';
import { StackParser } from './stack_parser.js';
import { 
  PatchProposal, 
  PatchResult,
  RootCauseAnalysis, 
  VerificationResult 
} from './fix.types.js';
import { NAVIGATOR_ROOT } from '../navigator/navigator.service.js';

export class FixService {
  /**
   * Parse error log and generate root cause analysis scoped to NAVIGATOR_ROOT
   */
  public analyzeError(rawLog: string): RootCauseAnalysis {
    const parsed = StackParser.parse(rawLog);
    return RootCauseEngine.analyze(parsed, NAVIGATOR_ROOT);
  }

  /**
   * Generate patch proposal from analysis scoped to NAVIGATOR_ROOT
   */
  public proposePatch(analysis: RootCauseAnalysis): PatchResult {
    return RootCauseEngine.proposePatch(analysis, NAVIGATOR_ROOT);
  }

  /**
   * Dry-run verification on proposed patch
   */
  public verifyPatch(patch: PatchProposal): VerificationResult {
    const startTime = Date.now();
    const checksRun: string[] = [];

    // 1. Unified diff format validation
    checksRun.push('Unified diff header and hunk syntax check');
    if (!patch.unifiedDiff || !patch.unifiedDiff.includes('@@') || !patch.unifiedDiff.includes('---') || !patch.unifiedDiff.includes('+++')) {
      return {
        verified: false,
        status: 'SYNTAX_ERROR',
        message: 'Patch is not in valid unified diff format (missing headers or @@ hunk markers).',
        executionTimeMs: Date.now() - startTime,
        checksRun,
      };
    }

    // 2. Target file check
    checksRun.push('Source file path resolution within workspace');
    const safePath = path.resolve(NAVIGATOR_ROOT, patch.filePath);
    let originalText = '';

    if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      originalText = fs.readFileSync(safePath, 'utf8');
      checksRun.push('Source file target existence on disk');
    } else if (patch.originalSnippet) {
      originalText = patch.originalSnippet;
      checksRun.push('Source snippet buffer fallback');
    } else {
      return {
        verified: false,
        status: 'FAILED',
        message: `Target source file '${patch.filePath}' not found and no snippet provided.`,
        executionTimeMs: Date.now() - startTime,
        checksRun,
      };
    }

    // 3. Diff application via diff library
    checksRun.push('Patch application via diff library applyPatch');
    const patched = applyPatch(originalText, patch.unifiedDiff);
    if (patched === false) {
      return {
        verified: false,
        status: 'FAILED',
        message: 'Unified diff could not be applied cleanly to the target source content.',
        executionTimeMs: Date.now() - startTime,
        checksRun,
      };
    }

    // 4. TypeScript transpileModule diagnostics check
    checksRun.push('TypeScript AST syntax check via ts.transpileModule diagnostics');
    const transpile = ts.transpileModule(patched, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        noEmit: true,
      },
      reportDiagnostics: true,
    });

    if (transpile.diagnostics && transpile.diagnostics.length > 0) {
      const errorDiag = transpile.diagnostics.find(d => d.category === ts.DiagnosticCategory.Error);
      if (errorDiag) {
        const diagMsg = typeof errorDiag.messageText === 'string'
          ? errorDiag.messageText
          : errorDiag.messageText.messageText;
        return {
          verified: false,
          status: 'SYNTAX_ERROR',
          message: `Syntax diagnostic violation in patched output: ${diagMsg}`,
          executionTimeMs: Date.now() - startTime,
          checksRun,
        };
      }
    }

    return {
      verified: true,
      status: 'PASSED',
      message: `Patch cleanly verified across ${checksRun.length} validation checks without diagnostic errors.`,
      executionTimeMs: Date.now() - startTime,
      checksRun,
    };
  }

  /**
   * Get pre-built realistic sample error logs for UI inspection
   */
  public getSampleErrors(): Array<{ name: string; category: string; log: string }> {
    const samplesDir = path.resolve(__dirname, 'samples');

    const readFixture = (filename: string, fallback: string): string => {
      try {
        const filePath = path.join(samplesDir, filename);
        if (fs.existsSync(filePath)) {
          return fs.readFileSync(filePath, 'utf8').trim();
        }
      } catch {}
      return fallback;
    };

    return [
      {
        name: 'Node.js Null Dereference (TypeError)',
        category: 'TypeScript/Node',
        log: readFixture(
          'node_error.log',
          `TypeError: Cannot read properties of undefined (reading 'fullName')\n    at OpenSourceService.matchIssueSkills (/app/apps/api/src/modules/opensource/opensource.service.ts:164:32)\n    at OpenSourceController.matchIssueSkills (/app/apps/api/src/modules/opensource/opensource.controller.ts:25:28)\n    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)\n    at next (/app/node_modules/express/lib/router/route.js:149:13)`
        ),
      },
      {
        name: 'Vitest Test Assertion Failure',
        category: 'Vitest/Test',
        log: readFixture(
          'vitest_assertion.log',
          `FAIL  src/tests/dsa_intelligence.test.ts > Advanced DSA Intelligence & Spaced Repetition Tests > 2. Imports problems from CSV\nAssertionError: expected +0 to be 2 // Object.is equality\n ❯ src/tests/dsa_intelligence.test.ts:82:41\n     80|     expect(res.status).toBe(201);\n     81|     expect(res.body.data.totalReceived).toBe(3);\n     82|     expect(res.body.data.importedCount).toBe(2);\n       |                                         ^\n     83|     expect(res.body.data.deduplicatedCount).toBe(1);`
        ),
      },
      {
        name: 'Python IndexError (Out of Bounds)',
        category: 'Python',
        log: readFixture(
          'python_index_error.log',
          `Traceback (most recent call last):\n  File "/app/scripts/seed_repos.py", line 58, in parse_tags\n    primary_topic = topics[0]\nIndexError: list index out of range`
        ),
      },
    ];
  }
}
