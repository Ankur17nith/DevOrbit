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

const PIPELINE_STAGES: Array<{ key: PipelineItem['stage']; label: string; color: string }> = [
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-slate-500/30 text-slate-400' },
  { key: 'EXPLORING', label: 'Exploring', color: 'border-blue-500/30 text-blue-400' },
  { key: 'PREPARING', label: 'Preparing', color: 'border-indigo-500/30 text-indigo-400' },
  { key: 'WORKING', label: 'In Progress', color: 'border-amber-500/30 text-amber-400' },
  { key: 'PR_SUBMITTED', label: 'PR Submitted', color: 'border-purple-500/30 text-purple-400' },
  { key: 'MERGED', label: 'Merged 🎉', color: 'border-emerald-500/30 text-emerald-400' },
];

export function IssuesPage() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'pipeline'>('explore');
  const [issues, setIssues] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('All');
  const [search, setSearch] = useState('');
  
  // Skill match explainability modal state
  const [selectedIssueForMatch, setSelectedIssueForMatch] = useState<any | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchData, setMatchData] = useState<MatchResult | null>(null);

  // Success alert on merge
  const [mergedNotification, setMergedNotification] = useState<string | null>(null);

  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  // Fetch explore issues
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (difficulty !== 'All') params.append('difficulty', difficulty);
    if (search) params.append('search', search);

    fetch(`/api/v1/opensource/issues?${params.toString()}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setIssues(json.data.issues);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [difficulty, search]);

  // Fetch user pipeline
  const fetchPipeline = () => {
    if (!token) return;
    setPipelineLoading(true);
    fetch('/api/v1/opensource/pipeline', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) setPipeline(json.data.pipeline);
      })
      .catch(console.error)
      .finally(() => setPipelineLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'pipeline') {
      fetchPipeline();
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
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Merged Celebratory Banner */}
      {mergedNotification && (
        <div className="p-4 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <Award className="size-5 text-[#22C55E] shrink-0" />
            <span className="text-sm font-semibold">{mergedNotification}</span>
          </div>
          <button 
            onClick={() => setMergedNotification(null)}
            className="p-1 hover:bg-[#22C55E]/20 rounded-lg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CircleAlert className="size-6 text-[#8B5CF6]" />
            <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">Orbit OSS Intelligence</h1>
          </div>
          <p className="text-xs text-[#686D79] mt-1">
            Explainable skill-matched issues, verified good-first-issues, and personal contribution pipeline
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#12151D] border border-[#1F2430]">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
                : 'text-[#686D79] hover:text-[#C5C8D0]'
            }`}
          >
            <ListFilter className="size-3.5" />
            <span>Explore Issues</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'pipeline'
                ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
                : 'text-[#686D79] hover:text-[#C5C8D0]'
            }`}
          >
            <Kanban className="size-3.5" />
            <span>Contribution Pipeline</span>
            {pipeline.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                {pipeline.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: EXPLORE ISSUES */}
      {activeTab === 'explore' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#12151D] border border-[#1F2430]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by keywords, repository, or tags..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-mono text-[#686D79] uppercase tracking-wider mr-1">Difficulty:</span>
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    difficulty === d
                      ? 'bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/40 font-semibold'
                      : 'text-[#686D79] hover:text-[#F8FAFC] border border-transparent'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Issues List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-2xl bg-[#12151D] border border-[#1F2430]">
              <CircleAlert className="size-8 text-[#686D79] mx-auto" />
              <h3 className="mt-3 text-sm font-semibold text-[#F8FAFC]">No open issues found</h3>
              <p className="mt-1 text-xs text-[#686D79]">Try loosening your search filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map(issue => (
                <div
                  key={issue.id}
                  className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-[#8B5CF6] font-medium">{issue.repository?.fullName}</span>
                      <span className="text-xs font-mono text-[#686D79]">#{issue.number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        issue.difficulty === 'beginner' 
                          ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' 
                          : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                      }`}>
                        {issue.difficulty || 'Good First Issue'}
                      </span>
                      {issue.repository?.primaryLanguage && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181C26] text-[#A78BFA] border border-[#1F2430]">
                          {issue.repository.primaryLanguage}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[#F8FAFC] hover:text-[#A78BFA] transition-colors">
                      {issue.title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {issue.labels?.map((label: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181C26] text-[#C5C8D0] border border-[#1F2430]"
                        >
                          {typeof label === 'string' ? label : label.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    {/* Explain Skill Match Button */}
                    <button
                      onClick={() => handleInspectMatch(issue)}
                      className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-xs font-medium text-[#A78BFA] flex items-center gap-1.5 transition-all"
                      title="Inspect explainable skill match"
                    >
                      <Sparkles className="size-3.5" />
                      <span>Skill Fit</span>
                    </button>

                    {/* Add to Pipeline Button */}
                    <button
                      onClick={() => handleAddToPipeline(issue.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
                      title="Add to personal contribution pipeline"
                    >
                      <Plus className="size-3.5 text-[#8B5CF6]" />
                      <span>Track</span>
                    </button>

                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#C5C8D0] hover:text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONTRIBUTION PIPELINE (KANBAN BOARD) */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {!token ? (
            <div className="text-center py-16 p-6 rounded-2xl bg-[#12151D] border border-[#1F2430]">
              <Kanban className="size-8 text-[#8B5CF6] mx-auto mb-3" />
              <h3 className="text-base font-semibold text-[#F8FAFC]">Sign In Required</h3>
              <p className="text-xs text-[#686D79] mt-1 max-w-sm mx-auto">
                Sign in to manage your active open source issues through Shortlist, Exploration, PR submission, and Merge tracking.
              </p>
            </div>
          ) : pipelineLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map(stage => {
                const itemsInStage = pipeline.filter(item => item.stage === stage.key);
                return (
                  <div
                    key={stage.key}
                    className="flex flex-col bg-[#12151D] border border-[#1F2430] rounded-xl min-w-[220px] max-w-full"
                  >
                    {/* Stage Header */}
                    <div className="p-3 border-b border-[#1F2430] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${stage.color}`}>
                          {stage.label}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#181C26] text-[#686D79] border border-[#1F2430]">
                        {itemsInStage.length}
                      </span>
                    </div>

                    {/* Stage Items */}
                    <div className="p-2.5 flex-1 space-y-2.5 min-h-[300px]">
                      {itemsInStage.length === 0 ? (
                        <div className="h-24 flex items-center justify-center text-[11px] text-[#686D79] border border-dashed border-[#1F2430] rounded-lg">
                          No issues
                        </div>
                      ) : (
                        itemsInStage.map(item => (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] hover:border-[#2E364A] transition-all space-y-2 text-xs shadow-sm"
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#686D79]">
                              <span className="truncate max-w-[130px] text-[#8B5CF6]">
                                {item.issue?.repository?.fullName || 'External Repo'}
                              </span>
                              <span>#{item.issue?.number}</span>
                            </div>

                            <h4 className="font-medium text-[#F8FAFC] line-clamp-2 leading-snug">
                              {item.issue?.title || 'Tracked Opportunity'}
                            </h4>

                            {item.notes && (
                              <p className="text-[11px] text-[#686D79] italic line-clamp-2 bg-[#12151D] p-1.5 rounded border border-[#1F2430]">
                                {item.notes}
                              </p>
                            )}

                            {/* Stage Controls */}
                            <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between gap-1">
                              {/* Advance Stage Button */}
                              {stage.key !== 'MERGED' ? (
                                <button
                                  onClick={() => {
                                    const currentIndex = PIPELINE_STAGES.findIndex(s => s.key === stage.key);
                                    if (currentIndex < PIPELINE_STAGES.length - 1) {
                                      handleUpdateStage(item.id, PIPELINE_STAGES[currentIndex + 1].key, stage.key);
                                    }
                                  }}
                                  className="px-2 py-1 rounded bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 text-[#A78BFA] text-[10px] font-medium flex items-center gap-1 transition-colors"
                                  title="Advance to next pipeline stage"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="size-2.5" />
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#22C55E]">
                                  <CheckCircle2 className="size-3" />
                                  <span>Merged</span>
                                </span>
                              )}

                              <button
                                onClick={() => handleRemoveFromPipeline(item.id)}
                                className="p-1 text-[#686D79] hover:text-[#EF4444] rounded transition-colors"
                                title="Remove from pipeline"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EXPLAINABLE SKILL MATCH MODAL */}
      {selectedIssueForMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#12151D] border border-[#1F2430] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F2430] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC]">Explainable Skill Match</h3>
                  <p className="text-xs text-[#686D79]">Algorithmic fit analysis against your verified skills</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIssueForMatch(null)}
                className="p-1 rounded-lg text-[#686D79] hover:text-[#F8FAFC] transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Target Issue Context */}
            <div className="p-3 rounded-xl bg-[#181C26] border border-[#1F2430] space-y-1">
              <div className="text-xs font-mono text-[#8B5CF6]">
                {selectedIssueForMatch.repository?.fullName} #{selectedIssueForMatch.number}
              </div>
              <div className="text-sm font-semibold text-[#F8FAFC] line-clamp-2">
                {selectedIssueForMatch.title}
              </div>
            </div>

            {/* Match Analysis Content */}
            {!token ? (
              <div className="p-4 rounded-xl bg-[#181C26] border border-[#1F2430] text-center space-y-2">
                <Info className="size-6 text-[#8B5CF6] mx-auto" />
                <p className="text-xs text-[#C5C8D0]">
                  Please sign in to analyze your verified GitHub skills against this issue's tech stack.
                </p>
              </div>
            ) : matchLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="size-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin" />
                <span className="text-xs text-[#686D79]">Computing verified skill alignment...</span>
              </div>
            ) : matchData ? (
              <div className="space-y-4">
                {/* Score Banner */}
                <div className="p-4 rounded-xl bg-[#181C26] border border-[#1F2430] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#C5C8D0]">Overall Match Score</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold font-mono ${
                      matchData.matchScore >= 70 ? 'text-[#22C55E]' :
                      matchData.matchScore >= 40 ? 'text-[#F59E0B]' : 'text-[#8B5CF6]'
                    }`}>
                      {matchData.matchScore}%
                    </span>
                    <span className="text-xs text-[#686D79]">Fit</span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#1F2430] text-xs text-[#C5C8D0] leading-relaxed">
                  {matchData.explanation}
                </div>

                {/* Matched Skills */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#686D79] mb-1.5">
                    Matched Skills ({matchData.matchedSkills.length})
                  </h4>
                  {matchData.matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.matchedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded text-xs font-mono bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1"
                        >
                          <Check className="size-3" />
                          <span>{s}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[#686D79]">No direct skill overlap found in your profile.</span>
                  )}
                </div>

                {/* Missing Skills */}
                {matchData.missingSkills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#686D79] mb-1.5">
                      Recommended Prerequisite Skills ({matchData.missingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded text-xs font-mono bg-[#181C26] text-[#686D79] border border-[#1F2430]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#686D79]">Unable to compute skill match at this moment.</p>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2430]">
              <button
                onClick={() => setSelectedIssueForMatch(null)}
                className="px-4 py-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#C5C8D0] transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => handleAddToPipeline(selectedIssueForMatch.id)}
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="size-3.5" />
                <span>Track in Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
