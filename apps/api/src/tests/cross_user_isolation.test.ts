import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';

describe('Cross-User Data Isolation & IDOR Defense Tests', () => {
  const ts = Date.now();
  let userAlphaToken: string;
  let userAlphaId: string;
  let userBetaToken: string;
  let userBetaId: string;

  beforeAll(async () => {
    // 1. Register User Alpha
    const alphaRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `alpha_${ts}@devorbit.test`,
        username: `alpha_user_${ts}`,
        password: 'PasswordAlpha123!',
        name: 'User Alpha',
      });
    expect(alphaRes.status).toBe(201);
    userAlphaToken = alphaRes.body.data.token;
    userAlphaId = alphaRes.body.data.user.id;

    // 2. Register User Beta
    const betaRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `beta_${ts}@devorbit.test`,
        username: `beta_user_${ts}`,
        password: 'PasswordBeta123!',
        name: 'User Beta',
      });
    expect(betaRes.status).toBe(201);
    userBetaToken = betaRes.body.data.token;
    userBetaId = betaRes.body.data.user.id;
  });

  // 1. Integrations Isolation
  it('1. User Alpha connects LeetCode; User Beta integration status remains disconnected', async () => {
    // Connect LeetCode for User Alpha
    const connectRes = await request(app)
      .post('/api/v1/integrations/leetcode/connect')
      .set('Authorization', `Bearer ${userAlphaToken}`)
      .send({ username: 'alpha_leetcode_dev' });

    expect([200, 400, 500]).toContain(connectRes.status);

    // Verify Beta's integration status has isConnected: false
    const betaStatusRes = await request(app)
      .get('/api/v1/integrations/status')
      .set('Authorization', `Bearer ${userBetaToken}`);

    expect(betaStatusRes.status).toBe(200);
    expect(betaStatusRes.body.data.leetcode.isConnected).toBe(false);
    expect(betaStatusRes.body.data.leetcode.username).toBeUndefined();
  });

  // 2. DSA Progress Isolation
  it('2. User Alpha records solved DSA problem; User Beta sees zero solves', async () => {
    // Find or seed a problem
    const problem = await prisma.dsaProblem.findFirst();
    if (problem) {
      // User Alpha records SOLVED
      const updateRes = await request(app)
        .post(`/api/v1/dsa/problems/${problem.id}/progress`)
        .set('Authorization', `Bearer ${userAlphaToken}`)
        .send({
          status: 'SOLVED',
          solutionMode: 'INDEPENDENT',
          confidenceRating: 5,
        });

      expect(updateRes.status).toBe(200);

      // Verify User Beta's problem progress for this problem is null
      const betaProblemsRes = await request(app)
        .get('/api/v1/dsa/problems')
        .set('Authorization', `Bearer ${userBetaToken}`);

      expect(betaProblemsRes.status).toBe(200);
      const betaProb = betaProblemsRes.body.data.problems.find((p: any) => p.id === problem.id);
      expect(betaProb.userProgress).toBeNull();
    }
  });

  // 3. Profile & Skills Isolation
  it('3. User Alpha adds a private skill; User Beta profile does not reflect Alpha skill', async () => {
    const skillRes = await request(app)
      .post('/api/v1/profile/skills')
      .set('Authorization', `Bearer ${userAlphaToken}`)
      .send({
        skillName: 'Rust-Async-Tokio',
        category: 'BACKEND',
        confidenceScore: 0.95,
        provenanceLabel: 'USER_DECLARED',
      });

    expect([200, 201]).toContain(skillRes.status);

    // Verify User Beta's skills list does not contain Alpha's skill
    const betaProfileRes = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${userBetaToken}`);

    expect(betaProfileRes.status).toBe(200);
    const betaSkills = betaProfileRes.body.data.skills || [];
    expect(betaSkills.some((s: any) => s.skillName === 'Rust-Async-Tokio')).toBe(false);
  });

  // 4. Workspace Access IDOR Protection
  it('4. User Alpha creates a private workspace; User Beta cannot view or delete it (403 Forbidden)', async () => {
    const wsRes = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${userAlphaToken}`)
      .send({
        name: `Alpha Secret Workspace ${ts}`,
        slug: `alpha-secret-${ts}`,
        description: 'Classified private workspace',
      });

    expect(wsRes.status).toBe(201);
    const workspaceId = wsRes.body.data.id;

    // User Beta attempts to read Alpha's workspace
    const getRes = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${userBetaToken}`);

    expect([403, 404]).toContain(getRes.status);

    // User Beta attempts to delete Alpha's workspace
    const deleteRes = await request(app)
      .delete(`/api/v1/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${userBetaToken}`);

    expect([403, 404]).toContain(deleteRes.status);
  });

  // 5. Saved Organizations Isolation
  it('5. User Alpha bookmarks an organization; User Beta saved list remains empty', async () => {
    const saveRes = await request(app)
      .post('/api/v1/opensource/organizations/numfocus/save')
      .set('Authorization', `Bearer ${userAlphaToken}`);

    expect(saveRes.status).toBe(200);

    // Check User Beta saved list
    const betaSavedRes = await request(app)
      .get('/api/v1/opensource/organizations/saved/list')
      .set('Authorization', `Bearer ${userBetaToken}`);

    expect(betaSavedRes.status).toBe(200);
    expect(betaSavedRes.body.data.length).toBe(0);
  });

  // 6. AI Conversation Isolation & IDOR Protection
  it('6. User Alpha creates an AI conversation; User Beta cannot read or post to it', async () => {
    const chatRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userAlphaToken}`)
      .send({ prompt: 'Alpha private algorithm question' });

    expect(chatRes.status).toBe(200);
    const convId = chatRes.body.data.conversationId;

    // User Beta attempts to read Alpha's conversation
    const getConvRes = await request(app)
      .get(`/api/v1/ai/conversations/${convId}`)
      .set('Authorization', `Bearer ${userBetaToken}`);

    expect([403, 404]).toContain(getConvRes.status);

    // User Beta attempts to post into Alpha's conversation
    const postConvRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userBetaToken}`)
      .send({ prompt: 'Malicious injection into Alpha conversation', conversationId: convId });

    expect([403, 404]).toContain(postConvRes.status);
  });
});
