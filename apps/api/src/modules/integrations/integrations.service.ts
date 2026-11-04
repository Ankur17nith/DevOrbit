import { prisma } from '../../config/index.js';
import { githubService } from '../github/github.service.js';
import { codeforcesProvider, CodeforcesAggregatedStats } from './codeforces.provider.js';
import { leetCodeProvider, LeetCodeStats, LeetCodeImportPayload } from './leetcode.provider.js';
import { tufProvider, TufStats, TufImportPayload } from './tuf.provider.js';
import { githubOAuthHandler } from './github.oauth.js';
import { OllamaService } from '../ai/ollama.service.js';
import { BadRequestError } from '../../lib/errors.js';

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
        username: (githubStatus as any).username,
        scopes: (githubStatus as any).scopes || [],
        rateLimitRemaining: (githubStatus as any).rateLimitRemaining,
        lastSyncedAt: (githubStatus as any).lastSyncedAt,
        repoCount: (githubStatus as any).repoCount || 0,
        oauth: githubOAuthHandler.getOAuthStatus(),
      },
      codeforces: {
        isConnected: Boolean(cfCred),
        handle: cfCred?.username,
        stats: cfData,
        lastSyncedAt: cfCred?.lastSyncedAt,
      },
      leetcode: {
        isConnected: Boolean(lcCred),
        username: lcCred?.username,
        stats: lcData,
        lastSyncedAt: lcCred?.lastSyncedAt,
      },
      tuf: {
        isConnected: Boolean(tufCred),
        username: tufCred?.username,
        stats: tufData,
        lastSyncedAt: tufCred?.lastSyncedAt,
      },
      striver: {
        isBundled: true,
        sheetName: 'Striver A2Z DSA Sheet',
        totalProblems: striverProblemsCount || 455,
        solvedCount: striverSolvedCount,
      },
      ollama: {
        isAvailable: isOllamaOnline,
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

    return { credential, stats };
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

  async importTufData(userId: string, payload: TufImportPayload) {
    const stats = tufProvider.processImport(payload);
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
