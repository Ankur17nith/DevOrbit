import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { AuthModal } from './components/AuthModal.js';
import { Database, Shield, Zap, Layers, RefreshCw, Command } from 'lucide-react';

// Application Pages
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

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#8B5CF6]/30 selection:text-white">
      {/* Top Brand Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="pt-14 pb-8 flex-1">
        {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
        {currentTab === 'catalog' && <OssCatalogPage />}
        {currentTab === 'trending' && <TrendingPage />}
        {currentTab === 'issues' && <IssuesPage />}
        {currentTab === 'gsoc' && <GsocPage />}
        {currentTab === 'bounties' && <BountiesPage />}
        {currentTab === 'dsa' && <DsaTrackerPage />}
        {currentTab === 'recon' && <OrbitReconPage />}
        {currentTab === 'ai' && <OrbitAiPage />}
        {currentTab === 'workspaces' && <WorkspacesPage />}
        {currentTab === 'forum' && <ForumPage />}
        {currentTab === 'selfbot' && <SelfbotPage />}
        {currentTab === 'profile' && <DeveloperProfilePage />}
        {currentTab === 'navigator' && <CodebaseNavigatorPage />}
        {currentTab === 'fix' && <OrbitFixPage />}
        {currentTab === 'safechange' && <OrbitSafeChangePage />}
      </main>

      {/* DevOrbit System Status Bottom Bar */}
      <footer className="h-7 bg-[#12151D] border-t border-[#1F2430] px-4 text-[11px] font-mono text-[#686D79] flex items-center justify-between z-40 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#22C55E]">
            <span className="size-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <Database className="size-3 text-[#22C55E]" />
            <span>SQLite Connected</span>
          </div>
          <span className="text-[#1F2430]">|</span>
          <div className="hidden sm:flex items-center gap-1 text-[#C5C8D0]">
            <Layers className="size-3 text-[#8B5CF6]" />
            <span>Workspace: DevOrbit Core</span>
          </div>
          <span className="text-[#1F2430] hidden sm:inline">|</span>
          <div className="hidden md:flex items-center gap-1 text-[#22C55E]">
            <Zap className="size-3 text-[#22C55E]" />
            <span>Eco Mode: Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#C5C8D0]">
            <RefreshCw className="size-3 text-[#60A5FA]" />
            <span>Sync: Local First (Up to date)</span>
          </div>
          <span className="text-[#1F2430]">|</span>
          <span className="hidden lg:inline text-[#686D79]">DevOrbit OS v0.1.0</span>
        </div>
      </footer>

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
