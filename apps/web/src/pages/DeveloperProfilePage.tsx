import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitPullRequest, 
  GitCommit, 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink, 
  Search, 
  Code2, 
  Layers, 
  Lock, 
  Star, 
  FolderGit2, 
  SlidersHorizontal,
  ChevronDown,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

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

interface LanguageMetric {
  name: string;
  bytes: number;
  percentage: number;
}

interface SkillProfile {
  id: string;
  skillName: string;
  category: 'LANGUAGE' | 'FRAMEWORK' | 'TOOLING' | 'CLOUD';
  confidenceScore: number;
  evidence: Array<{
    repoName: string;
    repoFullName: string;
    languageBytes?: number;
    topicsMatched?: string[];
    lastActive: string;
    isOwner: boolean;
  }>;
  lastEvaluatedAt: string;
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
  isFork: boolean;
  defaultBranch: string;
  license: string | null;
  pushedAt: string | null;
  topics: string[];
}

export function DeveloperProfilePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [metrics, setMetrics] = useState<ContributionMetrics | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [languages, setLanguages] = useState<LanguageMetric[]>([]);
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [repositories, setRepositories] = useState<SyncedRepo[]>([]);
  
  // Modals & UI states
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [patInput, setPatInput] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [selectedSkillEvidence, setSelectedSkillEvidence] = useState<SkillProfile | null>(null);
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('ALL');
  const [repoSearch, setRepoSearch] = useState('');
  const [repoLangFilter, setRepoLangFilter] = useState('ALL');

  const fetchProfileData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/v1/github/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStatus(json.data.status);
          setMetrics(json.data.metrics);
          setHeatmap(json.data.heatmap || []);
          setLanguages(json.data.languages || []);
          setSkills(json.data.skills || []);
          setRepositories(json.data.repositories || []);
        }
      }
    } catch (err) {
      console.error('Failed to load GitHub profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token, user]);

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) return;
    setConnectLoading(true);
    setConnectError(null);

    try {
      const res = await fetch('/api/v1/github/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: patInput.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to authenticate token with GitHub');
      }

      setConnectModalOpen(false);
      setPatInput('');
      await fetchProfileData();
    } catch (err: any) {
      setConnectError(err.message || 'Token connection failed');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleSyncNow = async () => {
    if (syncing || !token) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/v1/github/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProfileData();
      }
    } catch (err) {
      console.error('Failed to sync GitHub repositories', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect GitHub? Your local sync state will be cleared.') || !token) return;
    try {
      await fetch('/api/v1/github/token', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProfileData();
    } catch (err) {
      console.error('Failed to disconnect GitHub', err);
    }
  };

  const filteredSkills = skills.filter(s => {
    if (skillCategoryFilter === 'ALL') return true;
    return s.category === skillCategoryFilter;
  });

  const filteredRepos = repositories.filter(r => {
    const matchesSearch = repoSearch === '' || 
      r.name.toLowerCase().includes(repoSearch.toLowerCase()) || 
      (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase()));
    const matchesLang = repoLangFilter === 'ALL' || r.language === repoLangFilter;
    return matchesSearch && matchesLang;
  });

  const distinctLanguages = Array.from(new Set(repositories.map(r => r.language).filter(Boolean)));

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-[#4C1D95] border-[#5B21B6]';
      case 2: return 'bg-[#6D28D9] border-[#7C3AED]';
      case 3: return 'bg-[#8B5CF6] border-[#A78BFA]';
      case 4: return 'bg-[#A78BFA] border-[#C4B5FD]';
      default: return 'bg-[#181C26] border-[#1F2430]';
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header & Integration Banner */}
      <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl shadow-black/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-xs font-mono text-[#A78BFA]">
            <ShieldCheck className="size-3.5 text-[#8B5CF6]" />
            <span>Developer Skill & Activity Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
            Developer Profile & GitHub Intelligence
          </h1>
          <p className="text-sm text-[#686D79] max-w-2xl">
            Evidence-grounded skill profiling, repository AST analysis, verified velocity metrics, and automated portfolio synchronization.
          </p>
        </div>

        {/* GitHub Integration Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {status?.connected ? (
            <div className="flex items-center gap-3 bg-[#181C26] border border-[#1F2430] p-2 rounded-xl">
              <div className="flex items-center gap-2.5 px-2">
                <div className="relative">
                  <div className="size-8 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center font-bold text-xs text-[#A78BFA]">
                    {status.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#22C55E] ring-2 ring-[#181C26]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#F8FAFC]">@{status.username}</div>
                  <div className="text-[10px] text-[#686D79] font-mono">
                    {status.rateLimitRemaining !== null ? `${status.rateLimitRemaining} / 5,000 API calls` : 'Rate limit active'}
                  </div>
                </div>
              </div>

              <div className="h-6 w-px bg-[#1F2430]" />

              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-medium transition-all shadow-sm shadow-[#8B5CF6]/20 disabled:opacity-50"
                title="Incremental GitHub repository and metrics sync"
              >
                <RefreshCw className={`size-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1.5 rounded-lg text-xs text-[#686D79] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                title="Disconnect GitHub PAT"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConnectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-[#8B5CF6]/25 active:scale-95"
            >
              <FolderGit2 className="size-4" />
              <span>Connect GitHub Account</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Developer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Commits */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-xl p-5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#686D79]">
            <span>Verified Commits</span>
            <GitCommit className="size-4 text-[#8B5CF6]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F8FAFC]">
            {metrics?.totalCommits ? metrics.totalCommits.toLocaleString() : '0'}
          </div>
          <div className="text-[11px] text-[#22C55E] flex items-center gap-1 font-mono">
            <span>Across {repositories.length} connected repositories</span>
          </div>
        </div>

        {/* Pull Requests */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-xl p-5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#686D79]">
            <span>Pull Requests</span>
            <GitPullRequest className="size-4 text-[#60A5FA]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F8FAFC]">
            {metrics?.totalPullRequests || 0}
          </div>
          <div className="text-[11px] text-[#A78BFA] font-mono">
            <span>{metrics?.mergedPullRequests || 0} merged into main</span>
          </div>
        </div>

        {/* PR Merge Rate */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-xl p-5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#686D79]">
            <span>PR Merge Velocity</span>
            <GitBranch className="size-4 text-[#22C55E]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F8FAFC]">
            {metrics?.mergeRate ? `${metrics.mergeRate}%` : '0%'}
          </div>
          <div className="text-[11px] text-[#686D79] font-mono">
            <span>High contribution acceptance rate</span>
          </div>
        </div>

        {/* Continuous Active Streak */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-xl p-5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#686D79]">
            <span>Continuous Streak</span>
            <Flame className="size-4 text-[#F76C39]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F8FAFC]">
            {metrics?.activeStreak || 0} <span className="text-xs font-normal text-[#686D79]">days</span>
          </div>
          <div className="text-[11px] text-[#F76C39] font-mono">
            <span>Longest streak: {metrics?.longestStreak || 0} days</span>
          </div>
        </div>
      </div>

      {/* 3. 52-Week Contribution Calendar Heatmap */}
      <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <Code2 className="size-4 text-[#8B5CF6]" />
              52-Week Contribution Activity Calendar
            </h2>
            <p className="text-xs text-[#686D79]">
              Empirical commit and code contribution distribution over the past 365 days
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#686D79] font-mono">
            <span>Less</span>
            <span className="size-2.5 rounded-sm bg-[#181C26] border border-[#1F2430]" />
            <span className="size-2.5 rounded-sm bg-[#4C1D95]" />
            <span className="size-2.5 rounded-sm bg-[#6D28D9]" />
            <span className="size-2.5 rounded-sm bg-[#8B5CF6]" />
            <span className="size-2.5 rounded-sm bg-[#A78BFA]" />
            <span>More</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1 min-w-[760px] py-2">
            {heatmap.map((pt, i) => (
              <div
                key={pt.date || i}
                title={`${pt.date}: ${pt.count} verified contributions`}
                className={`size-3 rounded-sm border transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(pt.level)}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Two-Column Layout: Evidence-Based Skills & Language Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): Verified Skill Profiles */}
        <div className="lg:col-span-2 bg-[#12151D] border border-[#1F2430] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#8B5CF6]" />
                Evidence-Grounded Skill Intelligence
              </h2>
              <p className="text-xs text-[#686D79]">
                Inferred skills backed by concrete repository evidence, byte volume, and recency
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1 bg-[#181C26] p-1 rounded-lg border border-[#1F2430]">
              {['ALL', 'LANGUAGE', 'FRAMEWORK', 'TOOLING', 'CLOUD'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    skillCategoryFilter === cat
                      ? 'bg-[#8B5CF6] text-white font-semibold shadow-sm'
                      : 'text-[#686D79] hover:text-[#F8FAFC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredSkills.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#1F2430] rounded-xl space-y-2">
              <Info className="size-8 text-[#686D79] mx-auto opacity-50" />
              <div className="text-xs text-[#C5C8D0]">No verified skills extracted yet.</div>
              <div className="text-[11px] text-[#686D79]">Connect your GitHub account to analyze repositories.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSkills.map(skill => (
                <div
                  key={skill.id}
                  className="bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/50 rounded-xl p-4 space-y-3 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#F8FAFC]">{skill.skillName}</span>
                        <CheckCircle2 className="size-3.5 text-[#8B5CF6]" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20">
                        {skill.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#8B5CF6]">
                        {skill.confidenceScore}%
                      </div>
                      <div className="text-[10px] text-[#686D79]">Confidence</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-[#12151D] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] rounded-full"
                        style={{ width: `${skill.confidenceScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Evidence Drawer Button */}
                  <button
                    onClick={() => setSelectedSkillEvidence(skill)}
                    className="w-full text-center py-1.5 px-2 rounded-lg bg-[#12151D] hover:bg-[#1F2430] text-[11px] font-mono text-[#C5C8D0] hover:text-white transition-colors flex items-center justify-center gap-1 border border-[#1F2430]"
                  >
                    <span>Inspect Evidence ({skill.evidence.length} Repos)</span>
                    <ExternalLink className="size-3 text-[#8B5CF6]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (1 col): Language Distribution */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <Layers className="size-4 text-[#8B5CF6]" />
              Language Breakdown
            </h2>
            <p className="text-xs text-[#686D79]">
              Aggregated code volume across all synced repositories
            </p>
          </div>

          {/* Stacked Progress Bar */}
          {languages.length > 0 && (
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#181C26]">
              {languages.map((l, i) => {
                const colors = ['bg-[#8B5CF6]', 'bg-[#60A5FA]', 'bg-[#F76C39]', 'bg-[#22C55E]', 'bg-[#F59E0B]', 'bg-[#EC4899]'];
                return (
                  <div
                    key={l.name}
                    className={`${colors[i % colors.length]} transition-all`}
                    style={{ width: `${l.percentage}%` }}
                    title={`${l.name}: ${l.percentage}%`}
                  />
                );
              })}
            </div>
          )}

          {/* Detailed Language List */}
          <div className="space-y-2">
            {languages.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#686D79]">No languages indexed yet.</div>
            ) : (
              languages.map((l, i) => {
                const dotColors = ['bg-[#8B5CF6]', 'bg-[#60A5FA]', 'bg-[#F76C39]', 'bg-[#22C55E]', 'bg-[#F59E0B]', 'bg-[#EC4899]'];
                return (
                  <div key={l.name} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-[#181C26] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${dotColors[i % dotColors.length]}`} />
                      <span className="font-semibold text-[#F8FAFC]">{l.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-[#686D79]">{Math.round(l.bytes / 1024).toLocaleString()} KB</span>
                      <span className="text-[#A78BFA] font-bold w-12 text-right">{l.percentage}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Synchronized Repositories Explorer */}
      <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <FolderGit2 className="size-4 text-[#8B5CF6]" />
              Synchronized Repositories ({repositories.length})
            </h2>
            <p className="text-xs text-[#686D79]">
              Indexed repositories with topics, languages, and pull-request intelligence
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-2.5 text-[#686D79]" />
              <input
                type="text"
                placeholder="Search repos..."
                value={repoSearch}
                onChange={e => setRepoSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#181C26] border border-[#1F2430] rounded-lg text-xs text-[#F8FAFC] placeholder-[#686D79] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <select
              value={repoLangFilter}
              onChange={e => setRepoLangFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#181C26] border border-[#1F2430] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="ALL">All Languages</option>
              {distinctLanguages.map(lang => (
                <option key={lang!} value={lang!}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map(repo => (
            <div
              key={repo.id}
              className="bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/40 rounded-xl p-5 space-y-3 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#F8FAFC] truncate">{repo.name}</span>
                  <div className="flex items-center gap-1.5">
                    {repo.isPrivate ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1F2430] text-[#686D79] flex items-center gap-0.5">
                        <Lock className="size-2.5" />
                        Private
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#8B5CF6]/10 text-[#A78BFA]">
                        Public
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#686D79] line-clamp-2 min-h-[32px]">
                  {repo.description || 'No description provided.'}
                </p>

                {/* Topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {repo.topics.slice(0, 3).map(topic => (
                      <span key={topic} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#12151D] text-[#C5C8D0] border border-[#1F2430]">
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between text-[11px] text-[#686D79] font-mono">
                <div className="flex items-center gap-1 text-[#F8FAFC]">
                  <span className="size-2 rounded-full bg-[#8B5CF6]" />
                  <span>{repo.language || 'Plain'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5">
                    <Star className="size-3 text-[#F59E0B]" />
                    {repo.stargazersCount}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <GitBranch className="size-3 text-[#60A5FA]" />
                    {repo.forksCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Modal: Connect GitHub PAT */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-black relative">
            <button
              onClick={() => setConnectModalOpen(false)}
              className="absolute top-4 right-4 text-[#686D79] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-[#181C26] transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/10 text-xs font-mono text-[#A78BFA] border border-[#8B5CF6]/30">
                <Lock className="size-3" />
                <span>AES-256-GCM Encrypted at Rest</span>
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">Connect GitHub Account</h3>
              <p className="text-xs text-[#686D79]">
                DevOrbit uses read-only API access to analyze your repositories, commits, and demonstrated skills.
              </p>
            </div>

            {/* Scope guidance checklist */}
            <div className="bg-[#181C26] border border-[#1F2430] rounded-xl p-3 space-y-2 text-xs">
              <div className="font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#22C55E]" />
                Recommended Token Scopes:
              </div>
              <ul className="space-y-1 text-[#686D79] font-mono text-[11px] list-disc list-inside">
                <li><strong className="text-[#C5C8D0]">read:user</strong> — Read user profile and email</li>
                <li><strong className="text-[#C5C8D0]">repo</strong> — Read repositories and code metadata</li>
                <li><strong className="text-[#C5C8D0]">read:org</strong> — Read organization memberships</li>
              </ul>
            </div>

            <form onSubmit={handleConnectToken} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#F8FAFC]">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or mock_token_alex_dev"
                  value={patInput}
                  onChange={e => setPatInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181C26] border border-[#1F2430] rounded-lg text-xs text-[#F8FAFC] placeholder-[#686D79] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              {connectError && (
                <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{connectError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#C5C8D0] hover:bg-[#181C26] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectLoading || !patInput.trim()}
                  className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold transition-all shadow-md shadow-[#8B5CF6]/20 disabled:opacity-50"
                >
                  {connectLoading ? 'Validating Token...' : 'Authenticate & Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Inspect Skill Evidence */}
      {selectedSkillEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl shadow-black relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedSkillEvidence(null)}
              className="absolute top-4 right-4 text-[#686D79] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-[#181C26] transition-colors"
            >
              <X className="size-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F8FAFC]">{selectedSkillEvidence.skillName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20">
                  {selectedSkillEvidence.category}
                </span>
              </div>
              <p className="text-xs text-[#686D79]">
                Verified with {selectedSkillEvidence.confidenceScore}% confidence based on concrete repository artifacts.
              </p>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {selectedSkillEvidence.evidence.map((ev, i) => (
                <div key={i} className="bg-[#181C26] border border-[#1F2430] rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">{ev.repoFullName}</span>
                    <span className="text-[10px] font-mono text-[#22C55E]">
                      {ev.isOwner ? 'Author / Owner' : 'Contributor'}
                    </span>
                  </div>

                  {ev.languageBytes && (
                    <div className="text-[11px] text-[#686D79] font-mono">
                      Code Volume: <strong className="text-[#C5C8D0]">{Math.round(ev.languageBytes / 1024).toLocaleString()} KB</strong>
                    </div>
                  )}

                  {ev.topicsMatched && ev.topicsMatched.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-[#686D79]">Architecture Topics:</span>
                      {ev.topicsMatched.map(t => (
                        <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12151D] text-[#A78BFA]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-[#686D79] font-mono">
                    Last active: {new Date(ev.lastActive).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#1F2430] flex justify-end">
              <button
                onClick={() => setSelectedSkillEvidence(null)}
                className="px-4 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#1F2430] text-xs font-medium text-[#F8FAFC] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
