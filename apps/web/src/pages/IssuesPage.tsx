import React, { useState, useEffect } from 'react';
import { 
  CircleAlert, 
  ExternalLink, 
  Search, 
  Check, 
  Sparkles, 
  Kanban, 
  ListFilter, 
  Plus, 
  Trash2, 
  ArrowRight, 
  GitPullRequest, 
  CheckCircle2, 
  X,
  Info,
  Clock,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';

interface PipelineItem {
  id: string;
  issueId?: string;
  stage: 'SHORTLISTED' | 'EXPLORING' | 'PREPARING' | 'WORKING' | 'PR_SUBMITTED' | 'MERGED';
  notes?: string;
  prUrl?: string;
  createdAt: string;
  updatedAt: string;
  issue?: {
    id: string;
    title: string;
    number: number;
    url: string;
    difficulty?: string;
    labels?: any[];
    repository?: {
      fullName: string;
      primaryLanguage?: string;
    };
  };
}

interface MatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  repositoryMatch: boolean;
  explanation: string;
}

function getCleanRepoName(repo?: { fullName?: string; owner?: string; name?: string }, url?: string): string {
  if (repo?.fullName && !repo.fullName.startsWith('undefined/')) {
    return repo.fullName;
  }
  if (repo?.owner && repo?.name && repo.owner !== 'undefined' && repo.name !== 'undefined') {
    return `${repo.owner}/${repo.name}`;
  }
  if (url && url.includes('github.com/')) {
    const extracted = url.split('github.com/')[1]?.split('/issues/')[0];
    if (extracted && !extracted.includes('undefined')) return extracted;
  }
  return 'github/repository';
}

const PIPELINE_STAGES: Array<{ key: PipelineItem['stage']; label: string; color: string }> = [
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'text-[#686D79]' },
  { key: 'EXPLORING', label: 'Exploring', color: 'text-blue-600' },
  { key: 'PREPARING', label: 'Preparing', color: 'text-[#8B5CF6]' },
  { key: 'WORKING', label: 'In Progress', color: 'text-amber-600' },
  { key: 'PR_SUBMITTED', label: 'PR Submitted', color: 'text-indigo-600' },
  { key: 'MERGED', label: 'Merged 🎉', color: 'text-emerald-600' },
];

export function IssuesPage() {
  const { token } = useAuth();
  
  const getInitialParams = () => {
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    return {
      tab: (params.get('tab') as 'explore' | 'recommendations' | 'pipeline') || 'explore',
      difficulty: params.get('difficulty') || 'All',
      search: params.get('search') || '',
    };
  };

  const initial = getInitialParams();
  const [activeTab, setActiveTab] = useState<'explore' | 'recommendations' | 'pipeline'>(initial.tab);
  const [issues, setIssues] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [search, setSearch] = useState(initial.search);
  
  // Skill match explainability modal state
  const [selectedIssueForMatch, setSelectedIssueForMatch] = useState<any | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchData, setMatchData] = useState<MatchResult | null>(null);

  // Success alert on merge
  const [mergedNotification, setMergedNotification] = useState<string | null>(null);

  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  // Sync state to URL
  useEffect(() => {
    const urlParams = new URLSearchParams();
    if (activeTab !== 'explore') urlParams.set('tab', activeTab);
    if (difficulty !== 'All') urlParams.set('difficulty', difficulty);
    if (search.trim()) urlParams.set('search', search.trim());
    const qs = urlParams.toString();
    const newPath = qs ? `${window.location.pathname}#issues?${qs}` : `${window.location.pathname}#issues`;
    window.history.replaceState(null, '', newPath);
  }, [activeTab, difficulty, search]);

  // Fetch explore issues
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (difficulty !== 'All') params.append('difficulty', difficulty);
    if (search.trim()) params.append('search', search.trim());

    fetch(`/api/v1/opensource/issues?${params.toString()}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setIssues(json.data.issues || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [difficulty, search]);

  // Fetch recommendations
  const fetchRecommendations = () => {
    if (!token) return;
    setRecommendationsLoading(true);
    fetch('/api/v1/opensource/recommendations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) setRecommendations(json.data || []);
      })
      .catch(console.error)
      .finally(() => setRecommendationsLoading(false));
  };

  // Fetch user pipeline
  const fetchPipeline = () => {
    if (!token) return;
    setPipelineLoading(true);
    fetch('/api/v1/opensource/pipeline', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) setPipeline(json.data.pipeline || []);
      })
      .catch(console.error)
      .finally(() => setPipelineLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'pipeline') {
      fetchPipeline();
    } else if (activeTab === 'recommendations') {
      fetchRecommendations();
    }
  }, [activeTab, token]);

  // Inspect Explainable Match
  const handleInspectMatch = async (issue: any) => {
    setSelectedIssueForMatch(issue);
    setMatchLoading(true);
    setMatchData(null);

    if (!token) {
      setMatchLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/opensource/issues/${issue.id}/match`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMatchData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchLoading(false);
    }
  };

  // Add issue to pipeline
  const handleAddToPipeline = async (issueId: string, stage: PipelineItem['stage'] = 'SHORTLISTED') => {
    if (!token) {
      alert('Please sign in to track issues in your contribution pipeline.');
      return;
    }
    try {
      const res = await fetch('/api/v1/opensource/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ issueId, stage }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPipeline();
        if (selectedIssueForMatch) setSelectedIssueForMatch(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Advance or change pipeline stage
  const handleUpdateStage = async (id: string, newStage: PipelineItem['stage'], currentStage: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/opensource/pipeline/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (data.success) {
        if (newStage === 'MERGED' && currentStage !== 'MERGED') {
          setMergedNotification('Congratulations! Contribution marked as MERGED. Your OSS skill profile has been updated!');
          setTimeout(() => setMergedNotification(null), 6000);
        }
        fetchPipeline();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Remove item from pipeline
  const handleRemoveFromPipeline = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/opensource/pipeline/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchPipeline();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* Merged Celebratory Banner */}
      {mergedNotification && (
        <div className="mb-4 p-4 rounded-xl bg-violet-50 border border-violet-200 text-[#8B5CF6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="size-5 text-[#8B5CF6] shrink-0" />
            <span className="text-xs font-semibold">{mergedNotification}</span>
          </div>
          <button 
            onClick={() => setMergedNotification(null)}
            className="p-1 hover:bg-violet-100 rounded-md transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Open source</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Issues</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Results require a connected source. DevOrbit does not fabricate issues, amounts, deadlines, or activity.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-black/7 bg-white p-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'explore'
                ? 'bg-[#11141B] text-white'
                : 'text-[#686D79] hover:text-[#11141B]'
            }`}
          >
            <ListFilter className="size-3.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-[#11141B] text-white'
                : 'text-[#686D79] hover:text-[#11141B]'
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>AI Matches</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-[#11141B] text-white'
                : 'text-[#686D79] hover:text-[#11141B]'
            }`}
          >
            <Kanban className="size-3.5" />
            <span>Pipeline</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: EXPLORE ISSUES */}
      {activeTab === 'explore' && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[250px_1fr]">
          
          {/* Left Column: Filters */}
          <section className="rounded-xl border border-black/7 bg-white h-fit">
            <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
              <h3 className="text-[11px] font-semibold text-[#11141B]">Filters</h3>
              {(search || difficulty !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setDifficulty('All');
                  }}
                  className="text-[10px] text-[#8B5CF6] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-4 p-4">
              <label className="block">
                <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Search issues</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#999CA3]" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Keywords or topics..."
                    className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] pl-8 pr-2 text-xs text-[#11141B] placeholder:text-[#999CA3] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Difficulty</span>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
                >
                  {difficulties.map(d => (
                    <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </label>

              <div className="pt-2 border-t border-black/5 space-y-2 text-[10px] text-[#686D79]">
                <div className="flex items-center gap-1.5 text-[#11141B] font-medium">
                  <CircleAlert className="size-3.5 text-[#8B5CF6]" />
                  <span>Real GitHub Issues</span>
                </div>
                <p className="leading-relaxed">
                  Every issue references a real repository on GitHub with verified labels and live URLs.
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: Issues List */}
          <section className="rounded-xl border border-black/7 bg-white">
            <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
              <h3 className="text-[11px] font-semibold text-[#11141B]">Open Issues</h3>
              <span className="text-[9px] text-[#999CA3]">
                {loading ? 'Searching...' : `${issues.length} issues available`}
              </span>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-24 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
                  ))}
                </div>
              ) : issues.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-5 py-8 text-center">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                    <CircleAlert className="size-5" />
                  </span>
                  <h3 className="mt-4 text-xs font-semibold text-[#11141B]">No issues match your criteria</h3>
                  <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                    Try loosening your difficulty level or clearing the search keyword.
                  </p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setDifficulty('All');
                    }}
                    className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.map(issue => (
                    <div
                      key={issue.id}
                      className="group flex flex-col justify-between gap-3 rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-[#686D79]">
                              {getCleanRepoName(issue.repository, issue.url)}
                            </span>
                            <span className="text-black/20">/</span>
                            <span className="text-xs font-mono text-[#8B5CF6]">#{issue.number}</span>
                            {issue.difficulty && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F7F7F8] text-[#686D79] border border-black/6">
                                {issue.difficulty}
                              </span>
                            )}
                          </div>

                          <h4 className="mt-1 text-sm font-semibold text-[#11141B] group-hover:text-[#8B5CF6] transition-colors">
                            {issue.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleInspectMatch(issue)}
                            className="inline-flex items-center gap-1 rounded-md border border-black/8 bg-[#F7F7F8] px-2.5 py-1 text-xs font-medium text-[#11141B] hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6] transition-colors"
                            title="Inspect AI skill fit"
                          >
                            <Sparkles className="size-3 text-[#8B5CF6]" />
                            <span>Match</span>
                          </button>

                          <button
                            onClick={() => handleAddToPipeline(issue.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-black/9 bg-white px-2.5 py-1 text-xs font-medium text-[#11141B] hover:bg-zinc-50 transition-colors"
                            title="Add to personal pipeline"
                          >
                            <Plus className="size-3" />
                            <span>Track</span>
                          </button>

                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-black/9 bg-[#11141B] px-2.5 py-1 text-xs font-medium text-white hover:bg-black transition-colors"
                          >
                            <span>GitHub</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>

                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {issue.labels.slice(0, 4).map((label: any, idx: number) => {
                            const name = typeof label === 'string' ? label : label.name;
                            return (
                              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F7F7F8] text-[#686D79] border border-black/5">
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      )}

      {/* VIEW 2: AI RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-black/7 bg-white p-5">
            <div className="flex items-center justify-between border-b border-black/7 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">Grounded Skill Matches</h3>
                <p className="mt-1 text-xs text-[#686D79]">
                  Issues matched to your verified GitHub repositories, solved DSA topics, and demonstrated tech stack.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchRecommendations} icon={<Sparkles className="size-3 text-[#8B5CF6]" />}>
                Refresh Matches
              </Button>
            </div>

            <div className="mt-5">
              {recommendationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-28 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <div className="py-12 text-center">
                  <Sparkles className="size-8 text-[#8B5CF6] mx-auto" />
                  <h4 className="mt-3 text-sm font-semibold text-[#11141B]">No recommendations yet</h4>
                  <p className="mt-1 text-xs text-[#686D79] max-w-md mx-auto">
                    Connect your GitHub account or log solved problem competencies in DevOrbit to receive tailored open-source recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recommendations.map(rec => (
                    <div
                      key={rec.id}
                      className="rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0EDFA] text-[#8B5CF6] border border-[#8B5CF6]/20">
                              {Math.round(rec.matchScore || 85)}% Match
                            </span>
                            <span className="text-xs font-mono text-[#686D79]">
                              {getCleanRepoName(rec.issue?.repository, rec.issue?.url)}
                            </span>
                          </div>
                          <h4 className="mt-1.5 text-sm font-semibold text-[#11141B]">{rec.issue?.title}</h4>
                          <p className="mt-1 text-xs text-[#686D79]">{rec.explanation || 'Strong overlap with your demonstrated skill profile.'}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAddToPipeline(rec.issue?.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-black/9 bg-white px-2.5 py-1 text-xs font-medium text-[#11141B] hover:bg-zinc-50 transition-colors"
                          >
                            <Plus className="size-3" />
                            <span>Track</span>
                          </button>
                          <a
                            href={rec.issue?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-black/9 bg-[#11141B] px-2.5 py-1 text-xs font-medium text-white hover:bg-black transition-colors"
                          >
                            <span>Solve</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-black/7 bg-white p-4">
            <div className="flex items-center justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">Contribution Kanban Pipeline</h3>
                <p className="mt-0.5 text-xs text-[#686D79]">Track active open-source issues from triage to PR merged</p>
              </div>
              <span className="text-xs font-mono text-[#8B5CF6] font-medium">{pipeline.length} Tracked</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {PIPELINE_STAGES.map(stage => {
                const itemsInStage = pipeline.filter(p => p.stage === stage.key);
                return (
                  <div key={stage.key} className="rounded-xl border border-black/7 bg-[#F7F7F8] p-3 flex flex-col justify-between min-h-[380px]">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-black/6">
                        <span className={`text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                        <span className="flex size-5 items-center justify-center rounded-full bg-white border border-black/6 text-[10px] font-mono font-medium text-[#686D79]">
                          {itemsInStage.length}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        {itemsInStage.map(item => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-black/7 bg-white p-2.5 shadow-2xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <span className="text-[10px] font-mono text-[#686D79] truncate">
                                {getCleanRepoName(item.issue?.repository, item.issue?.url)}
                              </span>
                              <button
                                onClick={() => handleRemoveFromPipeline(item.id)}
                                className="text-[#999CA3] hover:text-red-500 p-0.5"
                                title="Remove"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>

                            <h5 className="text-xs font-medium text-[#11141B] line-clamp-2 leading-snug">
                              {item.issue?.title || 'Tracked Issue'}
                            </h5>

                            {/* Stage advance controls */}
                            <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                              {stage.key !== 'MERGED' ? (
                                <select
                                  value={item.stage}
                                  onChange={e => handleUpdateStage(item.id, e.target.value as any, item.stage)}
                                  className="text-[9px] rounded border border-black/8 bg-[#F7F7F8] px-1 py-0.5 text-[#11141B]"
                                >
                                  {PIPELINE_STAGES.map(s => (
                                    <option key={s.key} value={s.key}>{s.label}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-[10px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                                  <Check className="size-3" /> Done
                                </span>
                              )}

                              {item.issue?.url && (
                                <a
                                  href={item.issue.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#999CA3] hover:text-[#11141B]"
                                >
                                  <ExternalLink className="size-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-black/6 text-center">
                      <button
                        onClick={() => setActiveTab('explore')}
                        className="text-[10px] text-[#686D79] hover:text-[#11141B] hover:underline"
                      >
                        + Find more issues
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Skill Match Explainability Modal */}
      {selectedIssueForMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-black/7 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#8B5CF6] uppercase tracking-wider font-semibold">AI Skill Fit Provenance</span>
                <h3 className="text-base font-semibold text-[#11141B] mt-0.5">{selectedIssueForMatch.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIssueForMatch(null)}
                className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B] hover:bg-zinc-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {matchLoading ? (
              <div className="py-8 text-center space-y-2">
                <div className="size-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#686D79]">Calculating grounded skill vector overlap...</p>
              </div>
            ) : matchData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0EDFA] border border-[#8B5CF6]/20">
                  <span className="text-xs font-medium text-[#11141B]">Calculated Match Score</span>
                  <span className="text-lg font-bold font-mono text-[#8B5CF6]">{matchData.matchScore}%</span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-[#11141B] mb-1.5">Matched Competencies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.matchedSkills?.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs font-mono bg-violet-50 text-[#8B5CF6] border border-violet-200">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {matchData.missingSkills && matchData.missingSkills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#11141B] mb-1.5">Growth Opportunities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.missingSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-xs font-mono bg-[#F7F7F8] text-[#686D79] border border-black/6">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#F7F7F8] border border-black/7 text-xs text-[#686D79] leading-relaxed">
                  {matchData.explanation}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#686D79]">Sign in to compare this issue against your real skill history.</p>
            )}

            <div className="pt-4 border-t border-black/7 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedIssueForMatch(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAddToPipeline(selectedIssueForMatch.id)}
                icon={<Plus className="size-3.5" />}
              >
                Track in Pipeline
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
