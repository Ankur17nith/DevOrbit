import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Command, 
  ChevronRight, 
  Database, 
  Zap, 
  ShieldCheck, 
  Check, 
  Clock, 
  ExternalLink,
  Sparkles,
  LogOut,
  UserCheck,
  Users,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface TopBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileSidebar: () => void;
  onOpenAuthModal: () => void;
  onOpenCommandPalette: () => void;
}

export function TopBar({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
  onOpenAuthModal,
  onOpenCommandPalette,
}: TopBarProps) {
  const { user, token, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  // Tab Breadcrumb labels mapping
  const breadcrumbMap: { [key: string]: { section: string; title: string } } = {
    dashboard: { section: 'Overview', title: 'Command Center' },
    navigator: { section: 'Development', title: 'Codebase Navigator' },
    fix: { section: 'Development', title: 'Orbit Fix' },
    safechange: { section: 'Development', title: 'Orbit SafeChange' },
    recon: { section: 'Development', title: 'Orbit Recon' },
    ai: { section: 'Development', title: 'Orbit AI' },
    dsa: { section: 'Learning', title: 'DSA Intelligence' },
    profile: { section: 'Learning', title: 'Developer Profile & Skills' },
    catalog: { section: 'Open Source', title: 'Discover' },
    trending: { section: 'Open Source', title: 'Trending Repositories' },
    gsoc: { section: 'Open Source', title: 'Organizations & Fellowships' },
    issues: { section: 'Open Source', title: 'Issues & Contribution Pipeline' },
    bounties: { section: 'Open Source', title: 'Bounties & Grants' },
    integrations: { section: 'Integrations', title: 'Integration Center' },
    workspaces: { section: 'Collaboration', title: 'Workspaces' },
    forum: { section: 'Collaboration', title: 'Community Forum' },
    selfbot: { section: 'Collaboration', title: 'Selfbot Terminal' },
    settings: { section: 'Account', title: 'Settings & Backups' },
  };

  const currentCrumb = breadcrumbMap[currentTab] || { section: 'DevOrbit', title: currentTab };

  // Fetch unread notifications
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = () => {
      fetch('/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(json => {
          if (json.success && Array.isArray(json.data)) {
            setNotifications(json.data);
            setUnreadCount(json.data.filter((n: any) => !n.isRead).length);
          }
        })
        .catch(() => {});
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [token]);

  const markAllAsRead = async () => {
    if (!token) return;
    for (const n of notifications.filter(n => !n.isRead)) {
      await fetch(`/api/v1/notifications/${n.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="h-14 bg-[#0B0D12] border-b border-[#1F2430] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 select-none">
      
      {/* Left: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#181C26] transition-colors"
          title="Open Navigation"
        >
          <Menu className="size-5" />
        </button>

        {/* Clean Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#686D79] hidden sm:inline">DevOrbit</span>
          <ChevronRight className="size-3 text-[#1F2430] hidden sm:inline" />
          <span className="text-[#686D79]">{currentCrumb.section}</span>
          <ChevronRight className="size-3 text-[#1F2430]" />
          <span className="font-semibold text-[#F8FAFC]">{currentCrumb.title}</span>
        </div>
      </div>

      {/* Center/Right Global Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Global Search / Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="h-8 px-2.5 sm:px-3 rounded-lg bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#2E364A] text-xs text-[#686D79] hover:text-[#C5C8D0] flex items-center gap-2 transition-all shadow-sm"
          title="Search or trigger command (Cmd+K)"
        >
          <Search className="size-3.5 text-[#686D79]" />
          <span className="hidden sm:inline">Quick Jump...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#181C26] border border-[#1F2430] text-[10px] font-mono text-[#686D79]">
            <span>⌘</span>K
          </kbd>
        </button>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="size-8 rounded-lg bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#2E364A] flex items-center justify-center text-[#686D79] hover:text-[#F8FAFC] transition-colors relative"
            title="Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#8B5CF6] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#12151D] border border-[#1F2430] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#F8FAFC]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-[#8B5CF6]/20 text-[#A78BFA] text-[10px] font-mono font-semibold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#1F2430]/60 mt-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#686D79]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`py-2.5 px-2 rounded-lg ${!n.isRead ? 'bg-[#181C26]/60' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-[#F8FAFC] leading-snug">{n.title}</span>
                        <span className="text-[10px] text-[#686D79] shrink-0 font-mono">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#686D79] mt-1 leading-relaxed">{n.message}</p>
                      {n.linkUrl && (
                        <a 
                          href={n.linkUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="mt-1.5 text-[11px] text-[#8B5CF6] hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <span>Open link</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Integration Quick Hub Shortcut */}
        <button
          onClick={() => onSelectTab('integrations')}
          className="hidden sm:flex h-8 px-2.5 rounded-lg bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/40 text-xs text-[#C5C8D0] hover:text-white items-center gap-1.5 transition-all"
          title="Open Integration Center"
        >
          <Sparkles className="size-3 text-[#8B5CF6]" />
          <span>Integrations</span>
        </button>

        {/* User Pill / Switcher */}
        <div className="relative">
          {user ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#2E364A] transition-all"
            >
              <div className="size-6 rounded-full bg-[#181C26] border border-[#8B5CF6]/40 flex items-center justify-center font-bold font-mono text-[10px] text-[#A78BFA]">
                {user.username ? user.username.slice(0, 2).toUpperCase() : 'DO'}
              </div>
              <span className="text-xs font-semibold text-[#F8FAFC] hidden sm:inline">
                {user.username}
              </span>
              <ChevronDown className="size-3 text-[#686D79]" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold transition-all shadow-sm"
            >
              Sign In
            </button>
          )}

          {/* User Menu Dropdown */}
          {userMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#12151D] border border-[#1F2430] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#1F2430]">
                <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                  {user.name || user.username}
                </div>
                <div className="text-[11px] text-[#686D79] truncate">{user.email}</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#A78BFA] font-mono uppercase tracking-wider">
                  <ShieldCheck className="size-3" />
                  <span>{user.role} Account</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { onSelectTab('profile'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#C5C8D0] hover:bg-[#181C26] transition-colors"
                >
                  <UserCheck className="size-3.5 text-[#8B5CF6]" />
                  <span>Developer Profile</span>
                </button>

                <button
                  onClick={() => { onOpenAuthModal(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#C5C8D0] hover:bg-[#181C26] transition-colors"
                >
                  <Users className="size-3.5 text-[#686D79]" />
                  <span>Switch / Add Account</span>
                </button>

                <div className="my-1 border-t border-[#1F2430]" />

                <button
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
