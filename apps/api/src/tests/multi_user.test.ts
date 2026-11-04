import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';

describe('Multi-User Security & Data Isolation Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let sampleProblemId: string;

  beforeAll(async () => {
    // Authenticate User A (Alex)
    const resA = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'alex_developer', password: 'DevOrbit123!' });
    
    expect(resA.status).toBe(200);
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Authenticate User B (Sara)
    const resB = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'sara_chen', password: 'DevOrbit123!' });

    expect(resB.status).toBe(200);
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Fetch a sample problem
    const prob = await prisma.dsaProblem.findFirst();
    sampleProblemId = prob!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Rejects unauthenticated access to protected user resources with 401', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. Returns isolated private dashboard summary for User A', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('alex_developer');
  });

  it('3. Returns isolated private dashboard summary for User B', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('sara_chen');
    expect(res.body.data.user.id).toBe(userBId);
  });

  it('4. User A records private DSA progress; User B cannot see it as their own', async () => {
    // User A solves sample problem
    const updateRes = await request(app)
      .post(`/api/v1/dsa/problems/${sampleProblemId}/progress`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        status: 'SOLVED',
        timeSpentSeconds: 450,
        notes: 'User A private confidential solution notes',
      });

    expect(updateRes.status).toBe(200);

    // Verify User A's analytics reflect this
    const analyticsA = await request(app)
      .get('/api/v1/dsa/analytics')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(analyticsA.status).toBe(200);
    const solvedCountA = analyticsA.body.data.solvedCount;

    // Verify in database that User B has independent record
    const progressB = await prisma.userDsaProgress.findUnique({
      where: {
        userId_problemId: {
          userId: userBId,
          problemId: sampleProblemId,
        },
      },
    });

    // If User B has not solved it, their record is null or different
    if (progressB) {
      expect(progressB.notes).not.toBe('User A private confidential solution notes');
    } else {
      expect(progressB).toBeNull();
    }
  });

  it('5. User bookmarks remain strictly user-isolated', async () => {
    const repo = await prisma.ossRepository.findFirst();
    expect(repo).toBeDefined();

    // User A bookmarks the repo
    const bmRes = await request(app)
      .post('/api/v1/opensource/bookmarks/toggle')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ targetType: 'REPO', repositoryId: repo!.id });

    expect(bmRes.status).toBe(200);

    // User B fetches their bookmarks; User A's bookmark should not appear under User B's list
    const userBBookmarks = await request(app)
      .get('/api/v1/opensource/bookmarks')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(userBBookmarks.status).toBe(200);
    const containsA = userBBookmarks.body.data.some((b: any) => b.userId === userAId);
    expect(containsA).toBe(false);
  });

  it('6. Workspaces role enforcement: Members list and ownership', async () => {
    const wsRes = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(wsRes.status).toBe(200);
    expect(Array.isArray(wsRes.body.data)).toBe(true);
    expect(wsRes.body.data.length).toBeGreaterThan(0);

    const ws = wsRes.body.data[0];
    expect(ws.role).toBe('OWNER');
  });
});
