import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  BookOpen, 
  Compass, 
  Plug, 
  ChevronRight, 
  GitPullRequest, 
  GitBranch, 
  Clock, 
  ExternalLink,
  Brain,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer.js';
import { useAuth } from '../context/AuthContext.js';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardProps) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    if (!token) {
      setLoading(false);
      return;
    }
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

  if (loading) {
    return (
      <PageContainer maxWidth="max-w-[1280px]">
        <div className="space-y-6 animate-pulse">
          <div className="h-20 bg-white border border-black/7 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white border border-black/7 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="h-64 bg-white border border-black/7 rounded-xl" />
            <div className="h-64 bg-white border border-black/7 rounded-xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  const { stats, integrations, activity, repositories, pipeline } = data || {};
  const connectedCount = stats?.connectedIntegrations ?? (integrations?.github?.isConnected ? 1 : 0);
  const solvedCount = stats?.solvedDsaCount ?? 0;
  const savedOppsCount = pipeline?.total ?? 0;
  const indexedCount = stats?.indexedProjects ?? repositories?.length ?? 0;

  return (
    <PageContainer maxWidth="max-w-[1280px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Workspace overview</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">
            {(() => {
              const hour = new Date().getHours();
              const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
              return `${greeting}, ${user?.name || user?.username || 'Developer'}.`;
            })()}
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">Your developer workspace at a glance.</p>
        </div>
      </div>

      {/* 2. 4 KPI Cards */}
      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* KPI 1: Connected platforms */}
        <div 
          onClick={() => onNavigate('integrations')} 
          className="rounded-xl border border-black/7 bg-white p-4 cursor-pointer hover:border-black/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">Connected platforms</span>
            <Plug className="size-3.5 text-[#8B5CF6]" />
          </div>
          <p className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#0B0D12]">{connectedCount}</p>
          <p className="mt-1 text-[9px] text-[#858993]">
            {connectedCount === 0 ? 'No connections yet' : `${connectedCount} active connection${connectedCount === 1 ? '' : 's'}`}
          </p>
        </div>

        {/* KPI 2: Solved problems */}
        <div 
          onClick={() => onNavigate('dsa')} 
          className="rounded-xl border border-black/7 bg-white p-4 cursor-pointer hover:border-black/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">Solved problems</span>
            <BookOpen className="size-3.5 text-[#8B5CF6]" />
          </div>
          <p className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#0B0D12]">{solvedCount}</p>
          <p className="mt-1 text-[9px] text-[#858993]">
            {solvedCount === 0 ? 'Add your first problem' : `${stats?.dsaRevisionsDue || 0} revisions due`}
          </p>
        </div>

        {/* KPI 3: Saved opportunities */}
        <div 
          onClick={() => onNavigate('catalog')} 
          className="rounded-xl border border-black/7 bg-white p-4 cursor-pointer hover:border-black/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">Saved opportunities</span>
            <Compass className="size-3.5 text-[#8B5CF6]" />
          </div>
          <p className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#0B0D12]">{savedOppsCount}</p>
          <p className="mt-1 text-[9px] text-[#858993]">
            {savedOppsCount === 0 ? 'Explore open source' : `${savedOppsCount} saved in pipeline`}
          </p>
        </div>

        {/* KPI 4: Indexed projects */}
        <div 
          onClick={() => onNavigate('navigator')} 
          className="rounded-xl border border-black/7 bg-white p-4 cursor-pointer hover:border-black/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">Indexed projects</span>
            <Code2 className="size-3.5 text-[#8B5CF6]" />
          </div>
          <p className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#0B0D12]">{indexedCount}</p>
          <p className="mt-1 text-[9px] text-[#858993]">
            {indexedCount === 0 ? 'Add a repository' : `${indexedCount} repository indexed`}
          </p>
        </div>
      </div>

      {/* 3. Main Split Grid */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Left: Development overview */}
        <section className="rounded-xl border border-black/7 bg-white min-h-[310px] flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Development overview</h3>
            <span className="text-[9px] text-[#999CA3]">Source: connected GitHub account</span>
          </div>

          {integrations?.github?.isConnected ? (
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#0B0D12]">@{integrations.github.username}</div>
                  <div className="text-[10px] text-[#858993] mt-0.5">Connected GitHub Profile</div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#EBF7EE] text-[#1E8A38] text-[9px] font-semibold">
                  <span className="size-1.5 rounded-full bg-[#1E8A38]" />
                  Active
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 rounded-lg bg-[#F8F9FA] border border-black/5">
                  <span className="text-[9px] text-[#858993] block">Commits</span>
                  <span className="text-lg font-semibold text-[#0B0D12]">{stats?.totalCommits || 0}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F8F9FA] border border-black/5">
                  <span className="text-[9px] text-[#858993] block">Repositories</span>
                  <span className="text-lg font-semibold text-[#0B0D12]">{repositories?.length || 0}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F8F9FA] border border-black/5">
                  <span className="text-[9px] text-[#858993] block">PRs Synced</span>
                  <span className="text-lg font-semibold text-[#0B0D12]">{pipeline?.stages?.PR_SUBMITTED || 0}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => onNavigate('profile')} 
                  className="rounded-md border border-black/9 bg-white px-3 py-1.5 text-[10px] font-semibold hover:bg-black/5 transition text-[#0B0D12]"
                >
                  View profile activity
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <GitPullRequest className="size-4.5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">GitHub is not connected</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                Authorize GitHub to see repository activity, commits, and pull requests. DevOrbit will only request permissions you approve.
              </p>
              <button 
                onClick={() => onNavigate('integrations')}
                className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold hover:bg-black/5 transition text-[#0B0D12]"
              >
                Open integrations
              </button>
            </div>
          )}
        </section>

        {/* Right: Quick actions */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Quick actions</h3>
          </div>
          <div className="divide-y divide-black/7 flex-1">
            <button 
              onClick={() => onNavigate('navigator')}
              className="w-full flex items-center justify-between px-4 py-3.5 text-[10px] font-semibold hover:bg-[#F8F8FA] transition text-[#0B0D12] text-left"
            >
              <span className="flex items-center gap-2.5">
                <Code2 className="size-3.5 text-[#8B5CF6]" />
                Open a repository
              </span>
              <ChevronRight className="size-3 text-[#A1A4AB]" />
            </button>
            <button 
              onClick={() => onNavigate('dsa')}
              className="w-full flex items-center justify-between px-4 py-3.5 text-[10px] font-semibold hover:bg-[#F8F8FA] transition text-[#0B0D12] text-left"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="size-3.5 text-[#8B5CF6]" />
                Track a DSA problem
              </span>
              <ChevronRight className="size-3 text-[#A1A4AB]" />
            </button>
            <button 
              onClick={() => onNavigate('catalog')}
              className="w-full flex items-center justify-between px-4 py-3.5 text-[10px] font-semibold hover:bg-[#F8F8FA] transition text-[#0B0D12] text-left"
            >
              <span className="flex items-center gap-2.5">
                <Compass className="size-3.5 text-[#8B5CF6]" />
                Discover an issue
              </span>
              <ChevronRight className="size-3 text-[#A1A4AB]" />
            </button>
            <button 
              onClick={() => onNavigate('ai')}
              className="w-full flex items-center justify-between px-4 py-3.5 text-[10px] font-semibold hover:bg-[#F8F8FA] transition text-[#0B0D12] text-left"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="size-3.5 text-[#8B5CF6]" />
                Open Orbit AI
              </span>
              <ChevronRight className="size-3 text-[#A1A4AB]" />
            </button>
            <button 
              onClick={() => onNavigate('integrations')}
              className="w-full flex items-center justify-between px-4 py-3.5 text-[10px] font-semibold hover:bg-[#F8F8FA] transition text-[#0B0D12] text-left"
            >
              <span className="flex items-center gap-2.5">
                <Plug className="size-3.5 text-[#8B5CF6]" />
                Connect an integration
              </span>
              <ChevronRight className="size-3 text-[#A1A4AB]" />
            </button>
          </div>
        </section>
      </div>

      {/* 4. Lower Grid: DSA Progress & Open Source Pipeline */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* DSA progress */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">DSA progress</h3>
            <span className="text-[9px] text-[#999CA3]">{solvedCount} tracked</span>
          </div>

          {solvedCount > 0 ? (
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-[#F8F9FA] rounded-lg border border-black/5">
                  <span className="text-[8px] uppercase tracking-wider text-[#858993] block">Solved</span>
                  <span className="text-xl font-bold text-[#0B0D12]">{solvedCount}</span>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-lg border border-black/5">
                  <span className="text-[8px] uppercase tracking-wider text-[#858993] block">Revisions Due</span>
                  <span className="text-xl font-bold text-[#F59E0B]">{stats?.dsaRevisionsDue || 0}</span>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-lg border border-black/5">
                  <span className="text-[8px] uppercase tracking-wider text-[#858993] block">Streak</span>
                  <span className="text-xl font-bold text-[#8B5CF6]">{stats?.streak || 1}d</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => onNavigate('dsa')}
                  className="rounded-md border border-black/9 bg-white px-3 py-1.5 text-[10px] font-semibold hover:bg-black/5 transition text-[#0B0D12]"
                >
                  Open problem tracker
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <BookOpen className="size-4.5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">No problem-solving data yet</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                Track a problem manually or import a supported sheet. No sample statistics are shown.
              </p>
              <button 
                onClick={() => onNavigate('dsa')}
                className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold hover:bg-black/5 transition text-[#0B0D12]"
              >
                Open problem tracker
              </button>
            </div>
          )}
        </section>

        {/* Open-source pipeline */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Open-source pipeline</h3>
            <span className="text-[9px] text-[#999CA3]">{savedOppsCount} saved</span>
          </div>

          {savedOppsCount > 0 ? (
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#0B0D12]">
                  <span>Active pipeline issues</span>
                  <span className="font-semibold">{savedOppsCount}</span>
                </div>
                <div className="text-[10px] text-[#858993]">
                  Stages: {pipeline?.stages?.TRIAGED || 0} Triaged · {pipeline?.stages?.IN_PROGRESS || 0} In Progress · {pipeline?.stages?.PR_SUBMITTED || 0} Submitted
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => onNavigate('issues')}
                  className="rounded-md border border-black/9 bg-white px-3 py-1.5 text-[10px] font-semibold hover:bg-black/5 transition text-[#0B0D12]"
                >
                  View pipeline board
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <Compass className="size-4.5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">No saved opportunities</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                Search supported sources, evaluate an issue, and add it to your contribution pipeline.
              </p>
              <button 
                onClick={() => onNavigate('catalog')}
                className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold hover:bg-black/5 transition text-[#0B0D12]"
              >
                Discover opportunities
              </button>
            </div>
          )}
        </section>
      </div>

      {/* 5. Bottom Section: Recent Activity */}
      <section className="rounded-xl border border-black/7 bg-white mt-4">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <h3 className="text-[11px] font-semibold text-[#0B0D12]">Recent activity</h3>
          <span className="text-[9px] text-[#999CA3]">
            {activity?.recentEvents?.length ? `${activity.recentEvents.length} events` : 'No synced events'}
          </span>
        </div>

        {activity?.recentEvents && activity.recentEvents.length > 0 ? (
          <div className="divide-y divide-black/7">
            {activity.recentEvents.slice(0, 6).map((evt: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="size-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
                  <span className="text-[#0B0D12] truncate">{evt.title || evt.description}</span>
                </div>
                <span className="text-[9px] text-[#999CA3] shrink-0">{evt.timeAgo || 'Recent'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
              <Clock className="size-4.5" />
            </span>
            <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">Your activity stream is quiet</h3>
            <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
              Repository activity, DSA updates, integration syncs, and workspace changes will appear after you connect or create data.
            </p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
