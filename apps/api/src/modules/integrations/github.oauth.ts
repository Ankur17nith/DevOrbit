export interface GitHubOAuthStatus {
  isConfigured: boolean;
  clientId?: string;
  authorizationUrl?: string;
  setupInstructions?: string;
}

export class GitHubOAuthHandler {
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
    this.redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/integrations';
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  getOAuthStatus(state: string = 'devorbit_oauth_state'): GitHubOAuthStatus {
    if (!this.isConfigured()) {
      return {
        isConfigured: false,
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
