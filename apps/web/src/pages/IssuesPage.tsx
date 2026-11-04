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
            <CircleAlert className="size-6 text-[#8B5CF6]" />
            <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">Issue Explorer</h1>
          </div>
          <p className="text-xs text-[#686D79] mt-1">
            Curated beginner-friendly issues, good first issues, and unassigned tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1">
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
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
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
              className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#686D79]">{issue.repository?.fullName}</span>
                  <span className="text-xs font-mono text-[#686D79]">#{issue.number}</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase font-semibold ${
                    issue.difficulty === 'beginner' 
                      ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' 
                      : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                  }`}>
                    {issue.difficulty || 'Good First Issue'}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#F8FAFC] truncate">{issue.title}</h3>

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

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {issue.bountyAmount && (
                  <span className="px-2.5 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] text-xs font-mono font-bold">
                    ${issue.bountyAmount} {issue.currency}
                  </span>
                )}

                <a
                  href={issue.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
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
