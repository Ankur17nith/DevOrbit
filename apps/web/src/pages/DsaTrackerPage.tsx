import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  RotateCw, 
  Circle, 
  Clock, 
  ExternalLink, 
  Filter, 
  Search,
  BookOpen,
  Sparkles, 
  Upload, 
  Download, 
  Plus, 
  X,
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer } from '../components/ui/PageContainer.js';

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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'CSV' | 'JSON'>('CSV');
  const [importContent, setImportContent] = useState('');

  const topics = ['All', 'Array', 'String', 'Binary Tree', 'Graph', 'Dynamic Programming', 'Binary Search', 'Stack', 'Intervals'];

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

  useEffect(() => {
    fetchData();
    fetchAnalytics();
    fetchRevisionQueue();
  }, [selectedSheet, selectedDifficulty, selectedTopic, search, token]);

  const openSolveModal = (prob: Problem) => {
    setSolveModalProblem(prob);
    if (prob.userProgress) {
      setSolutionMode((prob.userProgress.solutionMode as any) || 'INDEPENDENT');
      setConfidenceRating(prob.userProgress.confidenceRating || 4);
      setSolveNotes(prob.userProgress.notes || '');
      setSolveCode(prob.userProgress.codeSnippet || '');
    } else {
      setSolutionMode('INDEPENDENT');
      setConfidenceRating(4);
      setSolveNotes('');
      setSolveCode('');
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
        }),
      });

      if (res.ok) {
        setSolveModalProblem(null);
        await Promise.all([fetchData(), fetchAnalytics(), fetchRevisionQueue()]);
      }
    } catch (err) {
      console.error('Failed to update progress', err);
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
      if (json.success) {
        setImportModalOpen(false);
        setImportContent('');
        fetchData();
      }
    } catch (err) {
      console.error('Import failed', err);
    }
  };

  const solvedCount = analytics?.totalSolved || problems.filter(p => p.userProgress?.status === 'SOLVED').length || 0;
  const dueCount = analytics?.dueForReview || revisionQueue.length || 0;
  const platformsCount = analytics?.activePlatforms?.length || (problems.length > 0 ? 1 : 0);

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Learning</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">Orbit DSA</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Problem-solving data appears only after you add or import it.
          </p>
        </div>

        <button 
          onClick={() => setImportModalOpen(true)}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#11141B] px-4 text-[10px] font-semibold text-white hover:bg-black transition-colors"
        >
          <Plus className="size-3.5" />
          <span>Add problem</span>
        </button>
      </div>

      {/* 2. 3 KPI Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">Total solved</p>
          <p className="mt-5 text-2xl font-semibold text-[#0B0D12]">{solvedCount}</p>
          <p className="mt-1 text-[9px] text-[#858993]">
            {solvedCount === 0 ? 'No data recorded' : `${analytics?.independentSolves || 0} independent / ${analytics?.assistedSolves || 0} assisted`}
          </p>
        </div>

        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">Revision due</p>
          <p className="mt-5 text-2xl font-semibold text-[#0B0D12]">{dueCount}</p>
          <p className="mt-1 text-[9px] text-[#858993]">
            {dueCount === 0 ? 'No data recorded' : 'SuperMemo SM-2 scheduled today'}
          </p>
        </div>

        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9699A1]">Active platforms</p>
          <p className="mt-5 text-2xl font-semibold text-[#0B0D12]">{platformsCount}</p>
          <p className="mt-1 text-[9px] text-[#858993]">
            {platformsCount === 0 ? 'No data recorded' : 'LeetCode, Codeforces, TUF'}
          </p>
        </div>
      </div>

      {/* 3. Problems Section */}
      <section className="rounded-xl border border-black/7 bg-white mt-4 overflow-hidden">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <h3 className="text-[11px] font-semibold text-[#0B0D12]">Problems</h3>
          <span className="text-[9px] text-[#999CA3]">{problems.length} records</span>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2 border-b border-black/7 p-3 bg-[#F9FAFB]">
          <div className="flex flex-1 items-center gap-2 rounded-md bg-white border border-black/8 px-3">
            <Search className="size-3.5 text-[#999CA3]" />
            <input 
              placeholder="Search problems…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 w-full bg-transparent text-[10px] text-[#0B0D12] outline-none placeholder:text-[#999CA3]"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="h-8 rounded-md border border-black/8 bg-white px-2.5 text-[9px] text-[#0B0D12] outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="h-8 rounded-md border border-black/8 bg-white px-2.5 text-[9px] text-[#0B0D12] outline-none"
            >
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button 
              onClick={() => {
                const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problems, null, 2));
                const a = document.createElement('a');
                a.href = jsonStr;
                a.download = 'devorbit_dsa_problems.json';
                a.click();
              }}
              className="rounded-md border border-black/8 bg-white px-3 text-[9px] font-semibold text-[#0B0D12] hover:bg-black/5 transition"
            >
              Export
            </button>
          </div>
        </div>

        {problems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-black/7 text-[8px] font-bold uppercase tracking-wider text-[#9699A1] bg-[#F9FAFB]">
                  <th className="py-2.5 px-4">Problem</th>
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Difficulty</th>
                  <th className="py-2.5 px-3">SM-2 Interval</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/7">
                {problems.map(prob => {
                  const status = prob.userProgress?.status || 'TODO';
                  return (
                    <tr key={prob.id} className="hover:bg-[#F8F8FA] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0B0D12]">{prob.title}</div>
                        <div className="text-[9px] text-[#858993] flex items-center gap-2 mt-0.5">
                          <span className="font-mono uppercase">{prob.platform}</span>
                          {prob.url && (
                            <a 
                              href={prob.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[#8B5CF6] hover:underline flex items-center gap-0.5"
                            >
                              Open <ExternalLink className="size-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-[#686D79] font-medium">{prob.topic}</td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                          prob.difficulty === 'EASY' ? 'bg-[#EBF7EE] text-[#1E8A38]' :
                          prob.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {prob.difficulty}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[#858993] font-mono">
                        {prob.userProgress?.reviewIntervalDays 
                          ? `${prob.userProgress.reviewIntervalDays}d interval` 
                          : 'Not queued'}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-semibold ${
                          status === 'SOLVED' ? 'text-[#1E8A38]' :
                          status === 'ATTEMPTED' ? 'text-amber-700' :
                          'text-[#858993]'
                        }`}>
                          <span className={`size-1.5 rounded-full ${
                            status === 'SOLVED' ? 'bg-[#1E8A38]' :
                            status === 'ATTEMPTED' ? 'bg-amber-500' :
                            'bg-[#D9DADE]'
                          }`} />
                          {status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openSolveModal(prob)}
                          className="px-2.5 py-1 rounded bg-[#11141B] hover:bg-black text-white text-[9px] font-semibold transition"
                        >
                          {status === 'SOLVED' ? 'Review' : 'Log solve'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
              <BookOpen className="size-4.5" />
            </span>
            <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">No tracked problems</h3>
            <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
              Add a problem manually or import CSV/JSON. Imports include preview, column mapping, and duplicate detection before records are created.
            </p>
          </div>
        )}
      </section>

      {/* Solve / Log Modal */}
      {solveModalProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-black/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/7 pb-3">
              <div>
                <h4 className="text-xs font-semibold text-[#0B0D12]">{solveModalProblem.title}</h4>
                <span className="text-[9px] text-[#858993]">SuperMemo SM-2 Spaced Repetition Logger</span>
              </div>
              <button onClick={() => setSolveModalProblem(null)} className="text-[#858993] hover:text-[#0B0D12]">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#9699A1] block mb-1">
                  Solution Mode
                </label>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {(['INDEPENDENT', 'WITH_HINTS', 'WITH_EDITORIAL', 'WITH_AI'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSolutionMode(mode)}
                      className={`p-2 rounded-md border text-left transition ${
                        solutionMode === mode 
                          ? 'border-[#8B5CF6] bg-[#F0EDFA] text-[#6D3FE0] font-semibold' 
                          : 'border-black/8 bg-[#F9FAFB] text-[#686D79]'
                      }`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#9699A1] block mb-1">
                  Recall Quality (0-5 SM-2 Scale)
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(q => (
                    <button
                      key={q}
                      onClick={() => setConfidenceRating(q)}
                      className={`flex-1 py-1.5 rounded-md border text-xs font-mono font-semibold transition ${
                        confidenceRating === q 
                          ? 'border-[#11141B] bg-[#11141B] text-white' 
                          : 'border-black/8 bg-[#F9FAFB] text-[#686D79]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#9699A1] block mb-1">
                  Time Spent (Minutes)
                </label>
                <input 
                  type="number" 
                  value={timeSpentMins}
                  onChange={e => setTimeSpentMins(Number(e.target.value))}
                  className="w-full h-8 px-3 rounded-md border border-black/8 text-xs text-[#0B0D12]"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#9699A1] block mb-1">
                  Notes / Core Invariant
                </label>
                <textarea 
                  value={solveNotes}
                  onChange={e => setSolveNotes(e.target.value)}
                  placeholder="Key observations, edge cases, time/space complexity..."
                  className="w-full h-20 p-2 rounded-md border border-black/8 text-[10px] text-[#0B0D12] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-black/7">
              <button
                onClick={() => handleSaveProgress('SOLVED')}
                className="flex-1 py-2 rounded-md bg-[#11141B] hover:bg-black text-white text-[10px] font-semibold transition"
              >
                Save as Solved
              </button>
              <button
                onClick={() => handleSaveProgress('REVISE')}
                className="px-4 py-2 rounded-md border border-black/8 text-[#0B0D12] text-[10px] font-semibold hover:bg-black/5 transition"
              >
                Mark for Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-black/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/7 pb-3">
              <div>
                <h4 className="text-xs font-semibold text-[#0B0D12]">Import Problems</h4>
                <span className="text-[9px] text-[#858993]">Paste CSV or JSON with title, platform, difficulty, topic</span>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-[#858993] hover:text-[#0B0D12]">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleImport} className="space-y-3">
              <div className="flex gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setImportType('CSV')}
                  className={`px-3 py-1 rounded border font-semibold ${
                    importType === 'CSV' ? 'bg-[#11141B] text-white' : 'border-black/8 text-[#686D79]'
                  }`}
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => setImportType('JSON')}
                  className={`px-3 py-1 rounded border font-semibold ${
                    importType === 'JSON' ? 'bg-[#11141B] text-white' : 'border-black/8 text-[#686D79]'
                  }`}
                >
                  JSON
                </button>
              </div>

              <textarea 
                value={importContent}
                onChange={e => setImportContent(e.target.value)}
                placeholder={importType === 'CSV' 
                  ? "title,platform,difficulty,topic,url\nTwo Sum,LEETCODE,EASY,Array,https://leetcode.com/problems/two-sum" 
                  : '[{"title":"Two Sum","platform":"LEETCODE","difficulty":"EASY","topic":"Array"}]'}
                className="w-full h-36 p-3 rounded-md border border-black/8 font-mono text-[9px] text-[#0B0D12] resize-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-black/8 text-[10px] text-[#686D79]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!importContent.trim()}
                  className="px-4 py-1.5 rounded-md bg-[#11141B] hover:bg-black text-white text-[10px] font-semibold disabled:bg-[#D9DADE]"
                >
                  Import records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
