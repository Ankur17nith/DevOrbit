import { StaticProvider } from './static.provider.js';

export class GitHubOrgProvider extends StaticProvider {
  constructor() {
    super('GITHUB', 'GitHub Open Source Organizations', 'GITHUB_DIRECT');
  }
}
