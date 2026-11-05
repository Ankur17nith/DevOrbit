import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Sidebar } from './components/Sidebar.js';
import { TopBar } from './components/TopBar.js';
import { CommandPalette } from './components/CommandPalette.js';
import { AuthModal } from './components/AuthModal.js';
import { Database, Layers, RefreshCw } from 'lucide-react';

// Public Pages (Figma Design System)
import { PublicLandingPage } from './pages/PublicLandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DocumentationPage } from './pages/DocumentationPage.js';

// Application Workspace Pages
import { DashboardPage } from './pages/DashboardPage.js';
import { OssCatalogPage } from './pages/OssCatalogPage.js';
import { TrendingPage } from './pages/TrendingPage.js';
import { IssuesPage } from './pages/IssuesPage.js';
import { GsocPage } from './pages/GsocPage.js';
import { BountiesPage } from './pages/BountiesPage.js';
import { DsaTrackerPage } from './pages/DsaTrackerPage.js';
import { OrbitReconPage } from './pages/OrbitReconPage.js';
import { OrbitAiPage } from './pages/OrbitAiPage.js';
import { WorkspacesPage } from './pages/WorkspacesPage.js';
import { ForumPage } from './pages/ForumPage.js';
import { SelfbotPage } from './pages/SelfbotPage.js';
import { DeveloperProfilePage } from './pages/DeveloperProfilePage.js';
import { CodebaseNavigatorPage } from './pages/CodebaseNavigatorPage.js';
import { OrbitFixPage } from './pages/OrbitFixPage.js';
import { OrbitSafeChangePage } from './pages/OrbitSafeChangePage.js';
import { IntegrationCenterPage } from './pages/IntegrationCenterPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

function getUrlRoute(): string {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash) {
    if (hash === 'organizations') return 'gsoc';
    if (hash === 'app' || hash === 'dashboard') return 'dashboard';
    if (hash === 'app/codebase' || hash === 'codebase') return 'navigator';
    if (hash === 'app/fix') return 'fix';
    if (hash === 'app/safe-change') return 'safechange';
    if (hash === 'app/recon') return 'recon';
    if (hash === 'app/ai') return 'ai';
    if (hash === 'app/dsa') return 'dsa';
    if (hash === 'app/skills') return 'profile';
    if (hash === 'app/oss' || hash === 'oss') return 'catalog';
    if (hash === 'app/trending') return 'trending';
    if (hash === 'app/organizations') return 'gsoc';
    if (hash === 'app/issues') return 'issues';
    if (hash === 'app/bounties') return 'bounties';
    if (hash === 'app/workspaces') return 'workspaces';
    if (hash === 'app/community') return 'forum';
    if (hash === 'app/integrations') return 'integrations';
    if (hash === 'app/settings') return 'settings';
    return hash;
  }
  const path = window.location.pathname.replace(/^\//, '');
  if (path && path !== '') {
    if (path === 'organizations') return 'gsoc';
    if (path === 'app' || path === 'dashboard') return 'dashboard';
    if (path === 'app/codebase' || path === 'codebase') return 'navigator';
    if (path === 'app/fix') return 'fix';
    if (path === 'app/safe-change') return 'safechange';
    if (path === 'app/recon') return 'recon';
    if (path === 'app/ai') return 'ai';
    if (path === 'app/dsa') return 'dsa';
    if (path === 'app/skills') return 'profile';
    if (path === 'app/oss' || path === 'oss') return 'catalog';
    if (path === 'app/trending') return 'trending';
    if (path === 'app/organizations') return 'gsoc';
    if (path === 'app/issues') return 'issues';
    if (path === 'app/bounties') return 'bounties';
    if (path === 'app/workspaces') return 'workspaces';
    if (path === 'app/community') return 'forum';
    if (path === 'app/integrations') return 'integrations';
    if (path === 'app/settings') return 'settings';
    return path;
  }
  return '';
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const route = getUrlRoute();
    if (route) return route;
    return user ? 'dashboard' : 'landing';
  });
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

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('devorbit_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const route = getUrlRoute();
      if (route) {
        setCurrentTab(route);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update default tab if user logs in or out when on default route
  useEffect(() => {
    const route = getUrlRoute();
    if (!route || route === 'landing') {
      if (user && currentTab === 'landing') {
        setCurrentTab('dashboard');
      } else if (!user && currentTab !== 'login' && currentTab !== 'register' && currentTab !== 'documentation') {
        setCurrentTab('landing');
      }
    }
  }, [user]);

  const handleSelectTab = (tab: string) => {
    let resolved = tab;
    if (tab === 'organizations') resolved = 'gsoc';
    if (tab === 'app') resolved = 'dashboard';
    if (tab === 'app/codebase') resolved = 'navigator';
    if (tab === 'app/fix') resolved = 'fix';
    if (tab === 'app/safe-change') resolved = 'safechange';
    if (tab === 'app/recon') resolved = 'recon';
    if (tab === 'app/ai') resolved = 'ai';
    if (tab === 'app/dsa') resolved = 'dsa';
    if (tab === 'app/skills') resolved = 'profile';
    if (tab === 'app/oss') resolved = 'catalog';
    if (tab === 'app/trending') resolved = 'trending';
    if (tab === 'app/organizations') resolved = 'gsoc';
    if (tab === 'app/issues') resolved = 'issues';
    if (tab === 'app/bounties') resolved = 'bounties';
    if (tab === 'app/workspaces') resolved = 'workspaces';
    if (tab === 'app/community') resolved = 'forum';
    if (tab === 'app/integrations') resolved = 'integrations';
    if (tab === 'app/settings') resolved = 'settings';

    setCurrentTab(resolved);
    window.location.hash = tab;
  };

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

  // 1. PUBLIC ROUTES FOR UNAUTHENTICATED VISITORS
  if (!user) {
    if (currentTab === 'login') {
      return (
        <LoginPage 
          onNavigate={handleSelectTab} 
          onSuccess={() => handleSelectTab('dashboard')} 
        />
      );
    }

    if (currentTab === 'register') {
      return (
        <RegisterPage 
          onNavigate={handleSelectTab} 
          onSuccess={() => handleSelectTab('dashboard')} 
        />
      );
    }

    if (currentTab === 'documentation') {
      return (
        <DocumentationPage 
          onNavigate={handleSelectTab} 
          onLaunchWorkspace={() => {
            handleSelectTab('login');
          }} 
        />
      );
    }

    // Default public landing page matching Figma
    return (
      <PublicLandingPage 
        onNavigate={handleSelectTab} 
        onLaunchDemo={() => {
          handleSelectTab('login');
        }} 
      />
    );
  }

  // 2. STANDALONE DOCUMENTATION OR LANDING ACCESSIBLE WHEN LOGGED IN
  if (currentTab === 'documentation') {
    return (
      <DocumentationPage 
        onNavigate={handleSelectTab} 
        onLaunchWorkspace={() => handleSelectTab('dashboard')} 
      />
    );
  }

  if (currentTab === 'landing') {
    return (
      <PublicLandingPage 
        onNavigate={handleSelectTab} 
        onLaunchDemo={() => handleSelectTab('dashboard')} 
      />
    );
  }

  // 3. AUTHENTICATED WORKSPACE SHELL (FIGMA LIGHT CANVAS)
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0B0D12] flex selection:bg-[#8B5CF6]/20 selection:text-[#8B5CF6]">
      
      {/* 1. Dedicated Left-Side Application Navigation (Figma Dark Shell) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* 2. Main Content Layout (Offset for Left Sidebar) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-60'}`}>
        
        {/* Global Action Top Bar (Figma White Header) */}
        <TopBar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 min-h-[calc(100vh-56px-28px)]">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={handleSelectTab} />}
          {currentTab === 'integrations' && <IntegrationCenterPage />}
          {currentTab === 'navigator' && <CodebaseNavigatorPage />}
          {currentTab === 'fix' && <OrbitFixPage />}
          {currentTab === 'safechange' && <OrbitSafeChangePage />}
          {currentTab === 'recon' && <OrbitReconPage />}
          {currentTab === 'ai' && <OrbitAiPage />}
          {currentTab === 'dsa' && <DsaTrackerPage />}
          {currentTab === 'profile' && <DeveloperProfilePage />}
          {currentTab === 'catalog' && <OssCatalogPage />}
          {currentTab === 'trending' && <TrendingPage />}
          {currentTab === 'issues' && <IssuesPage />}
          {(currentTab === 'gsoc' || currentTab === 'organizations') && <GsocPage />}
          {currentTab === 'bounties' && <BountiesPage />}
          {currentTab === 'workspaces' && <WorkspacesPage />}
          {currentTab === 'forum' && <ForumPage />}
          {currentTab === 'selfbot' && <SelfbotPage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>

        {/* Global DevOrbit Telemetry Bottom Bar (Figma Clean Footer) */}
        <footer className="h-7 bg-white border-t border-black/8 px-6 text-[10px] font-mono text-[#858993] flex items-center justify-between shrink-0 select-none z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="size-3 text-emerald-600" />
              <span className="font-sans font-medium text-[11px] text-[#0B0D12]">SQLite Connected</span>
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
              <span className="hidden sm:inline">Sync: Local First (Up to date)</span>
            </div>
            <span className="text-black/10 hidden lg:inline">|</span>
            <span className="hidden lg:inline text-[#858993]">DevOrbit OS v0.1.0</span>
          </div>
        </footer>

      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleSelectTab}
      />

      {/* Auth & Multi-User Switcher Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
