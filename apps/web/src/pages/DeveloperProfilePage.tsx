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
  FolderGit2,
  FileText,
  Plus,
  Trash2,
  Save,
  Check,
  Sparkles,
  Sliders,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer } from '../components/ui/PageContainer.js';
import { apiFetch } from '../lib/api.js';

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

interface UnifiedSkill {
  id: string;
  skillName: string;
  category: string;
  confidenceScore: number;
  source: string;
  evidenceCount: number;
  provenanceLabel: string;
}

interface UnifiedProfileData {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  weeklyAvailabilityHours: number;
  weeklyCommitmentHours: number;
  preferredLanguages: string[];
  domains: string[];
  connectedAccounts: {
    github: { connected: boolean; username?: string };
    codeforces: { connected: boolean; username?: string };
    leetcode: { connected: boolean; username?: string };
  };
  skills: UnifiedSkill[];
  interests: Array<{ topic: string; weight: number }>;
  recentReadmeSnapshots: Array<{
    id: string;
    sourceType: string;
    repositoryFullName: string | null;
    signalsCount: number;
    createdAt: string;
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
  const [repositories, setRepositories] = useState<SyncedRepo[]>([]);
  
  // Unified Profile State
  const [profileData, setProfileData] = useState<UnifiedProfileData | null>(null);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // README Sync Modal State
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);
  const [readmeContent, setReadmeContent] = useState('');
  const [readmeSyncing, setReadmeSyncing] = useState(false);
  const [readmeResult, setReadmeResult] = useState<any | null>(null);

  // Add Skill Modal State
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('LANGUAGE');
  const [newSkillConfidence, setNewSkillConfidence] = useState(80);

  const fetchProfileData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statusJson, metricsJson, heatmapJson, reposJson, unifiedProfileJson] = await Promise.all([
        apiFetch('/api/v1/github/status', { headers }),
        apiFetch('/api/v1/github/metrics', { headers }),
        apiFetch('/api/v1/github/heatmap', { headers }),
        apiFetch('/api/v1/github/repositories', { headers }),
        apiFetch('/api/v1/profile', { headers }),
      ]);

      if (statusJson.success && statusJson.data) setStatus(statusJson.data);
      if (metricsJson.success && metricsJson.data) setMetrics(metricsJson.data);
      if (heatmapJson.success && heatmapJson.data) setHeatmap(heatmapJson.data?.points || []);
      if (reposJson.success && reposJson.data) setRepositories(reposJson.data?.repositories || []);
      
      if (unifiedProfileJson.success && unifiedProfileJson.data) {
        const prof = unifiedProfileJson.data;
        setProfileData(prof);
        setHeadline(prof.headline || '');
        setBio(prof.bio || '');
        setExperienceLevel(prof.experienceLevel || 'INTERMEDIATE');
        setWeeklyHours(prof.weeklyCommitmentHours || prof.weeklyAvailabilityHours || 10);
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  const handleSyncTelemetry = async () => {
    if (!token) return;
    setSyncing(true);
    try {
      await apiFetch('/api/v1/github/sync', {
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

  const handleSaveProfilePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingProfile(true);
    setProfileSaveSuccess(false);

    try {
      const json = await apiFetch('/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          headline,
          bio,
          experienceLevel,
          weeklyCommitmentHours: weeklyHours,
        }),
      });
      if (json.success) {
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 3000);
        await fetchProfileData();
      }
    } catch (err) {
      console.error('Save profile preferences failed', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSyncReadme = async () => {
    if (!token) return;
    setReadmeSyncing(true);
    setReadmeResult(null);

    try {
      const json = await apiFetch('/api/v1/profile/readme/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          markdown: readmeContent.trim() || undefined,
        }),
      });
      if (json.success) {
        setReadmeResult(json.data);
        await fetchProfileData();
      }
    } catch (err) {
      console.error('README sync failed', err);
    } finally {
      setReadmeSyncing(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newSkillName.trim()) return;

    try {
      await apiFetch('/api/v1/profile/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillName: newSkillName.trim(),
          category: newSkillCategory,
          confidenceScore: newSkillConfidence,
        }),
      });
      setNewSkillName('');
      setIsAddSkillOpen(false);
      await fetchProfileData();
    } catch (err) {
      console.error('Add skill failed', err);
    }
  };

  const handleRemoveSkill = async (skillName: string) => {
    if (!token) return;
    try {
      await apiFetch(`/api/v1/profile/skills/${encodeURIComponent(skillName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProfileData();
    } catch (err) {
      console.error('Remove skill failed', err);
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

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'GITHUB_CODEBASE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-[#F0EDFA] px-1.5 py-0.5 text-[8px] font-semibold text-[#8B5CF6]">
            <Code2 className="size-2.5" />
            Codebase
          </span>
        );
      case 'GITHUB_README':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[8px] font-semibold text-blue-600">
            <FileText className="size-2.5" />
            README
          </span>
        );
      case 'MANUAL':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
            <Sliders className="size-2.5" />
            Configured
          </span>
        );
      case 'MULTI_SOURCE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[8px] font-semibold text-purple-700">
            <Sparkles className="size-2.5" />
            Multi-Source
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 text-[8px] font-semibold text-zinc-700">
            <ShieldCheck className="size-2.5" />
            Verified
          </span>
        );
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Account</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">Developer Intelligence Profile</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Unified developer identity synthesizing GitHub codebase signals, profile README competencies, and competitive metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReadmeModalOpen(true)}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-black/9 bg-white px-3.5 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors"
          >
            <FileText className="size-3.5 text-[#8B5CF6]" />
            <span>Sync Profile README</span>
          </button>

          {status?.connected && (
            <button
              onClick={handleSyncTelemetry}
              disabled={syncing}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#11141B] px-4 text-[10px] font-semibold text-white hover:bg-black transition-colors"
            >
              <RefreshCw className={`size-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Telemetry'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Connected Integrations Status Bar */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-black/7 bg-white px-3 py-1.5 text-[10px]">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-[#0B0D12]">GitHub:</span>
          {status?.connected ? (
            <span className="text-[#686D79]">@{status.username} (Connected)</span>
          ) : (
            <span className="text-amber-600">Disconnected</span>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-black/7 bg-white px-3 py-1.5 text-[10px]">
          <span className={`size-2 rounded-full ${profileData?.connectedAccounts.codeforces.connected ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
          <span className="font-semibold text-[#0B0D12]">Codeforces:</span>
          {profileData?.connectedAccounts.codeforces.connected ? (
            <span className="text-[#686D79]">@{profileData.connectedAccounts.codeforces.username}</span>
          ) : (
            <span className="text-[#858993]">Not linked</span>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-black/7 bg-white px-3 py-1.5 text-[10px]">
          <span className={`size-2 rounded-full ${profileData?.connectedAccounts.leetcode.connected ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
          <span className="font-semibold text-[#0B0D12]">LeetCode:</span>
          {profileData?.connectedAccounts.leetcode.connected ? (
            <span className="text-[#686D79]">@{profileData.connectedAccounts.leetcode.username}</span>
          ) : (
            <span className="text-[#858993]">Not linked</span>
          )}
        </div>
      </div>

      {/* 3. Developer Intelligence & Preferences Card */}
      <section className="rounded-xl border border-black/7 bg-white mt-4">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Profile & Opportunity Preferences</h3>
            <span className="rounded bg-[#F0EDFA] px-1.5 py-0.5 text-[9px] font-bold text-[#8B5CF6]">
              7-Factor Engine Synced
            </span>
          </div>
          {profileSaveSuccess && (
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
              <Check className="size-3" />
              Preferences saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfilePreferences} className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[9px] font-semibold text-[#0B0D12]">Primary Focus / Headline</label>
              <input 
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="e.g. Distributed Systems & Open Source Contributor"
                className="h-10 w-full rounded-md border border-black/8 bg-[#F9FAFB] px-3 text-[10px] text-[#0B0D12] focus:border-[#8B5CF6] focus:bg-white focus:outline-hidden transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[9px] font-semibold text-[#0B0D12]">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value as any)}
                className="h-10 w-full rounded-md border border-black/8 bg-[#F9FAFB] px-3 text-[10px] text-[#0B0D12] focus:border-[#8B5CF6] focus:bg-white focus:outline-hidden transition-colors"
              >
                <option value="BEGINNER">Beginner (Good first issues, starter tasks)</option>
                <option value="INTERMEDIATE">Intermediate (Core feature bugfixes, standard modules)</option>
                <option value="ADVANCED">Advanced (Architecture rewrites, compilers, perf critical)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[9px] font-semibold text-[#0B0D12]">Developer Bio</label>
              <textarea 
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={2}
                placeholder="Brief summary of your technical interests, OSS contribution goals, and specializations."
                className="w-full rounded-md border border-black/8 bg-[#F9FAFB] p-3 text-[10px] text-[#0B0D12] focus:border-[#8B5CF6] focus:bg-white focus:outline-hidden transition-colors resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[9px] font-semibold text-[#0B0D12]">Weekly Availability Commitment</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min="2"
                  max="40"
                  step="2"
                  value={weeklyHours}
                  onChange={e => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-[#8B5CF6]"
                />
                <span className="text-xs font-mono font-bold text-[#8B5CF6] shrink-0 w-12">{weeklyHours} hrs/wk</span>
              </div>
            </div>

            <div className="flex items-end justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#11141B] px-5 text-[10px] font-semibold text-white hover:bg-black transition-colors"
              >
                <Save className="size-3.5" />
                <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 4. Verified Metrics */}
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

      {/* 5. 52-Week Contribution Heatmap */}
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

      {/* 6. Multi-Source Evidence Skills & Repositories */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Skills */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[11px] font-semibold text-[#0B0D12]">Multi-Source Verified Skills</h3>
              <span className="text-[9px] text-[#999CA3]">
                {profileData?.skills.length || 0} skills detected
              </span>
            </div>
            <button
              onClick={() => setIsAddSkillOpen(true)}
              className="inline-flex items-center gap-1 rounded-md border border-black/9 bg-white px-2.5 py-1 text-[9px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors"
            >
              <Plus className="size-3 text-[#8B5CF6]" />
              <span>Add Custom Skill</span>
            </button>
          </div>
          
          <div className="p-4 flex-1 space-y-2 max-h-[420px] overflow-y-auto [scrollbar-width:none]">
            {profileData?.skills && profileData.skills.length > 0 ? (
              profileData.skills.map(skill => (
                <div key={skill.id} className="p-3 rounded-lg border border-black/7 bg-[#F9FAFB] flex items-center justify-between group hover:border-[#8B5CF6]/40 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#0B0D12]">{skill.skillName}</span>
                      {getSourceBadge(skill.source)}
                    </div>
                    <div className="text-[8px] text-[#858993] mt-0.5 truncate">
                      {skill.provenanceLabel || `${skill.category} · ${skill.evidenceCount} verified evidence sources`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-[#8B5CF6]">
                        {skill.confidenceScore}%
                      </span>
                      <span className="text-[8px] text-[#858993] block">confidence</span>
                    </div>

                    <button
                      onClick={() => handleRemoveSkill(skill.skillName)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#858993] hover:text-rose-600 transition-all"
                      title="Remove skill"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center text-center p-4 text-[#858993] text-[10px]">
                Connect GitHub or sync your profile README to automatically extract and verify your developer competencies.
              </div>
            )}
          </div>
        </section>

        {/* Synchronized Repositories */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Synchronized Repositories</h3>
            <span className="text-[9px] text-[#999CA3]">{repositories.length} repos</span>
          </div>
          <div className="p-4 flex-1 space-y-2 max-h-[420px] overflow-y-auto [scrollbar-width:none]">
            {repositories.length > 0 ? (
              repositories.map(repo => (
                <div key={repo.id} className="p-3 rounded-lg border border-black/7 bg-[#F9FAFB] flex items-center justify-between hover:border-black/15 transition-colors">
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
                No repositories synced yet.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL: Sync Profile README */}
      {isReadmeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-black/7 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#0B0D12]">Extract Signals from Profile README</h3>
                <p className="mt-1 text-xs text-[#686D79]">
                  Parse technical stack badges, declared languages, and frameworks from your GitHub profile or repository README.
                </p>
              </div>
              <button onClick={() => setIsReadmeModalOpen(false)} className="text-[#999CA3] hover:text-[#0B0D12]">
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-[#0B0D12]">
                  Paste Profile README Markdown (or leave blank to fetch from GitHub)
                </label>
                <textarea
                  value={readmeContent}
                  onChange={e => setReadmeContent(e.target.value)}
                  placeholder="### 🛠️ Languages and Tools&#10;- Languages: TypeScript, Python, Rust, Go&#10;- Frameworks: React, Next.js, Express&#10;- Databases: PostgreSQL, Redis..."
                  rows={8}
                  className="w-full rounded-lg border border-black/10 bg-[#F9FAFB] p-3 text-[10px] font-mono text-[#0B0D12] focus:border-[#8B5CF6] focus:bg-white focus:outline-hidden"
                />
              </div>

              {readmeResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-800">
                  <div className="font-semibold">Successfully extracted {readmeResult.signalsCount} technical signals!</div>
                  <div className="mt-1 text-[10px] text-emerald-700">
                    Languages: {readmeResult.extractedSignals?.languages?.join(', ') || 'None detected'}
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Frameworks: {readmeResult.extractedSignals?.frameworks?.join(', ') || 'None detected'}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/7">
                <button
                  type="button"
                  onClick={() => setIsReadmeModalOpen(false)}
                  className="rounded-lg border border-black/10 bg-white px-3.5 py-2 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSyncReadme}
                  disabled={readmeSyncing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B5CF6] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#7C3AED] transition-colors"
                >
                  <Sparkles className="size-3" />
                  <span>{readmeSyncing ? 'Extracting Signals...' : 'Extract & Ingest'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Custom Skill */}
      {isAddSkillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-black/7 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#0B0D12]">Add Custom Verified Skill</h3>
                <p className="mt-1 text-xs text-[#686D79]">
                  Manually calibrate a skill to tune the 7-factor recommendation engine.
                </p>
              </div>
              <button onClick={() => setIsAddSkillOpen(false)} className="text-[#999CA3] hover:text-[#0B0D12]">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-[#0B0D12]">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GraphQL, Rust, Kubernetes, Vue"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="h-10 w-full rounded-md border border-black/10 bg-[#F9FAFB] px-3 text-[10px] text-[#0B0D12] focus:border-[#8B5CF6] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-[#0B0D12]">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={e => setNewSkillCategory(e.target.value)}
                  className="h-10 w-full rounded-md border border-black/10 bg-[#F9FAFB] px-3 text-[10px] text-[#0B0D12] focus:border-[#8B5CF6] focus:bg-white focus:outline-hidden"
                >
                  <option value="LANGUAGE">Programming Language</option>
                  <option value="FRAMEWORK">Framework / Library</option>
                  <option value="DATABASE">Database / Storage</option>
                  <option value="TOOL">Tool / Infrastructure / DevOps</option>
                  <option value="DOMAIN">Focus Domain / Architecture</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-semibold text-[#0B0D12]">Confidence Level</label>
                  <span className="text-xs font-mono font-bold text-[#8B5CF6]">{newSkillConfidence}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={newSkillConfidence}
                  onChange={e => setNewSkillConfidence(Number(e.target.value))}
                  className="w-full accent-[#8B5CF6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/7">
                <button
                  type="button"
                  onClick={() => setIsAddSkillOpen(false)}
                  className="rounded-lg border border-black/10 bg-white px-3.5 py-2 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#11141B] px-4 py-2 text-[10px] font-semibold text-white hover:bg-black transition-colors"
                >
                  <Plus className="size-3" />
                  <span>Add Skill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
