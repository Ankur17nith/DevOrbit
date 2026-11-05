import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';
import { OllamaService } from '../modules/ai/ollama.service.js';

describe('Orbit Recon, Local AI & Pulse Intelligence Tests (Milestone M8)', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Authenticate test user
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'alex_developer', password: 'DevOrbit123!' });
    userToken = res.body.data.token;
    userId = res.body.data.user.id;

    // Clean up any existing test urgent fellowship notification for this user
    await prisma.notification.deleteMany({
      where: {
        userId,
        title: { contains: 'Urgent Test Fellowship' },
      },
    });

    // Seed an OSS program with deadline within 48 hours for pulse test
    await prisma.ossProgram.upsert({
      where: { slug: 'test-urgent-fellowship' },
      update: {
        deadlineDate: new Date(Date.now() + 36 * 3600 * 1000), // 36 hours from now
      },
      create: {
        name: 'Urgent Test Fellowship 2026',
        slug: 'test-urgent-fellowship',
        category: 'MENTORSHIP',
        description: 'Test urgent mentorship fellowship closing within 72 hours',
        website: 'https://fellowship.test.org',
        status: 'ACTIVE',
        deadlineDate: new Date(Date.now() + 36 * 3600 * 1000),
      },
    });
  });

  // 1. Ollama Offline Detection & Deterministic Fallback
  it('1. Handles offline Ollama gracefully and falls back to deterministic local developer engine', async () => {
    const service = new OllamaService('http://127.0.0.1:99999'); // Non-existent port
    const isOnline = await service.isOllamaAvailable();
    expect(isOnline).toBe(false);

    const reviewRes = await service.generate('Please review this authentication code for security');
    expect(reviewRes.source).toBe('deterministic_fallback');
    expect(reviewRes.model).toContain('deterministic');
    expect(reviewRes.content).toContain('Orbit AI: Code Review Analysis');

    const dsaRes = await service.generate('How to solve Two Sum using algorithms?');
    expect(dsaRes.source).toBe('deterministic_fallback');
    expect(dsaRes.content).toContain('Orbit AI: Algorithmic Intelligence');
  });

  // 2. Orbit AI Status Endpoint
  it('2. Serves /api/v1/ai/status reporting active local engine and privacy guarantee', async () => {
    const res = await request(app).get('/api/v1/ai/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.privacy).toContain('Local-First');
    expect(res.body.data.activeEngine).toBeDefined();
  });

  // 3. Orbit AI Chat & Conversation Persistence
  it('3. Persists AI conversations and generates contextual developer responses', async () => {
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        prompt: 'Provide security audit advice for local database encryption',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.conversationId).toBeDefined();
    expect(res.body.data.message.content).toContain('Orbit AI: Security Audit');
  });

  // 4. Orbit Recon Inspection & Electric Violet Tokens
  it('4. Inspects target origin, extracts Electric Violet design tokens, and generates React component', async () => {
    const res = await request(app)
      .post('/api/v1/recon/inspect')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        url: 'https://ossium.in/',
        projectName: 'Ossium Target UI',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accentColor).toBe('#8B5CF6'); // Zero emerald green
    expect(res.body.data.generatedCode).toContain('Electric Violet');
    expect(res.body.data.generatedCode).not.toContain('#09AE5B');
  });

  // 5. Orbit Pulse Opportunity Monitor
  it('5. Monitors active deadlines within 72h and dispatches persistent desktop notifications', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/pulse')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.programsMonitored).toBeGreaterThanOrEqual(1);

    // Verify unread count endpoint
    const unreadRes = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${userToken}`);
    expect(unreadRes.status).toBe(200);
    expect(unreadRes.body.data.unreadCount).toBeGreaterThanOrEqual(1);

    // Verify notifications list
    const listRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((n: any) => n.title.includes('Urgent Test Fellowship'))).toBe(true);
  });
});
