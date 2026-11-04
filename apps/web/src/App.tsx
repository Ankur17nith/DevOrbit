import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Sidebar } from './components/Sidebar.js';
import { TopBar } from './components/TopBar.js';
import { CommandPalette } from './components/CommandPalette.js';
import { AuthModal } from './components/AuthModal.js';
import { Database, Zap, Layers, RefreshCw } from 'lucide-react';

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
  if (hash) return hash;
  const path = window.location.pathname.replace(/^\//, '');
  if (path && path !== '') return path;
  return '';
}

function AppContent() {
  const { user, isLoading, demoLogin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const route = getUrlRoute();
    if (route) return route;
    return user ? 'dashboard' : 'landing';
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

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
    setCurrentTab(tab);
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
          onLaunchWorkspace={async () => {
            await demoLogin();
            handleSelectTab('dashboard');
          }} 
        />
      );
    }

    // Default public landing page matching Figma
    return (
      <PublicLandingPage 
        onNavigate={handleSelectTab} 
        onLaunchDemo={async () => {
          await demoLogin();
          handleSelectTab('dashboard');
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

  // 3. AUTHENTICATED WORKSPACE SHELL
  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F8FAFC] flex selection:bg-[#8B5CF6]/30 selection:text-white">
      
      {/* 1. Dedicated Left-Side Application Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Layout (Offset for Left Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-200 lg:pl-60">
        
        {/* Global Action Top Bar */}
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
          {currentTab === 'gsoc' && <GsocPage />}
          {currentTab === 'bounties' && <BountiesPage />}
          {currentTab === 'workspaces' && <WorkspacesPage />}
          {currentTab === 'forum' && <ForumPage />}
          {currentTab === 'selfbot' && <SelfbotPage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>

        {/* Global DevOrbit Telemetry Bottom Bar */}
        <footer className="h-7 bg-[#12151D] border-t border-[#1F2430] px-4 text-[11px] font-mono text-[#686D79] flex items-center justify-between shrink-0 select-none z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#22C55E]">
              <span className="size-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <Database className="size-3 text-[#22C55E]" />
              <span>SQLite Connected</span>
            </div>
            <span className="text-[#1F2430] hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1 text-[#C5C8D0]">
              <Layers className="size-3 text-[#8B5CF6]" />
              <span>Workspace: DevOrbit Core</span>
            </div>
            <span className="text-[#1F2430] hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-1 text-[#22C55E]">
              <Zap className="size-3 text-[#22C55E]" />
              <span>Eco Mode: Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#C5C8D0]">
              <RefreshCw className="size-3 text-[#60A5FA]" />
              <span className="hidden sm:inline">Sync: Local First (Up to date)</span>
            </div>
            <span className="text-[#1F2430] hidden lg:inline">|</span>
            <span className="hidden lg:inline text-[#686D79]">DevOrbit OS v0.1.0</span>
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
