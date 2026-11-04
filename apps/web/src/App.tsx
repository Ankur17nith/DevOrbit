import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { AuthModal } from './components/AuthModal.js';

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

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0E0F10] text-[#E5E5E5]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="pt-14 pb-12">
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
      </main>

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
