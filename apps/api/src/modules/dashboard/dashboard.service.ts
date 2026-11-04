import { prisma } from '../../config/index.js';

export class DashboardService {
  async getDashboardSummary(userId: string) {
    const [
      user,
      dsaProgresses,
      skills,
      bookmarks,
      upcomingDeadlines,
      recentBounties,
      notifications,
      credentials,
      contributionMetric,
      topRepos,
      pipelineItems,
      recentRecon,
      aiConversationsCount,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { preference: true },
      }),
      prisma.userDsaProgress.findMany({
        where: { userId },
        include: { problem: true },
      }),
      prisma.userSkillProfile.findMany({
        where: { userId },
        orderBy: { confidenceScore: 'desc' },
      }),
      prisma.userBookmark.count({ where: { userId } }),
      prisma.ossProgram.findMany({
        where: { deadlineDate: { gte: new Date() } },
        take: 3,
        orderBy: { deadlineDate: 'asc' },
      }),
      prisma.ossIssue.findMany({
        where: { bountyAmount: { not: null }, state: 'open' },
        take: 4,
        include: { repository: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.findMany({
        where: { userId, isRead: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.integrationCredential.findMany({
        where: { userId },
      }),
      prisma.userContributionMetric.findUnique({
        where: { userId },
      }),
      prisma.userGithubRepo.findMany({
        where: { userId },
        take: 4,
        orderBy: { stargazersCount: 'desc' },
      }),
      prisma.contributionPipelineItem.findMany({
        where: { userId },
      }),
      prisma.reconProject.findMany({
        where: { userId },
        take: 3,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.aiConversation.count({
        where: { userId },
      }),
    ]);

    const solvedDsa = dsaProgresses.filter(p => p.status === 'SOLVED');
    const reviseDsa = dsaProgresses.filter(p => p.status === 'REVISE');
    const attemptedDsa = dsaProgresses.filter(p => p.status === 'ATTEMPTED');

    // Cognitive solution modes
    const independentSolves = solvedDsa.filter(p => p.solutionMode === 'INDEPENDENT').length;
    const assistedSolves = solvedDsa.filter(
      p => p.solutionMode && ['WITH_HINTS', 'WITH_EDITORIAL', 'WITH_AI'].includes(p.solutionMode)
    ).length;

    // Difficulty breakdown
    const difficultyCounts = {
      Easy: solvedDsa.filter(p => p.problem.difficulty.toLowerCase() === 'easy').length,
      Medium: solvedDsa.filter(p => p.problem.difficulty.toLowerCase() === 'medium').length,
      Hard: solvedDsa.filter(p => p.problem.difficulty.toLowerCase() === 'hard').length,
    };

    // Connected Integrations Map
    const credMap = new Map(credentials.map(c => [c.provider, c]));
    const githubCred = credMap.get('GITHUB');
    const cfCred = credMap.get('CODEFORCES');
    const lcCred = credMap.get('LEETCODE');
    const tufCred = credMap.get('TUF');

    // Pipeline stages count
    const pipelineByStage = {
      SHORTLISTED: pipelineItems.filter(i => i.stage === 'SHORTLISTED').length,
      EXPLORING: pipelineItems.filter(i => i.stage === 'EXPLORING').length,
      WORKING: pipelineItems.filter(i => i.stage === 'WORKING').length,
      PR_SUBMITTED: pipelineItems.filter(i => i.stage === 'PR_SUBMITTED').length,
      MERGED: pipelineItems.filter(i => i.stage === 'MERGED').length,
    };

    return {
      user: {
        id: user?.id,
        name: user?.name,
        username: user?.username,
        avatarUrl: user?.avatarUrl,
        ecoMode: user?.preference?.ecoMode ?? true,
      },
      stats: {
        solvedDsaCount: solvedDsa.length,
        dsaRevisionsDue: reviseDsa.length,
        dsaAttemptedCount: attemptedDsa.length,
        bookmarkedCount: bookmarks,
        activeSkillsCount: skills.length,
        unreadNotificationsCount: notifications.length,
        independentSolves,
        assistedSolves,
        totalReposCount: topRepos.length,
        totalCommits: contributionMetric?.totalCommits || 0,
        mergeRate: contributionMetric?.mergeRate || 0,
        activeStreak: contributionMetric?.activeStreak || 0,
        longestStreak: contributionMetric?.longestStreak || 0,
        aiSessionsCount: aiConversationsCount,
      },
      difficultyCounts,
      integrations: {
        github: {
          isConnected: Boolean(githubCred),
          username: githubCred?.username,
          lastSyncedAt: githubCred?.lastSyncedAt,
          reposCount: topRepos.length,
          totalCommits: contributionMetric?.totalCommits || 0,
        },
        codeforces: {
          isConnected: Boolean(cfCred),
          handle: cfCred?.username,
          stats: cfCred?.metadataJson ? JSON.parse(cfCred.metadataJson) : null,
          lastSyncedAt: cfCred?.lastSyncedAt,
        },
        leetcode: {
          isConnected: Boolean(lcCred),
          username: lcCred?.username,
          stats: lcCred?.metadataJson ? JSON.parse(lcCred.metadataJson) : null,
          lastSyncedAt: lcCred?.lastSyncedAt,
        },
        tuf: {
          isConnected: Boolean(tufCred),
          username: tufCred?.username,
          stats: tufCred?.metadataJson ? JSON.parse(tufCred.metadataJson) : null,
          lastSyncedAt: tufCred?.lastSyncedAt,
        },
      },
      activity: {
        commitHeatmap: contributionMetric?.commitHeatmapJson
          ? JSON.parse(contributionMetric.commitHeatmapJson)
          : [],
        languageBytes: contributionMetric?.languageBytesJson
          ? JSON.parse(contributionMetric.languageBytesJson)
          : {},
        projectTimeline: contributionMetric?.projectTimelineJson
          ? JSON.parse(contributionMetric.projectTimelineJson)
          : [],
      },
      repositories: topRepos.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        description: r.description,
        language: r.language,
        stargazersCount: r.stargazersCount,
        forksCount: r.forksCount,
      })),
      pipeline: {
        total: pipelineItems.length,
        stages: pipelineByStage,
      },
      recentRecon: recentRecon.map(r => ({
        id: r.id,
        name: r.name,
        targetUrl: r.targetUrl,
        updatedAt: r.updatedAt,
      })),
      skills: skills.map(s => ({
        skillName: s.skillName,
        category: s.category,
        confidenceScore: s.confidenceScore,
      })),
      upcomingDeadlines: upcomingDeadlines.map(d => ({
        slug: d.slug,
        name: d.name,
        deadlineDate: d.deadlineDate,
      })),
      featuredBounties: recentBounties.map(b => ({
        id: b.id,
        title: b.title,
        repo: b.repository.fullName,
        amount: b.bountyAmount,
        currency: b.currency,
        url: b.url,
      })),
      notifications,
    };
  }
}
