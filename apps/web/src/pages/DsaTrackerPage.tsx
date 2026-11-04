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
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function DsaTrackerPage() {
  const { token } = useAuth();
  const [problems, setProblems] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [search, setSearch] = useState('');
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');

  const topics = ['All', 'Array', 'String', 'Binary Tree', 'Graph', 'Dynamic Programming', 'Stack', 'Design', 'Intervals'];

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: '1',
      limit: '50',
    });
    if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
    if (selectedTopic !== 'All') params.append('topic', selectedTopic);
    if (search) params.append('search', search);

    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    Promise.all([
      fetch(`/api/v1/dsa/problems?${params.toString()}`, { headers }).then(r => r.json()),
      token ? fetch('/api/v1/dsa/analytics', { headers }).then(r => r.json()) : Promise.resolve(null),
    ])
      .then(([probJson, anaJson]) => {
        if (probJson?.success) setProblems(probJson.data.problems);
        if (anaJson?.success) setAnalytics(anaJson.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(fetchData, 200);
    return () => clearTimeout(timeout);
  }, [selectedDifficulty, selectedTopic, search, token]);

  const handleUpdateStatus = async (problemId: string, newStatus: 'TODO' | 'ATTEMPTED' | 'SOLVED' | 'REVISE', notes?: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/v1/dsa/problems/${problemId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes !== undefined ? notes : undefined,
          timeSpentSeconds: 300,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setProblems(prev =>
          prev.map(p => (p.id === problemId ? { ...p, userProgress: json.data } : p))
        );
        // Refresh analytics
        fetch('/api/v1/dsa/analytics', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(j => { if (j.success) setAnalytics(j.data); });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Sheet Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">DSA Intelligence & Problem Tracker</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono text-xs font-semibold">
              Striver A2Z Sheet
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Personal algorithmic problem tracking with spaced repetition and weakness detection
          </p>
        </div>

        {/* Search */}
        <div className="relative w-64 md:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search problems, topics..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#09AE5B]"
          />
        </div>
      </div>

      {/* Analytics Banner */}
      {analytics && (
        <div className="p-5 rounded-2xl bg-[#181819] border border-[#242424] grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-mono uppercase text-neutral-400">Solved Ratio</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {analytics.solvedCount} / {analytics.totalCatalogProblems}
              <span className="text-xs text-emerald-400 ml-1.5 font-normal">({analytics.completionRate}%)</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-neutral-400">Difficulty Breakdown</div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono">
              <span className="text-emerald-400">{analytics.difficultyBreakdown?.EASY || 0} Easy</span>
              <span className="text-amber-400">{analytics.difficultyBreakdown?.MEDIUM || 0} Med</span>
              <span className="text-rose-400">{analytics.difficultyBreakdown?.HARD || 0} Hard</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-neutral-400">Needs Revision</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {analytics.reviseCount || 0} problems
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-neutral-400">Detected Weakness</div>
            <div className="text-xs font-medium text-rose-300 mt-1 truncate">
              {analytics.weakTopics?.[0]?.topic || 'None detected'}
            </div>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTopic === t
                  ? 'bg-[#25262C] text-[#E5E5E5] border border-neutral-600'
                  : 'text-neutral-400 hover:text-white bg-transparent border border-neutral-800/80 hover:bg-white/[0.03]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {['All', 'EASY', 'MEDIUM', 'HARD'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                selectedDifficulty === d
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div className="rounded-2xl bg-[#181819] border border-[#242424] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#242424] bg-[#0E0F10]/50 text-[11px] font-mono text-neutral-400 uppercase">
              <th className="py-3 px-4 w-12">Status</th>
              <th className="py-3 px-4">Problem</th>
              <th className="py-3 px-4">Topic</th>
              <th className="py-3 px-4">Difficulty</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]/60 text-xs">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="size-4 bg-neutral-800 rounded-full"></div></td>
                  <td className="py-4 px-4"><div className="h-4 w-48 bg-neutral-800 rounded"></div></td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-neutral-800 rounded"></div></td>
                  <td className="py-4 px-4"><div className="h-4 w-16 bg-neutral-800 rounded"></div></td>
                  <td className="py-4 px-4"><div className="h-4 w-24 bg-neutral-800 rounded ml-auto"></div></td>
                </tr>
              ))
            ) : problems.map(prob => {
              const status = prob.userProgress?.status || 'TODO';
              return (
                <tr key={prob.id} className="hover:bg-white/[0.02] transition-colors">
                  
                  {/* Status Indicator Button */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        const next = status === 'TODO' ? 'SOLVED' : status === 'SOLVED' ? 'REVISE' : 'TODO';
                        handleUpdateStatus(prob.id, next as any);
                      }}
                      className="focus:outline-none"
                      title={`Current: ${status}. Click to change.`}
                    >
                      {status === 'SOLVED' ? (
                        <CheckCircle2 className="size-4 text-emerald-400" />
                      ) : status === 'REVISE' ? (
                        <RotateCw className="size-4 text-amber-400" />
                      ) : status === 'ATTEMPTED' ? (
                        <Clock className="size-4 text-blue-400" />
                      ) : (
                        <Circle className="size-4 text-neutral-600" />
                      )}
                    </button>
                  </td>

                  {/* Title & Link */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{prob.title}</span>
                        <ExternalLink className="size-3 text-neutral-500" />
                      </a>
                    </div>
                    {prob.userProgress?.notes && (
                      <div className="text-[11px] text-neutral-400 mt-0.5 truncate max-w-md">
                        Note: {prob.userProgress.notes}
                      </div>
                    )}
                  </td>

                  {/* Topic */}
                  <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                    {prob.topic} {prob.subtopic && <span className="text-neutral-500">/ {prob.subtopic}</span>}
                  </td>

                  {/* Difficulty Badge */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      prob.difficulty === 'EASY'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : prob.difficulty === 'MEDIUM'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </td>

                  {/* Status Toggle Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateStatus(prob.id, 'SOLVED')}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          status === 'SOLVED'
                            ? 'bg-emerald-500 text-white font-semibold'
                            : 'bg-[#242424] text-neutral-300 hover:bg-[#2e2e2e]'
                        }`}
                      >
                        Solved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(prob.id, 'REVISE')}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          status === 'REVISE'
                            ? 'bg-amber-500 text-black font-semibold'
                            : 'bg-[#242424] text-neutral-300 hover:bg-[#2e2e2e]'
                        }`}
                      >
                        Revise
                      </button>
                      <button
                        onClick={() => {
                          setEditingProblem(prob);
                          setNoteText(prob.userProgress?.notes || '');
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                        title="Add solution notes"
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note Editor Modal */}
      {editingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0E0F10] border border-[#242424] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-display">
              Notes for {editingProblem.title}
            </h3>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Record your algorithmic complexity, edge cases, and personal code hints..."
              rows={5}
              className="w-full p-3 rounded-xl bg-[#181819] border border-[#242424] text-white text-xs font-mono focus:outline-none focus:border-[#09AE5B]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingProblem(null)}
                className="px-3 py-1.5 rounded-lg bg-[#181819] text-neutral-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(editingProblem.id, editingProblem.userProgress?.status || 'SOLVED', noteText);
                  setEditingProblem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
