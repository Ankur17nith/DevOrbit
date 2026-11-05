import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

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
});
