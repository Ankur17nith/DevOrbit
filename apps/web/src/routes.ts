import React from 'react';
import {
  LayoutDashboard,
  Code2,
  Wrench,
  ShieldAlert,
  Scan,
  Sparkles,
  Brain,
  Activity,
  Compass,
  Flame,
  Building2,
  GitPullRequest,
  Coins,
  Users,
  MessageSquare,
  Bot,
  Plug,
  Settings,
  BookOpen,
  LogIn,
  UserPlus,
  Home,
} from 'lucide-react';

export type NavGroupType = 'OVERVIEW' | 'DEVELOPMENT' | 'LEARNING' | 'OPEN SOURCE' | 'COLLABORATION' | 'SYSTEM';

export interface RouteDefinition {
  path: string;
  id: string;
  label: string;
  auth: boolean;
  element: React.LazyExoticComponent<React.ComponentType<any>>;
  showInNav?: boolean;
  navGroup?: NavGroupType;
  icon?: React.ElementType;
  badge?: string | number;
  description?: string;
}

// Lazy-loaded pages with code-splitting
const preloadLanding = import('./pages/PublicLandingPage.js');
const preloadLogin = import('./pages/LoginPage.js');
const preloadRegister = import('./pages/RegisterPage.js');
const preloadDocumentation = import('./pages/DocumentationPage.js');

export const PublicLandingPage = React.lazy(() => preloadLanding.then(m => ({ default: m.PublicLandingPage })));
export const LoginPage = React.lazy(() => preloadLogin.then(m => ({ default: m.LoginPage })));
export const RegisterPage = React.lazy(() => preloadRegister.then(m => ({ default: m.RegisterPage })));
export const DocumentationPage = React.lazy(() => preloadDocumentation.then(m => ({ default: m.DocumentationPage })));
export const DashboardPage = React.lazy(() => import('./pages/DashboardPage.js').then(m => ({ default: m.DashboardPage })));
export const CodebaseNavigatorPage = React.lazy(() => import('./pages/CodebaseNavigatorPage.js').then(m => ({ default: m.CodebaseNavigatorPage })));
export const OrbitFixPage = React.lazy(() => import('./pages/OrbitFixPage.js').then(m => ({ default: m.OrbitFixPage })));
export const OrbitSafeChangePage = React.lazy(() => import('./pages/OrbitSafeChangePage.js').then(m => ({ default: m.OrbitSafeChangePage })));
export const OrbitReconPage = React.lazy(() => import('./pages/OrbitReconPage.js').then(m => ({ default: m.OrbitReconPage })));
export const OrbitAiPage = React.lazy(() => import('./pages/OrbitAiPage.js').then(m => ({ default: m.OrbitAiPage })));
export const DsaTrackerPage = React.lazy(() => import('./pages/DsaTrackerPage.js').then(m => ({ default: m.DsaTrackerPage })));
export const DeveloperProfilePage = React.lazy(() => import('./pages/DeveloperProfilePage.js').then(m => ({ default: m.DeveloperProfilePage })));
export const OssCatalogPage = React.lazy(() => import('./pages/OssCatalogPage.js').then(m => ({ default: m.OssCatalogPage })));
export const TrendingPage = React.lazy(() => import('./pages/TrendingPage.js').then(m => ({ default: m.TrendingPage })));
export const GsocPage = React.lazy(() => import('./pages/GsocPage.js').then(m => ({ default: m.GsocPage })));
export const IssuesPage = React.lazy(() => import('./pages/IssuesPage.js').then(m => ({ default: m.IssuesPage })));
export const BountiesPage = React.lazy(() => import('./pages/BountiesPage.js').then(m => ({ default: m.BountiesPage })));
export const WorkspacesPage = React.lazy(() => import('./pages/WorkspacesPage.js').then(m => ({ default: m.WorkspacesPage })));
export const ForumPage = React.lazy(() => import('./pages/ForumPage.js').then(m => ({ default: m.ForumPage })));
export const SelfbotPage = React.lazy(() => import('./pages/SelfbotPage.js').then(m => ({ default: m.SelfbotPage })));
export const IntegrationCenterPage = React.lazy(() => import('./pages/IntegrationCenterPage.js').then(m => ({ default: m.IntegrationCenterPage })));
export const SettingsPage = React.lazy(() => import('./pages/SettingsPage.js').then(m => ({ default: m.SettingsPage })));
export const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.js').then(m => ({ default: m.NotFoundPage })));

export const APP_ROUTES: RouteDefinition[] = [
  // Public Routes
  { path: '/', id: 'landing', label: 'DevOrbit Home', auth: false, icon: Home, element: PublicLandingPage },
  { path: '/login', id: 'login', label: 'Sign In', auth: false, icon: LogIn, element: LoginPage },
  { path: '/register', id: 'register', label: 'Create Account', auth: false, icon: UserPlus, element: RegisterPage },
  { path: '/documentation', id: 'documentation', label: 'Documentation', auth: false, icon: BookOpen, element: DocumentationPage },

  // Authenticated App Workspace Routes
  { path: '/app', id: 'dashboard', label: 'Command Center', auth: true, showInNav: true, navGroup: 'OVERVIEW', icon: LayoutDashboard, description: 'Developer OS command center and workspace metrics', element: DashboardPage },
  { path: '/app/codebase', id: 'navigator', label: 'Codebase Navigator', auth: true, showInNav: true, navGroup: 'DEVELOPMENT', icon: Code2, description: 'AST and local dependency topology graph', element: CodebaseNavigatorPage },
  { path: '/app/fix', id: 'fix', label: 'Orbit Fix', auth: true, showInNav: true, navGroup: 'DEVELOPMENT', icon: Wrench, description: 'Root cause debugger and unified diff studio', element: OrbitFixPage },
  { path: '/app/safe-change', id: 'safechange', label: 'SafeChange', auth: true, showInNav: true, navGroup: 'DEVELOPMENT', icon: ShieldAlert, description: 'Blast radius analyzer and schema migration safety', element: OrbitSafeChangePage },
  { path: '/app/recon', id: 'recon', label: 'Orbit Recon', auth: true, showInNav: true, navGroup: 'DEVELOPMENT', icon: Scan, description: 'UI token extraction and component generator', element: OrbitReconPage },
  { path: '/app/ai', id: 'ai', label: 'Orbit AI', auth: true, showInNav: true, navGroup: 'DEVELOPMENT', icon: Sparkles, description: 'Local Ollama pairing and autonomous model runner', element: OrbitAiPage },
  { path: '/app/dsa', id: 'dsa', label: 'DSA Dashboard', auth: true, showInNav: true, navGroup: 'LEARNING', icon: Brain, description: 'SM-2 spaced repetition algorithmic mastery', element: DsaTrackerPage },
  { path: '/app/skills', id: 'profile', label: 'Skill Intelligence', auth: true, showInNav: true, navGroup: 'LEARNING', icon: Activity, description: 'Developer skill profile and verified contributions', element: DeveloperProfilePage },
  { path: '/app/oss', id: 'catalog', label: 'Discover', auth: true, showInNav: true, navGroup: 'OPEN SOURCE', icon: Compass, description: 'Curated open source repositories and mentorship projects', element: OssCatalogPage },
  { path: '/app/trending', id: 'trending', label: 'Trending', auth: true, showInNav: true, navGroup: 'OPEN SOURCE', icon: Flame, description: 'Star velocity and emerging GitHub technologies', element: TrendingPage },
  { path: '/app/organizations', id: 'gsoc', label: 'Organizations', auth: true, showInNav: true, navGroup: 'OPEN SOURCE', icon: Building2, description: 'GSoC organizations and fellowship directories', element: GsocPage },
  { path: '/app/issues', id: 'issues', label: 'Issues', auth: true, showInNav: true, navGroup: 'OPEN SOURCE', icon: GitPullRequest, description: 'Curated beginner and bounty open source issues', element: IssuesPage },
  { path: '/app/bounties', id: 'bounties', label: 'Bounties', auth: true, showInNav: true, navGroup: 'OPEN SOURCE', icon: Coins, description: 'Monetized algorithmic and open source bounties', element: BountiesPage },
  { path: '/app/workspaces', id: 'workspaces', label: 'Workspaces', auth: true, showInNav: true, navGroup: 'COLLABORATION', icon: Users, description: 'Team workspaces and role-based collaboration', element: WorkspacesPage },
  { path: '/app/community', id: 'forum', label: 'Community', auth: true, showInNav: true, navGroup: 'COLLABORATION', icon: MessageSquare, description: 'Developer architecture forum and peer discussions', element: ForumPage },
  { path: '/app/selfbot', id: 'selfbot', label: 'Maintainer Bot', auth: true, showInNav: true, navGroup: 'COLLABORATION', icon: Bot, description: 'Repository automation and pull request triaging bot', element: SelfbotPage },
  { path: '/app/integrations', id: 'integrations', label: 'Integrations', auth: true, showInNav: true, navGroup: 'SYSTEM', icon: Plug, description: 'GitHub, Codeforces, LeetCode, and Ollama connectors', element: IntegrationCenterPage },
  { path: '/app/settings', id: 'settings', label: 'Settings', auth: true, showInNav: true, navGroup: 'SYSTEM', icon: Settings, description: 'Preferences, security, and database backup / restore', element: SettingsPage },
];

export const LEGACY_HASH_MAP: Record<string, string> = {
  '': '/',
  'landing': '/',
  'login': '/login',
  'register': '/register',
  'docs': '/documentation',
  'documentation': '/documentation',
  'app': '/app',
  'dashboard': '/app',
  'codebase': '/app/codebase',
  'app/codebase': '/app/codebase',
  'navigator': '/app/codebase',
  'fix': '/app/fix',
  'app/fix': '/app/fix',
  'safechange': '/app/safe-change',
  'app/safe-change': '/app/safe-change',
  'recon': '/app/recon',
  'app/recon': '/app/recon',
  'ai': '/app/ai',
  'app/ai': '/app/ai',
  'dsa': '/app/dsa',
  'app/dsa': '/app/dsa',
  'skills': '/app/skills',
  'profile': '/app/skills',
  'app/skills': '/app/skills',
  'catalog': '/app/oss',
  'oss': '/app/oss',
  'app/oss': '/app/oss',
  'trending': '/app/trending',
  'app/trending': '/app/trending',
  'organizations': '/app/organizations',
  'gsoc': '/app/organizations',
  'app/organizations': '/app/organizations',
  'issues': '/app/issues',
  'app/issues': '/app/issues',
  'bounties': '/app/bounties',
  'app/bounties': '/app/bounties',
  'workspaces': '/app/workspaces',
  'app/workspaces': '/app/workspaces',
  'community': '/app/community',
  'forum': '/app/community',
  'app/community': '/app/community',
  'selfbot': '/app/selfbot',
  'app/selfbot': '/app/selfbot',
  'integrations': '/app/integrations',
  'app/integrations': '/app/integrations',
  'settings': '/app/settings',
  'app/settings': '/app/settings',
};

export interface NavGroupDefinition {
  group: NavGroupType;
  items: RouteDefinition[];
}

export function getNavGroups(): NavGroupDefinition[] {
  const groups: NavGroupType[] = ['OVERVIEW', 'DEVELOPMENT', 'LEARNING', 'OPEN SOURCE', 'COLLABORATION', 'SYSTEM'];
  return groups.map(group => ({
    group,
    items: APP_ROUTES.filter(r => r.showInNav && r.navGroup === group),
  }));
}
