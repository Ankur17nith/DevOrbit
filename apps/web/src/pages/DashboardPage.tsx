import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  RotateCw, 
  Bookmark, 
  Sparkles, 
  Calendar, 
  ExternalLink, 
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Zap
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
      <div className="p-8 max-w-[1440px] mx-auto space-y-6 animate-pulse">
        <div className="h-28 bg-[#12151D] border border-[#1F2430] rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#12151D] border border-[#1F2430] rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#12151D] via-[#181C26] to-[#0B0D12] border border-[#1F2430] relative overflow-hidden shadow-xl shadow-black/40">
        
        {/* Subtle Violet Accent Glow */}
        <div className="absolute top-0 right-1/4 w-64 h-32 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold font-display text-[#F8FAFC] tracking-tight">
              Welcome back, {user?.name || user?.username}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] text-xs font-mono font-medium">
              Verified Session
            </span>
          </div>
          <p className="text-sm text-[#C5C8D0] max-w-xl">
            Your skills, algorithmic journey, open source opportunities, and workspaces synchronized in one universe.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => onNavigate('dsa')}
            className="px-4 py-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] hover:border-[#2E364A] text-[#F8FAFC] text-xs font-medium flex items-center gap-2 transition-all"
          >
            <RotateCw className="size-3.5 text-[#F59E0B]" />
            <span>Revision Queue ({data?.stats?.dsaRevisionsDue || 0})</span>
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shadow-[#8B5CF6]/20 active:scale-98"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* DSA Solved */}
        <div className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] relative group hover:border-[#2E364A] transition-all">
          <div className="flex items-center justify-between text-[#686D79]">
            <span className="text-xs font-mono uppercase font-semibold">DSA Solved</span>
            <Code2 className="size-4 text-[#22C55E]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{data?.stats?.solvedDsaCount || 0}</span>
            <span className="text-xs text-[#686D79] font-mono">problems</span>
          </div>
          <div className="mt-2 text-xs text-[#22C55E] flex items-center gap-1 font-mono">
            <TrendingUp className="size-3" />
            <span>Striver A2Z Active</span>
          </div>
        </div>

        {/* Spaced Revisions */}
        <div className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] relative group hover:border-[#2E364A] transition-all">
          <div className="flex items-center justify-between text-[#686D79]">
            <span className="text-xs font-mono uppercase font-semibold">Spaced Revisions</span>
            <RotateCw className="size-4 text-[#F59E0B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{data?.stats?.dsaRevisionsDue || 0}</span>
            <span className="text-xs text-[#686D79] font-mono">due today</span>
          </div>
          <div className="mt-2 text-xs text-[#686D79] font-mono">
            Automated interval repetition
          </div>
        </div>

        {/* Saved Bookmarks */}
        <div className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] relative group hover:border-[#2E364A] transition-all">
          <div className="flex items-center justify-between text-[#686D79]">
            <span className="text-xs font-mono uppercase font-semibold">Saved Bookmarks</span>
            <Bookmark className="size-4 text-[#8B5CF6]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{data?.stats?.bookmarkedCount || 0}</span>
            <span className="text-xs text-[#686D79] font-mono">shortlisted</span>
          </div>
          <div className="mt-2 text-xs text-[#686D79] font-mono">
            Repos & Bounty Issues
          </div>
        </div>

        {/* Verified Skills */}
        <div className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] relative group hover:border-[#2E364A] transition-all">
          <div className="flex items-center justify-between text-[#686D79]">
            <span className="text-xs font-mono uppercase font-semibold">Verified Skills</span>
            <Sparkles className="size-4 text-[#60A5FA]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{data?.stats?.activeSkillsCount || 0}</span>
            <span className="text-xs text-[#686D79] font-mono">domains</span>
          </div>
          <div className="mt-2 text-xs text-[#686D79] font-mono">
            Evidence-based scoring
          </div>
        </div>
      </div>

      {/* Main Grid: Skills Matrix + Mentorship Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Evidence-Based Skills & Bounties */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Skill Intelligence Card */}
          <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC] font-display">Developer Skill Intelligence</h3>
                <p className="text-xs text-[#686D79]">Confidence scores derived from code commits and solved problems</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/30">
                Live Analysis
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {data?.skills?.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#686D79]">
                  No skills recorded yet. Complete DSA problems or link your GitHub profile in M2.
                </div>
              ) : (
                data?.skills?.map((skill: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#F8FAFC] flex items-center gap-2">
                        <span>{skill.skillName}</span>
                        <span className="text-[10px] font-mono text-[#686D79] uppercase">{skill.category}</span>
                      </span>
                      <span className="font-mono text-[#C5C8D0]">{skill.confidenceScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#181C26] overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]"
                        style={{ width: `${Math.min(100, skill.confidenceScore)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Featured Bounties Feed */}
          <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC] font-display">High-Impact Open Source Bounties</h3>
                <p className="text-xs text-[#686D79]">Paid contribution opportunities with verified rewards</p>
              </div>
              <button
                onClick={() => onNavigate('bounties')}
                className="text-xs text-[#A78BFA] hover:text-white font-medium flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {data?.featuredBounties?.map((bounty: any) => (
                <div 
                  key={bounty.id}
                  className="p-4 rounded-xl bg-[#0B0D12] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-[#686D79] truncate">{bounty.repo}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] font-mono text-xs font-bold shrink-0">
                        ${bounty.amount} {bounty.currency}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-[#F8FAFC] line-clamp-2 leading-snug">
                      {bounty.title}
                    </h4>
                  </div>

                  <a
                    href={bounty.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs text-[#686D79] hover:text-[#F8FAFC] transition-colors"
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
          <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-[#60A5FA]" />
              <h3 className="text-base font-bold text-[#F8FAFC] font-display">Mentorship Deadlines</h3>
            </div>
            
            <div className="space-y-3">
              {data?.upcomingDeadlines?.map((prog: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#1F2430]">
                  <div className="text-xs font-semibold text-[#F8FAFC]">{prog.name}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-[#686D79]">
                    <span>Deadline</span>
                    <span className="text-[#F59E0B]">
                      {prog.deadlineDate ? new Date(prog.deadlineDate).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('gsoc')}
              className="w-full py-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#C5C8D0] hover:text-[#F8FAFC] transition-colors"
            >
              Explore 606+ GSoC Orgs
            </button>
          </div>

          {/* Quick AI Co-Pilot Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12151D] via-[#181C26] to-[#3B1F7A]/40 border border-[#8B5CF6]/30 space-y-3 shadow-lg shadow-[#8B5CF6]/5">
            <div className="flex items-center gap-2 text-[#A78BFA]">
              <Sparkles className="size-4" />
              <h3 className="text-sm font-bold font-display text-[#F8FAFC]">Orbit AI Co-Pilot</h3>
            </div>
            <p className="text-xs text-[#C5C8D0] leading-relaxed">
              Ask questions about repository architecture, get personalized contribution plans, and find beginner issues matching your skills.
            </p>
            <button
              onClick={() => onNavigate('ai')}
              className="mt-2 w-full py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold transition-all shadow-sm shadow-[#8B5CF6]/20 active:scale-98"
            >
              Open AI Assistant
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
