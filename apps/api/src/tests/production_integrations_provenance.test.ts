import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { app } from '../app.js';
import { prisma } from '../config/index.js';
import { githubOAuthHandler } from '../modules/integrations/github.oauth.js';
import { tufProvider } from '../modules/integrations/tuf.provider.js';

describe('Production Integrations, OAuth State & Data Provenance Tests (M9)', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'alex_developer', password: 'DevOrbit123!' });
    userToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Prisma GithubOAuthState Persistence & Single-Use Atomic Anti-Replay
  it('1. Persists SHA-256 hashed OAuth state in database and enforces atomic single-use consumption', async () => {
    // Generate state for user
    const rawState = await githubOAuthHandler.generateOAuthState(userId, 'vitest-agent');
    expect(rawState).toBeDefined();
    expect(rawState).toHaveLength(64); // 32 bytes hex

    const stateHash = crypto.createHash('sha256').update(rawState).digest('hex');

    // Verify record in Prisma
    const record = await prisma.githubOAuthState.findUnique({
      where: { stateHash },
    });
    expect(record).not.toBeNull();
    expect(record?.userId).toBe(userId);
    expect(record?.consumedAt).toBeNull();
    expect(record?.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // First consumption: MUST succeed
    const firstUse = await githubOAuthHandler.validateAndConsumeState(rawState, userId);
    expect(firstUse).toBe(true);

    // Verify marked consumed in database
    const consumedRecord = await prisma.githubOAuthState.findUnique({
      where: { stateHash },
    });
    expect(consumedRecord?.consumedAt).not.toBeNull();

    // Replay attack (second consumption): MUST fail
    const replayUse = await githubOAuthHandler.validateAndConsumeState(rawState, userId);
    expect(replayUse).toBe(false);

    // Cross-user attack: MUST fail
    const forgedRaw = await githubOAuthHandler.generateOAuthState(userId);
    const crossUserUse = await githubOAuthHandler.validateAndConsumeState(forgedRaw, 'other-attacker-id');
    expect(crossUserUse).toBe(false);
  });

  // 2. Removal of Fabricated Metrics in Take U Forward
  it('2. Initializes Take U Forward without fabricated 64/455 progress', async () => {
    const stats = await tufProvider.verifyProfile('new_student_handle');
    expect(stats.totalCompleted).toBe(0);
    expect(stats.completionPercentage).toBe(0);
    expect(stats.recentActivity).toHaveLength(0);
    expect(stats.source).toBe('provider_sync');
  });

  // 3. Evidence-Grounded Opportunity Recommendations
  it('3. Generates evidence-grounded recommendations with transparent explanation text', async () => {
    const res = await request(app)
      .get('/api/v1/opensource/recommendations?limit=5')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    if (res.body.data.length > 0) {
      const topRec = res.body.data[0];
      expect(topRec.matchScore).toBeGreaterThanOrEqual(20);
      expect(topRec.explanation).toBeDefined();
      expect(typeof topRec.explanation).toBe('string');
      expect(topRec.explanation).toMatch(/Recommended (because|open)/i);
    }
  });

  // 4. Honest Trending Repositories Provenance
  it('4. Returns trending repositories with honest data provenance and no fake starsToday formula', async () => {
    const res = await request(app).get('/api/v1/opensource/trending');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const first = res.body.data[0];
    expect(first.stargazersCount).toBeGreaterThanOrEqual(0);
    expect(first.provenance).toBe('github_rest_index');
    // Ensure fabricated starsToday is eliminated
    expect(first.starsToday).toBeUndefined();
  });
});
