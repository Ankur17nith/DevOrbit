import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { StackParser } from '../modules/fix/stack_parser.js';
import { RootCauseEngine } from '../modules/fix/root_cause_engine.js';
import { FixService } from '../modules/fix/fix.service.js';

describe('Orbit Fix & Root-Cause Debugging Tests (Milestone M6)', () => {
  const fixService = new FixService();
  let authToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `fix_test_${Date.now()}@devorbit.test`,
        username: `fix_tester_${Date.now()}`,
        password: 'FixPassword123!',
        name: 'Fix Tester',
      });
    authToken = res.body.data.token;
  });

  // 1. Node.js / V8 Stack Trace Parsing
  it('1. Parses Node.js/V8 stack traces, extracting error type, message, and project frames', () => {
    const raw = `TypeError: Cannot read properties of undefined (reading 'title')
    at DsaService.solveProblem (/home/ankurgupta/DevOrbit/apps/api/src/modules/dsa/dsa.service.ts:55:20)
    at DsaController.submitSolve (/home/ankurgupta/DevOrbit/apps/api/src/modules/dsa/dsa.controller.ts:32:15)
    at /home/ankurgupta/DevOrbit/node_modules/express/lib/router/layer.js:95:5`;

    const parsed = StackParser.parse(raw);
    expect(parsed.errorType).toBe('TypeError');
    expect(parsed.message).toContain("Cannot read properties of undefined (reading 'title')");
    expect(parsed.runtime).toBe('node');
    expect(parsed.frames.length).toBe(3);

    const primary = parsed.primaryFrame;
    expect(primary).toBeDefined();
    expect(primary?.isProjectFile).toBe(true);
    expect(primary?.functionName).toBe('DsaService.solveProblem');
    expect(primary?.lineNumber).toBe(55);
    expect(primary?.columnNumber).toBe(20);
  });

  // 2. Vitest Test Assertion Log Parsing
  it('2. Parses Vitest test assertion failures and identifies failing test line', () => {
    const raw = `FAIL  src/tests/example.test.ts > suite > test 1
AssertionError: expected +0 to be 2 // Object.is equality
 ❯ src/tests/example.test.ts:82:41
     80|     expect(res.status).toBe(201);
     81|     expect(res.body.data.totalReceived).toBe(3);
     82|     expect(res.body.data.importedCount).toBe(2);`;

    const parsed = StackParser.parse(raw);
    expect(parsed.runtime).toBe('vitest');
    expect(parsed.errorType).toBe('AssertionError');
    expect(parsed.message).toContain('expected +0 to be 2');
    expect(parsed.primaryFrame?.lineNumber).toBe(82);
    expect(parsed.primaryFrame?.columnNumber).toBe(41);
  });

  // 3. Multi-Runtime Parsing (Python, Go, Rust)
  it('3. Parses Python tracebacks and Rust panic stack traces', () => {
    const pyRaw = `Traceback (most recent call last):
  File "apps/api/worker.py", line 42, in process_batch
    items = payload["data"]
IndexError: list index out of range`;

    const pyParsed = StackParser.parse(pyRaw);
    expect(pyParsed.runtime).toBe('python');
    expect(pyParsed.errorType).toBe('IndexError');
    expect(pyParsed.primaryFrame?.lineNumber).toBe(42);
    expect(pyParsed.primaryFrame?.functionName).toBe('process_batch');

    const rsRaw = `thread 'main' panicked at 'index out of bounds: the len is 3 but the index is 5', src/main.rs:25:9`;
    const rsParsed = StackParser.parse(rsRaw);
    expect(rsParsed.runtime).toBe('rust');
    expect(rsParsed.primaryFrame?.lineNumber).toBe(25);
    expect(rsParsed.primaryFrame?.columnNumber).toBe(9);
  });

  // 4. Root-Cause Analysis & Categorization
  it('4. Correctly classifies bug categories and confidence levels', () => {
    const nullLog = `TypeError: Cannot read properties of null (reading 'user')\n    at func (/src/app.ts:10:5)`;
    const nullAnalysis = fixService.analyzeError(nullLog);
    expect(nullAnalysis.category).toBe('NULL_UNDEFINED');
    expect(nullAnalysis.confidence).toBeGreaterThanOrEqual(90);

    const outOfBoundsLog = `IndexError: list index out of range\n  File "main.py", line 12, in run`;
    const oobAnalysis = fixService.analyzeError(outOfBoundsLog);
    expect(oobAnalysis.category).toBe('OUT_OF_BOUNDS');

    const assertLog = `AssertionError: expected true to be false\n ❯ test.ts:15:3`;
    const assertAnalysis = fixService.analyzeError(assertLog);
    expect(assertAnalysis.category).toBe('ASSERTION_FAILURE');
  });

  // 5. Unified Diff Patch Proposal Generation
  it('5. Generates valid non-destructive unified diff patch proposals', () => {
    const raw = `TypeError: Cannot read properties of undefined (reading 'name')\n    at handler (/src/controller.ts:40:10)`;
    const analysis = fixService.analyzeError(raw);
    const patch = fixService.proposePatch(analysis);

    expect(patch.unifiedDiff).toContain('--- a/');
    expect(patch.unifiedDiff).toContain('+++ b/');
    expect(patch.unifiedDiff).toContain('@@');
    expect(patch.confidence).toBeGreaterThan(80);
    expect(patch.explanation).toBeDefined();
  });

  // 6. Test Verification Runner
  it('6. Dry-run verifier validates patch structure and syntax', () => {
    const raw = `TypeError: Cannot read properties of undefined (reading 'score')\n    at func (/src/utils.ts:12:4)`;
    const analysis = fixService.analyzeError(raw);
    const patch = fixService.proposePatch(analysis);

    const verification = fixService.verifyPatch(patch);
    expect(verification.verified).toBe(true);
    expect(verification.status).toBe('PASSED');
    expect(verification.checksRun.length).toBeGreaterThan(2);
  });

  // 7. End-to-End HTTP API Endpoints
  it('7. Exposes /analyze, /propose, /verify, and /samples HTTP API endpoints', async () => {
    // 1. Get Samples
    const samplesRes = await request(app)
      .get('/api/v1/fix/samples')
      .set('Authorization', `Bearer ${authToken}`);
    expect(samplesRes.status).toBe(200);
    expect(samplesRes.body.data.samples.length).toBeGreaterThanOrEqual(2);

    // 2. Analyze
    const sampleLog = samplesRes.body.data.samples[0].log;
    const analyzeRes = await request(app)
      .post('/api/v1/fix/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ rawLog: sampleLog });
    expect(analyzeRes.status).toBe(200);
    expect(analyzeRes.body.data.analysis.category).toBeDefined();

    // 3. Propose Patch
    const proposeRes = await request(app)
      .post('/api/v1/fix/propose')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ analysis: analyzeRes.body.data.analysis });
    expect(proposeRes.status).toBe(200);
    expect(proposeRes.body.data.patch.unifiedDiff).toContain('--- a/');

    // 4. Verify Patch
    const verifyRes = await request(app)
      .post('/api/v1/fix/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ patch: proposeRes.body.data.patch });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.verification.verified).toBe(true);
  });
});
