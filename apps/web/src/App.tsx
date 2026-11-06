import React, { useState, useEffect, useMemo } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Sidebar } from './components/Sidebar.js';
import { TopBar } from './components/TopBar.js';
import { CommandPalette } from './components/CommandPalette.js';
import { AuthModal } from './components/AuthModal.js';
import { Database, Layers, RefreshCw } from 'lucide-react';

import {
  APP_ROUTES,
  LEGACY_HASH_MAP,
  PublicLandingPage,
  LoginPage,
  RegisterPage,
  DocumentationPage,
  DashboardPage,
  CodebaseNavigatorPage,
  OrbitFixPage,
  OrbitSafeChangePage,
  OrbitReconPage,
  OrbitAiPage,
  DsaTrackerPage,
  DeveloperProfilePage,
  OssCatalogPage,
  TrendingPage,
  GsocPage,
  IssuesPage,
  BountiesPage,
  WorkspacesPage,
  ForumPage,
  SelfbotPage,
  IntegrationCenterPage,
  SettingsPage,
  NotFoundPage,
} from './routes.js';

function LoadingFallback() {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-8 text-xs font-mono text-[#858993]">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-[#8B5CF6] animate-ping" />
        <span>Loading workspace module...</span>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center text-white font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#8B5CF6] animate-ping" />
          <span>DevOrbit Local-First System Initializing...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function resolveLegacyRoute(hash?: string, currentTab?: string): string {
  if (hash === 'organizations') return 'gsoc';
  if (currentTab === 'gsoc' || currentTab === 'organizations') return 'gsoc';
  return hash || currentTab || 'dashboard';
}

function HashRedirectWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleHash = () => {
      const rawHash = (typeof window !== 'undefined' ? window.location.hash : '').replace(/^#\/?/, '');
      if (rawHash && LEGACY_HASH_MAP[rawHash]) {
        const target = LEGACY_HASH_MAP[rawHash];
        if (window.location.pathname !== target) {
          navigate(target, { replace: true });
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigate]);

  return null;
}

function AuthenticatedAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('devorbit_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkDb = async () => {
      try {
        const res = await fetch('/api/v1/system/health');
        if (res.ok) {
          const json = await res.json();
          if (mounted) {
            setDbConnected(json?.database?.status === 'connected');
          }
        } else {
          if (mounted) setDbConnected(false);
        }
      } catch {
        if (mounted) setDbConnected(false);
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('devorbit_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleSelectTab = (tab: string) => {
    if (tab.startsWith('/')) {
      navigate(tab);
    } else if (LEGACY_HASH_MAP[tab]) {
      navigate(LEGACY_HASH_MAP[tab]);
    } else {
      navigate(`/app/${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0B0D12] flex selection:bg-[#8B5CF6]/20 selection:text-[#8B5CF6]">
      <HashRedirectWatcher />

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={location.pathname}
        onSelectTab={handleSelectTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* 2. Main Content Layout */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-60'}`}>
        <TopBar
          currentTab={location.pathname}
          onSelectTab={handleSelectTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 min-h-[calc(100vh-56px-28px)]">
          <React.Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </React.Suspense>
        </main>

        {/* Telemetry Footer */}
        <footer className="h-7 bg-white border-t border-black/8 px-6 text-[10px] font-mono text-[#858993] flex items-center justify-between shrink-0 select-none z-20">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 ${dbConnected === false ? 'text-rose-600' : 'text-emerald-600'}`}>
              <span className={`size-1.5 rounded-full ${dbConnected === false ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
              <Database className={`size-3 ${dbConnected === false ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span className="font-sans font-medium text-[11px] text-[#0B0D12]">
                {dbConnected === null ? 'SQLite Connecting...' : dbConnected ? 'SQLite Connected' : 'SQLite Disconnected'}
              </span>
            </div>
            <span className="text-black/10 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1 text-[#686D79]">
              <Layers className="size-3 text-[#8B5CF6]" />
              <span>Workspace: DevOrbit Core</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#686D79]">
              <RefreshCw className="size-3 text-[#8B5CF6]" />
              <span className="hidden sm:inline">Sync: Local First</span>
            </div>
            <span className="text-black/10 hidden lg:inline">|</span>
            <span className="hidden lg:inline text-[#858993]">DevOrbit OS v0.1.0</span>
          </div>
        </footer>
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleSelectTab}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

function PublicLandingWrapper() {
  const navigate = useNavigate();
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <PublicLandingPage
        onNavigate={(tab: string) => navigate(LEGACY_HASH_MAP[tab] || (tab.startsWith('/') ? tab : `/${tab}`))}
        onLaunchDemo={import.meta.env.VITE_ENABLE_DEMO === 'true' ? () => navigate('/login') : undefined}
      />
    </React.Suspense>
  );
}

function LoginWrapper() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/app" replace />;
  }
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <LoginPage
        onNavigate={(tab: string) => navigate(LEGACY_HASH_MAP[tab] || (tab.startsWith('/') ? tab : `/${tab}`))}
        onSuccess={() => navigate('/app')}
      />
    </React.Suspense>
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/app" replace />;
  }
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <RegisterPage
        onNavigate={(tab: string) => navigate(LEGACY_HASH_MAP[tab] || (tab.startsWith('/') ? tab : `/${tab}`))}
        onSuccess={() => navigate('/app')}
      />
    </React.Suspense>
  );
}

function DocumentationWrapper() {
  const navigate = useNavigate();
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <DocumentationPage
        onNavigate={(tab: string) => navigate(LEGACY_HASH_MAP[tab] || (tab.startsWith('/') ? tab : `/${tab}`))}
        onLaunchWorkspace={() => navigate('/login')}
      />
    </React.Suspense>
  );
}

function DashboardWrapper() {
  const navigate = useNavigate();
  return (
    <DashboardPage
      onNavigate={(tab: string) => navigate(LEGACY_HASH_MAP[tab] || (tab.startsWith('/') ? tab : `/app/${tab}`))}
    />
  );
}

function NotFoundWrapper() {
  const navigate = useNavigate();
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <NotFoundPage
        onNavigate={(path: string) => navigate(path)}
      />
    </React.Suspense>
  );
}

export function buildRoutes() {
  return [
    {
      path: '/',
      element: <PublicLandingWrapper />,
    },
    {
      path: '/login',
      element: <LoginWrapper />,
    },
    {
      path: '/register',
      element: <RegisterWrapper />,
    },
    {
      path: '/documentation',
      element: <DocumentationWrapper />,
    },
    {
      path: '/app',
      element: (
        <RequireAuth>
          <AuthenticatedAppLayout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <DashboardWrapper /> },
        { path: 'codebase', element: <CodebaseNavigatorPage /> },
        { path: 'fix', element: <OrbitFixPage /> },
        { path: 'safe-change', element: <OrbitSafeChangePage /> },
        { path: 'recon', element: <OrbitReconPage /> },
        { path: 'ai', element: <OrbitAiPage /> },
        { path: 'dsa', element: <DsaTrackerPage /> },
        { path: 'skills', element: <DeveloperProfilePage /> },
        { path: 'oss', element: <OssCatalogPage /> },
        { path: 'trending', element: <TrendingPage /> },
        { path: 'organizations', element: <GsocPage /> },
        { path: 'issues', element: <IssuesPage /> },
        { path: 'bounties', element: <BountiesPage /> },
        { path: 'workspaces', element: <WorkspacesPage /> },
        { path: 'community', element: <ForumPage /> },
        { path: 'selfbot', element: <SelfbotPage /> },
        { path: 'integrations', element: <IntegrationCenterPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: '*', element: <NotFoundWrapper /> },
      ],
    },
    // Top-level 404 catch-all
    {
      path: '*',
      element: <NotFoundWrapper />,
    },
  ];
}

export function createAppRouter() {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace(/^#\/?/, '');
    if (rawHash && LEGACY_HASH_MAP[rawHash]) {
      const target = LEGACY_HASH_MAP[rawHash];
      if (window.location.pathname !== target) {
        window.history.replaceState(null, '', target);
      }
    }
  }
  return createBrowserRouter(buildRoutes());
}

export function App() {
  const router = useMemo(() => createAppRouter(), []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
