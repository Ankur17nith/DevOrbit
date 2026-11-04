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
            <Flame className="size-6 text-orange-400" />
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">Trending Repositories</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
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
                  ? 'bg-[#25262C] text-[#E5E5E5] border border-neutral-600'
                  : 'text-neutral-400 hover:text-white bg-transparent border border-neutral-800/80 hover:bg-white/[0.03]'
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
            <div key={i} className="h-28 bg-[#181819] border border-[#242424] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {repos.map((repo, idx) => (
            <div
              key={repo.id}
              className="p-5 rounded-xl bg-[#181819] border border-[#242424] hover:border-neutral-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <span className="size-8 rounded-lg bg-[#0E0F10] border border-[#242424] flex items-center justify-center font-mono font-bold text-sm text-neutral-400 shrink-0">
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">{repo.owner}</span>
                    <span className="text-neutral-600">/</span>
                    <h3 className="text-base font-semibold text-white truncate">{repo.name}</h3>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400 line-clamp-1">{repo.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2.5 py-1 rounded-full">
                  <TrendingUp className="size-3" />
                  <span>+{repo.starsToday} today</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 text-amber-400" />
                    <span>{repo.stargazersCount?.toLocaleString()}</span>
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
                  className="p-2 rounded-lg bg-[#0E0F10] hover:bg-[#222223] border border-[#242424] text-neutral-300 hover:text-white transition-colors"
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
