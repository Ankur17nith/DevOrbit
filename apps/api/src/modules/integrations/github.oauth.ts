import crypto from 'crypto';

export interface GitHubOAuthStatus {
  isConfigured: boolean;
  clientId?: string;
  authorizationUrl?: string;
  state?: string;
  setupInstructions?: string;
}

interface OAuthStateRecord {
  userId: string;
  expiresAt: number;
}

export class GitHubOAuthHandler {
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private redirectUri: string;
  // In-memory state store with 10-minute TTL
  private stateStore: Map<string, OAuthStateRecord> = new Map();

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
    this.redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/integrations';
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Generates a cryptographically random 32-byte hex state with 10-minute TTL
   */
  generateOAuthState(userId: string): string {
    this.pruneExpiredStates();
    const state = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    this.stateStore.set(state, { userId, expiresAt });
    return state;
  }

  /**
   * Validates and immediately consumes the OAuth state parameter (single-use anti-replay)
   */
  validateAndConsumeState(state: string, userId: string): boolean {
    this.pruneExpiredStates();
    const record = this.stateStore.get(state);
    if (!record) {
      return false;
    }

    // Check user matching and expiration
    const isValid = record.userId === userId && record.expiresAt > Date.now();
    // Strictly delete on first use
    this.stateStore.delete(state);
    return isValid;
  }

  private pruneExpiredStates(): void {
    const now = Date.now();
    for (const [state, record] of this.stateStore.entries()) {
      if (record.expiresAt <= now) {
        this.stateStore.delete(state);
      }
    }
  }

  getOAuthStatus(userId: string): GitHubOAuthStatus {
    const state = this.generateOAuthState(userId);

    if (!this.isConfigured()) {
      return {
        isConfigured: false,
        state,
        setupInstructions:
          'GitHub OAuth application credentials are not yet configured in apps/api/.env. ' +
          'To enable one-click OAuth, create an OAuth app at https://github.com/settings/developers and set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET. ' +
          'Alternatively, you can connect instantly using a GitHub Personal Access Token (PAT) with read:user, repo scopes.',
      };
    }

    const params = new URLSearchParams({
      client_id: this.clientId!,
      redirect_uri: this.redirectUri,
      scope: 'read:user,repo',
      state,
      allow_signup: 'true',
    });

    return {
      isConfigured: true,
      clientId: this.clientId,
      state,
      authorizationUrl: `https://github.com/login/oauth/authorize?${params.toString()}`,
    };
  }

  async exchangeCode(code: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error(
        'GitHub OAuth application is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in apps/api/.env'
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = (await res.json()) as any;
    if (json.error || !json.access_token) {
      throw new Error(json.error_description || json.error || 'Failed to exchange GitHub OAuth code for access token');
    }

    return json.access_token as string;
  }
}

export const githubOAuthHandler = new GitHubOAuthHandler();
