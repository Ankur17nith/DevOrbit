import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';
import { generateCanonicalSlug, normalizeDifficulty } from '../modules/dsa/adapters/deduplication.js';
import { createTestUser, ensureSampleDsaProblems } from './test_helpers.js';

describe('Advanced DSA Intelligence & Spaced Repetition Tests (Milestone M3)', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let sampleProblemA: any;
  let sampleProblemB: any;

  beforeAll(async () => {
    await ensureSampleDsaProblems();

    // Authenticate User A (ADMIN for problem import permission)
    const userA = await createTestUser('ADMIN');
    userAToken = userA.token;
    userAId = userA.userId;

    // Authenticate User B
    const userB = await createTestUser();
    userBToken = userB.token;
    userBId = userB.userId;

    // Clear test user progress and test imported problems FIRST
    await prisma.userDsaProgress.deleteMany({
      where: { userId: { in: [userAId, userBId] } },
    });
    await prisma.dsaProblem.deleteMany({
      where: {
        OR: [
          { slug: { in: ['subarray-sum-equals-k-leetcode', 'course-schedule-leetcode', 'subarray-sum-equals-k', 'course-schedule'] } },
          { canonicalSlug: { in: ['subarray-sum-equals-k', 'course-schedule'] } },
        ],
      },
    });

    // Fetch two persistent core problems from the remaining catalog
    const problems = await prisma.dsaProblem.findMany({
      where: {
        slug: { notIn: ['subarray-sum-equals-k-leetcode', 'course-schedule-leetcode'] },
      },
      take: 3,
    });
    expect(problems.length).toBeGreaterThanOrEqual(2);
    sampleProblemA = problems[0];
    sampleProblemB = problems[1];
  });

  afterAll(async () => {
    if (userAId || userBId) {
      await prisma.userDsaProgress.deleteMany({
        where: { userId: { in: [userAId, userBId].filter(Boolean) } },
      });
      await prisma.session.deleteMany({
        where: { userId: { in: [userAId, userBId].filter(Boolean) } },
      });
      await prisma.userPreference.deleteMany({
        where: { userId: { in: [userAId, userBId].filter(Boolean) } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [userAId, userBId].filter(Boolean) } },
      });
    }
    await prisma.$disconnect();
  });

  // 1. Slug normalization and difficulty mapping
  it('1. Deduplication engine correctly normalizes slugs and maps platform ratings', () => {
    expect(generateCanonicalSlug('1. Two Sum')).toBe('two-sum');
    expect(generateCanonicalSlug('15. 3Sum - Closest')).toBe('3sum-closest');
    expect(generateCanonicalSlug('Longest Palindromic Substring')).toBe('longest-palindromic-substring');

    // Codeforces rating to difficulty mapping
    expect(normalizeDifficulty(800, 'CODEFORCES')).toBe('EASY');
    expect(normalizeDifficulty(1400, 'CODEFORCES')).toBe('MEDIUM');
    expect(normalizeDifficulty(2100, 'CODEFORCES')).toBe('HARD');
  });

  // 2. CSV Import & Deduplication
  it('2. Imports problems from CSV format and deduplicates duplicates against the database', async () => {
    const csvContent = `title,platform,difficulty,topic,subtopic,url,tags
Subarray Sum Equals K,LEETCODE,MEDIUM,Array,Prefix Sum,https://leetcode.com/problems/subarray-sum-equals-k/,prefix-sum;hash-table
Course Schedule,LEETCODE,MEDIUM,Graph,Topological Sort,https://leetcode.com/problems/course-schedule/,graph;bfs
Subarray Sum Equals K,LEETCODE,MEDIUM,Array,Prefix Sum,https://leetcode.com/problems/subarray-sum-equals-k/,prefix-sum`;

    const res = await request(app)
      .post('/api/v1/dsa/import')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'CSV',
        content: csvContent,
        defaultCategory: 'STRIVER_A2Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.totalReceived).toBe(3);
    expect(res.body.data.importedCount).toBe(2);
    expect(res.body.data.deduplicatedCount).toBe(1);
  });

  // 3. Independent vs Assisted Problem Solving
  it('3. Distinguishes independent mastery (100%) from assisted solutions with hints/editorials', async () => {
    // User A solves problem A independently
    const resIndependent = await request(app)
      .post(`/api/v1/dsa/problems/${sampleProblemA.id}/progress`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        status: 'SOLVED',
        solutionMode: 'INDEPENDENT',
        confidenceRating: 5,
        timeSpentSeconds: 420,
        notes: 'Clean two-pointer approach in O(n) time',
      });

    expect(resIndependent.status).toBe(200);
    expect(resIndependent.body.data.solutionMode).toBe('INDEPENDENT');
    expect(resIndependent.body.data.masteryScore).toBe(100.0);
    expect(resIndependent.body.data.hintUsed).toBe(false);

    // User A solves problem B with hints and editorial
    const resAssisted = await request(app)
      .post(`/api/v1/dsa/problems/${sampleProblemB.id}/progress`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        status: 'SOLVED',
        solutionMode: 'WITH_HINTS',
        confidenceRating: 3,
        timeSpentSeconds: 900,
        hintUsed: true,
        repeatedMistakes: ['off-by-one', 'edge-case-empty'],
      });

    expect(resAssisted.status).toBe(200);
    expect(resAssisted.body.data.solutionMode).toBe('WITH_HINTS');
    expect(resAssisted.body.data.masteryScore).toBe(65.0);
    expect(resAssisted.body.data.hintUsed).toBe(true);
  });

  // 4. SuperMemo SM-2 Spaced Repetition Scheduling
  it('4. SM-2 Spaced Repetition calculates interval progression and handles recall blackouts', async () => {
    // Problem A was rating 5 -> Should schedule 1 day for repetition 0
    const progressA = await prisma.userDsaProgress.findUnique({
      where: { userId_problemId: { userId: userAId, problemId: sampleProblemA.id } },
    });
    expect(progressA!.repetitionCount).toBe(1);
    expect(progressA!.reviewIntervalDays).toBe(1);

    // Review Problem A again with rating 5 -> Should advance interval to 6 days
    const reviewRes = await request(app)
      .post(`/api/v1/dsa/review/${sampleProblemA.id}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ rating: 5 });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.repetitionCount).toBe(2);
    expect(reviewRes.body.data.reviewIntervalDays).toBe(6);

    // Simulate recall blackout (rating 1) on Problem B
    const blackoutRes = await request(app)
      .post(`/api/v1/dsa/review/${sampleProblemB.id}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ rating: 1 });

    expect(blackoutRes.status).toBe(200);
    expect(blackoutRes.body.data.repetitionCount).toBe(0);
    expect(blackoutRes.body.data.reviewIntervalDays).toBe(1);
    expect(blackoutRes.body.data.status).toBe('REVISE');
  });

  // 5. Revision queue
  it('5. Returns revision queue containing problems marked REVISE or due today', async () => {
    const res = await request(app)
      .get('/api/v1/dsa/revision-queue')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.dueCount).toBeGreaterThanOrEqual(1);
    const queuedIds = res.body.data.items.map((i: any) => i.problemId);
    expect(queuedIds).toContain(sampleProblemB.id); // Marked REVISE
  });

  // 6. User Analytics & Weakness Detection
  it('6. Computes independent mastery index, weakness detection, and repeated mistake frequency', async () => {
    const res = await request(app)
      .get('/api/v1/dsa/analytics')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    const analytics = res.body.data;

    expect(analytics.solvedCount).toBe(1);
    expect(analytics.reviseCount).toBe(1);
    expect(analytics.averageMasteryScore).toBeGreaterThan(50);
    expect(analytics.solutionModeCounts.INDEPENDENT).toBe(1);
    expect(analytics.solutionModeCounts.WITH_HINTS).toBe(1);

    // Repeated mistakes analysis
    expect(analytics.repeatedMistakes.length).toBeGreaterThan(0);
    const offByOne = analytics.repeatedMistakes.find((m: any) => m.mistake === 'off-by-one');
    expect(offByOne).toBeDefined();
    expect(offByOne.count).toBe(1);

    // Weak topic identification
    expect(analytics.weakTopics.length).toBeGreaterThanOrEqual(1);
  });

  // 7. Recommended Next Problem
  it('7. Recommends next problems based on weakness recovery and prerequisite topics', async () => {
    const res = await request(app)
      .get('/api/v1/dsa/recommendations')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.focusTopic).toBeDefined();
    expect(res.body.data.problems.length).toBeGreaterThan(0);
  });

  // 8. Multi-user isolation
  it('8. Multi-user isolation: User B has separate clean analytics and empty revision queue', async () => {
    const resB = await request(app)
      .get('/api/v1/dsa/analytics')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data.solvedCount).toBe(0);
    expect(resB.body.data.revisionQueueCount).toBe(0);

    const queueB = await request(app)
      .get('/api/v1/dsa/revision-queue')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(queueB.status).toBe(200);
    expect(queueB.body.data.dueCount).toBe(0);
  });
});
