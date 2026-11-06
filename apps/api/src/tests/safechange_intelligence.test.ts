import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { SafeChangeService } from '../modules/safechange/safechange.service.js';
import { MigrationSafetyChecker } from '../modules/safechange/migration_checker.js';
import { DependencyGuardian } from '../modules/safechange/dependency_guardian.js';

describe('Orbit SafeChange & Engineering Quality Tests (Milestone M7)', () => {
  const service = new SafeChangeService();
  let authToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `safechange_test_${Date.now()}@devorbit.test`,
        username: `sc_tester_${Date.now()}`,
        password: 'ScPassword123!',
        name: 'SafeChange Tester',
      });
    authToken = res.body.data.token;
  });

  // 1. Change Impact & Blast Radius Analysis
  it('1. Analyzes change impact and traces downstream dependents across codebase', async () => {
    // Inspect impact of changing a core utility (e.g. navigator.types.ts)
    const impact = await service.analyzeImpact('apps/api/src/modules/navigator/navigator.types.ts');
    expect(impact.targetFile).toContain('navigator.types.ts');
    expect(impact.riskScore).toBeGreaterThanOrEqual(30);
    expect(impact.affectedModules).toContain('navigator');
    expect(impact.recommendations.length).toBeGreaterThan(0);
  });

  // 2. Risk Scoring Differentiation
  it('2. Assigns higher risk levels to core utilities than isolated leaf files', async () => {
    const coreImpact = await service.analyzeImpact('apps/api/src/lib/jwt.ts');
    const leafImpact = await service.analyzeImpact('apps/api/src/database/seed.ts');

    expect(coreImpact.riskScore).toBeGreaterThan(leafImpact.riskScore);
  });

  // 3. Migration Safety: Dropped Model Detection
  it('3. Flags destructive migration when a Prisma model table is removed', () => {
    const current = `
datasource db { provider = "sqlite" url = "file:./dev.db" }
generator client { provider = "prisma-client-js" }
model User { id String @id }
model Bounty { id String @id }
`;
    const proposed = `
datasource db { provider = "sqlite" url = "file:./dev.db" }
generator client { provider = "prisma-client-js" }
model User { id String @id }
`;
    // Bounty model is missing
    const report = MigrationSafetyChecker.checkSchema(proposed, '/dummy/path');
    // Using string comparison logic
    const directReport = (MigrationSafetyChecker as any).parseModels ? null : null;

    // Simulate check
    const warnings = MigrationSafetyChecker.checkSchema(proposed);
    expect(warnings.warnings.length).toBeGreaterThan(0);
    expect(warnings.isDestructive).toBe(true);
  });

  // 4. Migration Safety: Non-Nullable Field without Default
  it('4. Flags critical warning when non-nullable column is added to existing model without @default', () => {
    const proposedWithBadField = `
model User {
  id String @id
  newStrictField String
}
`;
    const report = MigrationSafetyChecker.checkSchema(proposedWithBadField);
    expect(report.warnings.some(w => w.change === 'NON_NULL_NO_DEFAULT')).toBe(true);
    expect(report.isDestructive).toBe(true);
  });

  // 5. Dependency Guardian & Technical Debt Quality Metrics
  it('5. Audits workspace dependencies, test volume ratio, and health grades', () => {
    const quality = DependencyGuardian.audit();
    expect(quality.totalTestSuites).toBeGreaterThanOrEqual(5);
    expect(quality.totalAutomatedTests).toBeGreaterThanOrEqual(40);
    expect(quality.testToCodeRatio).toBeGreaterThan(0);
    expect(['A+', 'A', 'B']).toContain(quality.healthGrade);
    expect(quality.techDebtScore).toBeLessThanOrEqual(30);
  });

  // 6. End-to-End HTTP API Endpoints
  it('6. Serves /impact, /migration, and /quality HTTP API endpoints', async () => {
    // 1. Impact Endpoint
    const impactRes = await request(app)
      .post('/api/v1/safechange/impact')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ filePath: 'apps/api/src/lib/jwt.ts' });
    expect(impactRes.status).toBe(200);
    expect(impactRes.body.data.impact.riskLevel).toBeDefined();

    // 2. Migration Safety Endpoint
    const migrationRes = await request(app)
      .post('/api/v1/safechange/migration')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        schemaContent: `model User { id String @id email String @unique }`,
      });
    expect(migrationRes.status).toBe(200);
    expect(migrationRes.body.data.report.warnings).toBeDefined();

    // 3. Quality Guardian Endpoint
    const qualityRes = await request(app)
      .get('/api/v1/safechange/quality')
      .set('Authorization', `Bearer ${authToken}`);
    expect(qualityRes.status).toBe(200);
    expect(qualityRes.body.data.quality.healthGrade).toBeDefined();
    expect(qualityRes.body.data.quality.dependencies.length).toBeGreaterThan(0);
  });
});
