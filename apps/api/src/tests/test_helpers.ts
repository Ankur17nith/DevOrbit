import request from 'supertest';
import crypto from 'crypto';
import { app } from '../app.js';
import { prisma } from '../config/index.js';

export interface TestUser {
  user: any;
  token: string;
  userId: string;
  email: string;
  username: string;
  password: string;
}

export async function ensureSampleDsaProblems() {
  const count = await prisma.dsaProblem.count();
  if (count < 3) {
    const defaultProblems = [
      {
        title: 'Two Sum',
        slug: 'two-sum-core',
        canonicalSlug: 'two-sum',
        platform: 'LEETCODE',
        difficulty: 'EASY',
        topic: 'Array',
        url: 'https://leetcode.com/problems/two-sum',
      },
      {
        title: '3Sum',
        slug: '3sum-core',
        canonicalSlug: '3sum',
        platform: 'LEETCODE',
        difficulty: 'MEDIUM',
        topic: 'Array',
        url: 'https://leetcode.com/problems/3sum',
      },
      {
        title: 'Trapping Rain Water',
        slug: 'trapping-rain-water-core',
        canonicalSlug: 'trapping-rain-water',
        platform: 'LEETCODE',
        difficulty: 'HARD',
        topic: 'Array',
        url: 'https://leetcode.com/problems/trapping-rain-water',
      },
    ];

    for (const p of defaultProblems) {
      await prisma.dsaProblem.upsert({
        where: { platform_slug: { platform: p.platform, slug: p.slug } },
        update: {},
        create: p,
      });
    }
  }
}

export async function ensureSampleRepos() {
  const count = await prisma.ossRepository.count();
  if (count < 1) {
    await prisma.ossRepository.create({
      data: {
        name: 'orbit-client',
        fullName: 'devorbit/orbit-client',
        owner: 'devorbit',
        language: 'TypeScript',
        topicsJson: JSON.stringify(['react', 'typescript', 'vite']),
        stargazersCount: 450,
      },
    });
  }
}

export async function createTestUser(role: string = 'USER'): Promise<TestUser> {
  await ensureSampleDsaProblems();
  await ensureSampleRepos();

  const rand = crypto.randomBytes(4).toString('hex');
  const email = `test_${rand}_${Date.now()}@devorbit.test`;
  const username = `user_${rand}_${Date.now().toString().slice(-6)}`;
  const password = `TestPassword123!_${rand}`;
  const name = `Test User ${rand}`;

  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email,
      username,
      password,
      name,
    });

  if (res.status !== 201) {
    throw new Error(`Failed to create test user: ${JSON.stringify(res.body)}`);
  }

  const { token, user } = res.body.data;

  if (role !== 'USER') {
    await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });
    user.role = role;
  }

  return {
    user,
    token,
    userId: user.id,
    email,
    username,
    password,
  };
}
