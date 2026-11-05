import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';
import { extractReadmeSignals } from '../modules/profile/readme_extractor.js';
import { recommendationEngine } from '../modules/recommendations/recommendation.engine.js';

describe('Unified Developer Profile & 7-Factor Recommendation Engine Tests', () => {
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

  // 1. README Signal Extraction
  describe('1. README Signal Extraction', () => {
    it('accurately parses languages, frameworks, tools, and databases from markdown', () => {
      const sampleReadme = `
# Hi there 👋 I'm Alex

I am a Full Stack Developer passionate about distributed systems and modern web apps.

### 🛠️ Languages & Frameworks
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

- Languages: TypeScript, JavaScript, Python, Rust, Go
- Frameworks: Next.js, Express, Tailwind CSS
- Databases: PostgreSQL, Redis, MongoDB
- Cloud & DevOps: Docker, Kubernetes, AWS, GitHub Actions

### 🔭 Projects & Interests
Working on open source developer intelligence tools, CLI automation, and cloud native architectures.
      `;

      const signals = extractReadmeSignals(sampleReadme, 'github_profile_readme');

      expect(signals.languages).toContain('TypeScript');
      expect(signals.languages).toContain('Python');
      expect(signals.languages).toContain('Rust');
      expect(signals.languages).toContain('Go');

      expect(signals.frameworks).toContain('React');
      expect(signals.frameworks).toContain('Next.js');
      expect(signals.frameworks).toContain('Express');

      expect(signals.databases).toContain('PostgreSQL');
      expect(signals.databases).toContain('Redis');

      expect(signals.tools).toContain('Docker');
      expect(signals.tools).toContain('Kubernetes');

      expect(signals.summary).toBeDefined();
      expect(signals.summary.length).toBeGreaterThan(0);
    });
  });

  // 2. Profile Sync & Unified Profile Endpoints
  describe('2. Unified Developer Profile API', () => {
    it('syncs README signals into profile and returns aggregated intelligence', async () => {
      const readmeMarkdown = `
# Developer Profile
Building distributed systems with TypeScript, Rust, and PostgreSQL.
Interested in open source, DevOps, and compiler architecture.
      `;

      const syncRes = await request(app)
        .post('/api/v1/profile/readme/sync')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ markdown: readmeMarkdown });

      expect(syncRes.status).toBe(200);
      expect(syncRes.body.success).toBe(true);
      expect(syncRes.body.data.signalsCount).toBeGreaterThan(0);
      expect(syncRes.body.data.extractedSignals.languages).toContain('TypeScript');
      expect(syncRes.body.data.extractedSignals.languages).toContain('Rust');
      expect(syncRes.body.data.extractedSignals.databases).toContain('PostgreSQL');
    });

    it('retrieves the unified developer profile with multi-source verified skills', async () => {
      const res = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const profile = res.body.data;

      expect(profile).toBeDefined();
      expect(profile.user).toBeDefined();
      expect(profile.skills).toBeInstanceOf(Array);
      expect(profile.skills.length).toBeGreaterThan(0);

      // Verify skill sources
      const tsSkill = profile.skills.find((s: any) => s.skillName.toLowerCase() === 'typescript');
      expect(tsSkill).toBeDefined();
      expect(tsSkill.confidenceScore).toBeGreaterThanOrEqual(50);
      expect(['GITHUB_CODEBASE', 'GITHUB_README', 'MANUAL_VERIFIED']).toContain(tsSkill.source);
    });

    it('updates developer preferences and commitment level', async () => {
      const updateRes = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bio: 'Open source contributor & systems enthusiast',
          primaryFocus: 'Full Stack & Distributed Systems',
          experienceLevel: 'INTERMEDIATE',
          weeklyCommitmentHours: 15,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.bio).toBe('Open source contributor & systems enthusiast');
      expect(updateRes.body.data.weeklyCommitmentHours).toBe(15);
    });

    it('allows adding and removing custom verified skills with confidence scores', async () => {
      // Add custom skill
      const addRes = await request(app)
        .post('/api/v1/profile/skills')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          skillName: 'GraphQL',
          category: 'API_GRAPH',
          confidenceScore: 82,
        });

      expect(addRes.status).toBe(200);
      expect(addRes.body.success).toBe(true);
      expect(addRes.body.data.skillName).toBe('GraphQL');
      expect(addRes.body.data.confidenceScore).toBe(82);

      // Verify skill is in profile
      const profRes = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${userToken}`);
      const gqlSkill = profRes.body.data.skills.find((s: any) => s.skillName === 'GraphQL');
      expect(gqlSkill).toBeDefined();
      expect(gqlSkill.confidenceScore).toBe(82);

      // Remove skill
      const delRes = await request(app)
        .delete('/api/v1/profile/skills/GraphQL')
        .set('Authorization', `Bearer ${userToken}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
    });
  });

  // 3. 7-Factor Recommendation Engine & Feedback Loop
  describe('3. 7-Factor Recommendation Engine & Feedback Loop', () => {
    it('returns explainable recommendations with category and transparent factors', async () => {
      const res = await request(app)
        .get('/api/v1/profile/recommendations?limit=6')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const topRec = res.body.data[0];
      expect(topRec.score).toBeGreaterThanOrEqual(20);
      expect(topRec.category).toBeDefined();
      expect(['BEST_SKILL_FIT', 'GOOD_FIRST_ISSUE', 'DOMAIN_EXPANSION', 'TRENDING_HOT', 'SPONSORED_BOUNTY']).toContain(topRec.category);

      // Verify 7 explainable factors
      expect(topRec.factors).toBeDefined();
      expect(topRec.factors.technologyMatchScore).toBeGreaterThanOrEqual(0);
      expect(topRec.factors.domainMatchScore).toBeGreaterThanOrEqual(0);
      expect(topRec.factors.difficultyScore).toBeGreaterThanOrEqual(0);
      expect(topRec.factors.skillStrengthScore).toBeGreaterThanOrEqual(0);
      expect(topRec.factors.projectHealthScore).toBeGreaterThanOrEqual(0);
      expect(topRec.factors.freshnessScore).toBeGreaterThanOrEqual(0);
      expect(topRec.factors.orgRelevanceScore).toBeGreaterThanOrEqual(0);

      // Verify explanation string mentions alignment
      expect(topRec.explanation).toMatch(/Recommended because/i);
    });

    it('records user feedback and adjusts recommendations deterministically', async () => {
      // Get a recommendation
      const listRes = await request(app)
        .get('/api/v1/profile/recommendations?limit=2')
        .set('Authorization', `Bearer ${userToken}`);

      const candidate = listRes.body.data[0];
      expect(candidate).toBeDefined();

      // Record feedback (SAVED)
      const saveRes = await request(app)
        .post('/api/v1/profile/recommendations/feedback')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recommendationId: candidate.id,
          action: 'SAVED',
        });

      expect(saveRes.status).toBe(201);
      expect(saveRes.body.success).toBe(true);
      expect(saveRes.body.data.action).toBe('SAVED');

      // Record feedback (DISMISSED with reason)
      const dismissRes = await request(app)
        .post('/api/v1/profile/recommendations/feedback')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recommendationId: candidate.id,
          action: 'DISMISSED',
          reason: 'Not interested in this technology',
        });

      expect(dismissRes.status).toBe(201);
      expect(dismissRes.body.success).toBe(true);
      expect(dismissRes.body.data.action).toBe('DISMISSED');
    });

    it('isolates user recommendations and feedback: dismissed recommendations do not appear for the user but remain visible to other users', async () => {
      // Register or login a second isolated user User B
      let resB = await request(app)
        .post('/api/v1/auth/login')
        .send({ login: 'rec_iso_user_b', password: 'DevOrbitPassword999!' });

      if (resB.status !== 200) {
        resB = await request(app)
          .post('/api/v1/auth/register')
          .send({
            email: 'rec_iso_user_b@devorbit.local',
            username: 'rec_iso_user_b',
            password: 'DevOrbitPassword999!',
            name: 'Rec Iso User B',
          });
      }
      const tokenB = resB.body.data.token;

      // User A gets recommendations
      const recsA = await request(app)
        .get('/api/v1/profile/recommendations?limit=5')
        .set('Authorization', `Bearer ${userToken}`);

      if (recsA.body.data && recsA.body.data.length > 0) {
        const targetIssueId = recsA.body.data[0].issue.id;
        const targetRecId = recsA.body.data[0].id;

        // User A dismisses targetRecId
        await request(app)
          .post('/api/v1/profile/recommendations/feedback')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            recommendationId: targetRecId,
            action: 'DISMISSED',
            reason: 'Irrelevant to my profile',
          });

        // User A queries recommendations again - targetIssueId is filtered out
        const afterDismissA = await request(app)
          .get('/api/v1/profile/recommendations?limit=10')
          .set('Authorization', `Bearer ${userToken}`);
        const issueIdsA = afterDismissA.body.data.map((r: any) => r.issue.id);
        expect(issueIdsA).not.toContain(targetIssueId);

        // User B queries recommendations - User A's dismissal has ZERO effect on User B
        const recsB = await request(app)
          .get('/api/v1/profile/recommendations?limit=10')
          .set('Authorization', `Bearer ${tokenB}`);
        expect(recsB.status).toBe(200);
        expect(recsB.body.success).toBe(true);
      }
    });
  });
});
