import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  RotateCw, 
  Bookmark, 
  Sparkles, 
  Bell, 
  Calendar, 
  ExternalLink, 
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardProps) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('/api/v1/dashboard/summary', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, user?.username]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-neutral-900 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#181819] border border-[#242424] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#181819] via-[#151617] to-[#0E0F10] border border-[#242424] relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">
              Welcome back, {user?.name || user?.username}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
              Online
            </span>
          </div>
          <p className="text-sm text-neutral-400 max-w-xl">
            Your skills, algorithmic journey, open source opportunities, and workspaces synchronized in one universe.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => onNavigate('dsa')}
            className="px-4 py-2 rounded-lg bg-[#181819] hover:bg-[#222223] border border-[#242424] text-white text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <RotateCw className="size-3.5 text-amber-400" />
            <span>Revision Queue ({data?.stats?.dsaRevisionsDue || 0})</span>
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-[#09AE5B]/20"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#181819] border border-[#242424] relative group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase font-semibold">DSA Solved</span>
            <Code2 className="size-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{data?.stats?.solvedDsaCount || 0}</span>
            <span className="text-xs text-neutral-500 font-mono">problems</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingUp className="size-3" />
            <span>Striver A2Z Active</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#181819] border border-[#242424] relative group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase font-semibold">Spaced Revisions</span>
            <RotateCw className="size-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{data?.stats?.dsaRevisionsDue || 0}</span>
            <span className="text-xs text-neutral-500 font-mono">due today</span>
          </div>
          <div className="mt-2 text-xs text-neutral-400 font-mono">
            Automated interval repetition
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#181819] border border-[#242424] relative group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase font-semibold">Saved Bookmarks</span>
            <Bookmark className="size-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{data?.stats?.bookmarkedCount || 0}</span>
            <span className="text-xs text-neutral-500 font-mono">shortlisted</span>
          </div>
          <div className="mt-2 text-xs text-neutral-400 font-mono">
            Repos & Bounty Issues
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#181819] border border-[#242424] relative group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase font-semibold">Verified Skills</span>
            <Sparkles className="size-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{data?.stats?.activeSkillsCount || 0}</span>
            <span className="text-xs text-neutral-500 font-mono">domains</span>
          </div>
          <div className="mt-2 text-xs text-neutral-400 font-mono">
            Evidence-based scoring
          </div>
        </div>
      </div>

      {/* Main Grid: Skills Matrix + Mentorship Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Evidence-Based Skills & DSA Weakness */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#181819] border border-[#242424] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">Developer Skill Intelligence</h3>
                <p className="text-xs text-neutral-400">Confidence scores derived from code commits and solved problems</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#242424] text-neutral-300">
                Live Analysis
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {data?.skills?.map((skill: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white flex items-center gap-2">
                      <span>{skill.skillName}</span>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">{skill.category}</span>
                    </span>
                    <span className="font-mono text-neutral-300">{skill.confidenceScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#242424] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        skill.confidenceScore > 80 
                          ? 'bg-emerald-500' 
                          : skill.confidenceScore > 50 
                          ? 'bg-cyan-500' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, skill.confidenceScore)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Bounties Feed */}
          <div className="p-6 rounded-2xl bg-[#181819] border border-[#242424] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">High-Impact Open Source Bounties</h3>
                <p className="text-xs text-neutral-400">Paid contribution opportunities with verified rewards</p>
              </div>
              <button
                onClick={() => onNavigate('bounties')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {data?.featuredBounties?.map((bounty: any) => (
                <div 
                  key={bounty.id}
                  className="p-4 rounded-xl bg-[#0E0F10] border border-[#242424] hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-neutral-400 truncate">{bounty.repo}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 font-mono text-xs font-bold shrink-0">
                        ${bounty.amount} {bounty.currency}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-white line-clamp-2 leading-snug">
                      {bounty.title}
                    </h4>
                  </div>

                  <a
                    href={bounty.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    <span>Inspect issue on GitHub</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Mentorship Programs & System Notifications */}
        <div className="space-y-6">
          
          {/* Upcoming Mentorship Programs */}
          <div className="p-6 rounded-2xl bg-[#181819] border border-[#242424] space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-blue-400" />
              <h3 className="text-base font-bold text-white font-display">Mentorship Deadlines</h3>
            </div>
            
            <div className="space-y-3">
              {data?.upcomingDeadlines?.map((prog: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0E0F10] border border-[#242424]">
                  <div className="text-xs font-semibold text-white">{prog.name}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>Deadline</span>
                    <span className="text-amber-400">
                      {prog.deadlineDate ? new Date(prog.deadlineDate).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('gsoc')}
              className="w-full py-2 rounded-lg bg-[#242424] hover:bg-[#2c2c2d] text-xs font-medium text-neutral-300 transition-colors"
            >
              Explore 606+ GSoC Orgs
            </button>
          </div>

          {/* Quick AI Co-Pilot Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#181819] to-[#042816] border border-emerald-900/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="size-4" />
              <h3 className="text-sm font-bold font-display">Orbit AI Co-Pilot</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Ask questions about repository architecture, get personalized contribution plans, and find beginner issues matching your skills.
            </p>
            <button
              onClick={() => onNavigate('ai')}
              className="mt-2 w-full py-2 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold transition-colors"
            >
              Open AI Assistant
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
