import React, { useState } from 'react';
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
  MessageCircle, 
  Users, 
  LogOut, 
  UserCheck, 
  Leaf,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuthModal: () => void;
}

export function Navbar({ currentTab, onSelectTab, onOpenAuthModal }: NavbarProps) {
  const { user, logout, switchUser } = useAuth();
  const [platformOpen, setPlatformOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0E0F10]/90 backdrop-blur-md border-b border-[#242424]">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onSelectTab('dashboard')} 
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="size-8 rounded-lg bg-gradient-to-br from-[#09AE5B] to-[#044724] flex items-center justify-center text-white shadow-lg shadow-[#09AE5B]/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-base tracking-wider font-mono">DO</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white font-display">DevOrbit</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">OS</span>
              </div>
            </div>
          </button>

          {/* Navigation Links & Dropdowns */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'dashboard' 
                  ? 'bg-white/[0.08] text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Command Center
            </button>

            {/* Platform Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPlatformOpen(!platformOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  platformOpen || ['catalog', 'trending', 'issues', 'gsoc', 'bounties'].includes(currentTab)
                    ? 'bg-white/[0.08] text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Orbit OSS
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${platformOpen ? 'rotate-180' : ''}`} />
              </button>

              {platformOpen && (
                <div 
                  className="absolute left-0 mt-2 w-[480px] bg-[#0E0F10] border border-[#242424] rounded-xl shadow-2xl p-4 grid grid-cols-2 gap-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setPlatformOpen(false)}
                >
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 py-1 font-semibold">Discovery</div>
                    <button
                      onClick={() => { onSelectTab('catalog'); setPlatformOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] text-left transition-colors group"
                    >
                      <House className="size-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-sm font-medium text-white">Curated Catalog</div>
                        <div className="text-xs text-neutral-400">Handpicked repositories</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onSelectTab('trending'); setPlatformOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] text-left transition-colors group"
                    >
                      <Flame className="size-4 text-orange-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-sm font-medium text-white">Trending Repos</div>
                        <div className="text-xs text-neutral-400">Fastest-rising on GitHub</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onSelectTab('issues'); setPlatformOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] text-left transition-colors group"
                    >
                      <CircleAlert className="size-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-sm font-medium text-white">Find Issues</div>
                        <div className="text-xs text-neutral-400">Good first issues & help</div>
                      </div>
                    </button>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 py-1 font-semibold">Programs & Rewards</div>
                    <button
                      onClick={() => { onSelectTab('gsoc'); setPlatformOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] text-left transition-colors group"
                    >
                      <Building2 className="size-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-sm font-medium text-white">GSoC Orgs (606+)</div>
                        <div className="text-xs text-neutral-400">Historical database</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onSelectTab('bounties'); setPlatformOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] text-left transition-colors group"
                    >
                      <Star className="size-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-sm font-medium text-white">Bounties</div>
                        <div className="text-xs text-neutral-400">Paid contribution tasks</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onSelectTab('selfbot'); setPlatformOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] text-left transition-colors group"
                    >
                      <Bot className="size-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-sm font-medium text-white">GitHub Selfbot</div>
                        <div className="text-xs text-neutral-400">Zero-action auto responder</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectTab('dsa')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'dsa' 
                  ? 'bg-white/[0.08] text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              DSA Intelligence
            </button>

            <button
              onClick={() => onSelectTab('recon')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'recon' 
                  ? 'bg-white/[0.08] text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ScanSearch className="size-3.5 text-emerald-400" />
              Orbit Recon
            </button>

            <button
              onClick={() => onSelectTab('ai')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'ai' 
                  ? 'bg-white/[0.08] text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="size-3.5 text-amber-400" />
              Orbit AI
            </button>

            <button
              onClick={() => onSelectTab('workspaces')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'workspaces' 
                  ? 'bg-white/[0.08] text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Workspaces
            </button>

            <button
              onClick={() => onSelectTab('forum')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'forum' 
                  ? 'bg-white/[0.08] text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Community
            </button>
          </div>
        </div>

        {/* Right: Eco Mode Indicator & User Profile / Multi-User Switcher */}
        <div className="flex items-center gap-3">
          {/* Eco Mode Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
            <Leaf className="size-3" />
            <span>Eco Mode: 0.1% CPU</span>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors border border-neutral-800"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces'}
                  alt={user.name || user.username}
                  className="size-7 rounded-full object-cover border border-[#242424]"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">{user.name || user.username}</div>
                  <div className="text-[10px] text-neutral-400 leading-tight font-mono">@{user.username}</div>
                </div>
                <ChevronDown className="size-3 text-neutral-400" />
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-[#0E0F10] border border-[#242424] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#242424] mb-1">
                    <div className="text-xs font-semibold text-white">{user.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">{user.email}</div>
                    <div className="mt-1 text-[10px] text-emerald-400 font-mono uppercase tracking-wider">{user.role} role</div>
                  </div>

                  <div className="px-2 py-1 text-[10px] font-mono text-neutral-500 uppercase font-semibold">
                    Quick Multi-User Switch
                  </div>
                  <button
                    onClick={() => { switchUser('alex_developer'); setUserMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      user.username === 'alex_developer' ? 'bg-white/[0.08] text-emerald-400 font-medium' : 'text-neutral-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>Alex Rivera (Admin)</span>
                    {user.username === 'alex_developer' && <UserCheck className="size-3.5" />}
                  </button>
                  <button
                    onClick={() => { switchUser('sara_chen'); setUserMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      user.username === 'sara_chen' ? 'bg-white/[0.08] text-emerald-400 font-medium' : 'text-neutral-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>Sara Chen (Systems Dev)</span>
                    {user.username === 'sara_chen' && <UserCheck className="size-3.5" />}
                  </button>

                  <div className="my-1 border-t border-[#242424]"></div>

                  <button
                    onClick={() => { onOpenAuthModal(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:bg-white/[0.04] transition-colors"
                  >
                    <Users className="size-3.5 text-neutral-400" />
                    <span>Manage Accounts...</span>
                  </button>

                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
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
              className="px-4 py-1.5 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold transition-colors shadow-lg shadow-[#09AE5B]/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
