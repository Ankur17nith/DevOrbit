import React, { useState, useEffect } from 'react';
import { Flame, Star, GitFork, ExternalLink, TrendingUp } from 'lucide-react';

export function TrendingPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('All');

  const languages = ['All', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'C++'];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (language !== 'All') params.append('language', language);

    fetch(`/api/v1/opensource/trending?${params.toString()}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setRepos(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [language]);

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="size-6 text-[#F76C39]" />
            <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">Trending Repositories</h1>
          </div>
          <p className="text-xs text-[#686D79] mt-1">
            Fastest-rising open-source projects on GitHub with star velocity metrics
          </p>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {languages.map(l => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                language === l
                  ? 'bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/40 font-semibold'
                  : 'text-[#686D79] hover:text-[#F8FAFC] bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {repos.map((repo, idx) => (
            <div
              key={repo.id}
              className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <span className="size-8 rounded-lg bg-[#0B0D12] border border-[#1F2430] flex items-center justify-center font-mono font-bold text-sm text-[#A78BFA] shrink-0">
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#686D79]">{repo.owner}</span>
                    <span className="text-[#1F2430]">/</span>
                    <h3 className="text-base font-semibold text-[#F8FAFC] truncate">{repo.name}</h3>
                  </div>
                  <p className="mt-1 text-xs text-[#C5C8D0] line-clamp-1">{repo.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#F76C39] bg-[#F76C39]/15 border border-[#F76C39]/30 px-2.5 py-1 rounded-full">
                  <TrendingUp className="size-3" />
                  <span>+{repo.starsToday} today</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[#686D79]">
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 text-[#F59E0B]" />
                    <span className="text-[#F8FAFC]">{repo.stargazersCount?.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="size-3.5" />
                    <span>{repo.forksCount?.toLocaleString()}</span>
                  </span>
                </div>

                <a
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-[#C5C8D0] hover:text-white transition-colors"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
