/**
 * Canonical Typed API Endpoints for DevOrbit
 * Single source of truth for frontend API route paths.
 */
export const ENDPOINTS = {
  auth: {
    me: '/api/v1/auth/me',
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    csrf: '/api/v1/auth/csrf',
  },
  integrations: {
    status: '/api/v1/integrations/status',
    githubConnect: '/api/v1/integrations/github/connect',
    githubOAuthUrl: '/api/v1/integrations/github/oauth/url',
    githubOAuthCallback: '/api/v1/integrations/github/oauth/callback',
    githubSync: '/api/v1/integrations/github/sync',
    githubDisconnect: '/api/v1/integrations/github',
    codeforcesConnect: '/api/v1/integrations/codeforces/connect',
    codeforcesSync: '/api/v1/integrations/codeforces/sync',
    codeforcesDisconnect: '/api/v1/integrations/codeforces',
    leetcodeConnect: '/api/v1/integrations/leetcode/connect',
    leetcodeSync: '/api/v1/integrations/leetcode/sync',
    leetcodeImport: '/api/v1/integrations/leetcode/import',
    leetcodeDisconnect: '/api/v1/integrations/leetcode',
    tufConnect: '/api/v1/integrations/tuf/connect',
    tufSync: '/api/v1/integrations/tuf/sync',
    tufImport: '/api/v1/integrations/tuf/import',
    tufDisconnect: '/api/v1/integrations/tuf',
  },
  github: {
    profile: '/api/v1/github/profile',
    metrics: '/api/v1/github/metrics',
    heatmap: '/api/v1/github/heatmap',
    repositories: '/api/v1/github/repositories',
    status: '/api/v1/github/status',
    sync: '/api/v1/github/sync',
  },
  dsa: {
    problems: '/api/v1/dsa/problems',
    progress: (problemId: string) => `/api/v1/dsa/problems/${problemId}/progress`,
    review: (problemId: string) => `/api/v1/dsa/review/${problemId}`,
    analytics: '/api/v1/dsa/analytics',
    revisionQueue: '/api/v1/dsa/revision-queue',
    import: '/api/v1/dsa/import',
    recommendations: '/api/v1/dsa/recommendations',
  },
  fix: {
    samples: '/api/v1/fix/samples',
    analyze: '/api/v1/fix/analyze',
    propose: '/api/v1/fix/propose',
    verify: '/api/v1/fix/verify',
  },
  ai: {
    status: '/api/v1/ai/status',
    models: '/api/v1/ai/models',
    chat: '/api/v1/ai/chat',
    prompt: '/api/v1/ai/prompt',
    conversations: '/api/v1/ai/conversations',
    conversation: (id: string) => `/api/v1/ai/conversations/${id}`,
  },
  navigator: {
    summary: '/api/v1/navigator/summary',
    symbols: '/api/v1/navigator/symbols',
    graph: '/api/v1/navigator/graph',
    file: '/api/v1/navigator/file',
  },
  recon: {
    inspect: '/api/v1/recon/inspect',
    projects: '/api/v1/recon/projects',
    project: (id: string) => `/api/v1/recon/projects/${id}`,
  },
  forum: {
    posts: '/api/v1/forum/posts',
    upvote: (postId: string) => `/api/v1/forum/posts/${postId}/upvote`,
    replies: (postId: string) => `/api/v1/forum/posts/${postId}/replies`,
    deletePost: (postId: string) => `/api/v1/forum/posts/${postId}`,
  },
  safechange: {
    analyze: '/api/v1/safechange/analyze',
    risk: '/api/v1/safechange/risk',
    dependencies: '/api/v1/safechange/dependencies',
  },
  workspaces: {
    list: '/api/v1/workspaces',
    create: '/api/v1/workspaces',
    workspace: (id: string) => `/api/v1/workspaces/${id}`,
  },
  system: {
    health: '/api/v1/system/health',
    backup: '/api/v1/system/backup',
    restore: '/api/v1/system/restore',
  },
  profile: {
    developer: '/api/v1/profile/developer',
    readme: '/api/v1/profile/readme',
  },
} as const;
