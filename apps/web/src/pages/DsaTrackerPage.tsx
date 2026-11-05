import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  RotateCw, 
  Circle, 
  Clock, 
  ExternalLink, 
  Filter, 
  BrainCircuit, 
  Search,
  BookOpen,
  Edit3,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Calendar,
  Layers,
  Upload,
  Download,
  Flame,
  Award,
  ChevronRight,
  X,
  Code2,
  Tag,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, PageHeading, StatusBadge, Button } from '../components/ui/index.js';

interface Problem {
  id: string;
  externalId?: string;
  platform: string;
  title: string;
  slug: string;
  canonicalSlug?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  subtopic?: string;
  url: string;
  sheetCategory?: string;
  tags?: string[];
  userProgress?: {
    id: string;
    status: 'TODO' | 'ATTEMPTED' | 'SOLVED' | 'REVISE';
    solutionMode?: 'INDEPENDENT' | 'WITH_HINTS' | 'WITH_EDITORIAL' | 'WITH_AI' | 'REATTEMPTED' | 'FAILED';
    masteryScore: number;
    confidenceRating?: number;
    repetitionCount: number;
    easeFactor: number;
    reviewIntervalDays: number;
    nextReviewDate?: string;
    notes?: string;
    codeSnippet?: string;
    repeatedMistakes?: string[];
  };
}

export function DsaTrackerPage() {
  const { token } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [revisionQueue, setRevisionQueue] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedSheet, setSelectedSheet] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modals
  const [solveModalProblem, setSolveModalProblem] = useState<Problem | null>(null);
  const [solutionMode, setSolutionMode] = useState<'INDEPENDENT' | 'WITH_HINTS' | 'WITH_EDITORIAL' | 'WITH_AI'>('INDEPENDENT');
  const [confidenceRating, setConfidenceRating] = useState<number>(4);
  const [solveNotes, setSolveNotes] = useState('');
  const [solveCode, setSolveCode] = useState('');
  const [timeSpentMins, setTimeSpentMins] = useState<number>(15);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'CSV' | 'JSON'>('CSV');
  const [importContent, setImportContent] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const topics = ['All', 'Array', 'String', 'Binary Tree', 'Graph', 'Dynamic Programming', 'Binary Search', 'Stack', 'Intervals'];
  const commonMistakes = ['off-by-one', 'edge-case-empty', 'integer-overflow', 'tle-brute-force', 'null-pointer', 'recursion-stack'];

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: '1',
      limit: '50',
    });
    if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
    if (selectedTopic !== 'All') params.append('topic', selectedTopic);
    if (selectedSheet !== 'ALL') params.append('sheetCategory', selectedSheet);
    if (search) params.append('search', search);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/v1/dsa/problems?${params.toString()}`, { headers });
      const json = await res.json();
      if (json.success) {
        setProblems(json.data.problems);
      }
    } catch (err) {
      console.error('Failed to load problems', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/dsa/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  const fetchRevisionQueue = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/dsa/revision-queue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setRevisionQueue(json.data.dueItems || []);
      }
    } catch (err) {
      console.error('Failed to fetch revision queue', err);
    }
  };

  const fetchRecommendations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/dsa/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setRecommendations(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAnalytics();
    fetchRevisionQueue();
    fetchRecommendations();
  }, [selectedSheet, selectedDifficulty, selectedTopic, search, token]);

  const openSolveModal = (prob: Problem) => {
    setSolveModalProblem(prob);
    if (prob.userProgress) {
      setSolutionMode((prob.userProgress.solutionMode as any) || 'INDEPENDENT');
      setConfidenceRating(prob.userProgress.confidenceRating || 4);
      setSolveNotes(prob.userProgress.notes || '');
      setSolveCode(prob.userProgress.codeSnippet || '');
      setSelectedMistakes(prob.userProgress.repeatedMistakes || []);
    } else {
      setSolutionMode('INDEPENDENT');
      setConfidenceRating(4);
      setSolveNotes('');
      setSolveCode('');
      setSelectedMistakes([]);
    }
  };

  const handleSaveProgress = async (status: 'SOLVED' | 'ATTEMPTED' | 'REVISE') => {
    if (!solveModalProblem || !token) return;
    try {
      const res = await fetch(`/api/v1/dsa/problems/${solveModalProblem.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          solutionMode,
          confidenceRating,
          notes: solveNotes,
          codeSnippet: solveCode,
          timeSpentMins,
          repeatedMistakes: selectedMistakes,
        }),
      });

      if (res.ok) {
        setSolveModalProblem(null);
        await Promise.all([fetchData(), fetchAnalytics(), fetchRevisionQueue(), fetchRecommendations()]);
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const handleReviewRating = async (problemId: string, rating: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/dsa/problems/${problemId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });
      if (res.ok) {
        await Promise.all([fetchRevisionQueue(), fetchAnalytics()]);
      }
    } catch (err) {
      console.error('Failed to submit recall review', err);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importContent.trim() || !token) return;
    try {
      const content = importType === 'JSON' ? JSON.parse(importContent) : importContent;
      const res = await fetch('/api/v1/dsa/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: importType,
          content,
          defaultCategory: 'CUSTOM',
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setImportStatus(`Successfully imported ${json.data.importedCount} new problems (${json.data.deduplicatedCount} deduplicated)`);
        await fetchData();
        setTimeout(() => setImportModalOpen(false), 1200);
      } else {
        setImportStatus(`Import error: ${json.error?.message}`);
      }
    } catch (err: any) {
      setImportStatus(`Error parsing import: ${err.message}`);
    }
  };

  return (
    <PageContainer>
      
      {/* 1. Header & Sheet Switcher */}
      <PageHeading
        title="DSA Intelligence Command Center"
        description="Unified multi-platform problem catalog, SuperMemo SM-2 transparent spaced review queue, independent vs assisted mastery tracking, and weakness detection"
        icon={BrainCircuit}
        badge={
          <>
            <BrainCircuit className="size-3" />
            <span>Problem-Solving Mastery & Spaced Repetition Engine</span>
          </>
        }
        actions={
          <Button
            onClick={() => setImportModalOpen(true)}
            variant="secondary"
            size="sm"
            icon={Upload}
          >
            Import Sheet
          </Button>
        }
      />

      {/* 2. Top Analytics Metrics & Mastery Radar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solved & Mastery Index */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#686D79]">
            <span>Solved Problems</span>
            <CheckCircle2 className="size-4 text-[#8B5CF6]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F8FAFC]">
            {analytics?.solvedCount || 0}
            <span className="text-sm font-normal text-[#686D79] ml-1">/ {analytics?.totalCatalogProblems || 0}</span>
          </div>
          <div className="text-[11px] text-[#A78BFA] font-mono">
            <span>Independent Mastery Index: {analytics?.averageMasteryScore || 0}%</span>
          </div>
        </div>

        {/* Independent vs Assisted Breakdown */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#686D79]">
            <span>Solution Modes</span>
            <Award className="size-4 text-[#22C55E]" />
          </div>
          <div className="text-3xl font-extrabold text-[#22C55E]">
            {analytics?.solutionModeCounts?.INDEPENDENT || 0}
            <span className="text-xs font-normal text-[#686D79] ml-1.5 font-mono">100% Solo</span>
          </div>
          <div className="text-[11px] text-[#686D79] font-mono">
            <span>{analytics?.solutionModeCounts?.WITH_HINTS || 0} hints, {analytics?.solutionModeCounts?.WITH_EDITORIAL || 0} editorial</span>
          </div>
        </div>

        {/* Spaced Review Queue */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#686D79]">
            <span>Due for SM-2 Review</span>
            <Calendar className="size-4 text-[#60A5FA]" />
          </div>
          <div className="text-3xl font-extrabold text-[#60A5FA]">
            {revisionQueue.length}
            <span className="text-xs font-normal text-[#686D79] ml-1.5 font-mono">problems due</span>
          </div>
          <div className="text-[11px] text-[#60A5FA] font-mono">
            <span>Spaced repetition keeps retention above 90%</span>
          </div>
        </div>

        {/* Identified Weak Topics */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#686D79]">
            <span>Identified Weakness</span>
            <AlertCircle className="size-4 text-[#F76C39]" />
          </div>
          <div className="text-xl font-bold text-[#F8FAFC] truncate">
            {analytics?.weakTopics && analytics.weakTopics.length > 0
              ? analytics.weakTopics[0].topic
              : 'All Solid'}
          </div>
          <div className="text-[11px] text-[#F76C39] font-mono">
            <span>{analytics?.weakTopics?.length || 0} topics need reinforcement</span>
          </div>
        </div>
      </div>

      {/* 3. Spaced Repetition Due Queue (Interactive SM-2 Review Drawer) */}
      {revisionQueue.length > 0 && (
        <div className="bg-[#12151D] border border-[#8B5CF6]/30 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Calendar className="size-4 text-[#8B5CF6]" />
                Today's Spaced Repetition Queue ({revisionQueue.length} Due)
              </h2>
              <p className="text-xs text-[#686D79]">
                Rate your recall quality from 1 to 5 to advance the SuperMemo SM-2 interval.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {revisionQueue.slice(0, 6).map((item: any) => (
              <div
                key={item.id}
                className="bg-[#181C26] border border-[#1F2430] rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#F8FAFC] truncate">{item.problem.title}</span>
                    <StatusBadge
                      variant={
                        item.problem.difficulty === 'EASY' ? 'success' :
                        item.problem.difficulty === 'MEDIUM' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {item.problem.difficulty}
                    </StatusBadge>
                  </div>
                  <div className="text-[11px] text-[#686D79] mt-1 font-mono">
                    Topic: {item.problem.topic} • Interval: {item.reviewIntervalDays}d • Reps: {item.repetitionCount}
                  </div>
                </div>

                {/* SM-2 Recall Rating Buttons */}
                <div className="pt-2 border-t border-[#1F2430] space-y-1.5">
                  <div className="text-[10px] text-[#686D79] font-mono">Submit Recall Rating:</div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                    <button
                      onClick={() => handleReviewRating(item.problem.id, 1)}
                      className="py-1 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] text-center border border-[#EF4444]/30"
                      title="1 - Complete blackout / forgot"
                    >
                      Forgot
                    </button>
                    <button
                      onClick={() => handleReviewRating(item.problem.id, 3)}
                      className="py-1 rounded-lg bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] text-center border border-[#F59E0B]/30"
                      title="3 - Hard recall after struggle"
                    >
                      Hard
                    </button>
                    <button
                      onClick={() => handleReviewRating(item.problem.id, 4)}
                      className="py-1 rounded-lg bg-[#60A5FA]/10 hover:bg-[#60A5FA]/20 text-[#60A5FA] text-center border border-[#60A5FA]/30"
                      title="4 - Good recall with hesitation"
                    >
                      Good
                    </button>
                    <button
                      onClick={() => handleReviewRating(item.problem.id, 5)}
                      className="py-1 rounded-lg bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] text-center border border-[#22C55E]/30"
                      title="5 - Effortless perfect recall"
                    >
                      Easy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Personalized Recommendation Banner */}
      {recommendations && recommendations.problems?.length > 0 && (
        <div className="bg-gradient-to-r from-[#181C26] to-[#12151D] border border-[#8B5CF6]/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A78BFA]">
              <Sparkles className="size-3.5 text-[#8B5CF6]" />
              <span>Recommended Next Focus: {recommendations.focusTopic}</span>
            </div>
            <div className="text-sm font-bold text-[#F8FAFC]">
              {recommendations.reason}
            </div>
            <div className="text-xs text-[#686D79]">
              Solve these foundational problems independently to boost your mastery index.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {recommendations.problems.slice(0, 3).map((p: any) => (
              <button
                key={p.id}
                onClick={() => openSolveModal(p)}
                className="px-3 py-1.5 rounded-xl bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/50 text-xs font-semibold text-[#F8FAFC] transition-colors flex items-center gap-1.5"
              >
                <span>{p.title}</span>
                <ChevronRight className="size-3 text-[#8B5CF6]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Problem Catalog & Sheet Explorer */}
      <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl p-6 space-y-5">
        
        {/* Filters & Sheet Selection Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1F2430]">
          
          {/* Sheet Categories */}
          <div className="flex flex-wrap items-center gap-1 bg-[#181C26] p-1 rounded-2xl border border-[#1F2430]">
            {[
              { id: 'ALL', label: 'All Catalog' },
              { id: 'STRIVER_A2Z', label: 'Striver A2Z' },
              { id: 'BLIND_75', label: 'Blind 75' },
              { id: 'NEETCODE_150', label: 'NeetCode 150' },
              { id: 'CODEFORCES_DIV2', label: 'Codeforces Div 2' },
              { id: 'CUSTOM', label: 'Custom Sheet' },
            ].map(sheet => (
              <button
                key={sheet.id}
                onClick={() => setSelectedSheet(sheet.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedSheet === sheet.id
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-sm'
                    : 'text-[#686D79] hover:text-[#F8FAFC]'
                }`}
              >
                {sheet.label}
              </button>
            ))}
          </div>

          {/* Search & Topic Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-2.5 text-[#686D79]" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#0B0D12] border border-[#1F2430] rounded-xl text-xs text-[#F8FAFC] placeholder-[#686D79] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1.5 bg-[#0B0D12] border border-[#1F2430] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="All">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 bg-[#0B0D12] border border-[#1F2430] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
            >
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Problems Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1F2430] text-[#686D79] font-mono">
                <th className="pb-3 font-medium">STATUS</th>
                <th className="pb-3 font-medium">PROBLEM</th>
                <th className="pb-3 font-medium">TOPIC</th>
                <th className="pb-3 font-medium">DIFFICULTY</th>
                <th className="pb-3 font-medium">SOLUTION MODE</th>
                <th className="pb-3 font-medium">MASTERY</th>
                <th className="pb-3 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2430]/60">
              {problems.map(prob => {
                const status = prob.userProgress?.status || 'TODO';
                const mode = prob.userProgress?.solutionMode;
                const mastery = prob.userProgress?.masteryScore || 0;

                return (
                  <tr key={prob.id} className="hover:bg-[#181C26]/50 transition-colors group">
                    <td className="py-3.5 pr-2">
                      <StatusBadge
                        variant={
                          status === 'SOLVED' ? 'success' :
                          status === 'ATTEMPTED' ? 'warning' :
                          status === 'REVISE' ? 'info' : 'neutral'
                        }
                        size="sm"
                        dot={status === 'SOLVED'}
                      >
                        {status}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-[#F8FAFC]">
                      <div className="flex items-center gap-1.5">
                        <a 
                          href={prob.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="hover:text-[#8B5CF6] transition-colors"
                        >
                          {prob.title}
                        </a>
                        <ExternalLink className="size-3 text-[#686D79] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[10px] text-[#686D79] font-mono">
                        {prob.platform} {prob.subtopic ? `• ${prob.subtopic}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-[#C5C8D0] font-mono">
                      {prob.topic}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge
                        variant={
                          prob.difficulty === 'EASY' ? 'success' :
                          prob.difficulty === 'MEDIUM' ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {prob.difficulty}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 pr-4 text-[#686D79] font-mono">
                      {mode ? (
                        <StatusBadge
                          variant={
                            mode === 'INDEPENDENT' ? 'success' :
                            mode === 'WITH_HINTS' ? 'warning' : 'violet'
                          }
                          size="sm"
                        >
                          {mode}
                        </StatusBadge>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 pr-4 font-mono">
                      {status === 'SOLVED' ? (
                        <span className="text-[#8B5CF6] font-bold">{mastery}%</span>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 text-right">
                      <Button
                        onClick={() => openSolveModal(prob)}
                        variant="secondary"
                        size="sm"
                      >
                        {status === 'TODO' ? 'Log Solve' : 'Update'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal: Problem Solution Mode & Progress Recording */}
      {solveModalProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-black relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSolveModalProblem(null)}
              className="absolute top-4 right-4 text-[#686D79] hover:text-[#F8FAFC] p-1 rounded-xl hover:bg-[#181C26] transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge
                  variant={
                    solveModalProblem.difficulty === 'EASY' ? 'success' :
                    solveModalProblem.difficulty === 'MEDIUM' ? 'warning' : 'danger'
                  }
                  size="sm"
                >
                  {solveModalProblem.difficulty}
                </StatusBadge>
                <span className="text-xs font-mono text-[#686D79]">{solveModalProblem.topic}</span>
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">{solveModalProblem.title}</h3>
            </div>

            {/* Solution Mode Selector (Mandatory for True Mastery Index) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#F8FAFC]">Solution Mode & Assistance Level</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { mode: 'INDEPENDENT', label: '100% Solo Solve', desc: 'No hints, editorials or AI' },
                  { mode: 'WITH_HINTS', label: 'With Hints (65%)', desc: 'Looked at topic hints' },
                  { mode: 'WITH_EDITORIAL', label: 'With Editorial (35%)', desc: 'Read solution breakdown' },
                  { mode: 'WITH_AI', label: 'With AI (20%)', desc: 'AI code generation' },
                ].map(opt => (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => setSolutionMode(opt.mode as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      solutionMode === opt.mode
                        ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-white shadow-sm'
                        : 'bg-[#181C26] border-[#1F2430] text-[#686D79] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className="text-[10px] opacity-75">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Spent & Recall Rating */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F8FAFC]">Time Spent (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={timeSpentMins}
                  onChange={e => setTimeSpentMins(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-1.5 bg-[#0B0D12] border border-[#1F2430] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F8FAFC]">Recall Rating (1-5)</label>
                <select
                  value={confidenceRating}
                  onChange={e => setConfidenceRating(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 bg-[#0B0D12] border border-[#1F2430] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value={5}>5 - Effortless Master</option>
                  <option value={4}>4 - Good Recall</option>
                  <option value={3}>3 - Hard Recall</option>
                  <option value={2}>2 - Struggled</option>
                  <option value={1}>1 - Total Blackout</option>
                </select>
              </div>
            </div>

            {/* Repeated Mistakes Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC]">Tag Repeated Mistakes (If any)</label>
              <div className="flex flex-wrap gap-1.5">
                {commonMistakes.map(m => {
                  const active = selectedMistakes.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMistakes(prev =>
                          active ? prev.filter(x => x !== m) : [...prev, m]
                        );
                      }}
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition-colors ${
                        active
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                          : 'bg-[#181C26] border-[#1F2430] text-[#686D79] hover:text-[#C5C8D0]'
                      }`}
                    >
                      #{m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes & Code Snippet */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC]">Key Insights / Notes</label>
              <textarea
                rows={2}
                placeholder="Key realization, time complexity, or edge case trick..."
                value={solveNotes}
                onChange={e => setSolveNotes(e.target.value)}
                className="w-full p-3 bg-[#0B0D12] border border-[#1F2430] rounded-xl text-xs text-[#F8FAFC] placeholder-[#686D79] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1F2430]">
              <Button
                type="button"
                onClick={() => handleSaveProgress('REVISE')}
                variant="outline"
                size="sm"
              >
                Needs Revision
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => handleSaveProgress('ATTEMPTED')}
                  variant="secondary"
                  size="sm"
                >
                  Save Attempt
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSaveProgress('SOLVED')}
                  variant="primary"
                  size="sm"
                >
                  Mark Solved
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Sheet Import */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12151D] border border-[#1F2430] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-black relative">
            <button
              onClick={() => setImportModalOpen(false)}
              className="absolute top-4 right-4 text-[#686D79] hover:text-[#F8FAFC] p-1 rounded-xl hover:bg-[#181C26] transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#F8FAFC]">Import DSA Problem Sheet</h3>
              <p className="text-xs text-[#686D79]">
                Import custom problem sets or sheets via CSV or JSON format with automatic deduplication.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImportType('CSV')}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold ${
                  importType === 'CSV' ? 'bg-[#8B5CF6] text-white' : 'bg-[#181C26] text-[#686D79]'
                }`}
              >
                CSV Format
              </button>
              <button
                type="button"
                onClick={() => setImportType('JSON')}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold ${
                  importType === 'JSON' ? 'bg-[#8B5CF6] text-white' : 'bg-[#181C26] text-[#686D79]'
                }`}
              >
                JSON Format
              </button>
            </div>

            <form onSubmit={handleImport} className="space-y-4">
              <textarea
                rows={6}
                placeholder={
                  importType === 'CSV'
                    ? 'title,platform,difficulty,topic,subtopic,url\nTwo Sum,LEETCODE,EASY,Array,Hash Table,https://leetcode.com/problems/two-sum/'
                    : '[{ "title": "Two Sum", "difficulty": "EASY", "topic": "Array" }]'
                }
                value={importContent}
                onChange={e => setImportContent(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-[#0B0D12] border border-[#1F2430] rounded-xl text-[#F8FAFC] placeholder-[#686D79] focus:outline-none focus:border-[#8B5CF6]"
                required
              />

              {importStatus && (
                <div className="text-xs font-mono text-[#A78BFA] bg-[#8B5CF6]/10 p-2.5 rounded-xl border border-[#8B5CF6]/30">
                  {importStatus}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Import Problems
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageContainer>
  );
}
