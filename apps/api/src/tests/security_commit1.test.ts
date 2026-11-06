import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';
import { GitHubOAuthHandler } from '../modules/integrations/github.oauth.js';

describe('Commit 1 Security Tests (S1–S14 Defense Verification)', () => {
  let userAToken: string;
  let userAId: string;
  let userBToken: string;
  let userBId: string;
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    // 1. User A (regular user)
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `sec_user_a_${Date.now()}@devorbit.test`,
        username: `sec_user_a_${Date.now()}`,
        password: 'PasswordSecA123!',
        name: 'Sec User A',
      });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // 2. User B (regular user)
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `sec_user_b_${Date.now()}@devorbit.test`,
        username: `sec_user_b_${Date.now()}`,
        password: 'PasswordSecB123!',
        name: 'Sec User B',
      });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // 3. Admin user
    const resAdmin = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `sec_admin_${Date.now()}@devorbit.test`,
        username: `sec_admin_${Date.now()}`,
        password: 'PasswordAdmin123!',
        name: 'Sec Admin',
      });
    adminToken = resAdmin.body.data.token;
    adminId = resAdmin.body.data.user.id;
    // Elevate admin
    await prisma.user.update({
      where: { id: adminId },
      data: { role: 'ADMIN' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Unauthenticated calls return 401
  it('1. Unauthenticated calls to navigator, fix, safechange, and ai status/models return 401', async () => {
    // Navigator routes
    const navSummary = await request(app).get('/api/v1/navigator/summary');
    expect(navSummary.status).toBe(401);

    const navFile = await request(app).get('/api/v1/navigator/file?filePath=apps/api/src/server.ts');
    expect(navFile.status).toBe(401);

    const navIndex = await request(app).post('/api/v1/navigator/index');
    expect(navIndex.status).toBe(401);

    // Fix routes
    const fixSamples = await request(app).get('/api/v1/fix/samples');
    expect(fixSamples.status).toBe(401);

    const fixAnalyze = await request(app).post('/api/v1/fix/analyze').send({ rawLog: 'err' });
    expect(fixAnalyze.status).toBe(401);

    // Safechange routes
    const scImpact = await request(app).post('/api/v1/safechange/impact').send({ filePath: 'apps/api/src/server.ts' });
    expect(scImpact.status).toBe(401);

    const scQuality = await request(app).get('/api/v1/safechange/quality');
    expect(scQuality.status).toBe(401);

    // AI routes
    const aiStatus = await request(app).get('/api/v1/ai/status');
    expect(aiStatus.status).toBe(401);

    const aiModels = await request(app).get('/api/v1/ai/models');
    expect(aiModels.status).toBe(401);
  });

  // 2. Path traversal blocked
  it('2. Rejects path traversal and sensitive files in navigator with 400 or 403', async () => {
    // Attempt to access parent directory (.env)
    const resTraversal = await request(app)
      .get('/api/v1/navigator/file?filePath=../../.env')
      .set('Authorization', `Bearer ${userAToken}`);
    expect([400, 403]).toContain(resTraversal.status);

    // Attempt to access /etc/passwd
    const resPasswd = await request(app)
      .get('/api/v1/navigator/file?filePath=/etc/passwd')
      .set('Authorization', `Bearer ${userAToken}`);
    expect([400, 403]).toContain(resPasswd.status);

    // Attempt to access dotfile (.git)
    const resDot = await request(app)
      .get('/api/v1/navigator/file?filePath=.git/config')
      .set('Authorization', `Bearer ${userAToken}`);
    expect([400, 403]).toContain(resDot.status);
  });

  // 3. OAuth backdoor removal: exchangeCode('test_x') calls GitHub or throws if unconfigured, never returns fake token
  it('3. exchangeCode("test_x") does not return a backdoor token in production code', async () => {
    const oauthHandler = new GitHubOAuthHandler();
    // In production/unconfigured, exchangeCode throws or fails, never returns a mock token object
    await expect(oauthHandler.exchangeCode('test_x')).rejects.toThrow();
  });

  // 4. Recommendation feedback IDOR test: User B cannot tamper with User A's recommendation record
  it('4. User B cannot modify or hijack User A recommendation status', async () => {
    // Create a recommendation owned by User A
    const recA = await prisma.recommendation.create({
      data: {
        userId: userAId,
        targetType: 'ISSUE',
        targetId: `issue_target_${Date.now()}`,
        score: 88,
        category: 'BEST_SKILL_FIT',
        factorsJson: '{}',
        explanation: 'User A recommendation',
        status: 'ACTIVE',
      },
    });

    // User B attempts to dismiss User A's recommendation by passing recA.id
    const resFeedback = await request(app)
      .post('/api/v1/profile/recommendations/feedback')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        recommendationId: recA.id,
        action: 'DISMISSED',
      });

    expect([200, 201]).toContain(resFeedback.status);

    // Verify User A's recommendation was NOT modified to DISMISSED
    const updatedRecA = await prisma.recommendation.findUnique({
      where: { id: recA.id },
    });
    expect(updatedRecA!.status).toBe('ACTIVE');
    expect(updatedRecA!.userId).toBe(userAId);
  });

  // 5. Workspace role-escalation test: non-owner cannot grant ADMIN; nobody can grant OWNER; ADMIN cannot remove ADMIN
  it('5. Workspace role-escalation defenses prevent privilege escalation', async () => {
    // 1. User A creates a workspace (User A becomes OWNER)
    const wsRes = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Security Test Workspace', slug: `sec-ws-${Date.now()}` });
    expect(wsRes.status).toBe(201);
    const workspaceId = wsRes.body.data.id;

    // 2. User A tries to grant role "OWNER" via invite -> must fail
    const inviteOwnerRes = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ userId: userBId, role: 'OWNER' });
    expect([400, 403]).toContain(inviteOwnerRes.status);

    // 3. User A invites User B as MEMBER
    const inviteMemberRes = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ userId: userBId, role: 'MEMBER' });
    expect(inviteMemberRes.status).toBe(201);

    // 4. User B (MEMBER) attempts to grant ADMIN role to another user -> must be rejected
    const memberEscalateRes = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ userId: adminId, role: 'ADMIN' });
    expect([400, 403]).toContain(memberEscalateRes.status);

    // 5. User A promotes User B to ADMIN
    const promoteBRes = await request(app)
      .patch(`/api/v1/workspaces/${workspaceId}/members/${userBId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ role: 'ADMIN' });
    expect(promoteBRes.status).toBe(200);

    // 6. User A adds another user (adminId) as ADMIN
    const addAnotherAdmin = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ userId: adminId, role: 'ADMIN' });
    expect(addAnotherAdmin.status).toBe(201);

    // 7. User B (ADMIN) tries to remove the other ADMIN (adminId) -> must be rejected
    const removeAdminRes = await request(app)
      .delete(`/api/v1/workspaces/${workspaceId}/members/${adminId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(removeAdminRes.status).toBe(403);
  });

  // 6. DSA import validation: javascript: URL is rejected with 400, non-admin is rejected with 403
  it('6. DSA problem import enforces ADMIN role and rejects javascript: protocol URLs', async () => {
    // Non-admin attempt returns 403
    const nonAdminRes = await request(app)
      .post('/api/v1/dsa/import')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'JSON',
        content: JSON.stringify([
          {
            title: 'Malicious Problem',
            slug: 'malicious-problem',
            difficulty: 'EASY',
            topic: 'Array',
            url: 'javascript:alert(1)',
          },
        ]),
      });
    expect(nonAdminRes.status).toBe(403);

    // Admin attempt with javascript: URL returns 400
    const adminBadUrlRes = await request(app)
      .post('/api/v1/dsa/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type: 'JSON',
        content: JSON.stringify([
          {
            title: 'Malicious Problem',
            slug: 'malicious-problem',
            difficulty: 'EASY',
            topic: 'Array',
            url: 'javascript:alert(1)',
          },
        ]),
      });
    expect(adminBadUrlRes.status).toBe(400);
    expect(adminBadUrlRes.body.error.message).toMatch(/Invalid problem URL protocol|protocol/i);
  });
});
