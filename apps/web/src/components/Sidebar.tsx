import React from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  Wrench, 
  ShieldAlert, 
  Scan, 
  Sparkles, 
  Brain, 
  CheckSquare,
  Calendar,
  Award,
  TrendingUp,
  Compass, 
  Flame, 
  Building2, 
  GitPullRequest, 
  Coins, 
  GitMerge,
  Users, 
  MessageSquare, 
  Plug,
  Activity,
  BookOpen,
  Settings, 
  ChevronLeft, 
  ChevronRight,
  User,
  Bot,
  LogOut,
  X
} from 'lucide-react';
import { DevOrbitLogo, DevOrbitMark } from './DevOrbitLogo.js';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string | number;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const figmaNavGroups: NavGroup[] = [
  {
    group: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, path: '/app' },
    ],
  },
  {
    group: 'DEVELOPMENT',
    items: [
      { id: 'navigator', label: 'Codebase Navigator', icon: Code2, path: '/app/codebase' },
      { id: 'fix', label: 'Orbit Fix', icon: Wrench, path: '/app/fix' },
      { id: 'safechange', label: 'SafeChange', icon: ShieldAlert, path: '/app/safe-change' },
      { id: 'recon', label: 'Orbit Recon', icon: Scan, path: '/app/recon' },
      { id: 'ai', label: 'Orbit AI', icon: Sparkles, path: '/app/ai' },
    ],
  },
  {
    group: 'LEARNING',
    items: [
      { id: 'dsa', label: 'DSA Dashboard', icon: Brain, path: '/app/dsa' },
      { id: 'profile', label: 'Skill Intelligence', icon: Activity, path: '/app/skills' },
    ],
  },
  {
    group: 'OPEN SOURCE',
    items: [
      { id: 'catalog', label: 'Discover', icon: Compass, path: '/app/oss' },
      { id: 'trending', label: 'Trending', icon: Flame, path: '/app/trending' },
      { id: 'gsoc', label: 'Organizations', icon: Building2, path: '/app/organizations' },
      { id: 'issues', label: 'Issues', icon: GitPullRequest, path: '/app/issues' },
      { id: 'bounties', label: 'Bounties', icon: Coins, path: '/app/bounties' },
    ],
  },
  {
    group: 'COLLABORATION',
    items: [
      { id: 'workspaces', label: 'Workspaces', icon: Users, path: '/app/workspaces' },
      { id: 'forum', label: 'Community', icon: MessageSquare, path: '/app/community' },
      // Configuration only — hidden until background worker active: { id: 'selfbot', label: 'Maintainer Bot', icon: Bot, path: '/app/selfbot' },
    ],
  },
  {
    group: 'SYSTEM',
    items: [
      { id: 'integrations', label: 'Integrations', icon: Plug, path: '/app/integrations' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/app/settings' },
    ],
  },
];

export function Sidebar({ 
  currentTab, 
  onSelectTab, 
  onOpenAuthModal, 
  mobileOpen, 
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const { user, logout } = useAuth();

  const isItemActive = (item: NavItem): boolean => {
    if (currentTab === item.id) return true;
    if (item.id === 'gsoc' && currentTab === 'organizations') return true;
    if (item.id === 'dashboard' && currentTab === 'app') return true;
    if (item.id === 'navigator' && currentTab === 'codebase') return true;
    if (item.id === 'catalog' && currentTab === 'oss') return true;
    if (item.id === 'forum' && currentTab === 'community') return true;
    if (item.id === 'safechange' && (currentTab === 'safe-change' || currentTab === 'safechange')) return true;
    return false;
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'DU';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'DU';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/8 bg-[#0B0D12] text-white transition-all duration-200 ${
          isCollapsed ? 'w-[68px]' : 'w-[244px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/8 shrink-0">
          <div 
            onClick={() => {
              onSelectTab('dashboard');
              onCloseMobile();
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <DevOrbitMark className="size-6 text-[#8B5CF6] shrink-0" />
            {!isCollapsed && (
              <span className="font-bold text-sm tracking-tight text-white">DevOrbit</span>
            )}
          </div>

          {/* Mobile close button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-white/50 hover:text-white rounded-md transition"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>

          {/* Desktop collapse button */}
          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex size-6 items-center justify-center rounded text-white/30 hover:text-white hover:bg-white/5 transition"
              title="Collapse sidebar"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 [scrollbar-width:none]">
          {figmaNavGroups.map((group) => (
            <div key={group.group} className="space-y-0.5">
              {!isCollapsed ? (
                <p className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
                  {group.group}
                </p>
              ) : (
                <div className="h-2" />
              )}

              {group.items.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                      active 
                        ? 'bg-[#181C26] text-white font-semibold shadow-sm border border-white/5' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`size-3.5 shrink-0 ${active ? 'text-[#8B5CF6]' : 'text-white/50'}`} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto text-[8px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Profile Card & Footer Actions */}
        <div className="p-2.5 border-t border-white/8 shrink-0 bg-[#0B0D12]">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => onSelectTab('settings')}
                title="Settings"
                className="size-8 rounded-lg flex items-center justify-center hover:opacity-90 overflow-hidden"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || user.username}
                    className="size-8 rounded-lg object-cover border border-white/10"
                  />
                ) : (
                  <div className="size-8 rounded-lg bg-[#EEEAFB] text-[#6D3FE0] text-[10px] font-bold flex items-center justify-center">
                    {getInitials(user?.name || user?.username)}
                  </div>
                )}
              </button>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="size-6 flex items-center justify-center text-white/30 hover:text-white rounded"
                  title="Expand sidebar"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => onSelectTab('profile')}
                className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 text-left transition group"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || user.username}
                    className="size-7 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                ) : (
                  <div className="size-7 rounded-lg bg-[#EEEAFB] text-[#6D3FE0] text-[9px] font-bold flex items-center justify-center shrink-0">
                    {getInitials(user?.name || user?.username)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate leading-snug">
                    {user?.name || user?.username || 'Dev User'}
                  </p>
                  <p className="text-[9px] text-white/40 truncate">
                    @{user?.username || 'developer'}
                  </p>
                </div>
              </button>

              <div className="flex items-center justify-between px-1.5 pt-1 text-[10px] text-white/40">
                <button
                  onClick={() => onSelectTab('settings')}
                  className="hover:text-white flex items-center gap-1 transition"
                >
                  <Settings className="size-3" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="hover:text-red-400 flex items-center gap-1 transition"
                  title="Sign out"
                >
                  <LogOut className="size-3" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
