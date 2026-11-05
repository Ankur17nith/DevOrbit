import React from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  Wrench, 
  ShieldAlert, 
  Scan, 
  Sparkles, 
  Brain, 
  Compass, 
  Flame, 
  Building2, 
  GitPullRequest, 
  Coins, 
  Plug, 
  Users, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Zap,
  Terminal,
  Activity,
  LogOut,
  BookOpen,
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'violet' | 'amber' | 'green' | 'neutral';
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

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

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Development',
      items: [
        { id: 'navigator', label: 'Codebase Navigator', icon: Code2 },
        { id: 'fix', label: 'Orbit Fix', icon: Wrench },
        { id: 'safechange', label: 'Orbit SafeChange', icon: ShieldAlert },
        { id: 'recon', label: 'Orbit Recon', icon: Scan },
        { id: 'ai', label: 'Orbit AI', icon: Sparkles, badge: 'Local', badgeVariant: 'violet' },
      ],
    },
    {
      group: 'Learning',
      items: [
        { id: 'dsa', label: 'DSA Intelligence', icon: Brain, badge: 'SM-2', badgeVariant: 'amber' },
        { id: 'profile', label: 'Skill Intelligence', icon: Activity },
      ],
    },
    {
      group: 'Open Source',
      items: [
        { id: 'catalog', label: 'Discover', icon: Compass },
        { id: 'trending', label: 'Trending', icon: Flame },
        { id: 'gsoc', label: 'Organizations', icon: Building2 },
        { id: 'issues', label: 'Issues & Pipeline', icon: GitPullRequest },
        { id: 'bounties', label: 'Bounties', icon: Coins },
      ],
    },
    {
      group: 'Integrations',
      items: [
        { id: 'integrations', label: 'Integration Center', icon: Plug, badge: 'Hub', badgeVariant: 'green' },
      ],
    },
    {
      group: 'Collaboration',
      items: [
        { id: 'workspaces', label: 'Workspaces', icon: Users },
        { id: 'forum', label: 'Community', icon: MessageSquare },
        { id: 'selfbot', label: 'Selfbot Terminal', icon: Terminal },
      ],
    },
    {
      group: 'Account',
      items: [
        { id: 'settings', label: 'Settings & Backups', icon: Settings },
      ],
    },
    {
      group: 'Resources',
      items: [
        { id: 'documentation', label: 'Documentation', icon: BookOpen, badge: 'Docs', badgeVariant: 'violet' },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    onSelectTab(id);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  const getBadgeClasses = (variant?: 'violet' | 'amber' | 'green' | 'neutral') => {
    switch (variant) {
      case 'violet':
        return 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30';
      case 'amber':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
      case 'green':
        return 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30';
      default:
        return 'bg-[#181C26] text-[#C5C8D0] border-[#1F2430]';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-[#0B0D12] border-r border-[#1F2430] transition-all duration-200 ease-in-out select-none
          ${mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-60'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-14 border-b border-[#1F2430] flex items-center justify-between px-3.5 shrink-0 bg-[#0B0D12]">
          {isCollapsed ? (
            <div className="w-full flex items-center justify-center">
              <button 
                onClick={() => handleSelect('dashboard')}
                title="DevOrbit Command Center"
                className="hover:scale-105 transition-transform"
              >
                <DevOrbitMark className="size-7" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button 
                onClick={() => handleSelect('dashboard')}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <DevOrbitLogo size="sm" showBadge={true} />
              </button>
              
              {/* Desktop Collapse Toggle */}
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  title="Collapse sidebar"
                  className="hidden lg:flex size-7 rounded-lg hover:bg-[#181C26] text-[#686D79] hover:text-[#F8FAFC] items-center justify-center transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
              )}

              {/* Mobile Close Button */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden size-8 rounded-lg text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#181C26] flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-4">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {/* Group Header (hidden when collapsed) */}
              {!isCollapsed && (
                <div className="px-2 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#686D79]">
                  {grp.group}
                </div>
              )}

              {/* Group Items */}
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id || (item.id === 'gsoc' && currentTab === 'organizations');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all group relative
                      ${isActive 
                        ? 'bg-[#1A1E29] text-[#F8FAFC] border-l-2 border-[#8B5CF6] font-semibold shadow-sm' 
                        : 'text-[#C5C8D0] hover:text-[#F8FAFC] hover:bg-[#151923] border-l-2 border-transparent'
                      }
                      ${isCollapsed ? 'justify-center px-0 h-10 border-l-0' : ''}
                    `}
                  >
                    <Icon 
                      className={`size-4 shrink-0 transition-colors
                        ${isActive ? 'text-[#8B5CF6]' : 'text-[#686D79] group-hover:text-[#F8FAFC]'}
                      `} 
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${getBadgeClasses(item.badgeVariant)}`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Floating Tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="hidden group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-[#181C26] text-[#F8FAFC] text-xs rounded-lg shadow-xl border border-[#1F2430] whitespace-nowrap z-50 pointer-events-none items-center gap-1.5 font-medium animate-in fade-in duration-150">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${getBadgeClasses(item.badgeVariant)}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: User Card & Local Telemetry */}
        <div className="border-t border-[#1F2430] p-2.5 space-y-2 bg-[#0B0D12]">
          
          {/* User Profile Area */}
          <div 
            onClick={onOpenAuthModal}
            className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#12151D] cursor-pointer transition-colors border border-transparent hover:border-[#1F2430]
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title="Switch User / Account Settings"
          >
            <div className="size-8 rounded-full bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center font-bold font-mono text-xs shrink-0 shadow-sm">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : 'DO'}
            </div>
            
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                    {user?.name || user?.username || 'Local Developer'}
                  </div>
                  <div className="text-[10px] text-[#686D79] truncate flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-[#22C55E]" />
                    <span>Active Session</span>
                  </div>
                </div>
                {user && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                    }}
                    title="Sign Out"
                    className="p-1 rounded-lg text-[#686D79] hover:text-[#EF4444] hover:bg-[#181C26] transition-colors"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Quick System Telemetry */}
          {!isCollapsed ? (
            <div className="px-2 pt-1 flex items-center justify-between text-[10px] font-mono text-[#686D79]">
              <div className="flex items-center gap-1 text-[#22C55E]">
                <Database className="size-3" />
                <span>SQLite Active</span>
              </div>
              <div className="flex items-center gap-1 text-[#C5C8D0]">
                <Zap className="size-3 text-[#8B5CF6]" />
                <span>Eco Mode</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center pt-1" title="SQLite Database Active">
              <span className="size-2 rounded-full bg-[#22C55E] animate-pulse" />
            </div>
          )}

          {/* Collapsed expand toggle button */}
          {isCollapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="hidden lg:flex w-full py-1 text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#181C26] rounded-lg items-center justify-center"
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
