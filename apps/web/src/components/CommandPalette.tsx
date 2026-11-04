import React, { useState, useEffect } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Code2, 
  Wrench, 
  ShieldAlert, 
  Scan, 
  Sparkles, 
  Brain, 
  Plug, 
  Compass, 
  Settings, 
  ArrowRight,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'dashboard', title: 'Command Center', category: 'Overview', icon: LayoutDashboard },
    { id: 'integrations', title: 'Integration Center (GitHub, Codeforces, LeetCode, TUF)', category: 'Integrations', icon: Plug },
    { id: 'ai', title: 'Orbit AI (Local LLM & Coding Assistant)', category: 'Development', icon: Sparkles },
    { id: 'dsa', title: 'DSA Intelligence (SM-2 Spaced Repetition)', category: 'Learning', icon: Brain },
    { id: 'navigator', title: 'Codebase Navigator (AST & Dependency Graph)', category: 'Development', icon: Code2 },
    { id: 'fix', title: 'Orbit Fix (Root Cause Debugger & Diff Studio)', category: 'Development', icon: Wrench },
    { id: 'safechange', title: 'Orbit SafeChange (Blast Radius & Migration Safety)', category: 'Development', icon: ShieldAlert },
    { id: 'recon', title: 'Orbit Recon (UI Token Extraction & Code Gen)', category: 'Development', icon: Scan },
    { id: 'catalog', title: 'Open Source Discover (606+ GSoC Orgs & Repos)', category: 'Open Source', icon: Compass },
    { id: 'settings', title: 'Settings & Database Backup / Restore', category: 'Account', icon: Settings },
  ];

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-2xl bg-[#12151D] border border-[#1F2430] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-[#1F2430] bg-[#181C26]">
          <Search className="size-5 text-[#8B5CF6] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or module to jump..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#686D79] focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#202431]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#686D79]">
              No matching modules found for "{query}".
            </div>
          ) : (
            filtered.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-[#181C26] flex items-center justify-between text-left group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-[#202431] border border-[#1F2430] flex items-center justify-center text-[#8B5CF6] group-hover:border-[#8B5CF6]/40 transition-colors">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#F8FAFC] group-hover:text-white">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#686D79] font-mono">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-[#686D79] group-hover:text-[#8B5CF6] group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="h-9 px-4 bg-[#0B0D12] border-t border-[#1F2430] text-[10px] font-mono text-[#686D79] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[#8B5CF6]">DevOrbit Quick Jump</span>
        </div>
      </div>
    </div>
  );
}
