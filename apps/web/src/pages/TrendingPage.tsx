import React, { useState, useEffect } from 'react';
import { Flame, Star, GitFork, ExternalLink, TrendingUp } from 'lucide-react';
import { PageContainer, PageHeading, StatusBadge, Button, EmptyState } from '../components/ui/index.js';

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
    <PageContainer>
      <PageHeading
        title="Trending Repositories"
        description="Top open-source projects ranked by verified GitHub stargazers and community activity"
        badges={[
          <StatusBadge key="ranking" variant="violet">
            Verified Star Ranking
          </StatusBadge>,
          <StatusBadge key="provenance" variant="neutral">
            Source: GitHub Public Index
          </StatusBadge>
        ]}
        actions={
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {languages.map(l => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  language === l
                    ? 'bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/40 font-semibold shadow-sm'
                    : 'text-[#686D79] hover:text-[#F8FAFC] bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        }
      />

      {/* Repositories List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : repos.length === 0 ? (
        <EmptyState
          title="No trending repositories found"
          description="Try selecting a different programming language to discover trending repositories."
          icon={<Flame className="size-8 text-[#686D79]" />}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLanguage('All')}
            >
              Reset to All Languages
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {repos.map((repo, idx) => (
            <div
              key={repo.id}
              className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <span className="size-8 rounded-lg bg-[#0B0D12] border border-[#1F2430] flex items-center justify-center font-mono font-bold text-sm text-[#A78BFA] shrink-0 group-hover:border-[#8B5CF6]/40 transition-colors">
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#686D79]">{repo.owner}</span>
                    <span className="text-[#1F2430]">/</span>
                    <h3 className="text-base font-semibold text-[#F8FAFC] truncate group-hover:text-[#A78BFA] transition-colors">{repo.name}</h3>
                  </div>
                  <p className="mt-1 text-xs text-[#C5C8D0] line-clamp-1">{repo.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#A78BFA] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 px-2.5 py-1 rounded-full">
                  <TrendingUp className="size-3 text-[#8B5CF6]" />
                  <span>{repo.language || 'Trending'}</span>
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
                  title="View on GitHub"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
