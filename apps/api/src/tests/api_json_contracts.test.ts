import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { createTestUser } from './test_helpers.js';

describe('API Structured JSON Error Handling & HTML Prevention Contract', () => {
  it('1. Returns structured JSON for unknown /api/v1 route and never returns HTML', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-for-testing');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('data', null);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.statusCode).toBe(404);
    expect(res.body.error.message).toContain('API endpoint not found');
    expect(res.body).toHaveProperty('requestId');
    expect(typeof res.body.requestId).toBe('string');
  });

  it('2. Returns structured JSON for unknown top-level /api route', async () => {
    const res = await request(app).post('/api/unknown-gateway-target').send({ test: true });
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('API endpoint not found: POST /api/unknown-gateway-target');
  });

  it('3. Guarantees x-request-id header is attached to all API responses', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.body.status).toBe('ok');
  });

  it('4. Suppresses internal error details in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const { errorHandler } = await import('../middleware/errorHandler.js');
      const mockReq = { headers: {} } as any;
      let responseBody: any = null;
      let responseStatus = 0;
      const mockRes = {
        status: (code: number) => {
          responseStatus = code;
          return {
            json: (body: any) => { responseBody = body; }
          };
        }
      } as any;
      errorHandler(new Error('Internal secret database query failed at line 42'), mockReq, mockRes, (() => {}) as any);
      expect(responseStatus).toBe(500);
      expect(responseBody.error.message).toBe('An unexpected internal server error occurred.');
      expect(responseBody.error.stack).toBeUndefined();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('5. Successfully exposes /live and /ready probes with database connectivity status', async () => {
    const liveRes = await request(app).get('/live');
    expect(liveRes.status).toBe(200);
    expect(liveRes.body.status).toBe('ok');
    expect(typeof liveRes.body.uptime).toBe('number');

    const readyRes = await request(app).get('/ready');
    expect(readyRes.status).toBe(200);
    expect(readyRes.body.status).toBe('ready');
    expect(readyRes.body.database).toBe('connected');

    const v1ReadyRes = await request(app).get('/api/v1/ready');
    expect(v1ReadyRes.status).toBe(200);
    expect(v1ReadyRes.body.status).toBe('ready');
  });

  it('6. Rejects oversized payloads (>1MB) with HTTP 413 or 400 structured JSON', async () => {
    // Generate a payload slightly larger than 1MB
    const bigData = 'X'.repeat(1024 * 1024 + 50);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send(`{"username":"${bigData}"}`);

    expect([413, 400]).toContain(res.status);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.success).toBe(false);
  });

  describe('Frontend-Backend Contract Mismatch Alignments (C1-C18)', () => {
    it('C1-C5: GET /api/v1/integrations/status returns aligned properties for all providers', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .get('/api/v1/integrations/status')
        .set('Authorization', user.authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      // GitHub contract
      expect(data.github).toHaveProperty('isConnected');
      expect(data.github).toHaveProperty('connected');
      expect(data.github).toHaveProperty('repoCount');
      expect(data.github).toHaveProperty('publicReposCount');

      // Codeforces contract
      expect(data.codeforces).toHaveProperty('isConnected');
      expect(data.codeforces).toHaveProperty('connected');
      expect(data.codeforces).toHaveProperty('solvedCount');
      expect(data.codeforces).toHaveProperty('totalSolved');

      // LeetCode contract
      expect(data.leetcode).toHaveProperty('isConnected');
      expect(data.leetcode).toHaveProperty('connected');
      expect(data.leetcode).toHaveProperty('totalSolved');

      // Take U Forward contract
      expect(data.tuf).toHaveProperty('isConnected');
      expect(data.tuf).toHaveProperty('connected');
      expect(data.tuf).toHaveProperty('completedProblems');

      // Ollama contract
      expect(data.ollama).toHaveProperty('isConnected');
      expect(data.ollama).toHaveProperty('connected');
      expect(data.ollama).toHaveProperty('hostUrl');
    });

    it('C3: GET /api/v1/integrations/github/oauth/url returns authorizationUrl', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .get('/api/v1/integrations/github/oauth/url')
        .set('Authorization', user.authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isConfigured');
      expect(res.body.data).toHaveProperty('state');
    });

    it('C4: POST /api/v1/integrations/tuf/sync returns 400 manual only', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .post('/api/v1/integrations/tuf/sync')
        .set('Authorization', user.authHeader);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Take U Forward sync is manual only');
    });

    it('C9: POST /api/v1/forum/posts/:postId/upvote increments post upvotes', async () => {
      const user = await createTestUser();
      const createRes = await request(app)
        .post('/api/v1/forum/posts')
        .set('Authorization', user.authHeader)
        .send({ title: 'Test Post for Upvote', content: 'Content of upvote test post' });

      expect(createRes.status).toBe(201);
      const postId = createRes.body.data.id;

      const upvoteRes = await request(app)
        .post(`/api/v1/forum/posts/${postId}/upvote`)
        .set('Authorization', user.authHeader);

      expect(upvoteRes.status).toBe(200);
      expect(upvoteRes.body.success).toBe(true);
      expect(upvoteRes.body.data.upvotes).toBe(1);
    });

    it('C10: POST /api/v1/ai/prompt responds with reply and content', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .post('/api/v1/ai/prompt')
        .set('Authorization', user.authHeader)
        .send({ prompt: 'Explain the single responsibility principle' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reply');
      expect(res.body.data).toHaveProperty('content');
    });

    it('C11: GET /api/v1/navigator/graph returns both mermaid and mermaidCode', async () => {
      const user = await createTestUser();
      await request(app)
        .get('/api/v1/navigator/summary')
        .set('Authorization', user.authHeader);

      const res = await request(app)
        .get('/api/v1/navigator/graph')
        .set('Authorization', user.authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('mermaid');
      expect(res.body.data).toHaveProperty('mermaidCode');
      expect(res.body.data.mermaid).toBe(res.body.data.mermaidCode);
    });
  });
});
