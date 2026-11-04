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
  FolderGit2,
  GitBranch,
  BookOpen,
  Compass
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
      
      {/* 1. Figma Command Center Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1F2430]">
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase font-bold text-[#8B5CF6] tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F8FAFC] tracking-tight">
            Good morning, {user?.name || user?.username || 'Alex'}.
          </h1>
          <p className="text-xs text-[#686D79]">
            Your developer workspace at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('integrations')}
            className="px-3.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shadow-[#8B5CF6]/20"
          >
            <Plug className="size-3.5" />
            <span>Integrations</span>
          </button>
        </div>
      </div>

      {/* 2. Three Primary Summary Cards (Figma Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: GITHUB ACTIVITY */}
        <div 
          onClick={() => onNavigate(integrations?.github?.isConnected ? 'profile' : 'integrations')}
          className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#686D79]">
              GITHUB ACTIVITY
            </span>
            <GitBranch className="size-4 text-[#8B5CF6]" />
          </div>
          {integrations?.github?.isConnected ? (
            <div className="space-y-1">
              <div className="text-base font-bold text-[#F8FAFC]">
                @{integrations.github.username}
              </div>
              <div className="text-xs text-[#22C55E] flex items-center gap-1.5 font-mono">
                <span className="size-1.5 rounded-full bg-[#22C55E]" />
                <span>{stats?.totalCommits || 0} commits synchronized</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-base font-bold text-[#F8FAFC]">Connect GitHub</div>
              <div className="text-xs text-[#8B5CF6] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>OAuth required</span>
                <ArrowRight className="size-3" />
              </div>
            </div>
          )}
        </div>

        {/* Card 2: DSA PROGRESS */}
        <div 
          onClick={() => onNavigate('dsa')}
          className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#686D79]">
              DSA PROGRESS
            </span>
            <BookOpen className="size-4 text-[#F59E0B]" />
          </div>
          {(stats?.solvedDsaCount || 0) > 0 ? (
            <div className="space-y-1">
              <div className="text-base font-bold text-[#F8FAFC]">
                {stats.solvedDsaCount} Problems Solved
              </div>
              <div className="text-xs text-[#F59E0B] flex items-center gap-1.5 font-mono">
                <span>{stats?.dsaRevisionsDue || 0} revisions due today</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-base font-bold text-[#F8FAFC]">No problems yet</div>
              <div className="text-xs text-[#8B5CF6] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Add your first problem</span>
                <ArrowRight className="size-3" />
              </div>
            </div>
          )}
        </div>

        {/* Card 3: OPEN SOURCE */}
        <div 
          onClick={() => onNavigate((pipeline?.total || 0) > 0 ? 'issues' : 'catalog')}
          className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#686D79]">
              OPEN SOURCE
            </span>
            <Compass className="size-4 text-[#60A5FA]" />
          </div>
          {(pipeline?.total || 0) > 0 ? (
            <div className="space-y-1">
              <div className="text-base font-bold text-[#F8FAFC]">
                {pipeline.total} Active Issues
              </div>
              <div className="text-xs text-[#60A5FA] flex items-center gap-1.5 font-mono">
                <span>{pipeline?.stages?.PR_SUBMITTED || 0} PRs submitted</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-base font-bold text-[#F8FAFC]">No saved issues</div>
              <div className="text-xs text-[#8B5CF6] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Discover opportunities</span>
                <ArrowRight className="size-3" />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. Lower Row: Recent Activity & Quick Actions (Figma Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Recent Activity (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F8FAFC]">Recent activity</span>
              {activity?.recentEvents && activity.recentEvents.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/30">
                  Live
                </span>
              )}
            </div>
            <ExternalLink className="size-3.5 text-[#686D79]" />
          </div>

          {activity?.recentEvents && activity.recentEvents.length > 0 ? (
            <div className="divide-y divide-[#1F2430]">
              {activity.recentEvents.slice(0, 5).map((evt: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="size-1.5 rounded-full bg-[#8B5CF6]" />
                    <span className="text-[#F8FAFC] truncate">{evt.title || evt.description}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#686D79] shrink-0">
                    {evt.timeAgo || 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#686D79] space-y-2">
              <div className="size-9 rounded-full bg-[#181C26] border border-[#1F2430] flex items-center justify-center mx-auto text-[#686D79] text-base">
                ↗
              </div>
              <p>Connect an integration to see activity.</p>
            </div>
          )}
        </div>

        {/* Quick Actions (4 cols, Dark container) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0E1117] border border-[#1F2430] flex flex-col justify-between space-y-4">
          <div>
            <span className="text-sm font-bold text-[#F8FAFC] block mb-3">Quick actions</span>
            <div className="space-y-2">
              <button 
                onClick={() => onNavigate('navigator')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-left text-xs text-[#C5C8D0] hover:text-[#F8FAFC] flex items-center justify-between transition-colors"
              >
                <span>Open repository</span>
                <span className="text-[#686D79]">→</span>
              </button>
              <button 
                onClick={() => onNavigate('dsa')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-left text-xs text-[#C5C8D0] hover:text-[#F8FAFC] flex items-center justify-between transition-colors"
              >
                <span>Track DSA problem</span>
                <span className="text-[#686D79]">→</span>
              </button>
              <button 
                onClick={() => onNavigate('integrations')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-left text-xs text-[#C5C8D0] hover:text-[#F8FAFC] flex items-center justify-between transition-colors"
              >
                <span>Connect integration</span>
                <span className="text-[#686D79]">→</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1F2430] text-[10px] font-mono text-[#686D79] flex items-center justify-between">
            <span>DevOrbit v0.1.0</span>
            <span className="text-[#22C55E]">● Local Engine Active</span>
          </div>
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
