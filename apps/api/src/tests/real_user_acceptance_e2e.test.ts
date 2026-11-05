import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';

describe('DevOrbit Real User End-to-End Acceptance Test Suite', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `realuser_${timestamp}@devorbit.test`,
    username: `realuser_${timestamp}`,
    password: 'RealPassword123!Secure',
    name: 'Real Developer',
  };

  const secondUser = {
    email: `isolated_${timestamp}@devorbit.test`,
    username: `isolated_${timestamp}`,
    password: 'SecondPassword123!Secure',
    name: 'Isolated Developer',
  };

  let userToken: string;
  let userCookie: string;
  let userId: string;

  let secondToken: string;
  let secondId: string;

  afterAll(async () => {
    // Clean up test users
    try {
      await prisma.user.deleteMany({
        where: {
          username: { in: [testUser.username, secondUser.username] },
        },
      });
    } catch {
      // Ignore cleanup error if already deleted
    }
  });

  it('1. Registers a new real user without depending on seeded demo identities', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.token).toBeDefined();

    userId = res.body.data.user.id;
    userToken = res.body.data.token;

    // Verify Set-Cookie header contains devorbit_token
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieStr = Array.isArray(cookies) ? cookies.join(';') : cookies;
    expect(cookieStr).toContain('devorbit_token=');
    userCookie = cookieStr;
  });

  it('2. Authenticates the real user via login and verifies password verification', async () => {
    // Attempt invalid password
    const failRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: 'WrongPassword!',
      });
    expect([400, 401]).toContain(failRes.status);
    expect(failRes.body.success).toBe(false);

    // Correct password
    const successRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        login: testUser.username,
        password: testUser.password,
      });

    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);
    expect(successRes.body.data.user.id).toBe(userId);
    expect(successRes.body.data.token).toBeDefined();
    userToken = successRes.body.data.token;
  });

  it('3. Persists session via httpOnly cookie across subsequent requests', async () => {
    // Request /auth/me with Cookie only (no Authorization header)
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', userCookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.id).toBe(userId);
    expect(meRes.body.data.username).toBe(testUser.username);
  });

  it('4. Accesses developer profile and updates personal preferences and skills', async () => {
    const updateRes = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        primaryFocus: 'FULLSTACK',
        experienceLevel: 'INTERMEDIATE',
        preferredLanguages: ['TypeScript', 'Rust', 'Python'],
        weeklyHoursCommitment: 15,
        bio: 'Real active developer working on open source.',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);

    const profileRes = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.preferredLanguages).toContain('TypeScript');
    expect(profileRes.body.data.experienceLevel).toBe('INTERMEDIATE');
  });

  it('5. Connects Codeforces public handle and syncs user-specific statistics', async () => {
    const cfRes = await request(app)
      .post('/api/v1/integrations/codeforces')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ handle: 'tourist' });

    expect([200, 201]).toContain(cfRes.status);
    expect(cfRes.body.success).toBe(true);

    // Verify integration status reflects connection
    const statusRes = await request(app)
      .get('/api/v1/integrations/status')
      .set('Authorization', `Bearer ${userToken}`);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.codeforces.connected).toBe(true);
    expect(statusRes.body.data.codeforces.handle).toBe('tourist');
  });

  it('6. Connects LeetCode username and syncs user-specific statistics', async () => {
    const lcRes = await request(app)
      .post('/api/v1/integrations/leetcode')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'neal_wu' });

    expect([200, 201]).toContain(lcRes.status);
    expect(lcRes.body.success).toBe(true);

    const statusRes = await request(app)
      .get('/api/v1/integrations/status')
      .set('Authorization', `Bearer ${userToken}`);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.leetcode.connected).toBe(true);
    expect(statusRes.body.data.leetcode.username).toBe('neal_wu');
  });

  it('7. Initiates GitHub OAuth flow with anti-replay state token and valid redirect URL', async () => {
    const oauthRes = await request(app)
      .get('/api/v1/integrations/github/oauth/start')
      .set('Authorization', `Bearer ${userToken}`);

    expect(oauthRes.status).toBe(200);
    expect(oauthRes.body.success).toBe(true);
    expect(oauthRes.body.data.authUrl || oauthRes.body.data.authorizationUrl).toContain('github.com/login/oauth/authorize');
    expect(oauthRes.body.data.state).toBeDefined();

    // Verify single-use state is recorded in database
    const stateRecord = await prisma.githubOAuthState.findFirst({
      where: { userId },
    });
    expect(stateRecord).not.toBeNull();
  });

  it('8. Evaluates 7-factor recommendation scoring tailored to real user profile', async () => {
    const recsRes = await request(app)
      .get('/api/v1/profile/recommendations')
      .set('Authorization', `Bearer ${userToken}`);

    expect(recsRes.status).toBe(200);
    expect(recsRes.body.success).toBe(true);
    expect(Array.isArray(recsRes.body.data)).toBe(true);

    if (recsRes.body.data.length > 0) {
      const topRec = recsRes.body.data[0];
      expect(typeof topRec.score).toBe('number');
      expect(topRec.score).toBeGreaterThanOrEqual(0);
      expect(topRec.score).toBeLessThanOrEqual(100);
      expect(topRec.factors).toHaveProperty('technologyMatchScore');
      expect(topRec.category).toBeDefined();
    }
  });

  it('9. Enforces cross-user isolation: second user cannot view or mutate first user resources', async () => {
    // Register second user
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send(secondUser);

    expect(regRes.status).toBe(201);
    secondId = regRes.body.data.user.id;
    secondToken = regRes.body.data.token;

    // Verify second user sees empty/unconnected integrations
    const secondStatus = await request(app)
      .get('/api/v1/integrations/status')
      .set('Authorization', `Bearer ${secondToken}`);

    expect(secondStatus.status).toBe(200);
    expect(secondStatus.body.data.codeforces.connected).toBe(false);
    expect(secondStatus.body.data.leetcode.connected).toBe(false);

    // Verify second user cannot delete first user's integration
    const maliciousDelete = await request(app)
      .delete('/api/v1/integrations/codeforces')
      .set('Authorization', `Bearer ${secondToken}`);

    expect([200, 404]).toContain(maliciousDelete.status);

    // First user's integration remains intact
    const firstStatusAgain = await request(app)
      .get('/api/v1/integrations/status')
      .set('Authorization', `Bearer ${userToken}`);

    expect(firstStatusAgain.body.data.codeforces.connected).toBe(true);
  });

  it('10. Logs out user, invalidating session and blocking subsequent authenticated requests', async () => {
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${userToken}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Subsequent request with the same token must fail
    const blockedRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(blockedRes.status).toBe(401);
  });
});
