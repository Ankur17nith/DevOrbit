import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronRight, 
  Sparkles, 
  LogOut, 
  UserCheck, 
  Users, 
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Check,
  Settings
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

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Tab Breadcrumb labels mapping
  const breadcrumbMap: Record<string, { section: string; title: string }> = {
    dashboard: { section: 'Overview', title: 'Command Center' },
    navigator: { section: 'Development', title: 'Codebase Navigator' },
    fix: { section: 'Development', title: 'Orbit Fix' },
    safechange: { section: 'Development', title: 'Orbit SafeChange' },
    recon: { section: 'Development', title: 'Orbit Recon' },
    ai: { section: 'Development', title: 'Orbit AI Studio' },
    dsa: { section: 'Learning', title: 'DSA Intelligence' },
    profile: { section: 'Learning', title: 'Skill Intelligence' },
    catalog: { section: 'Open Source', title: 'Discover' },
    trending: { section: 'Open Source', title: 'Trending Repositories' },
    gsoc: { section: 'Open Source', title: 'Organizations' },
    issues: { section: 'Open Source', title: 'Issues & Pipeline' },
    bounties: { section: 'Open Source', title: 'Bounties & Grants' },
    integrations: { section: 'Integrations', title: 'Integration Center' },
    workspaces: { section: 'Collaboration', title: 'Workspaces' },
    forum: { section: 'Collaboration', title: 'Community' },
    selfbot: { section: 'Collaboration', title: 'Selfbot Terminal' },
    settings: { section: 'Account', title: 'Settings & Backups' },
    documentation: { section: 'Resources', title: 'Documentation' },
  };

  const currentCrumb = breadcrumbMap[currentTab] || { section: 'Workspace', title: currentTab };

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

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="h-14 bg-[#0B0D12]/95 backdrop-blur-md border-b border-[#1F2430] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 select-none">
      
      {/* Left: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-xl text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#181C26] transition-colors"
          title="Open Navigation"
        >
          <Menu className="size-5" />
        </button>

        {/* Clean Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#686D79] font-mono font-medium hidden sm:inline">DevOrbit</span>
          <ChevronRight className="size-3 text-[#2E364A] hidden sm:inline" />
          <span className="text-[#686D79]">{currentCrumb.section}</span>
          <ChevronRight className="size-3 text-[#2E364A]" />
          <span className="font-semibold text-[#F8FAFC] tracking-tight">{currentCrumb.title}</span>
        </div>
      </div>

      {/* Center/Right Global Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Global Search / Command Palette Trigger (Figma Matched) */}
        <button
          onClick={onOpenCommandPalette}
          className="h-9 px-3 rounded-xl bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/40 text-xs text-[#686D79] hover:text-[#C5C8D0] flex items-center gap-2.5 transition-all shadow-sm"
          title="Search your workspace (⌘K)"
        >
          <Search className="size-3.5 text-[#8B5CF6]" />
          <span className="hidden sm:inline">Search your workspace...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#181C26] border border-[#1F2430] text-[10px] font-mono text-[#8B5CF6]">
            <span>⌘</span>K
          </kbd>
        </button>

        {/* Integration Hub Shortcut */}
        <button
          onClick={() => onSelectTab('integrations')}
          className="hidden sm:flex h-9 px-3 rounded-xl bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/40 text-xs text-[#C5C8D0] hover:text-white items-center gap-1.5 transition-all"
          title="Open Integration Center"
        >
          <Sparkles className="size-3.5 text-[#8B5CF6]" />
          <span>Integrations</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="size-9 rounded-xl bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#2E364A] flex items-center justify-center text-[#686D79] hover:text-[#F8FAFC] transition-colors relative"
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
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#12151D] border border-[#1F2430] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#F8FAFC]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] text-[10px] font-mono font-semibold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] font-medium text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
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
                    <div key={n.id} className={`py-2.5 px-2 rounded-xl ${!n.isRead ? 'bg-[#181C26]/60' : ''}`}>
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

        {/* User Pill / Switcher */}
        <div className="relative" ref={userMenuRef}>
          {user ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all"
            >
              <div className="size-7 rounded-full bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center font-bold font-mono text-xs">
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
              className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-all shadow-sm shadow-[#8B5CF6]/20"
            >
              Sign In
            </button>
          )}

          {/* User Menu Dropdown */}
          {userMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#12151D] border border-[#1F2430] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-[#1F2430]">
                <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                  {user.name || user.username}
                </div>
                <div className="text-[11px] text-[#686D79] truncate">{user.email}</div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#A78BFA] font-mono uppercase tracking-wider">
                  <ShieldCheck className="size-3 text-[#8B5CF6]" />
                  <span>{user.role} Session</span>
                </div>
              </div>

              <div className="py-1.5 space-y-0.5">
                <button
                  onClick={() => { onSelectTab('profile'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#C5C8D0] hover:text-[#F8FAFC] hover:bg-[#181C26] transition-colors"
                >
                  <UserCheck className="size-3.5 text-[#8B5CF6]" />
                  <span>Skill Intelligence</span>
                </button>

                <button
                  onClick={() => { onSelectTab('settings'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#C5C8D0] hover:text-[#F8FAFC] hover:bg-[#181C26] transition-colors"
                >
                  <Settings className="size-3.5 text-[#8B5CF6]" />
                  <span>Settings & Backups</span>
                </button>

                <button
                  onClick={() => { onOpenAuthModal(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#C5C8D0] hover:text-[#F8FAFC] hover:bg-[#181C26] transition-colors"
                >
                  <Users className="size-3.5 text-[#686D79]" />
                  <span>Switch / Add Account</span>
                </button>

                <div className="my-1 border-t border-[#1F2430]" />

                <button
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors"
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
