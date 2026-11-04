import React, { useState, useEffect } from 'react';
import { CircleAlert, ExternalLink, Bookmark, Search, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function IssuesPage() {
  const { token } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('All');
  const [search, setSearch] = useState('');

  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

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

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CircleAlert className="size-6 text-purple-400" />
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">Issue Explorer</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Curated beginner-friendly issues, good first issues, and unassigned tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#09AE5B]"
            />
          </div>

          <div className="flex items-center gap-1">
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  difficulty === d
                    ? 'bg-[#25262C] text-white border border-neutral-600'
                    : 'text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#181819] border border-[#242424] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-2xl bg-[#181819] border border-[#242424]">
          <CircleAlert className="size-8 text-neutral-500 mx-auto" />
          <h3 className="mt-3 text-sm font-semibold text-white">No open issues found</h3>
          <p className="mt-1 text-xs text-neutral-400">Try loosening your search filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map(issue => (
            <div
              key={issue.id}
              className="p-5 rounded-xl bg-[#181819] border border-[#242424] hover:border-neutral-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400">{issue.repository?.fullName}</span>
                  <span className="text-xs font-mono text-neutral-600">#{issue.number}</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase font-semibold ${
                    issue.difficulty === 'beginner' 
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' 
                      : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                  }`}>
                    {issue.difficulty || 'Good First Issue'}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white truncate">{issue.title}</h3>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {issue.labels?.map((label: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0E0F10] text-neutral-300 border border-neutral-800"
                    >
                      {typeof label === 'string' ? label : label.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {issue.bountyAmount && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-bold">
                    ${issue.bountyAmount} {issue.currency}
                  </span>
                )}

                <a
                  href={issue.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#0E0F10] hover:bg-[#242424] border border-[#242424] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>View Issue</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
