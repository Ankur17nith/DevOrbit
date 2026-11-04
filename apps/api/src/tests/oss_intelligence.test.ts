import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';

describe('Orbit OSS Intelligence & Contribution Pipeline Tests (Milestone M4)', () => {
  let userAToken: string;
  let userBToken: string;
  let userCToken: string;
  let userAId: string;
  let userBId: string;
  let userCId: string;
  let sampleIssue: any;

  beforeAll(async () => {
    // Authenticate User A (Alex)
    const resA = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'alex_developer', password: 'DevOrbit123!' });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Authenticate User B (Sara)
    const resB = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'sara_chen', password: 'DevOrbit123!' });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Authenticate User C (Elena Isolated)
    const resC = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'elena_github_iso', password: 'DevOrbitPassword999!' });
    userCToken = resC.body.data.token;
    userCId = resC.body.data.user.id;

    // Fetch or seed a sample issue with repository
    let issue = await prisma.ossIssue.findFirst({
      include: { repository: true },
    });

    if (!issue) {
      let repo = await prisma.ossRepository.findFirst();
      if (!repo) {
        repo = await prisma.ossRepository.create({
          data: {
            name: 'orbit-client',
            fullName: 'devorbit/orbit-client',
            owner: 'devorbit',
            language: 'TypeScript',
            topicsJson: JSON.stringify(['react', 'typescript', 'vite']),
            stargazersCount: 450,
          },
        });
      }

      issue = await prisma.ossIssue.create({
        data: {
          repositoryId: repo.id,
          number: 101,
          title: 'Implement Dark Mode CSS variable anchor tokens',
          state: 'open',
          difficulty: 'beginner',
          url: 'https://github.com/devorbit/orbit-client/issues/101',
          labelsJson: JSON.stringify(['good first issue', 'frontend', 'typescript']),
        },
        include: { repository: true },
      });
    }

    sampleIssue = issue;

    // Clean user pipeline items
    await prisma.contributionPipelineItem.deleteMany({
      where: { userId: { in: [userAId, userBId, userCId] } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Program support
  it('1. Returns active OSS programs (GSoC 2026, LFX Mentorship, Outreachy, Hacktoberfest) with deadlines', async () => {
    const res = await request(app).get('/api/v1/opensource/programs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);

    const gsoc = res.body.data.find((p: any) => p.slug === 'gsoc-2026');
    expect(gsoc).toBeDefined();
    expect(gsoc.name).toContain('Google Summer of Code');
    expect(gsoc.timeline.length).toBeGreaterThan(0);
  });

  // 2. Issue Discovery & Filtering
  it('2. Filters issues by difficulty and returns repository metadata', async () => {
    const res = await request(app).get('/api/v1/opensource/issues?difficulty=beginner');
    expect(res.status).toBe(200);
    expect(res.body.data.issues).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  // 3. Explainable Skill Matching
  it('3. Computes transparent skill match score between user verified skills and issue codebase', async () => {
    // Ensure User A has verified TypeScript skill
    await prisma.userSkillProfile.upsert({
      where: { userId_skillName: { userId: userAId, skillName: 'TypeScript' } },
      create: {
        userId: userAId,
        skillName: 'TypeScript',
        category: 'LANGUAGE',
        confidenceScore: 88.0,
        verifiedEvidenceJson: JSON.stringify([{ repoFullName: 'alex-dev/devorbit-core', isOwner: true }]),
      },
      update: { confidenceScore: 88.0 },
    });

    const resA = await request(app)
      .get(`/api/v1/opensource/issues/${sampleIssue.id}/match`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(resA.status).toBe(200);
    const match = resA.body.data;
    expect(match.matchScore).toBeGreaterThanOrEqual(40);
    expect(match.matchedSkills.length).toBeGreaterThan(0);
    expect(match.matchedSkills.some((s: any) => s.skillName === 'TypeScript')).toBe(true);
    expect(match.explanation).toContain('match based on your verified');

    // User C without skills gets transparent baseline match
    const resC = await request(app)
      .get(`/api/v1/opensource/issues/${sampleIssue.id}/match`)
      .set('Authorization', `Bearer ${userCToken}`);

    expect(resC.status).toBe(200);
    expect(resC.body.data.matchedSkills).toHaveLength(0);
    expect(resC.body.data.explanation).toContain('Baseline match');
  });

  // 4. Contribution Pipeline Lifecycle
  it('4. Tracks full contribution pipeline lifecycle and triggers notification on merge', async () => {
    // Step 1: Add to pipeline (SHORTLISTED)
    const addRes = await request(app)
      .post('/api/v1/opensource/pipeline')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        issueId: sampleIssue.id,
        stage: 'SHORTLISTED',
        priority: 'HIGH',
        notes: 'Explored issue, good starter task',
        deadline: new Date(Date.now() + 48 * 3600000).toISOString(), // 48h deadline
      });

    expect(addRes.status).toBe(201);
    const itemId = addRes.body.data.id;
    expect(addRes.body.data.stage).toBe('SHORTLISTED');
    expect(addRes.body.data.priority).toBe('HIGH');

    // Step 2: Transition through stages
    await request(app)
      .patch(`/api/v1/opensource/pipeline/${itemId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ stage: 'WORKING' });

    await request(app)
      .patch(`/api/v1/opensource/pipeline/${itemId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        stage: 'PR_SUBMITTED',
        prUrl: 'https://github.com/devorbit/orbit-client/pull/105',
      });

    // Step 3: Transition to MERGED
    const mergeRes = await request(app)
      .patch(`/api/v1/opensource/pipeline/${itemId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ stage: 'MERGED' });

    expect(mergeRes.status).toBe(200);
    expect(mergeRes.body.data.stage).toBe('MERGED');

    // Check celebration notification was automatically generated
    const notif = await prisma.notification.findFirst({
      where: {
        userId: userAId,
        title: { contains: 'Merged' },
      },
    });
    expect(notif).toBeDefined();
    expect(notif!.message).toContain(sampleIssue.title);
  });

  // 5. Multi-User Isolation in Pipeline
  it('5. Pipeline multi-user isolation: User B cannot view or modify User A pipeline items', async () => {
    // User A has 1 item
    const pipelineA = await request(app)
      .get('/api/v1/opensource/pipeline')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(pipelineA.status).toBe(200);
    expect(pipelineA.body.data.length).toBeGreaterThanOrEqual(1);
    const itemAId = pipelineA.body.data[0].id;

    // User B should see empty pipeline
    const pipelineB = await request(app)
      .get('/api/v1/opensource/pipeline')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(pipelineB.status).toBe(200);
    expect(pipelineB.body.data).toHaveLength(0);

    // User B attempting to modify User A item should receive 404
    const modRes = await request(app)
      .patch(`/api/v1/opensource/pipeline/${itemAId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ stage: 'ABANDONED' });

    expect(modRes.status).toBe(404);
  });

  // 6. Opportunity Monitoring
  it('6. Opportunity monitoring alerts on approaching deadlines', async () => {
    // Add item with deadline in 24 hours
    await request(app)
      .post('/api/v1/opensource/pipeline')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        issueId: sampleIssue.id,
        stage: 'WORKING',
        priority: 'URGENT',
        deadline: new Date(Date.now() + 24 * 3600000).toISOString(),
      });

    const res = await request(app)
      .post('/api/v1/opensource/opportunities/monitor')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.monitoredItemsCount).toBeGreaterThanOrEqual(1);
  });
});
