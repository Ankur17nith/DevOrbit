import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { organizationService } from '../modules/opensource/organization.service.js';

describe('Multi-Platform Organization Discovery System', () => {
  it('1. Returns organizations from multiple verified platforms (GSoC, Outreachy, LFX, MLH, GitHub)', async () => {
    const res = await request(app).get('/api/v1/opensource/organizations?limit=50');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orgs.length).toBeGreaterThan(0);
    expect(res.body.data.availablePlatforms.length).toBe(5);

    const platformsFound = new Set<string>();
    for (const org of res.body.data.orgs) {
      org.verifiedPlatforms.forEach((p: string) => platformsFound.add(p));
      expect(org.id).toBeDefined();
      expect(org.name).toBeDefined();
      expect(org.slug).toBeDefined();
      // Ensure no guessed broken URLs
      if (org.websiteUrl) {
        expect(org.websiteUrl).toMatch(/^https?:\/\//);
        expect(org.websiteUrl).not.toContain('archive/2026');
      }
    }

    expect(platformsFound.has('GSOC') || platformsFound.has('OUTREACHY')).toBe(true);
  });

  it('2. Filters organizations by specific platform selection (e.g. OUTREACHY)', async () => {
    const res = await request(app).get('/api/v1/opensource/organizations?platforms=OUTREACHY');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orgs.length).toBeGreaterThan(0);

    for (const org of res.body.data.orgs) {
      expect(org.verifiedPlatforms).toContain('OUTREACHY');
    }
  });

  it('3. Supports multi-technology filtering with AND/OR logic', async () => {
    // OR logic
    const orRes = await request(app).get('/api/v1/opensource/organizations?technologies=Rust,Python&techLogic=OR');
    expect(orRes.status).toBe(200);
    expect(orRes.body.success).toBe(true);

    for (const org of orRes.body.data.orgs) {
      const hasMatch = org.technologies.some((t: string) => 
        t.toLowerCase().includes('rust') || t.toLowerCase().includes('python')
      );
      expect(hasMatch).toBe(true);
    }

    // AND logic
    const andRes = await request(app).get('/api/v1/opensource/organizations?technologies=Rust,Python&techLogic=AND');
    expect(andRes.status).toBe(200);
    expect(andRes.body.success).toBe(true);

    for (const org of andRes.body.data.orgs) {
      const hasRust = org.technologies.some((t: string) => t.toLowerCase().includes('rust'));
      const hasPython = org.technologies.some((t: string) => t.toLowerCase().includes('python'));
      expect(hasRust && hasPython).toBe(true);
    }
  });

  it('4. Retrieves comprehensive organization detail view with authentic provenance', async () => {
    // Detail for Mozilla (Outreachy & GSoC)
    const res = await request(app).get('/api/v1/opensource/organizations/mozilla');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const org = res.body.data;
    expect(org.name).toBe('Mozilla');
    expect(org.websiteUrl).toContain('mozilla.org');
    expect(org.verifiedPlatforms).toContain('OUTREACHY');
    expect(org.officialLinks.website).toContain('mozilla.org');
    expect(org.officialLinks.repositoryOrg).toContain('github.com/mozilla');
    expect(org.mentorshipHistory.length).toBeGreaterThan(0);
    expect(org.repositories.length).toBeGreaterThan(0);
  });

  it('5. Returns 404 JSON for non-existent organizations without HTML leaks', async () => {
    const res = await request(app).get('/api/v1/opensource/organizations/completely_non_existent_org_xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error.message).toBe('string');
  });
});
