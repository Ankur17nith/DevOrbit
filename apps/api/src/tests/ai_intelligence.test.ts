import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';

describe('AI Intelligence & Provenance Transparency Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Register test user
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `ai.tester.${Date.now()}@devorbit.internal`,
        username: `aitester_${Date.now()}`,
        name: 'AI Quality Tester',
        password: 'SecurePassword123!',
      });

    expect(res.status).toBe(201);
    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
  });

  it('1. GET /api/v1/ai/status returns local-first runtime status', async () => {
    const res = await request(app).get('/api/v1/ai/status');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('ollamaAvailable');
    expect(res.body.data).toHaveProperty('reachable');
    expect(res.body.data).toHaveProperty('activeEngine');
    expect(res.body.data.privacy).toContain('Local-First');
  });

  it('2. GET /api/v1/ai/models returns reachable flag and honest model list', async () => {
    const res = await request(app).get('/api/v1/ai/models');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('reachable');
    expect(Array.isArray(res.body.data.models)).toBe(true);

    if (!res.body.data.reachable) {
      // Offline fallback guarantee: empty models list and explicit guidance
      expect(res.body.data.models).toHaveLength(0);
      expect(res.body.data.message).toContain('ollama run qwen2.5-coder');
    }
  });

  it('3. POST /api/v1/ai/chat returns explicit provenance and fallback status', async () => {
    const prompt = 'Please provide an algorithmic derivation for Two Pointers technique';
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ prompt });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('conversationId');
    expect(res.body.data).toHaveProperty('isFallback');
    expect(res.body.data).toHaveProperty('isRealModel');
    expect(res.body.data).toHaveProperty('provenance');

    // Offline test execution environment verification
    if (res.body.data.isFallback) {
      expect(res.body.data.isRealModel).toBe(false);
      expect(res.body.data.provenance).toContain('Deterministic Rule Engine');
      expect(res.body.data.message.content).toContain('Algorithmic Intelligence');
      expect(res.body.data.message.isFallback).toBe(true);
    }
  });

  it('4. GET /api/v1/ai/conversations/:id retains message model and fallback metadata', async () => {
    // 1. Create a chat message
    const chatRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ prompt: 'Review our API security best practices' });

    expect(chatRes.status).toBe(200);
    const convId = chatRes.body.data.conversationId;

    // 2. Fetch conversation by ID
    const convRes = await request(app)
      .get(`/api/v1/ai/conversations/${convId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(convRes.status).toBe(200);
    expect(convRes.body.data.id).toBe(convId);
    expect(convRes.body.data.messages.length).toBeGreaterThanOrEqual(2);

    const assistantMsg = convRes.body.data.messages.find((m: any) => m.role === 'assistant');
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg).toHaveProperty('model');
    expect(assistantMsg).toHaveProperty('isFallback');
  });
});
