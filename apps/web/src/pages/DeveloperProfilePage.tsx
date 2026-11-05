import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitPullRequest, 
  GitCommit, 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Code2, 
  Layers, 
  Star, 
  FolderGit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer } from '../components/ui/PageContainer.js';

interface GitHubStatus {
  connected: boolean;
  username: string | null;
  scopes: string[];
  rateLimitRemaining: number | null;
  rateLimitTotal: number | null;
  rateLimitReset: string | null;
  lastSyncedAt: string | null;
  repoCount: number;
}

interface ContributionMetrics {
  totalCommits: number;
  totalPullRequests: number;
  mergedPullRequests: number;
  mergeRate: number;
  activeStreak: number;
  longestStreak: number;
  lastCalculatedAt: string;
}

interface HeatmapPoint {
  date: string;
  count: number;
  level: number;
}

interface SkillProfile {
  id: string;
  skillName: string;
  category: 'LANGUAGE' | 'FRAMEWORK' | 'TOOLING' | 'CLOUD';
  confidenceScore: number;
  evidence: Array<{
    repoName: string;
    repoFullName: string;
    lastActive: string;
    isOwner: boolean;
  }>;
}

interface SyncedRepo {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  isPrivate: boolean;
  license: string | null;
}

export function DeveloperProfilePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [metrics, setMetrics] = useState<ContributionMetrics | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [repositories, setRepositories] = useState<SyncedRepo[]>([]);

  const fetchProfileData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statusRes, metricsRes, heatmapRes, skillsRes, reposRes] = await Promise.all([
        fetch('/api/v1/github/status', { headers }),
        fetch('/api/v1/github/metrics', { headers }),
        fetch('/api/v1/github/heatmap', { headers }),
        fetch('/api/v1/github/skills', { headers }),
        fetch('/api/v1/github/repositories', { headers }),
      ]);

      const [statusJson, metricsJson, heatmapJson, skillsJson, reposJson] = await Promise.all([
        statusRes.json(),
        metricsRes.json(),
        heatmapRes.json(),
        skillsRes.json(),
        reposRes.json(),
      ]);

      if (statusJson.success) setStatus(statusJson.data);
      if (metricsJson.success) setMetrics(metricsJson.data);
      if (heatmapJson.success) setHeatmap(heatmapJson.data?.points || []);
      if (skillsJson.success) setSkills(skillsJson.data?.skills || []);
      if (reposJson.success) setRepositories(reposJson.data?.repositories || []);
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  const handleSync = async () => {
    if (!token) return;
    setSyncing(true);
    try {
      await fetch('/api/v1/github/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProfileData();
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setSyncing(false);
    }
  };

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-[#F0EDFA] border-[#E2DCF7]';
      case 2: return 'bg-[#DDD6FE] border-[#C4B5FD]';
      case 3: return 'bg-[#C4B5FD] border-[#A78BFA]';
      case 4: return 'bg-[#8B5CF6] border-[#7C3AED]';
      default: return 'bg-[#F3F4F6] border-black/5';
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Account</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">Profile</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">Your developer identity and interests.</p>
        </div>

        {status?.connected && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#11141B] px-4 text-[10px] font-semibold text-white hover:bg-black transition-colors"
          >
            <RefreshCw className={`size-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing GitHub...' : 'Sync telemetry'}</span>
          </button>
        )}
      </div>

      {/* 2. Profile Details Card (Figma match) */}
      <section className="rounded-xl border border-black/7 bg-white mt-6">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <h3 className="text-[11px] font-semibold text-[#0B0D12]">Profile details</h3>
          {status?.connected ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EBF7EE] text-[#1E8A38] text-[9px] font-semibold">
              <span className="size-1.5 rounded-full bg-[#1E8A38]" />
              @{status.username} connected
            </span>
          ) : (
            <span className="text-[9px] text-[#999CA3]">Local account</span>
          )}
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[9px] font-semibold text-[#0B0D12]">Full name</span>
            <input 
              disabled 
              value={user?.name || 'Developer'} 
              className="h-10 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-[10px] text-[#0B0D12]"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[9px] font-semibold text-[#0B0D12]">Username</span>
            <input 
              disabled 
              value={user?.username || 'developer'} 
              className="h-10 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-[10px] text-[#0B0D12]"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[9px] font-semibold text-[#0B0D12]">Email</span>
            <input 
              disabled 
              value={user?.email || 'developer@devorbit.internal'} 
              className="h-10 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-[10px] text-[#0B0D12]"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[9px] font-semibold text-[#0B0D12]">Developer role</span>
            <input 
              disabled 
              value="Full Stack Software Engineer" 
              className="h-10 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-[10px] text-[#0B0D12]"
            />
          </label>
          <div className="sm:col-span-2 rounded-lg bg-amber-50 p-3 text-[9px] text-amber-800">
            Profile editing is not enabled in this build. Existing account data remains unchanged.
          </div>
        </div>
      </section>

      {/* 3. Verified Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="rounded-xl border border-black/7 bg-white p-4">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">
            <span>Verified Commits</span>
            <GitCommit className="size-3.5 text-[#8B5CF6]" />
          </div>
          <p className="mt-5 text-2xl font-semibold text-[#0B0D12]">{metrics?.totalCommits || 0}</p>
          <p className="mt-1 text-[9px] text-[#858993]">Across {repositories.length} repositories</p>
        </div>

        <div className="rounded-xl border border-black/7 bg-white p-4">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">
            <span>Pull Requests</span>
            <GitPullRequest className="size-3.5 text-[#8B5CF6]" />
          </div>
          <p className="mt-5 text-2xl font-semibold text-[#0B0D12]">{metrics?.totalPullRequests || 0}</p>
          <p className="mt-1 text-[9px] text-[#858993]">{metrics?.mergedPullRequests || 0} merged into main</p>
        </div>

        <div className="rounded-xl border border-black/7 bg-white p-4">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">
            <span>PR Merge Velocity</span>
            <GitBranch className="size-3.5 text-[#8B5CF6]" />
          </div>
          <p className="mt-5 text-2xl font-semibold text-[#0B0D12]">{metrics?.mergeRate || 0}%</p>
          <p className="mt-1 text-[9px] text-[#858993]">Acceptance efficiency</p>
        </div>

        <div className="rounded-xl border border-black/7 bg-white p-4">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">
            <span>Continuous Streak</span>
            <Flame className="size-3.5 text-[#8B5CF6]" />
          </div>
          <p className="mt-5 text-2xl font-semibold text-[#0B0D12]">{metrics?.activeStreak || 0}d</p>
          <p className="mt-1 text-[9px] text-[#858993]">Longest: {metrics?.longestStreak || 0} days</p>
        </div>
      </div>

      {/* 4. 52-Week Contribution Heatmap */}
      <section className="rounded-xl border border-black/7 bg-white mt-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/7">
          <div>
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">52-Week Contribution Activity Calendar</h3>
            <p className="text-[9px] text-[#858993] mt-0.5">
              Empirical commit and code contribution distribution over the past 365 days
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-[#858993]">
            <span>Less</span>
            <span className="size-2 rounded-xs bg-[#F3F4F6] border border-black/5" />
            <span className="size-2 rounded-xs bg-[#F0EDFA]" />
            <span className="size-2 rounded-xs bg-[#DDD6FE]" />
            <span className="size-2 rounded-xs bg-[#C4B5FD]" />
            <span className="size-2 rounded-xs bg-[#8B5CF6]" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pt-4 [scrollbar-width:none]">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1 min-w-[760px]">
            {heatmap.map((pt, i) => (
              <div
                key={pt.date || i}
                title={`${pt.date}: ${pt.count} verified contributions`}
                className={`size-2.5 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(pt.level)}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Inferred Skills & Repositories */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Skills */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Evidence-Grounded Skills</h3>
            <span className="text-[9px] text-[#999CA3]">{skills.length} skills</span>
          </div>
          <div className="p-4 flex-1 space-y-2">
            {skills.length > 0 ? (
              skills.map(skill => (
                <div key={skill.id} className="p-3 rounded-lg border border-black/7 bg-[#F9FAFB] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-[#0B0D12]">{skill.skillName}</div>
                    <div className="text-[8px] text-[#858993] uppercase font-mono">{skill.category}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#8B5CF6]">
                      {Math.round(skill.confidenceScore * 100)}%
                    </span>
                    <span className="text-[8px] text-[#858993] block">confidence</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center text-center p-4 text-[#858993] text-[10px]">
                Connect GitHub to extract skills from repository code.
              </div>
            )}
          </div>
        </section>

        {/* Repositories */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Synchronized Repositories</h3>
            <span className="text-[9px] text-[#999CA3]">{repositories.length} repos</span>
          </div>
          <div className="p-4 flex-1 space-y-2 max-h-[360px] overflow-y-auto [scrollbar-width:none]">
            {repositories.length > 0 ? (
              repositories.map(repo => (
                <div key={repo.id} className="p-3 rounded-lg border border-black/7 bg-[#F9FAFB] flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] font-semibold text-[#0B0D12] truncate">{repo.name}</div>
                    <div className="text-[9px] text-[#858993] truncate">{repo.description || 'No description provided'}</div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-[#858993] shrink-0">
                    {repo.language && <span className="text-[#8B5CF6] font-semibold">{repo.language}</span>}
                    <span className="flex items-center gap-0.5">
                      <Star className="size-2.5" />
                      {repo.stargazersCount}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center text-center p-4 text-[#858993] text-[10px]">
                No repositories synced.
              </div>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
