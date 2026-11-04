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
  AlertCircle
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
            <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">
              DSA Intelligence & Problem Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] font-mono text-xs font-semibold">
              Striver A2Z Roadmap
            </span>
          </div>
          <p className="text-xs text-[#686D79] mt-1">
            Personal algorithmic problem tracking with spaced repetition and weakness detection
          </p>
        </div>

        {/* Search */}
        <div className="relative w-64 md:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search problems, topics, patterns..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
      </div>

      {/* Analytics Banner */}
      {analytics && (
        <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm">
          <div>
            <div className="text-xs font-mono uppercase text-[#686D79]">Solved Ratio</div>
            <div className="text-xl font-bold font-mono text-[#F8FAFC] mt-1">
              {analytics.solvedCount} / {analytics.totalCatalogProblems}
              <span className="text-xs text-[#22C55E] ml-1.5 font-normal">({analytics.completionRate}%)</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-[#686D79]">Difficulty Breakdown</div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono">
              <span className="text-[#22C55E]">{analytics.difficultyBreakdown?.EASY || 0} Easy</span>
              <span className="text-[#F59E0B]">{analytics.difficultyBreakdown?.MEDIUM || 0} Med</span>
              <span className="text-[#EF4444]">{analytics.difficultyBreakdown?.HARD || 0} Hard</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-[#686D79]">Needs Revision</div>
            <div className="text-xl font-bold font-mono text-[#F59E0B] mt-1">
              {analytics.reviseCount || 0} problems
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-[#686D79]">Detected Weakness</div>
            <div className="text-xs font-medium text-[#EF4444] mt-1 truncate flex items-center gap-1">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{analytics.weakTopics?.[0]?.topic || 'None detected'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTopic === t
                  ? 'bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/40 font-semibold'
                  : 'text-[#686D79] hover:text-[#F8FAFC] bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A]'
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
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 font-semibold'
                  : 'text-[#686D79] hover:text-[#F8FAFC]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div className="rounded-2xl bg-[#12151D] border border-[#1F2430] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1F2430] bg-[#0B0D12]/60 text-[11px] font-mono text-[#686D79] uppercase">
              <th className="py-3 px-4 w-12">Status</th>
              <th className="py-3 px-4">Problem Title</th>
              <th className="py-3 px-4">Topic / Pattern</th>
              <th className="py-3 px-4">Difficulty</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2430] text-xs">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="size-4 bg-[#181C26] rounded-full"></div></td>
                  <td className="py-4 px-4"><div className="h-4 w-48 bg-[#181C26] rounded"></div></td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-[#181C26] rounded"></div></td>
                  <td className="py-4 px-4"><div className="h-4 w-16 bg-[#181C26] rounded"></div></td>
                  <td className="py-4 px-4"><div className="h-4 w-24 bg-[#181C26] rounded ml-auto"></div></td>
                </tr>
              ))
            ) : problems.map(prob => {
              const status = prob.userProgress?.status || 'TODO';
              return (
                <tr key={prob.id} className="hover:bg-[#181C26]/50 transition-colors">
                  
                  {/* Status Indicator Button */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        const next = status === 'TODO' ? 'SOLVED' : status === 'SOLVED' ? 'REVISE' : 'TODO';
                        handleUpdateStatus(prob.id, next as any);
                      }}
                      className="focus:outline-none"
                      title={`Current: ${status}. Click to cycle.`}
                    >
                      {status === 'SOLVED' ? (
                        <CheckCircle2 className="size-4 text-[#22C55E]" />
                      ) : status === 'REVISE' ? (
                        <RotateCw className="size-4 text-[#F59E0B]" />
                      ) : status === 'ATTEMPTED' ? (
                        <Clock className="size-4 text-[#60A5FA]" />
                      ) : (
                        <Circle className="size-4 text-[#686D79]" />
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
                        className="font-medium text-[#F8FAFC] hover:text-[#A78BFA] transition-colors flex items-center gap-1.5"
                      >
                        <span>{prob.title}</span>
                        <ExternalLink className="size-3 text-[#686D79]" />
                      </a>
                    </div>
                    {prob.userProgress?.notes && (
                      <div className="text-[11px] text-[#C5C8D0] mt-0.5 truncate max-w-md font-mono">
                        Note: {prob.userProgress.notes}
                      </div>
                    )}
                  </td>

                  {/* Topic */}
                  <td className="py-3 px-4 text-[#686D79] font-mono text-[11px]">
                    <span className="text-[#C5C8D0]">{prob.topic}</span> {prob.subtopic && <span className="text-[#686D79]">/ {prob.subtopic}</span>}
                  </td>

                  {/* Difficulty Badge */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      prob.difficulty === 'EASY'
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                        : prob.difficulty === 'MEDIUM'
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                        : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </td>

                  {/* Status Toggle Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(prob.id, 'SOLVED')}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          status === 'SOLVED'
                            ? 'bg-[#22C55E] text-white font-semibold'
                            : 'bg-[#181C26] text-[#C5C8D0] hover:bg-[#202431] border border-[#1F2430]'
                        }`}
                      >
                        Solved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(prob.id, 'REVISE')}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          status === 'REVISE'
                            ? 'bg-[#F59E0B] text-black font-semibold'
                            : 'bg-[#181C26] text-[#C5C8D0] hover:bg-[#202431] border border-[#1F2430]'
                        }`}
                      >
                        Revise
                      </button>
                      <button
                        onClick={() => {
                          setEditingProblem(prob);
                          setNoteText(prob.userProgress?.notes || '');
                        }}
                        className="p-1 rounded text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#181C26]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#12151D] border border-[#1F2430] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F8FAFC] font-display">
              Confidential Notes: {editingProblem.title}
            </h3>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Record your algorithmic complexity, edge cases, and personal code hints..."
              rows={5}
              className="w-full p-3 rounded-xl bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingProblem(null)}
                className="px-3 py-1.5 rounded-lg bg-[#181C26] text-[#686D79] hover:text-[#F8FAFC] text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(editingProblem.id, editingProblem.userProgress?.status || 'SOLVED', noteText);
                  setEditingProblem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold"
              >
                Save Private Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
