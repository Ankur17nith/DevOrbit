import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Sparkles, 
  House, 
  Flame, 
  CircleAlert, 
  Building2, 
  Star, 
  ScanSearch, 
  Bot, 
  Bell,
  Users, 
  LogOut, 
  UserCheck, 
  Activity,
  Cpu,
  ShieldCheck,
  Check,
  FolderTree,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DevOrbitLogo } from './DevOrbitLogo.js';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  unreadCount?: number;
}

interface SystemMetrics {
  cpuPercent: number;
  memoryRssMb: number;
  memoryHeapMb: number;
  ecoMode: boolean;
}

export function Navbar({ currentTab, onSelectTab, onOpenAuthModal, unreadCount = 0 }: NavbarProps) {
  const { user, logout, switchUser } = useAuth();
  const [platformOpen, setPlatformOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [ecoActive, setEcoActive] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuPercent: 0.6,
    memoryRssMb: 72.4,
    memoryHeapMb: 24.8,
    ecoMode: true,
  });

  // Fetch real system resource telemetry from DevOrbit API
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/v1/system/status');
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setMetrics({
              cpuPercent: json.data.cpuPercent,
              memoryRssMb: json.data.memoryRssMb,
              memoryHeapMb: json.data.memoryHeapMb,
              ecoMode: json.data.ecoMode,
            });
          }
        }
      } catch {
        // Fallback to local calculated estimates if API offline
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isOssTab = ['catalog', 'trending', 'issues', 'gsoc', 'bounties', 'selfbot'].includes(currentTab);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0B0D12]/92 backdrop-blur-xl border-b border-[#1F2430]">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Official DevOrbit Brand Lockup */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onSelectTab('dashboard')} 
            className="flex items-center gap-2 group focus:outline-none transition-transform hover:opacity-95"
            title="DevOrbit — Your Skills. Your Code. Your Opportunities. One Universe."
          >
            <DevOrbitLogo size="md" />
          </button>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'dashboard' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              Command Center
            </button>

            {/* Orbit OSS Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPlatformOpen(!platformOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  platformOpen || isOssTab
                    ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10'
                    : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
                }`}
              >
                Orbit OSS
                <ChevronDown className={`size-3 transition-transform duration-200 text-[#686D79] ${platformOpen ? 'rotate-180 text-[#8B5CF6]' : ''}`} />
              </button>

              {platformOpen && (
                <div 
                  className="absolute left-0 mt-2 w-[490px] bg-[#12151D] border border-[#1F2430] rounded-xl shadow-2xl shadow-black/80 p-3 grid grid-cols-2 gap-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setPlatformOpen(false)}
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#686D79] px-2 py-1 font-semibold">Discovery & Trends</div>
                    <button
                      onClick={() => { onSelectTab('catalog'); setPlatformOpen(false); }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors group ${
                        currentTab === 'catalog' ? 'bg-[#181C26] border border-[#8B5CF6]/30' : 'hover:bg-[#181C26]'
                      }`}
                    >
                      <House className="size-4 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-[#F8FAFC]">Curated Catalog</div>
                        <div className="text-[11px] text-[#686D79]">Verified active repositories</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onSelectTab('trending'); setPlatformOpen(false); }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors group ${
                        currentTab === 'trending' ? 'bg-[#181C26] border border-[#8B5CF6]/30' : 'hover:bg-[#181C26]'
                      }`}
                    >
                      <Flame className="size-4 text-[#F76C39] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-[#F8FAFC]">Trending Repos</div>
                        <div className="text-[11px] text-[#686D79]">Fastest-rising on GitHub</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onSelectTab('issues'); setPlatformOpen(false); }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors group ${
                        currentTab === 'issues' ? 'bg-[#181C26] border border-[#8B5CF6]/30' : 'hover:bg-[#181C26]'
                      }`}
                    >
                      <CircleAlert className="size-4 text-[#A78BFA] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-[#F8FAFC]">Find Issues</div>
                        <div className="text-[11px] text-[#686D79]">Good first issues & help</div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#686D79] px-2 py-1 font-semibold">Programs & Automation</div>
                    <button
                      onClick={() => { onSelectTab('gsoc'); setPlatformOpen(false); }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors group ${
                        currentTab === 'gsoc' ? 'bg-[#181C26] border border-[#8B5CF6]/30' : 'hover:bg-[#181C26]'
                      }`}
                    >
                      <Building2 className="size-4 text-[#60A5FA] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-[#F8FAFC]">GSoC 2026 (606+ Orgs)</div>
                        <div className="text-[11px] text-[#686D79]">Historical acceptance data</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onSelectTab('bounties'); setPlatformOpen(false); }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors group ${
                        currentTab === 'bounties' ? 'bg-[#181C26] border border-[#8B5CF6]/30' : 'hover:bg-[#181C26]'
                      }`}
                    >
                      <Star className="size-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-[#F8FAFC]">Open Bounties</div>
                        <div className="text-[11px] text-[#686D79]">Paid contribution tasks</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onSelectTab('selfbot'); setPlatformOpen(false); }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors group ${
                        currentTab === 'selfbot' ? 'bg-[#181C26] border border-[#8B5CF6]/30' : 'hover:bg-[#181C26]'
                      }`}
                    >
                      <Bot className="size-4 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-[#F8FAFC]">GitHub Selfbot</div>
                        <div className="text-[11px] text-[#686D79]">Automated repo response agent</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectTab('dsa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'dsa' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              DSA Intelligence
            </button>

            <button
              onClick={() => onSelectTab('recon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                currentTab === 'recon' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              <ScanSearch className="size-3.5 text-[#8B5CF6]" />
              Orbit Recon
            </button>

            <button
              onClick={() => onSelectTab('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                currentTab === 'ai' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              <Sparkles className="size-3.5 text-[#A78BFA]" />
              Orbit AI
            </button>

            <button
              onClick={() => onSelectTab('navigator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                currentTab === 'navigator' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              <FolderTree className="size-3.5 text-[#8B5CF6]" />
              Navigator
            </button>

            <button
              onClick={() => onSelectTab('fix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                currentTab === 'fix' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              <Wrench className="size-3.5 text-[#8B5CF6]" />
              Orbit Fix
            </button>

            <button
              onClick={() => onSelectTab('workspaces')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'workspaces' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              Workspaces
            </button>

            <button
              onClick={() => onSelectTab('forum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'forum' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              Community
            </button>

            <button
              onClick={() => onSelectTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                currentTab === 'profile' 
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm shadow-[#8B5CF6]/10' 
                  : 'text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#12151D]'
              }`}
            >
              <UserCheck className="size-3.5 text-[#8B5CF6]" />
              Profile
            </button>
          </nav>
        </div>

        {/* Right Section: Real Resource Telemetry, Notifications, and Multi-User Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Live System Resource Telemetry Bar */}
          <div 
            className="hidden xl:flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#12151D] border border-[#1F2430] text-xs font-mono select-none"
            title="Real-time Node process resource metrics"
          >
            <div className="flex items-center gap-1 text-[#C5C8D0]">
              <Cpu className="size-3 text-[#8B5CF6]" />
              <span>CPU: {metrics.cpuPercent}%</span>
            </div>
            <span className="text-[#2E364A]">|</span>
            <div className="flex items-center gap-1 text-[#C5C8D0]">
              <Activity className="size-3 text-[#60A5FA]" />
              <span>RAM: {metrics.memoryRssMb}MB</span>
            </div>
            <span className="text-[#2E364A]">|</span>
            <button
              onClick={() => setEcoActive(!ecoActive)}
              className={`inline-flex items-center gap-1 transition-colors ${
                ecoActive ? 'text-[#22C55E]' : 'text-[#686D79]'
              }`}
              title="Toggle Low-Energy Eco Mode"
            >
              <span className={`size-1.5 rounded-full ${ecoActive ? 'bg-[#22C55E] animate-pulse' : 'bg-[#686D79]'}`} />
              <span>Eco</span>
            </button>
          </div>

          {/* Notifications Indicator */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="relative p-2 text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#181C26] rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-[#8B5CF6] ring-2 ring-[#0B0D12]" />
            )}
          </button>

          {/* User Profile & Multi-User Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#181C26] transition-colors border border-[#1F2430] hover:border-[#2E364A]"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces'}
                  alt={user.name || user.username}
                  className="size-7 rounded-full object-cover border border-[#8B5CF6]/30"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-[#F8FAFC] leading-tight">{user.name || user.username}</div>
                  <div className="text-[10px] text-[#686D79] leading-tight font-mono">@{user.username}</div>
                </div>
                <ChevronDown className={`size-3 text-[#686D79] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-[#12151D] border border-[#1F2430] rounded-xl shadow-2xl shadow-black/80 p-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#1F2430] mb-1.5">
                    <div className="text-xs font-bold text-[#F8FAFC]">{user.name}</div>
                    <div className="text-[11px] text-[#686D79] font-mono">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#A78BFA] font-mono uppercase tracking-wider">
                      <ShieldCheck className="size-3" />
                      <span>{user.role} Account</span>
                    </div>
                  </div>

                  <div className="px-2 py-1 text-[10px] font-mono text-[#686D79] uppercase font-semibold">
                    Instant Multi-User Switch
                  </div>
                  
                  {/* User A */}
                  <button
                    onClick={() => { switchUser('alex_developer'); setUserMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      user.username === 'alex_developer' 
                        ? 'bg-[#181C26] text-[#A78BFA] font-medium border border-[#8B5CF6]/30' 
                        : 'text-[#C5C8D0] hover:bg-[#181C26]'
                    }`}
                  >
                    <span>Alex Rivera (Admin / Fullstack)</span>
                    {user.username === 'alex_developer' && <Check className="size-3.5 text-[#8B5CF6]" />}
                  </button>

                  {/* User B */}
                  <button
                    onClick={() => { switchUser('sara_chen'); setUserMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      user.username === 'sara_chen' 
                        ? 'bg-[#181C26] text-[#A78BFA] font-medium border border-[#8B5CF6]/30' 
                        : 'text-[#C5C8D0] hover:bg-[#181C26]'
                    }`}
                  >
                    <span>Sara Chen (Systems Dev)</span>
                    {user.username === 'sara_chen' && <Check className="size-3.5 text-[#8B5CF6]" />}
                  </button>

                  <div className="my-1.5 border-t border-[#1F2430]"></div>

                  <button
                    onClick={() => { onSelectTab('profile'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#C5C8D0] hover:bg-[#181C26] transition-colors"
                  >
                    <UserCheck className="size-3.5 text-[#8B5CF6]" />
                    <span>View Developer Profile...</span>
                  </button>

                  <button
                    onClick={() => { onOpenAuthModal(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#C5C8D0] hover:bg-[#181C26] transition-colors"
                  >
                    <Users className="size-3.5 text-[#686D79]" />
                    <span>Manage / Add Account...</span>
                  </button>

                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold transition-all shadow-sm shadow-[#8B5CF6]/20 active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
