import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';

describe('Integrations Center, Codeforces, LeetCode, TUF & System Backup Tests (Milestone M9)', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Authenticate test user
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'alex_developer', password: 'DevOrbit123!' });
    userToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  // 1. Unified Integrations Status
  it('1. Returns unified status for all platforms with provider capabilities', async () => {
    const res = await request(app)
      .get('/api/v1/integrations/status')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.github).toBeDefined();
    expect(res.body.data.codeforces).toBeDefined();
    expect(res.body.data.leetcode).toBeDefined();
    expect(res.body.data.tuf).toBeDefined();
    expect(res.body.data.striver).toBeDefined();
    expect(res.body.data.ollama).toBeDefined();
    expect(res.body.data.ollama.privacy).toContain('Local-First');
  });

  // 2. Codeforces Provider Verification & Error Handling
  it('2. Gracefully handles invalid Codeforces handle with structured 400 error', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/codeforces/connect')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ handle: 'non_existent_codeforces_user_9999999_xyz' });

    // Should return 400 or 500 with descriptive error message, never crash
    expect([400, 500]).toContain(res.status);
    expect(res.body.error).toBeDefined();
  });

  // 3. LeetCode Import & Data Normalization
  it('3. Imports verified LeetCode stats and normalizes difficulty distribution', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/leetcode/import')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        username: 'alex_chen_dev',
        totalSolved: 142,
        easySolved: 55,
        mediumSolved: 72,
        hardSolved: 15,
        ranking: 85200,
        contestRating: 1740,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSolved).toBe(142);
    expect(res.body.data.mediumSolved).toBe(72);
    expect(res.body.data.source).toBe('manual_import');

    // Verify persisted credential
    const cred = await prisma.integrationCredential.findUnique({
      where: { userId_provider: { userId, provider: 'LEETCODE' } },
    });
    expect(cred).not.toBeNull();
    expect(cred?.username).toBe('alex_chen_dev');
  });

  // 4. Take U Forward (TUF) Progress Tracking
  it('4. Tracks Take U Forward sheet completion and active learning step', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/tuf/import')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        username: 'alex_chen',
        totalCompleted: 78,
        totalProblems: 455,
        activeSheet: 'Striver A2Z DSA Sheet',
        currentStep: 'Step 4: Binary Search',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.completionPercentage).toBe(17);
    expect(res.body.data.currentStep).toBe('Step 4: Binary Search');
  });

  // 5. GitHub OAuth Status & Setup Detection
  it('5. Detects GitHub OAuth configuration state and provides setup guidance', async () => {
    const res = await request(app)
      .get('/api/v1/integrations/github/oauth/url')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Even if client_id is not set in env, it returns honest status and setup instructions
    expect(res.body.data.isConfigured).toBeDefined();
    if (!res.body.data.isConfigured) {
      expect(res.body.data.setupInstructions).toContain('GITHUB_CLIENT_ID');
    }
  });

  // 6. Enriched Dashboard Summary
  it('6. Serves enriched Command Center dashboard with real integrations and cognitive DSA metrics', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.integrations).toBeDefined();
    expect(res.body.data.integrations.leetcode.isConnected).toBe(true);
    expect(res.body.data.integrations.tuf.isConnected).toBe(true);
    expect(res.body.data.difficultyCounts).toBeDefined();
    expect(res.body.data.pipeline).toBeDefined();
  });

  // 7. System Health Check
  it('7. Reports database connectivity and latency via /api/v1/system/health', async () => {
    const res = await request(app).get('/api/v1/system/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database.status).toBe('connected');
    expect(res.body.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  // 8. System Backup & Restore
  it('8. Exports and restores user backup safely without data corruption', async () => {
    const backupRes = await request(app)
      .get('/api/v1/system/backup')
      .set('Authorization', `Bearer ${userToken}`);

    expect(backupRes.status).toBe(200);
    expect(backupRes.body.success).toBe(true);
    expect(backupRes.body.data.version).toBe('1.0');
    expect(Array.isArray(backupRes.body.data.dsaProgress)).toBe(true);

    // Restore the exported payload
    const restoreRes = await request(app)
      .post('/api/v1/system/restore')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ backup: backupRes.body.data });

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.success).toBe(true);
    expect(restoreRes.body.message).toContain('restored successfully');
  });

  // 9. GitHub OAuth State Generation
  it('9. Generates cryptographic 32-byte state for GitHub OAuth flow', async () => {
    const res = await request(app)
      .get('/api/v1/integrations/github/oauth/url')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.state).toBeDefined();
    // 32 bytes in hex = 64 characters
    expect(res.body.data.state).toMatch(/^[0-9a-f]{64}$/);
  });

  // 10. Rejects forged or invalid OAuth state with 400
  it('10. Rejects callback with tampered, missing, or forged OAuth state', async () => {
    // Missing state
    const missingRes = await request(app)
      .post('/api/v1/integrations/github/oauth/callback')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'valid_looking_code' });

    expect(missingRes.status).toBe(400);
    expect(missingRes.body.error.message).toMatch(/state/i);

    // Forged state
    const forgedRes = await request(app)
      .post('/api/v1/integrations/github/oauth/callback')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'valid_looking_code', state: 'attacker_forged_state_123' });

    expect(forgedRes.status).toBe(400);
    expect(forgedRes.body.error.message).toMatch(/Invalid, expired, or tampered OAuth state parameter/i);
  });

  // 12. Root Service Info (ensures no Cannot GET / in browser)
  it('12. Root / endpoint returns structured JSON service information', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('devorbit-api');
    expect(res.body.endpoints).toBeDefined();
  });

  // 13. Integration Route Aliases
  it('13. Supports route aliases for leetcode, codeforces, and oauth start', async () => {
    // Leetcode alias route POST /api/v1/integrations/leetcode
    const leetcodeRes = await request(app)
      .post('/api/v1/integrations/leetcode')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'non_existent_fake_leetcode_user_999999999' });

    // Must be routed to connectLeetCode (400/500 structured error), NOT 404
    expect(leetcodeRes.status).not.toBe(404);
    expect(leetcodeRes.body.success).toBe(false);

    // Codeforces alias route POST /api/v1/integrations/codeforces
    const cfRes = await request(app)
      .post('/api/v1/integrations/codeforces')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ handle: 'non_existent_fake_cf_9999999' });

    expect(cfRes.status).not.toBe(404);

    // OAuth start alias route GET /api/v1/integrations/github/oauth/start
    const oauthRes = await request(app)
      .get('/api/v1/integrations/github/oauth/start')
      .set('Authorization', `Bearer ${userToken}`);

    expect(oauthRes.status).toBe(200);
    expect(oauthRes.body.success).toBe(true);
  });
});

