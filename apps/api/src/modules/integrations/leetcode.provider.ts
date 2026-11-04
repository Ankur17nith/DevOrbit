export interface LeetCodeStats {
  username: string;
  realName?: string;
  avatarUrl?: string;
  ranking?: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate?: number;
  contestRating?: number;
  globalRanking?: number;
  recentSubmissions?: {
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
  }[];
  source: 'graphql_sync' | 'manual_import' | 'browser_extension';
  lastSyncedAt: string;
}

export interface LeetCodeImportPayload {
  username: string;
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  ranking?: number;
  contestRating?: number;
  problems?: {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    status: 'SOLVED' | 'ATTEMPTED';
    solutionMode?: string;
    slug?: string;
  }[];
}

export class LeetCodeProvider {
  private graphqlUrl = 'https://leetcode.com/graphql';

  /**
   * Fetch public LeetCode stats via GraphQL endpoint
   */
  async fetchUserProfile(username: string): Promise<LeetCodeStats> {
    const cleanUser = username.trim();
    if (!cleanUser) {
      throw new Error('LeetCode username cannot be empty');
    }

    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DevOrbit-Intelligence/1.0',
        },
        body: JSON.stringify({
          query,
          variables: { username: cleanUser },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = (await res.json()) as any;

      if (!json.data || !json.data.matchedUser) {
        throw new Error(`LeetCode user "${cleanUser}" not found`);
      }

      const mu = json.data.matchedUser;
      const acNums = mu.submitStats?.acSubmissionNum || [];

      let total = 0;
      let easy = 0;
      let medium = 0;
      let hard = 0;

      for (const item of acNums) {
        if (item.difficulty === 'All') total = item.count;
        if (item.difficulty === 'Easy') easy = item.count;
        if (item.difficulty === 'Medium') medium = item.count;
        if (item.difficulty === 'Hard') hard = item.count;
      }

      return {
        username: mu.username,
        realName: mu.profile?.realName || undefined,
        avatarUrl: mu.profile?.userAvatar || undefined,
        ranking: mu.profile?.ranking || undefined,
        totalSolved: total,
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
        source: 'graphql_sync',
        lastSyncedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('LeetCode request timed out. Please try again or use JSON/CSV import.');
      }
      throw err;
    }
  }

  /**
   * Process manual import or browser extension payload
   */
  processImport(payload: LeetCodeImportPayload, source: 'manual_import' | 'browser_extension' = 'manual_import'): LeetCodeStats {
    if (!payload.username) {
      throw new Error('Import data must include a valid LeetCode username');
    }

    const easy = Number(payload.easySolved) || 0;
    const medium = Number(payload.mediumSolved) || 0;
    const hard = Number(payload.hardSolved) || 0;
    const total = Number(payload.totalSolved) || (easy + medium + hard);

    return {
      username: payload.username.trim(),
      totalSolved: total,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      ranking: payload.ranking,
      contestRating: payload.contestRating,
      source,
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

export const leetCodeProvider = new LeetCodeProvider();
