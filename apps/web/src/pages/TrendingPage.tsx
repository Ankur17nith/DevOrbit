import React, { useState, useEffect } from 'react';
import { Flame, Star, GitFork, ExternalLink, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';
import { apiFetch } from '../lib/api.js';

export function TrendingPage() {
  const getInitialParams = () => {
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    return {
      language: params.get('language') || 'All',
      timeRange: (params.get('since') as 'daily' | 'weekly' | 'monthly') || 'weekly',
    };
  };

  const initial = getInitialParams();
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(initial.language);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>(initial.timeRange);

  const languages = ['All', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'C++', 'Java'];

  useEffect(() => {
    // Update URL query parameters
    const urlParams = new URLSearchParams();
    if (language !== 'All') urlParams.set('language', language);
    if (timeRange !== 'weekly') urlParams.set('since', timeRange);
    const qs = urlParams.toString();
    const newPath = qs ? `${window.location.pathname}#trending?${qs}` : `${window.location.pathname}#trending`;
    window.history.replaceState(null, '', newPath);

    setLoading(true);
    const params = new URLSearchParams();
    if (language !== 'All') params.append('language', language);
    params.append('since', timeRange);

    apiFetch(`/api/v1/opensource/trending?${params.toString()}`)
      .then(json => {
        if (json.success && json.data) setRepos(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [language, timeRange]);

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Open source</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Trending Repositories (Most Starred)</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Results require a connected source. DevOrbit does not fabricate issues, amounts, deadlines, or activity.
          </p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[250px_1fr]">
        
        {/* Left Column: Filters */}
        <section className="rounded-xl border border-black/7 bg-white h-fit">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#11141B]">Filters</h3>
            {(language !== 'All' || timeRange !== 'weekly') && (
              <button
                onClick={() => {
                  setLanguage('All');
                  setTimeRange('weekly');
                }}
                className="text-[10px] text-[#8B5CF6] hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-4 p-4">
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Programming language</span>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
              >
                {languages.map(l => (
                  <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Trending time window</span>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value as any)}
                className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
              >
                <option value="daily">Trending Today</option>
                <option value="weekly">Trending This Week</option>
                <option value="monthly">Trending This Month</option>
              </select>
            </label>

            <div className="pt-2 border-t border-black/5 space-y-2 text-[10px] text-[#686D79]">
              <div className="flex items-center gap-1.5 font-medium text-[#11141B]">
                <Flame className="size-3.5 text-[#8B5CF6]" />
                <span>Verified Star Velocity</span>
              </div>
              <p className="leading-relaxed">
                Ranked purely by verified star count and active commit velocity from public repositories.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Trending List */}
        <section className="rounded-xl border border-black/7 bg-white">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#11141B]">Trending Projects</h3>
            <span className="text-[9px] text-[#999CA3]">
              {loading ? 'Fetching...' : `${repos.length} ranked repositories`}
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-24 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
                ))}
              </div>
            ) : repos.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                  <Flame className="size-5" />
                </span>
                <h3 className="mt-4 text-xs font-semibold text-[#11141B]">No trending repositories found</h3>
                <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                  Try selecting a different programming language or broadening your trending time filter.
                </p>
                <button
                  onClick={() => {
                    setLanguage('All');
                    setTimeRange('weekly');
                  }}
                  className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {repos.map((repo, idx) => {
                  const owner = (repo.owner && repo.owner !== 'undefined') 
                    ? repo.owner 
                    : (repo.fullName && !repo.fullName.startsWith('undefined/') ? repo.fullName.split('/')[0] : 'github');
                  const name = (repo.name && repo.name !== 'undefined') 
                    ? repo.name 
                    : (repo.fullName && !repo.fullName.startsWith('undefined/') ? repo.fullName.split('/')[1] : 'repository');
                  const fullName = repo.fullName && !repo.fullName.startsWith('undefined/') 
                    ? repo.fullName 
                    : `${owner}/${name}`;

                  return (
                  <div
                    key={repo.id || idx}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F7F7F8] border border-black/7 font-mono text-xs font-bold text-[#8B5CF6]">
                        #{idx + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono text-[#686D79] truncate">{owner}</span>
                          <span className="text-black/20">/</span>
                          <h4 className="text-sm font-semibold text-[#11141B] truncate group-hover:text-[#8B5CF6] transition-colors">
                            {name}
                          </h4>
                        </div>
                        <p className="mt-1 text-xs text-[#686D79] line-clamp-1">
                          {repo.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:self-center self-end pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-3 text-xs font-mono text-[#686D79]">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-[#8B5CF6]" />
                            <span className="text-[#11141B]">{repo.language}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Star className="size-3 text-[#F59E0B]" />
                          <span>{repo.stargazersCount?.toLocaleString()}</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <GitFork className="size-3 text-[#999CA3]" />
                          <span>{repo.forksCount?.toLocaleString()}</span>
                        </span>
                      </div>

                      <a
                        href={`https://github.com/${fullName}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-black/9 bg-white px-2.5 py-1.5 text-xs font-medium text-[#11141B] hover:bg-zinc-50 transition-colors"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="size-3 text-[#999CA3]" />
                      </a>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
