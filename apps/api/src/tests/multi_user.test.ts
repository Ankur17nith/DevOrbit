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

  let userCToken: string;
  let userCId: string;

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

    // Create / Authenticate User C (Elena)
    await prisma.session.deleteMany({ where: { user: { username: 'elena_vanguard' } } });
    await prisma.user.deleteMany({ where: { username: 'elena_vanguard' } });

    const resC = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'elena@devorbit.local',
        username: 'elena_vanguard',
        password: 'DevOrbitPassword999!',
        name: 'Elena Rostova',
      });

    expect(resC.status).toBe(201);
    userCToken = resC.body.data.token;
    userCId = resC.body.data.user.id;

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

  it('4. User C has fully isolated zero-state dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${userCToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('elena_vanguard');
    expect(res.body.data.user.id).toBe(userCId);
    expect(res.body.data.stats.solvedDsaCount).toBe(0);
  });

  it('5. User A records private DSA progress; User B and C cannot see it as their own', async () => {
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

    // Verify in database that User B has independent record
    const progressB = await prisma.userDsaProgress.findUnique({
      where: {
        userId_problemId: {
          userId: userBId,
          problemId: sampleProblemId,
        },
      },
    });

    if (progressB) {
      expect(progressB.notes).not.toBe('User A private confidential solution notes');
    } else {
      expect(progressB).toBeNull();
    }

    // Verify in database that User C has null record
    const progressC = await prisma.userDsaProgress.findUnique({
      where: {
        userId_problemId: {
          userId: userCId,
          problemId: sampleProblemId,
        },
      },
    });
    expect(progressC).toBeNull();
  });

  it('6. User bookmarks remain strictly user-isolated across 3 users', async () => {
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
    const containsAInB = userBBookmarks.body.data.some((b: any) => b.userId === userAId);
    expect(containsAInB).toBe(false);

    // User C fetches their bookmarks; should be empty
    const userCBookmarks = await request(app)
      .get('/api/v1/opensource/bookmarks')
      .set('Authorization', `Bearer ${userCToken}`);

    expect(userCBookmarks.status).toBe(200);
    expect(userCBookmarks.body.data.length).toBe(0);
  });

  it('7. Workspaces role enforcement: Members list and ownership', async () => {
    const wsRes = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(wsRes.status).toBe(200);
    expect(Array.isArray(wsRes.body.data)).toBe(true);
    expect(wsRes.body.data.length).toBeGreaterThan(0);

    const ws = wsRes.body.data[0];
    expect(ws.role).toBe('OWNER');
  });

  it('8. IDOR Prevention: User C cannot post messages into User A conversation', async () => {
    // User A creates a conversation
    const convRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ prompt: 'Private algorithmic architecture planning' });

    expect(convRes.status).toBe(200);
    const convId = convRes.body.data.conversationId;
    expect(convId).toBeDefined();

    // User C tries to inject a message into User A's conversation
    const hijackRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userCToken}`)
      .send({
        conversationId: convId,
        prompt: 'Attacker trying to inject into another conversation',
      });

    expect(hijackRes.status).toBe(403);
    expect(hijackRes.body.success).toBe(false);
  });

  it('9. Workspace membership invitation: Non-member or ordinary member cannot invite', async () => {
    // Fetch a workspace where User A is owner
    const wsRes = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${userAToken}`);
    
    const wsId = wsRes.body.data[0].id;

    // User C (not a member of this workspace) tries to invite someone
    const inviteRes = await request(app)
      .post(`/api/v1/workspaces/${wsId}/members`)
      .set('Authorization', `Bearer ${userCToken}`)
      .send({ targetUsername: 'sara_chen', role: 'MEMBER' });

    expect(inviteRes.status).toBe(403);
  });

  it('10. Notification Isolation: Users cannot mark another users notifications as read', async () => {
    // Create a private notification for User A directly
    const notif = await prisma.notification.create({
      data: {
        userId: userAId,
        title: 'Secret Security Notice',
        message: 'Confidential system alert for User A only',
        type: 'SYSTEM',
      },
    });

    // User C tries to mark User A's notification as read
    await request(app)
      .patch(`/api/v1/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${userCToken}`);

    // Verify in database that User A's notification is still unread!
    const freshNotif = await prisma.notification.findUnique({
      where: { id: notif.id },
    });
    expect(freshNotif?.isRead).toBe(false);
  });
});
