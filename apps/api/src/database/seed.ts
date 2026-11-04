import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DevOrbit Database Seeding...');

  // 1. Clean existing records in correct dependency order
  await prisma.notification.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.reconProject.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.forumReply.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.selfbotLog.deleteMany();
  await prisma.selfbotConfig.deleteMany();
  await prisma.contributionPipelineItem.deleteMany();
  await prisma.userSkillProfile.deleteMany();
  await prisma.userDsaProgress.deleteMany();
  await prisma.dsaProblem.deleteMany();
  await prisma.dsaSheet.deleteMany();
  await prisma.userBookmark.deleteMany();
  await prisma.ossIssue.deleteMany();
  await prisma.ossRepository.deleteMany();
  await prisma.ossOrganization.deleteMany();
  await prisma.ossProgram.deleteMany();
  await prisma.workspaceMembership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.integrationCredential.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 2. Create Default Users (Salted Bcrypt Password)
  const passwordHash = await bcrypt.hash('DevOrbit123!', 10);

  const userAlex = await prisma.user.create({
    data: {
      email: 'demo@devorbit.local',
      username: 'alex_developer',
      passwordHash,
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      bio: 'Full-stack software engineer, open-source enthusiast & algorithmic problem solver.',
      role: 'ADMIN',
      preference: {
        create: {
          theme: 'dark',
          ecoMode: true,
          notifyDesktop: true,
          notifyTelegram: false,
        },
      },
    },
  });

  const userSara = await prisma.user.create({
    data: {
      email: 'collaborator@devorbit.local',
      username: 'sara_chen',
      passwordHash,
      name: 'Sara Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
      bio: 'Systems programmer & distributed systems researcher. Specializing in Rust and Go.',
      role: 'USER',
      preference: {
        create: {
          theme: 'dark',
          ecoMode: true,
          notifyDesktop: true,
          notifyTelegram: false,
        },
      },
    },
  });

  console.log(`👤 Created Users: ${userAlex.username} and ${userSara.username}`);

  // 3. Create Shared Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'DevOrbit Core Space',
      slug: 'devorbit-core',
      description: 'Primary engineering workspace for multi-user open source collaboration and DSA prep.',
      ownerId: userAlex.id,
      memberships: {
        create: [
          { userId: userAlex.id, role: 'OWNER' },
          { userId: userSara.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log(`🏢 Created Workspace: ${workspace.name}`);

  // 4. Seed GSoC Programs & 606+ Organizations
  const gsocProgram = await prisma.ossProgram.create({
    data: {
      slug: 'gsoc-2026',
      name: 'Google Summer of Code 2026',
      description: 'Global program focused on bringing new contributors into open source software development.',
      website: 'https://summerofcode.withgoogle.com/',
      category: 'GSOC',
      status: 'ACTIVE',
      timelineJson: JSON.stringify([
        { phase: 'Org Applications Open', date: '2026-01-22' },
        { phase: 'Accepted Orgs Announced', date: '2026-02-27' },
        { phase: 'Contributor Proposal Period', date: '2026-03-24' },
        { phase: 'Coding Begins', date: '2026-06-02' },
        { phase: 'Final Results', date: '2026-09-08' },
      ]),
      deadlineDate: new Date('2026-04-08T18:00:00Z'),
    },
  });

  const gsocDataPath = path.join(__dirname, 'data', 'gsoc_orgs.json');
  if (fs.existsSync(gsocDataPath)) {
    const rawGsoc = JSON.parse(fs.readFileSync(gsocDataPath, 'utf8'));
    const orgsList = Array.isArray(rawGsoc) ? rawGsoc : rawGsoc.items || [];
    console.log(`📦 Seeding ${orgsList.length} GSoC organizations...`);

    for (const org of orgsList) {
      if (!org.slug || !org.name) continue;
      await prisma.ossOrganization.upsert({
        where: { slug: org.slug },
        update: {},
        create: {
          slug: org.slug,
          name: org.name,
          description: org.description || '',
          website: org.website || null,
          logoUrl: org.logoUrl || null,
          technologiesJson: JSON.stringify(org.technologies || []),
          participationYearsJson: JSON.stringify(org.participationYears || []),
          totalProjects: org.totalProjects || 0,
          programId: gsocProgram.id,
        },
      });
    }
    console.log(`✅ Seeded ${orgsList.length} GSoC organizations.`);
  }

  // 5. Seed Curated Repositories & Trending Repos
  const overviewPath = path.join(__dirname, 'data', 'oss_overview.json');
  let reposToSeed = [];
  if (fs.existsSync(overviewPath)) {
    const rawOverview = JSON.parse(fs.readFileSync(overviewPath, 'utf8'));
    reposToSeed = rawOverview.repos || [];
  }

  // Fallback / standard prominent repos if file missing or empty
  if (reposToSeed.length === 0) {
    reposToSeed = [
      {
        full_name: 'facebook/react',
        name: 'react',
        owner: 'facebook',
        description: 'The library for web and native user interfaces.',
        language: 'JavaScript',
        stargazers_count: 231000,
        forks_count: 46000,
        open_issues_count: 1400,
        topics: ['javascript', 'react', 'ui', 'frontend'],
        license: 'MIT',
      },
      {
        full_name: 'torvalds/linux',
        name: 'linux',
        owner: 'torvalds',
        description: 'Linux kernel source tree.',
        language: 'C',
        stargazers_count: 184000,
        forks_count: 53000,
        open_issues_count: 320,
        topics: ['kernel', 'linux', 'operating-system'],
        license: 'GPL-2.0',
      },
    ];
  }

  console.log(`📦 Seeding ${reposToSeed.length} Open Source Repositories...`);
  const createdRepos: Record<string, string> = {};

  for (const r of reposToSeed) {
    const fullName = r.full_name || `${r.owner?.login || r.owner}/${r.name}`;
    if (!fullName) continue;

    const created = await prisma.ossRepository.upsert({
      where: { fullName },
      update: {},
      create: {
        fullName,
        name: r.name || fullName.split('/')[1],
        owner: r.owner?.login || (typeof r.owner === 'string' ? r.owner : fullName.split('/')[0]),
        description: r.description || null,
        language: r.language || 'TypeScript',
        stargazersCount: r.stargazers_count || 0,
        forksCount: r.forks_count || 0,
        openIssuesCount: r.open_issues_count || 0,
        topicsJson: JSON.stringify(r.topics || []),
        license: typeof r.license === 'object' ? r.license?.spdx_id || r.license?.name : r.license || 'MIT',
        isVerified: true,
      },
    });
    createdRepos[fullName] = created.id;
  }

  // 6. Seed Issues & Bounties
  const bountiesPath = path.join(__dirname, 'data', 'bounties.json');
  let bountiesToSeed = [];
  if (fs.existsSync(bountiesPath)) {
    const rawBounties = JSON.parse(fs.readFileSync(bountiesPath, 'utf8'));
    bountiesToSeed = rawBounties.issues || [];
  }

  // Link issues to existing repos or primary fallback repo
  const defaultRepoId = Object.values(createdRepos)[0];
  if (defaultRepoId && bountiesToSeed.length > 0) {
    console.log(`💎 Seeding ${bountiesToSeed.length} Open Source Bounties / Issues...`);
    for (const b of bountiesToSeed) {
      const targetRepoId = createdRepos[`${b.repo_owner || b.repoOwner}/${b.repo_name || b.repoName}`] || defaultRepoId;
      await prisma.ossIssue.create({
        data: {
          repositoryId: targetRepoId,
          number: b.number || b.issueNumber || Math.floor(Math.random() * 1000),
          title: b.title,
          body: (b.body || b.description || '').slice(0, 500),
          state: b.state || 'open',
          authorUsername: b.user?.login || 'contributor',
          authorAvatarUrl: b.user?.avatar_url || null,
          labelsJson: JSON.stringify(b.labels || b.tags || ['good first issue', 'bounty']),
          difficulty: b.difficulty || 'intermediate',
          bountyAmount: b.bountyAmount || '500',
          currency: b.currency || 'USD',
          url: b.html_url || b.issueUrl || 'https://github.com',
        },
      });
    }
  }

  // 7. Seed Striver A2Z & Curated DSA Problems
  const dsaSheet = await prisma.dsaSheet.create({
    data: {
      slug: 'striver-a2z',
      name: 'Striver A2Z DSA Sheet',
      description: 'Comprehensive step-by-step roadmap from Learn the Basics to Advanced Algorithms.',
      category: 'STRIVER_A2Z',
      problemsCount: 15,
      isOfficial: true,
    },
  });

  const coreProblems = [
    { title: 'Two Sum', slug: 'two-sum', platform: 'LEETCODE', difficulty: 'EASY', topic: 'Array', subtopic: 'Hash Map', url: 'https://leetcode.com/problems/two-sum/' },
    { title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', platform: 'LEETCODE', difficulty: 'EASY', topic: 'Array', subtopic: 'Prefix/Suffix', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    { title: '3Sum', slug: '3sum', platform: 'LEETCODE', difficulty: 'MEDIUM', topic: 'Array', subtopic: 'Two Pointers', url: 'https://leetcode.com/problems/3sum/' },
    { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', platform: 'LEETCODE', difficulty: 'MEDIUM', topic: 'String', subtopic: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
    { title: 'Valid Parentheses', slug: 'valid-parentheses', platform: 'LEETCODE', difficulty: 'EASY', topic: 'Stack', subtopic: 'Standard', url: 'https://leetcode.com/problems/valid-parentheses/' },
    { title: 'Merge Intervals', slug: 'merge-intervals', platform: 'LEETCODE', difficulty: 'MEDIUM', topic: 'Intervals', subtopic: 'Sorting', url: 'https://leetcode.com/problems/merge-intervals/' },
    { title: 'Trapping Rain Water', slug: 'trapping-rain-water', platform: 'LEETCODE', difficulty: 'HARD', topic: 'Array', subtopic: 'Two Pointers', url: 'https://leetcode.com/problems/trapping-rain-water/' },
    { title: 'LRU Cache', slug: 'lru-cache', platform: 'LEETCODE', difficulty: 'MEDIUM', topic: 'Design', subtopic: 'Hash Map + Doubly Linked List', url: 'https://leetcode.com/problems/lru-cache/' },
    { title: 'Binary Tree Maximum Path Sum', slug: 'binary-tree-maximum-path-sum', platform: 'LEETCODE', difficulty: 'HARD', topic: 'Binary Tree', subtopic: 'DFS', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
    { title: 'Course Schedule', slug: 'course-schedule', platform: 'LEETCODE', difficulty: 'MEDIUM', topic: 'Graph', subtopic: 'Topological Sort', url: 'https://leetcode.com/problems/course-schedule/' },
    { title: 'Coin Change', slug: 'coin-change', platform: 'LEETCODE', difficulty: 'MEDIUM', topic: 'Dynamic Programming', subtopic: '1D DP', url: 'https://leetcode.com/problems/coin-change/' },
    { title: 'Edit Distance', slug: 'edit-distance', platform: 'LEETCODE', difficulty: 'HARD', topic: 'Dynamic Programming', subtopic: '2D DP', url: 'https://leetcode.com/problems/edit-distance/' },
    { title: 'Alien Dictionary', slug: 'alien-dictionary', platform: 'LEETCODE', difficulty: 'HARD', topic: 'Graph', subtopic: 'BFS/Kahn Algorithm', url: 'https://leetcode.com/problems/alien-dictionary/' },
    { title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', platform: 'LEETCODE', difficulty: 'HARD', topic: 'Binary Search', subtopic: 'Partitioning', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
    { title: 'Word Ladder', slug: 'word-ladder', platform: 'LEETCODE', difficulty: 'HARD', topic: 'Graph', subtopic: 'BFS Shortest Path', url: 'https://leetcode.com/problems/word-ladder/' },
  ];

  console.log(`🧠 Seeding ${coreProblems.length} Core DSA Problems...`);
  const createdProblems = [];
  for (const prob of coreProblems) {
    const created = await prisma.dsaProblem.upsert({
      where: {
        platform_slug: {
          platform: prob.platform,
          slug: prob.slug,
        },
      },
      update: {},
      create: prob,
    });
    createdProblems.push(created);
  }

  // 8. Seed Private User DSA Progress (Multi-User Isolation Demonstration)
  console.log('📊 Seeding private DSA progress for Alex and Sara...');
  // Alex solved Two Sum, 3Sum, Valid Parentheses, LRU Cache; needs revision on Coin Change
  await prisma.userDsaProgress.create({
    data: {
      userId: userAlex.id,
      problemId: createdProblems[0].id, // Two Sum
      status: 'SOLVED',
      attemptsCount: 1,
      timeSpentSeconds: 320,
      codeSnippet: 'function twoSum(nums, target) { const map = new Map(); ... }',
      notes: 'Optimal O(n) time using single-pass Hash Map.',
      lastSolvedAt: new Date(),
    },
  });

  await prisma.userDsaProgress.create({
    data: {
      userId: userAlex.id,
      problemId: createdProblems[10].id, // Coin Change
      status: 'REVISE',
      attemptsCount: 3,
      timeSpentSeconds: 1800,
      hintUsed: true,
      notes: 'Remember unbounded knapsack bottom-up formulation. Base case dp[0] = 0.',
      nextReviewDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    },
  });

  // Sara solved Trapping Rain Water, Course Schedule, Alien Dictionary
  await prisma.userDsaProgress.create({
    data: {
      userId: userSara.id,
      problemId: createdProblems[6].id, // Trapping Rain Water
      status: 'SOLVED',
      attemptsCount: 2,
      timeSpentSeconds: 840,
      notes: 'Solvable in O(1) auxiliary space using two pointers tracking leftMax and rightMax.',
      lastSolvedAt: new Date(),
    },
  });

  // 9. Seed Skill Profiles
  await prisma.userSkillProfile.create({
    data: {
      userId: userAlex.id,
      skillName: 'TypeScript',
      category: 'LANGUAGE',
      confidenceScore: 92.5,
      verifiedEvidenceJson: JSON.stringify({
        repos: ['devorbit/core', 'facebook/react'],
        mergedPRs: 14,
        confidenceBand: 'High',
      }),
    },
  });

  await prisma.userSkillProfile.create({
    data: {
      userId: userAlex.id,
      skillName: 'Dynamic Programming',
      category: 'DSA',
      confidenceScore: 48.0,
      verifiedEvidenceJson: JSON.stringify({
        weaknesses: ['Unbounded knapsack', 'State compression DP'],
        recommendedActions: ['Solve Coin Change II', 'Target Sum'],
      }),
    },
  });

  await prisma.userSkillProfile.create({
    data: {
      userId: userSara.id,
      skillName: 'Rust',
      category: 'LANGUAGE',
      confidenceScore: 96.0,
      verifiedEvidenceJson: JSON.stringify({
        cratesPublished: 3,
        mergedPRs: 28,
        confidenceBand: 'Expert',
      }),
    },
  });

  // 10. Seed Forum Posts & Replies
  const post1 = await prisma.forumPost.create({
    data: {
      userId: userAlex.id,
      title: 'Best approach for submitting first PR to a large GSoC organization?',
      content: 'When joining a new community like CNCF or Apache, what is the best strategy to get mentor visibility without overwhelming the issue tracker?',
      tagsJson: JSON.stringify(['gsoc', 'open-source', 'mentorship']),
      upvotes: 14,
      views: 120,
      isSolved: true,
    },
  });

  await prisma.forumReply.create({
    data: {
      postId: post1.id,
      userId: userSara.id,
      content: 'Start by setting up the dev environment and running the test suite locally. Pick a documentation fix or flaky unit test before proposing structural changes. Join their Slack/Zulip channels first!',
      isAcceptedAnswer: true,
      upvotes: 9,
    },
  });

  console.log('✅ DevOrbit Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
