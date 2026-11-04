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
  Brain,
  Plug,
  GitPullRequest,
  Check,
  AlertCircle,
  FolderGit2
} from 'lucide-react';
import { GithubIcon } from '../components/icons/GithubIcon.js';
import { useAuth } from '../context/AuthContext.js';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardProps) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
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
  };

  useEffect(() => {
    fetchDashboard();
  }, [token, user?.username]);

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-[#4C1D95] border-[#5B21B6]';
      case 2: return 'bg-[#6D28D9] border-[#7C3AED]';
      case 3: return 'bg-[#8B5CF6] border-[#A78BFA]';
      case 4: return 'bg-[#A78BFA] border-[#C4B5FD]';
      default: return 'bg-[#181C26] border-[#1F2430]';
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-pulse">
        <div className="h-28 bg-[#12151D] border border-[#1F2430] rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#12151D] border border-[#1F2430] rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-[#12151D] border border-[#1F2430] rounded-2xl" />
      </div>
    );
  }

  const { stats, integrations, activity, repositories, pipeline, skills, upcomingDeadlines, featuredBounties } = data || {};

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#12151D] via-[#181C26] to-[#0B0D12] border border-[#1F2430] relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold font-display text-[#F8FAFC] tracking-tight">
              Welcome back, {user?.name || user?.username}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] text-xs font-mono font-medium">
              Verified Session
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#C5C8D0] max-w-xl leading-relaxed">
            Your skills, algorithmic journey, open source opportunities, and workspaces synchronized in one universe.
          </p>

          {/* Quick Integration Badges Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* GitHub Badge */}
            <button
              onClick={() => onNavigate('integrations')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors border ${
                integrations?.github?.isConnected 
                  ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' 
                  : 'bg-[#181C26] border-[#1F2430] text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <GithubIcon className="size-3" />
              <span>{integrations?.github?.isConnected ? `@${integrations.github.username}` : 'GitHub (Offline)'}</span>
            </button>

            {/* Codeforces Badge */}
            <button
              onClick={() => onNavigate('integrations')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors border ${
                integrations?.codeforces?.isConnected 
                  ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#A78BFA]' 
                  : 'bg-[#181C26] border-[#1F2430] text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <TrendingUp className="size-3" />
              <span>{integrations?.codeforces?.isConnected ? `${integrations.codeforces.handle} (${integrations.codeforces.stats?.profile?.rating || 'Unrated'})` : 'Codeforces (Offline)'}</span>
            </button>

            {/* LeetCode Badge */}
            <button
              onClick={() => onNavigate('integrations')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors border ${
                integrations?.leetcode?.isConnected 
                  ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]' 
                  : 'bg-[#181C26] border-[#1F2430] text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <Brain className="size-3" />
              <span>{integrations?.leetcode?.isConnected ? `LeetCode: ${integrations.leetcode.stats?.totalSolved || 0}` : 'LeetCode (Offline)'}</span>
            </button>

            {/* Take U Forward Badge */}
            <button
              onClick={() => onNavigate('integrations')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors border ${
                integrations?.tuf?.isConnected 
                  ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#A78BFA]' 
                  : 'bg-[#181C26] border-[#1F2430] text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <Layers className="size-3" />
              <span>{integrations?.tuf?.isConnected ? `TUF: ${integrations.tuf.stats?.totalCompleted || 0}/455` : 'TUF (Offline)'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          <button
            onClick={() => onNavigate('dsa')}
            className="px-3.5 py-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-[#F8FAFC] text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <RotateCw className="size-3.5 text-[#F59E0B]" />
            <span>Revision Queue ({stats?.dsaRevisionsDue || 0})</span>
          </button>
          <button
            onClick={() => onNavigate('integrations')}
            className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shadow-[#8B5CF6]/20"
          >
            <Plug className="size-3.5" />
            <span>Connect Accounts</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: DSA Mastery & SuperMemo SM-2 */}
        <div 
          onClick={() => onNavigate('dsa')}
          className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/50 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-xs text-[#686D79]">
            <span className="font-medium text-[#C5C8D0]">DSA Mastery</span>
            <div className="size-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
              <Brain className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{stats?.solvedDsaCount || 0}</span>
            <span className="text-xs text-[#686D79]">solved problems</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#1F2430]">
            <span className="text-[#22C55E]">Indep: {stats?.independentSolves || 0}</span>
            <span className="text-[#F59E0B]">Assisted: {stats?.assistedSolves || 0}</span>
            <span className="text-[#8B5CF6]">Due: {stats?.dsaRevisionsDue || 0}</span>
          </div>
        </div>

        {/* KPI 2: Codeforces Rating */}
        <div 
          onClick={() => onNavigate('integrations')}
          className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/50 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-xs text-[#686D79]">
            <span className="font-medium text-[#C5C8D0]">Codeforces Rating</span>
            <div className="size-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">
              {integrations?.codeforces?.stats?.profile?.rating || 'Unrated'}
            </span>
            <span className="text-xs text-[#686D79]">
              {integrations?.codeforces?.stats?.profile?.rank || 'Offline'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#1F2430]">
            <span className="text-[#C5C8D0]">Peak: {integrations?.codeforces?.stats?.profile?.maxRating || 'N/A'}</span>
            <span className="text-[#8B5CF6]">{integrations?.codeforces?.isConnected ? 'Live Sync' : 'Connect'}</span>
          </div>
        </div>

        {/* KPI 3: GitHub Contributions & Velocity */}
        <div 
          onClick={() => onNavigate('profile')}
          className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/50 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-xs text-[#686D79]">
            <span className="font-medium text-[#C5C8D0]">GitHub Activity</span>
            <div className="size-7 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
              <GithubIcon className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{stats?.totalCommits || 0}</span>
            <span className="text-xs text-[#686D79]">annual commits</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#1F2430]">
            <span className="text-[#22C55E]">Streak: {stats?.activeStreak || 0}d</span>
            <span className="text-[#A78BFA]">PR Merge: {stats?.mergeRate ? Math.round(stats.mergeRate) : 0}%</span>
          </div>
        </div>

        {/* KPI 4: Open Source Pipeline */}
        <div 
          onClick={() => onNavigate('issues')}
          className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/50 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-xs text-[#686D79]">
            <span className="font-medium text-[#C5C8D0]">OSS Pipeline</span>
            <div className="size-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
              <GitPullRequest className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{pipeline?.total || 0}</span>
            <span className="text-xs text-[#686D79]">active issues</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#1F2430]">
            <span className="text-[#A78BFA]">Work: {pipeline?.stages?.WORKING || 0}</span>
            <span className="text-[#60A5FA]">PRs: {pipeline?.stages?.PR_SUBMITTED || 0}</span>
            <span className="text-[#22C55E]">Merged: {pipeline?.stages?.MERGED || 0}</span>
          </div>
        </div>

      </div>

      {/* 3. Coding Activity: 365-Day Contribution Calendar Heatmap */}
      <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#F8FAFC]">Verified Coding Activity (365 Days)</h2>
            <p className="text-xs text-[#686D79]">
              {integrations?.github?.isConnected 
                ? `Synchronized with GitHub account @${integrations.github.username}`
                : 'Connect your GitHub account to visualize your 365-day commit heatmap.'
              }
            </p>
          </div>

          {!integrations?.github?.isConnected && (
            <button
              onClick={() => onNavigate('integrations')}
              className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <Plug className="size-3" />
              <span>Connect GitHub</span>
            </button>
          )}
        </div>

        {integrations?.github?.isConnected && activity?.commitHeatmap && activity.commitHeatmap.length > 0 ? (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px] flex gap-1 items-center">
              {activity.commitHeatmap.map((day: any, idx: number) => (
                <div
                  key={idx}
                  title={`${day.date}: ${day.count} commits`}
                  className={`size-2.5 rounded-xs border transition-transform hover:scale-125 ${getHeatmapColor(day.level)}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-[#181C26]/50 border border-dashed border-[#1F2430] text-center space-y-3">
            <FolderGit2 className="size-8 text-[#686D79] mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#F8FAFC]">No GitHub Activity Synced</p>
              <p className="text-[11px] text-[#686D79] max-w-md mx-auto">
                Connect your GitHub account in the Integration Center to pull in your real commit streaks, pull request velocity, and repository language breakdown.
              </p>
            </div>
            <button
              onClick={() => onNavigate('integrations')}
              className="px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <Plug className="size-3 text-[#8B5CF6]" />
              <span>Open Integration Center</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Two-Column Intelligence Grid: Skills & Upcoming Program Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Verified Skills */}
        <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Demonstrated Developer Skills</h2>
              <p className="text-xs text-[#686D79]">Extracted from code repositories & solved algorithmic topics.</p>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          <div className="space-y-3">
            {skills && skills.length > 0 ? (
              skills.slice(0, 5).map((s: any) => (
                <div key={s.skillName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#F8FAFC]">{s.skillName}</span>
                    <span className="font-mono text-[#8B5CF6] font-semibold">{Math.round(s.confidenceScore)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#181C26] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full transition-all duration-500" 
                      style={{ width: `${s.confidenceScore}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#686D79]">
                Connect GitHub or solve DSA problems to extract verified skills.
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Opportunities & Fellowships */}
        <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Upcoming Mentorship Cutoffs</h2>
              <p className="text-xs text-[#686D79]">Monitored by Orbit Pulse engine within 72h window.</p>
            </div>
            <button
              onClick={() => onNavigate('gsoc')}
              className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((d: any) => (
                <div key={d.slug} className="p-3 rounded-xl bg-[#181C26] border border-[#1F2430] flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">{d.name}</h3>
                    <p className="text-[11px] text-[#686D79] flex items-center gap-1 mt-0.5">
                      <Clock className="size-3 text-[#F59E0B]" />
                      <span>Closes {new Date(d.deadlineDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('gsoc')}
                    className="px-2.5 py-1 rounded bg-[#202431] hover:bg-[#8B5CF6] hover:text-white text-[#C5C8D0] text-xs font-medium transition-colors"
                  >
                    View Cohort
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#686D79]">
                No imminent fellowship deadlines closing in the next 72 hours.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. Quick Development Studio Launchers */}
      <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
        <h2 className="text-sm font-semibold text-[#F8FAFC]">Development Workspaces</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button
            onClick={() => onNavigate('navigator')}
            className="p-4 rounded-xl bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/50 text-left transition-all space-y-2 group"
          >
            <div className="size-8 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
              <Code2 className="size-4" />
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-[#8B5CF6] transition-colors">
              Codebase Navigator
            </div>
            <p className="text-[11px] text-[#686D79] leading-relaxed">
              Polyglot AST indexer, module import graph, and live Mermaid diagrams.
            </p>
          </button>

          <button
            onClick={() => onNavigate('fix')}
            className="p-4 rounded-xl bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/50 text-left transition-all space-y-2 group"
          >
            <div className="size-8 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center text-[#F59E0B]">
              <Sparkles className="size-4" />
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-[#F59E0B] transition-colors">
              Orbit Fix Studio
            </div>
            <p className="text-[11px] text-[#686D79] leading-relaxed">
              Multi-runtime stack trace ingest, root-cause diagnosis, and unified diff generator.
            </p>
          </button>

          <button
            onClick={() => onNavigate('safechange')}
            className="p-4 rounded-xl bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/50 text-left transition-all space-y-2 group"
          >
            <div className="size-8 rounded-lg bg-[#EF4444]/15 flex items-center justify-center text-[#EF4444]">
              <ShieldCheck className="size-4" />
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-[#EF4444] transition-colors">
              Orbit SafeChange
            </div>
            <p className="text-[11px] text-[#686D79] leading-relaxed">
              Transitive blast radius risk scorer and anti-destruction migration auditor.
            </p>
          </button>

          <button
            onClick={() => onNavigate('ai')}
            className="p-4 rounded-xl bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/50 text-left transition-all space-y-2 group"
          >
            <div className="size-8 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
              <Sparkles className="size-4" />
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-[#8B5CF6] transition-colors">
              Orbit AI Workspace
            </div>
            <p className="text-[11px] text-[#686D79] leading-relaxed">
              Local Ollama neural models with transparent deterministic developer fallback.
            </p>
          </button>

        </div>
      </div>

    </div>
  );
}
