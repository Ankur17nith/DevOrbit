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
    ]);

    const solvedDsa = dsaProgresses.filter(p => p.status === 'SOLVED').length;
    const reviseDsa = dsaProgresses.filter(p => p.status === 'REVISE').length;

    return {
      user: {
        id: user?.id,
        name: user?.name,
        username: user?.username,
        avatarUrl: user?.avatarUrl,
        ecoMode: user?.preference?.ecoMode ?? true,
      },
      stats: {
        solvedDsaCount: solvedDsa,
        dsaRevisionsDue: reviseDsa,
        bookmarkedCount: bookmarks,
        activeSkillsCount: skills.length,
        unreadNotificationsCount: notifications.length,
      },
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
