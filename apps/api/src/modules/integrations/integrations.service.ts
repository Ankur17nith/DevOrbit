import { prisma } from '../../config/index.js';
import { githubService } from '../github/github.service.js';
import { codeforcesProvider, CodeforcesAggregatedStats } from './codeforces.provider.js';
import { leetCodeProvider, LeetCodeStats, LeetCodeImportPayload } from './leetcode.provider.js';
import { tufProvider, TufStats, TufImportPayload } from './tuf.provider.js';
import { githubOAuthHandler } from './github.oauth.js';
import { OllamaService } from '../ai/ollama.service.js';
import { BadRequestError } from '../../lib/errors.js';
import { normalizeProblem } from '../dsa/adapters/deduplication.js';

export class IntegrationsService {
  private ollama = new OllamaService();

  /**
   * Aggregate connection status across all supported developer platforms
   */
  async getAllStatus(userId: string) {
    const [credentials, githubStatus, isOllamaOnline] = await Promise.all([
      prisma.integrationCredential.findMany({ where: { userId } }),
      githubService.getIntegrationStatus(userId).catch(() => ({ isConnected: false })),
      this.ollama.isOllamaAvailable(),
    ]);
    const oauthStatus = githubOAuthHandler.getOAuthConfiguration();

    const credMap = new Map(credentials.map(c => [c.provider, c]));

    // Codeforces
    const cfCred = credMap.get('CODEFORCES');
    const cfData: CodeforcesAggregatedStats | null = cfCred?.metadataJson
      ? JSON.parse(cfCred.metadataJson)
      : null;

    // LeetCode
    const lcCred = credMap.get('LEETCODE');
    const lcData: LeetCodeStats | null = lcCred?.metadataJson
      ? JSON.parse(lcCred.metadataJson)
      : null;

    // Take U Forward
    const tufCred = credMap.get('TUF');
    const tufData: TufStats | null = tufCred?.metadataJson
      ? JSON.parse(tufCred.metadataJson)
      : null;

    // Striver Sheet Progress (Built-in or Imported)
    const striverProblemsCount = await prisma.dsaProblem.count({
      where: { sheetCategory: 'STRIVER_A2Z' },
    });
    const striverSolvedCount = await prisma.userDsaProgress.count({
      where: {
        userId,
        status: 'SOLVED',
        problem: { sheetCategory: 'STRIVER_A2Z' },
      },
    });

    return {
      github: {
        isConnected: Boolean((githubStatus as any).connected),
        connected: Boolean((githubStatus as any).connected),
        isExpired: Boolean((githubStatus as any).isExpired),
        needsReconnect: Boolean((githubStatus as any).needsReconnect),
        username: (githubStatus as any).username,
        scopes: (githubStatus as any).scopes || [],
        rateLimitRemaining: (githubStatus as any).rateLimitRemaining,
        lastSyncedAt: (githubStatus as any).lastSyncedAt,
        tokenExpiresAt: (githubStatus as any).tokenExpiresAt,
        tokenMasked: (githubStatus as any).tokenMasked,
        repoCount: (githubStatus as any).repoCount || 0,
        publicReposCount: (githubStatus as any).repoCount || 0,
        oauth: oauthStatus,
      },
      codeforces: {
        isConnected: Boolean(cfCred),
        connected: Boolean(cfCred),
        handle: cfCred?.username,
        rating: cfData?.profile?.rating ?? (cfData as any)?.rating ?? null,
        rank: cfData?.profile?.rank ?? (cfData as any)?.rank ?? null,
        maxRating: cfData?.profile?.maxRating ?? (cfData as any)?.maxRating ?? null,
        solvedCount: cfData?.totalSolved ?? (cfData as any)?.solvedCount ?? 0,
        totalSolved: cfData?.totalSolved ?? (cfData as any)?.solvedCount ?? 0,
        stats: cfData,
        lastSyncedAt: cfCred?.lastSyncedAt,
      },
      leetcode: {
        isConnected: Boolean(lcCred),
        connected: Boolean(lcCred),
        username: lcCred?.username,
        totalSolved: lcData?.totalSolved ?? 0,
        easySolved: lcData?.easySolved ?? 0,
        mediumSolved: lcData?.mediumSolved ?? 0,
        hardSolved: lcData?.hardSolved ?? 0,
        ranking: lcData?.ranking ?? null,
        contestRating: lcData?.contestRating ?? null,
        stats: lcData,
        lastSyncedAt: lcCred?.lastSyncedAt,
      },
      tuf: {
        isConnected: Boolean(tufCred),
        connected: Boolean(tufCred),
        username: tufCred?.username,
        completedProblems: tufData?.totalCompleted ?? 0,
        totalProblems: tufData?.totalProblems ?? striverProblemsCount,
        currentStep: tufData?.currentStep || null,
        activeSheet: tufData?.activeSheet || 'Striver A2Z DSA Sheet',
        stats: tufData,
        lastSyncedAt: tufCred?.lastSyncedAt,
      },
      striver: {
        isBundled: true,
        sheetName: 'Striver A2Z DSA Sheet',
        totalProblems: striverProblemsCount,
        solvedCount: striverSolvedCount,
      },
      ollama: {
        isAvailable: isOllamaOnline,
        connected: isOllamaOnline,
        isConnected: isOllamaOnline,
        hostUrl: 'http://127.0.0.1:11434',
        activeEngine: isOllamaOnline ? 'ollama-local-llm' : 'devorbit-deterministic-fallback',
        privacy: '100% Local-First / Zero Cloud Telemetry',
      },
    };
  }

  // --- Codeforces ---
  async connectCodeforces(userId: string, handle: string) {
    const stats = await codeforcesProvider.fetchAggregatedStats(handle);
    const credential = await prisma.integrationCredential.upsert({
      where: { userId_provider: { userId, provider: 'CODEFORCES' } },
      update: {
        username: stats.profile.handle,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        provider: 'CODEFORCES',
        username: stats.profile.handle,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
    });

    return { credential, stats };
  }

  async syncCodeforces(userId: string) {
    const cred = await prisma.integrationCredential.findUnique({
      where: { userId_provider: { userId, provider: 'CODEFORCES' } },
    });
    if (!cred || !cred.username) {
      throw new Error('Codeforces is not connected');
    }
    return this.connectCodeforces(userId, cred.username);
  }

  async disconnectCodeforces(userId: string) {
    await prisma.integrationCredential.deleteMany({
      where: { userId, provider: 'CODEFORCES' },
    });
    return { success: true };
  }

  // --- LeetCode ---
  async connectLeetCode(userId: string, username: string) {
    if (!username || !username.trim()) {
      throw new BadRequestError('LeetCode username is required');
    }
    const cleanUsername = username.trim();
    let stats: LeetCodeStats;
    try {
      stats = await leetCodeProvider.fetchUserProfile(cleanUsername);
    } catch (err: any) {
      throw new BadRequestError(
        `LeetCode user profile could not be verified on leetcode.com: ${err.message || 'User not found or endpoint rate-limited'}. ` +
        `If LeetCode Cloudflare or GraphQL is throttling your local IP, please use the verified Manual Import option below.`
      );
    }

    const credential = await prisma.integrationCredential.upsert({
      where: { userId_provider: { userId, provider: 'LEETCODE' } },
      update: {
        username: stats.username,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        provider: 'LEETCODE',
        username: stats.username,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
    });

    return { credential, stats };
  }

  async importLeetCodeData(userId: string, payload: LeetCodeImportPayload) {
    const stats = leetCodeProvider.processImport(payload, 'manual_import');
    const credential = await prisma.integrationCredential.upsert({
      where: { userId_provider: { userId, provider: 'LEETCODE' } },
      update: {
        username: stats.username,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        provider: 'LEETCODE',
        username: stats.username,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
    });

    if (Array.isArray(payload.problems) && payload.problems.length > 0) {
      for (const p of payload.problems) {
        if (!p.title) continue;
        const normalized = normalizeProblem({
          title: p.title,
          platform: 'LEETCODE',
          difficulty: p.difficulty,
          url: p.slug ? `https://leetcode.com/problems/${p.slug}/` : undefined,
        });

        const problem = await prisma.dsaProblem.upsert({
          where: { platform_slug: { platform: 'LEETCODE', slug: normalized.slug } },
          create: {
            title: normalized.title,
            slug: normalized.slug,
            canonicalSlug: normalized.canonicalSlug,
            platform: 'LEETCODE',
            difficulty: normalized.difficulty,
            topic: 'LeetCode Imports',
            url: normalized.url,
          },
          update: {},
        });

        const status = p.status || 'SOLVED';
        await prisma.userDsaProgress.upsert({
          where: { userId_problemId: { userId, problemId: problem.id } },
          create: {
            userId,
            problemId: problem.id,
            status,
            solutionMode: (p.solutionMode as any) || 'INDEPENDENT',
            masteryScore: status === 'SOLVED' ? 100 : 0,
            confidenceRating: status === 'SOLVED' ? 4 : 2,
            attemptsCount: 1,
            lastSolvedAt: status === 'SOLVED' ? new Date() : null,
          },
          update: {
            status,
            solutionMode: (p.solutionMode as any) || undefined,
            lastSolvedAt: status === 'SOLVED' ? new Date() : undefined,
          },
        });
      }
    }

    return { credential, stats };
  }

  async syncLeetCode(userId: string) {
    const cred = await prisma.integrationCredential.findUnique({
      where: { userId_provider: { userId, provider: 'LEETCODE' } },
    });
    if (!cred || !cred.username) {
      throw new BadRequestError('LeetCode is not connected');
    }
    return this.connectLeetCode(userId, cred.username);
  }

  async disconnectLeetCode(userId: string) {
    await prisma.integrationCredential.deleteMany({
      where: { userId, provider: 'LEETCODE' },
    });
    return { success: true };
  }

  // --- Take U Forward ---
  async connectTuf(userId: string, username: string) {
    const stats = await tufProvider.verifyProfile(username);
    const credential = await prisma.integrationCredential.upsert({
      where: { userId_provider: { userId, provider: 'TUF' } },
      update: {
        username: stats.username,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        provider: 'TUF',
        username: stats.username,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
    });

    return { credential, stats };
  }

  async syncTuf(userId: string) {
    const cred = await prisma.integrationCredential.findUnique({
      where: { userId_provider: { userId, provider: 'TUF' } },
    });
    if (!cred || !cred.username) {
      throw new BadRequestError('Take U Forward is not connected');
    }
    return this.connectTuf(userId, cred.username);
  }

  async importTufData(userId: string, payload: TufImportPayload) {
    const stats = await tufProvider.processImport(payload);
    const credential = await prisma.integrationCredential.upsert({
      where: { userId_provider: { userId, provider: 'TUF' } },
      update: {
        username: stats.username,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        provider: 'TUF',
        username: stats.username,
        metadataJson: JSON.stringify(stats),
        lastSyncedAt: new Date(),
      },
    });

    return { credential, stats };
  }

  async disconnectTuf(userId: string) {
    await prisma.integrationCredential.deleteMany({
      where: { userId, provider: 'TUF' },
    });
    return { success: true };
  }
}

export const integrationsService = new IntegrationsService();
