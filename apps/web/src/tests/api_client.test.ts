import { describe, it, expect } from 'vitest';
import { parseApiResponse } from '../lib/api.js';

describe('Frontend Centralized API Client & Response Parser', () => {
  it('1. Correctly parses valid JSON API responses', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true, data: { count: 42 } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'x-request-id': 'req-123' },
    });

    const result = await parseApiResponse(mockResponse);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ count: 42 });
    expect(result.requestId).toBe('req-123');
  });

  it('2. Prevents SyntaxError when API unexpectedly returns HTML error pages', async () => {
    const htmlBody = '<!DOCTYPE html><html><body><h1>502 Bad Gateway</h1></body></html>';
    const mockResponse = new Response(htmlBody, {
      status: 502,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

    const result = await parseApiResponse(mockResponse);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.statusCode).toBe(502);
    expect(result.error?.message).toContain('API endpoint returned HTML');
    expect(result.error?.message).not.toContain('Unexpected token');
  });

  it('3. Handles malformed JSON strings without throwing unhandled exceptions', async () => {
    const malformedJson = '{"success": true, data: [truncated';
    const mockResponse = new Response(malformedJson, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await parseApiResponse(mockResponse);
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Malformed JSON returned from server');
  });
});
