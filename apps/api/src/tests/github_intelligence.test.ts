import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';
import { encryptSecret, decryptSecret } from '../lib/encryption.js';
import { GitHubClient, GitHubApiError } from '../modules/github/github.client.js';

describe('GitHub Intelligence & Repository Sync Tests (Milestone M2)', () => {
  let userAToken: string;
  let userBToken: string;
  let userCToken: string;
  let userAId: string;
  let userBId: string;
  let userCId: string;

  beforeAll(async () => {
    // Mock GitHubClient methods
    vi.spyOn(GitHubClient.prototype, 'validateToken').mockImplementation(async (token: string) => {
      if (token === 'test_pat_token_invalid' || token === 'expired_token') {
        throw new GitHubApiError('Bad credentials', 401);
      }
      const username = token.includes('sara') ? 'sara-chen' : 'alex-dev';
      return {
        valid: true,
        user: {
          login: username,
          name: username === 'sara-chen' ? 'Sara Chen' : 'Alex Developer',
          avatarUrl: `https://avatars.githubusercontent.com/u/1000${username.length}`,
          bio: 'Full-stack Systems & Distributed Computing Engineer',
          publicRepos: 18,
          totalPrivateRepos: 4,
        },
        scopes: ['read:user', 'repo', 'read:org'],
        rateLimit: {
          limit: 5000,
          remaining: 4985,
          reset: new Date(Date.now() + 3600000),
        },
      };
    });

    vi.spyOn(GitHubClient.prototype, 'fetchUserRepos').mockImplementation(async (token: string) => {
      const isSara = token.includes('sara');
      const mockRepos: any[] = isSara
        ? [
            {
              id: 9001,
              name: 'distributed-raft',
              full_name: 'sara-chen/distributed-raft',
              description: 'High-throughput Raft consensus engine in Rust with async Tokio',
              language: 'Rust',
              stargazers_count: 342,
              forks_count: 45,
              open_issues_count: 3,
              private: false,
              fork: false,
              default_branch: 'main',
              topics: ['raft', 'consensus', 'rust', 'tokio', 'distributed-systems'],
              license: { spdx_id: 'Apache-2.0', name: 'Apache License 2.0' },
              pushed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            },
            {
              id: 9002,
              name: 'orbit-mesh-proxy',
              full_name: 'sara-chen/orbit-mesh-proxy',
              description: 'Zero-copy eBPF service mesh sidecar proxy written in Go and C',
              language: 'Go',
              stargazers_count: 180,
              forks_count: 22,
              open_issues_count: 1,
              private: false,
              fork: false,
              default_branch: 'main',
              topics: ['ebpf', 'networking', 'go', 'sidecar', 'service-mesh'],
              license: { spdx_id: 'MIT', name: 'MIT License' },
              pushed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            },
          ]
        : [
            {
              id: 8001,
              name: 'devorbit-core',
              full_name: 'alex-dev/devorbit-core',
              description: 'Local-first Developer Intelligence Operating System built with React, TypeScript and Node',
              language: 'TypeScript',
              stargazers_count: 520,
              forks_count: 64,
              open_issues_count: 5,
              private: false,
              fork: false,
              default_branch: 'main',
              topics: ['react', 'typescript', 'vite', 'tailwind', 'sqlite', 'local-first'],
              license: { spdx_id: 'MIT', name: 'MIT License' },
              pushed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            },
            {
              id: 8002,
              name: 'fast-ast-parser',
              full_name: 'alex-dev/fast-ast-parser',
              description: 'High-speed incremental AST indexer and dependency graph builder',
              language: 'TypeScript',
              stargazers_count: 145,
              forks_count: 18,
              open_issues_count: 2,
              private: false,
              fork: false,
              default_branch: 'main',
              topics: ['ast', 'compiler', 'typescript', 'graph'],
              license: { spdx_id: 'MIT', name: 'MIT License' },
              pushed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
            },
            {
              id: 8003,
              name: 'cloud-infra-terraform',
              full_name: 'alex-dev/cloud-infra-terraform',
              description: 'Multi-region immutable cloud infrastructure with Docker and GitHub Actions CI/CD',
              language: 'HCL',
              stargazers_count: 42,
              forks_count: 6,
              open_issues_count: 0,
              private: true,
              fork: false,
              default_branch: 'main',
              topics: ['terraform', 'docker', 'ci-cd', 'github-actions'],
              license: null,
              pushed_at: new Date(Date.now() - 12 * 86400000).toISOString(),
            },
          ];

      return {
        repos: mockRepos,
        notModified: false,
        etag: 'mock-etag-v1',
        rateLimit: {
          limit: 5000,
          remaining: 4980,
          reset: new Date(Date.now() + 3600000),
        },
      };
    });

    vi.spyOn(GitHubClient.prototype, 'fetchRepoLanguages').mockImplementation(async (_token: string, _owner: string, repo: string) => {
      if (repo === 'distributed-raft') {
        return { Rust: 185000, Shell: 4200 };
      }
      if (repo === 'orbit-mesh-proxy') {
        return { Go: 120000, C: 45000, Makefile: 3200 };
      }
      if (repo === 'devorbit-core') {
        return { TypeScript: 280000, CSS: 42000, HTML: 12000 };
      }
      if (repo === 'fast-ast-parser') {
        return { TypeScript: 95000, JavaScript: 8500 };
      }
      return { TypeScript: 50000 };
    });

    // Authenticate or Register User A (Alex)
    let resA = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'alex_developer', password: 'DevOrbit123!' });
    if (resA.status !== 200) {
      resA = await request(app)
        .post('/api/v1/auth/login')
        .send({ login: 'alex_developer', password: 'DevOrbitPassword123!' });
    }
    if (resA.status !== 200) {
      resA = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `alex_developer_${Date.now()}@devorbit.local`,
          username: `alex_dev_${Date.now()}`,
          password: 'DevOrbitPassword123!',
          name: 'Alex Developer',
        });
    }
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Authenticate or Register User B (Sara)
    let resB = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'sara_chen', password: 'DevOrbit123!' });
    if (resB.status !== 200) {
      resB = await request(app)
        .post('/api/v1/auth/login')
        .send({ login: 'sara_chen', password: 'DevOrbitPassword123!' });
    }
    if (resB.status !== 200) {
      resB = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `sara_chen_${Date.now()}@devorbit.local`,
          username: `sara_chen_${Date.now()}`,
          password: 'DevOrbitPassword123!',
          name: 'Sara Chen',
        });
    }
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Authenticate or Register User C (Elena Isolated)
    let resC = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'elena_github_iso', password: 'DevOrbitPassword999!' });

    if (resC.status !== 200) {
      resC = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'elena_github_iso@devorbit.local',
          username: 'elena_github_iso',
          password: 'DevOrbitPassword999!',
          name: 'Elena Rostova',
        });
    }
    userCToken = resC.body.data.token;
    userCId = resC.body.data.user.id;

    // Clear prior integration data for clean state
    await prisma.userGithubRepo.deleteMany();
    await prisma.userContributionMetric.deleteMany();
    await prisma.userSkillProfile.deleteMany();
    await prisma.integrationCredential.deleteMany({ where: { provider: 'GITHUB' } });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await prisma.$disconnect();
  });

  // 1. Encryption & Security
  it('1. AES-256-GCM authenticated encryption secures tokens and detects tampering', () => {
    const rawToken = 'ghp_super_secret_developer_token_xyz123';
    const encrypted = encryptSecret(rawToken);

    expect(encrypted).not.toContain(rawToken);
    expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:ciphertext

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(rawToken);

    // Tampering test: flip bits in ciphertext
    const parts = encrypted.split(':');
    const tamperedCiphertext = parts[2].slice(0, -2) + (parts[2].endsWith('a') ? 'b' : 'a');
    const tamperedPayload = `${parts[0]}:${parts[1]}:${tamperedCiphertext}`;

    expect(() => decryptSecret(tamperedPayload)).toThrow();
  });

  // 2. Token rejection
  it('2. Rejects invalid GitHub personal access token with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/github/token')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ token: 'test_pat_token_invalid' });

    expect(res.status).toBe(401);
  });

  // 3. Unauthenticated access
  it('3. Rejects unauthenticated request to GitHub status with 401', async () => {
    const res = await request(app).get('/api/v1/github/status');
    expect(res.status).toBe(401);
  });

  // 4. Zero state for User C
  it('4. User C without GitHub integration returns connected: false', async () => {
    const res = await request(app)
      .get('/api/v1/github/status')
      .set('Authorization', `Bearer ${userCToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.connected).toBe(false);
    expect(res.body.data.repoCount).toBe(0);
  });

  // 5. Connect User A and verify sync & rate limits
  it('5. Connects User A GitHub account, performs initial sync, and returns rate limits', async () => {
    const res = await request(app)
      .post('/api/v1/github/token')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ token: 'mock_token_alex_dev' });

    expect(res.status).toBe(200);
    expect(res.body.data.connected).toBe(true);
    expect(res.body.data.username).toBe('alex-dev');
    expect(res.body.data.rateLimit.remaining).toBeGreaterThan(0);
    expect(res.body.data.scopes).toContain('read:user');
    expect(res.body.data.scopes).toContain('repo');

    // Verify token is encrypted in database and never plaintext
    const dbCred = await prisma.integrationCredential.findUnique({
      where: { userId_provider: { userId: userAId, provider: 'GITHUB' } },
    });
    expect(dbCred).toBeDefined();
    expect(dbCred!.encryptedToken).not.toContain('mock_token_alex_dev');
    expect(decryptSecret(dbCred!.encryptedToken!)).toBe('mock_token_alex_dev');
  });

  // 6. Connect User B with separate token & separate repos
  it('6. Connects User B (Sara) independently with separate repos and identity', async () => {
    const res = await request(app)
      .post('/api/v1/github/token')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ token: 'mock_token_sara_chen' });

    expect(res.status).toBe(200);
    expect(res.body.data.connected).toBe(true);
    expect(res.body.data.username).toBe('sara-chen');

    const statusB = await request(app)
      .get('/api/v1/github/status')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(statusB.body.data.username).toBe('sara-chen');
    expect(statusB.body.data.repoCount).toBe(2); // distributed-raft, orbit-mesh-proxy
    expect(statusB.body.data.tokenMasked).toBeDefined();
    expect(statusB.body.data.tokenMasked).not.toContain('mock_token_sara_chen');
    expect(statusB.body.data.tokenMasked).toMatch(/\*\*\*/);
  });

  // 7. Multi-user repository isolation
  it('7. Multi-user repository isolation: User A sees only their repos, User B sees only theirs', async () => {
    const resA = await request(app)
      .get('/api/v1/github/repositories')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(resA.status).toBe(200);
    const repoNamesA = resA.body.data.map((r: any) => r.name);
    expect(repoNamesA).toContain('devorbit-core');
    expect(repoNamesA).toContain('fast-ast-parser');
    expect(repoNamesA).not.toContain('distributed-raft');

    const resB = await request(app)
      .get('/api/v1/github/repositories')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(resB.status).toBe(200);
    const repoNamesB = resB.body.data.map((r: any) => r.name);
    expect(repoNamesB).toContain('distributed-raft');
    expect(repoNamesB).toContain('orbit-mesh-proxy');
    expect(repoNamesB).not.toContain('devorbit-core');
  });

  // 8. Incremental sync
  it('8. Supports manual trigger sync and records lastSyncedAt', async () => {
    const res = await request(app)
      .post('/api/v1/github/sync')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.synced).toBe(true);
    expect(res.body.data.totalCount).toBe(3);
    expect(res.body.data.lastSyncedAt).toBeDefined();
  });

  // 9. Contribution calendar & metrics calculation
  it('9. Computes empirical 52-week contribution calendar, streak, and PR merge rate', async () => {
    const res = await request(app)
      .get('/api/v1/github/profile')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    const profile = res.body.data;

    expect(profile.metrics).toBeDefined();
    expect(profile.metrics.totalCommits).toBeGreaterThan(0);
    expect(profile.metrics.totalPullRequests).toBeGreaterThan(0);
    expect(profile.metrics.mergedPullRequests).toBeGreaterThan(0);
    expect(profile.metrics.mergeRate).toBeGreaterThan(50); // e.g. ~88%

    // 52-week calendar (365 days)
    expect(profile.heatmap).toHaveLength(365);
    expect(profile.heatmap[0]).toHaveProperty('date');
    expect(profile.heatmap[0]).toHaveProperty('count');
    expect(profile.heatmap[0]).toHaveProperty('level');

    // Language aggregation
    expect(profile.languages.length).toBeGreaterThan(0);
    const topLang = profile.languages[0];
    expect(topLang.name).toBe('TypeScript');
    expect(topLang.percentage).toBeGreaterThan(50);
  });

  // 10. Evidence-based skill extraction
  it('10. Extracts verified skills with confidence scores backed by concrete repository evidence', async () => {
    const resA = await request(app)
      .get('/api/v1/github/profile')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(resA.status).toBe(200);
    const skillsA = resA.body.data.skills;

    // User A should have TypeScript, React, Tailwind, Vite evidence
    const skillNamesA = skillsA.map((s: any) => s.skillName);
    expect(skillNamesA).toContain('TypeScript');
    expect(skillNamesA).toContain('React');
    expect(skillNamesA).toContain('Tailwind CSS');

    const tsSkill = skillsA.find((s: any) => s.skillName === 'TypeScript');
    expect(tsSkill.confidenceScore).toBeGreaterThanOrEqual(60);
    expect(tsSkill.evidence.length).toBeGreaterThan(0);
    expect(tsSkill.evidence[0]).toHaveProperty('repoFullName', 'alex-dev/devorbit-core');

    // Check User B's skills (Rust, Tokio, Go, eBPF)
    const resB = await request(app)
      .get('/api/v1/github/profile')
      .set('Authorization', `Bearer ${userBToken}`);

    const skillsB = resB.body.data.skills;
    const skillNamesB = skillsB.map((s: any) => s.skillName);
    expect(skillNamesB).toContain('Rust');
    expect(skillNamesB).toContain('Go');
    expect(skillNamesB).toContain('Tokio Async');
  });

  // 11. Disconnect GitHub account
  it('11. Disconnects GitHub account cleanly and revokes local credentials', async () => {
    const res = await request(app)
      .delete('/api/v1/github/token')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const statusAfter = await request(app)
      .get('/api/v1/github/status')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(statusAfter.body.data.connected).toBe(false);
  });
});
