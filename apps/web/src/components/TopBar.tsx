import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  LogOut, 
  User as UserIcon,
  Settings,
  X,
  ExternalLink,
  Check
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
    app: { section: 'Overview', title: 'Command Center' },
    navigator: { section: 'Development', title: 'Codebase Navigator' },
    codebase: { section: 'Development', title: 'Codebase Navigator' },
    fix: { section: 'Development', title: 'Orbit Fix' },
    safechange: { section: 'Development', title: 'SafeChange' },
    'safe-change': { section: 'Development', title: 'SafeChange' },
    recon: { section: 'Development', title: 'Orbit Recon' },
    ai: { section: 'Development', title: 'Orbit AI' },
    dsa: { section: 'Learning', title: 'DSA Dashboard' },
    problems: { section: 'Learning', title: 'Problem Tracker' },
    revisions: { section: 'Learning', title: 'Revision Schedule' },
    skills: { section: 'Learning', title: 'Orbit Skills' },
    learning: { section: 'Learning', title: 'Learning Progress' },
    catalog: { section: 'Open Source', title: 'Discover' },
    oss: { section: 'Open Source', title: 'Discover' },
    trending: { section: 'Open Source', title: 'Trending' },
    gsoc: { section: 'Open Source', title: 'Organizations' },
    organizations: { section: 'Open Source', title: 'Organizations' },
    issues: { section: 'Open Source', title: 'Issues' },
    bounties: { section: 'Open Source', title: 'Bounties' },
    contributions: { section: 'Open Source', title: 'Contributions' },
    workspaces: { section: 'Collaboration', title: 'Workspaces' },
    forum: { section: 'Collaboration', title: 'Community' },
    community: { section: 'Collaboration', title: 'Community' },
    integrations: { section: 'System', title: 'Integrations' },
    pulse: { section: 'System', title: 'Orbit Pulse' },
    profile: { section: 'Account', title: 'Profile' },
    settings: { section: 'Account', title: 'Settings' },
  };

  const currentInfo = breadcrumbMap[currentTab] || {
    section: 'Overview',
    title: 'Command Center'
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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real unread notifications
  useEffect(() => {
    if (!token) return;
    fetch('/api/v1/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setNotifications(data.data);
          setUnreadCount(data.data.filter((n: any) => !n.read).length);
        }
      })
      .catch(() => {});
  }, [token, currentTab]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <header className="h-14 bg-white border-b border-black/8 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 select-none z-30 sticky top-0">
      {/* Left: Mobile hamburger + Breadcrumbs + Page title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-md border border-black/8 text-[#686D79] hover:bg-gray-50 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="size-4" />
        </button>

        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8B8F98] leading-none">
            DEVORBIT / {currentInfo.section}
          </div>
          <h1 className="text-xs sm:text-sm font-semibold tracking-[-0.02em] text-[#0B0D12] mt-0.5 leading-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Workspace Search + Notifications + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button with ⌘K */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex h-8 w-48 lg:w-56 items-center justify-between rounded-md border border-black/8 bg-[#F6F7F8] px-3 text-[10px] text-[#8B8F98] hover:border-black/15 transition"
        >
          <span className="flex items-center gap-2">
            <Search className="size-3 text-[#999CA3]" />
            <span>Search workspace</span>
          </span>
          <kbd className="font-mono text-[9px] px-1 py-0.2 bg-white rounded border border-black/8 text-[#686D79]">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon Button */}
        <button
          onClick={onOpenCommandPalette}
          className="sm:hidden size-8 flex items-center justify-center rounded-md border border-black/8 bg-white text-[#686D79] hover:bg-gray-50"
          title="Search (⌘K)"
        >
          <Search className="size-3.5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(prev => !prev)}
            className="size-8 flex items-center justify-center rounded-md border border-black/8 bg-white text-[#686D79] hover:bg-gray-50 transition relative"
            title="Notifications"
          >
            <Bell className="size-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#8B5CF6] ring-2 ring-white" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-black/8 shadow-xl py-2 z-50 text-left animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-4 py-2 border-b border-black/8">
                <span className="text-xs font-semibold text-[#0B0D12]">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#F0EDFA] text-[#8B5CF6]">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-black/5 [scrollbar-width:none]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#858993]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      className={`p-3 hover:bg-gray-50 transition flex items-start gap-2.5 ${!n.read ? 'bg-[#F9F8FE]' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-[#0B0D12]">{n.title}</p>
                        <p className="text-[10px] text-[#686D79] line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          title="Mark as read"
                          className="size-5 rounded flex items-center justify-center text-[#8B5CF6] hover:bg-[#EEEAFB]"
                        >
                          <Check className="size-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(prev => !prev)}
            className="size-8 rounded-lg flex items-center justify-center hover:opacity-90 transition select-none overflow-hidden"
            title={user ? `${user.name || user.username}` : 'Sign in'}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || user.username}
                className="size-8 rounded-lg object-cover"
              />
            ) : (
              <div className="size-8 rounded-lg bg-[#EEEAFB] text-[#6D3FE0] text-[9px] font-bold flex items-center justify-center">
                {getInitials(user?.name || user?.username)}
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-black/8 shadow-xl py-1.5 z-50 text-left animate-in fade-in duration-150">
              <div className="px-3.5 py-2 border-b border-black/8">
                <p className="text-xs font-semibold text-[#0B0D12] truncate">
                  {user?.name || user?.username || 'Dev User'}
                </p>
                <p className="text-[10px] text-[#858993] truncate">
                  {user?.email || 'developer@devorbit.local'}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectTab('profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-[#0B0D12] hover:bg-gray-50 flex items-center gap-2"
                >
                  <UserIcon className="size-3.5 text-[#858993]" />
                  <span>Profile details</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-[#0B0D12] hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="size-3.5 text-[#858993]" />
                  <span>Account & settings</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab('documentation');
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-[#0B0D12] hover:bg-gray-50 flex items-center gap-2"
                >
                  <ExternalLink className="size-3.5 text-[#858993]" />
                  <span>Documentation</span>
                </button>
              </div>

              <div className="pt-1 border-t border-black/8">
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="size-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
