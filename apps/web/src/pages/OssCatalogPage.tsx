import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Star, 
  GitFork, 
  Bookmark, 
  ExternalLink, 
  X, 
  BookOpen, 
  BadgeCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';

export function OssCatalogPage() {
  const { token } = useAuth();
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'issues' | 'recent'>('stars');
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'readme' | 'contributing'>('overview');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const languages = ['All', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'C', 'C++'];

  const fetchCatalog = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: '1',
      limit: '30',
      sortBy,
    });
    if (search.trim()) params.append('search', search.trim());
    if (selectedLanguage !== 'All') params.append('language', selectedLanguage);

    fetch(`/api/v1/opensource/catalog?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setRepos(json.data.repos || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(fetchCatalog, 200);
    return () => clearTimeout(timeout);
  }, [search, selectedLanguage, sortBy]);

  // Load user bookmarks
  useEffect(() => {
    if (!token) return;
    fetch('/api/v1/opensource/bookmarks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          const ids = new Set<string>(json.data.map((b: any) => b.repositoryId).filter(Boolean));
          setBookmarkedIds(ids);
        }
      })
      .catch(console.error);
  }, [token]);

  const handleToggleBookmark = async (repoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    try {
      const res = await fetch('/api/v1/opensource/bookmarks/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType: 'REPO', repositoryId: repoId }),
      });
      const json = await res.json();
      if (json.success) {
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (json.data.bookmarked) next.add(repoId);
          else next.delete(repoId);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Open source</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Open Source Discovery</h2>
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
            {(search || selectedLanguage !== 'All' || sortBy !== 'stars') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedLanguage('All');
                  setSortBy('stars');
                }}
                className="text-[10px] text-[#8B5CF6] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="space-y-4 p-4">
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Search query</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#999CA3]" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Keywords or topics..."
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] pl-8 pr-2 text-xs text-[#11141B] placeholder:text-[#999CA3] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Language</span>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
              >
                {languages.map(l => (
                  <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Sort by</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
              >
                <option value="stars">Most Stargazers</option>
                <option value="forks">Most Forks</option>
                <option value="issues">Open Issues Count</option>
                <option value="recent">Recently Active</option>
              </select>
            </label>

            <div className="pt-2 border-t border-black/5">
              <div className="flex items-center gap-1.5 text-[10px] text-[#686D79]">
                <BadgeCheck className="size-3.5 text-[#8B5CF6]" />
                <span>Verified index from GitHub public API</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Opportunities / Repositories */}
        <section className="rounded-xl border border-black/7 bg-white">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#11141B]">Opportunities</h3>
            <span className="text-[9px] text-[#999CA3]">
              {loading ? 'Searching...' : repos.length > 0 ? `${repos.length} repositories` : 'No connected sources'}
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-36 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
                ))}
              </div>
            ) : repos.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                    <circle cx="6" cy="5" r="2" />
                    <circle cx="18" cy="7" r="2" />
                    <circle cx="6" cy="19" r="2" />
                    <path d="M6 7v10M8 6c5 0 3 10 8 10M16 16l2-2 2 2" />
                  </svg>
                </span>
                <h3 className="mt-4 text-xs font-semibold text-[#11141B]">No opportunity source connected</h3>
                <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                  Connect GitHub or add a supported source before searching. Results will always include their source and last-updated time.
                </p>
                <a
                  href="#integrations"
                  className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors"
                >
                  Open integrations
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {repos.map(repo => {
                  const isBookmarked = bookmarkedIds.has(repo.id);
                  return (
                    <div
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className="group flex flex-col justify-between rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono text-[#686D79] truncate">{repo.owner}</span>
                              {repo.isVerified && <BadgeCheck className="size-3.5 text-[#8B5CF6] shrink-0" />}
                            </div>
                            <h4 className="mt-0.5 text-sm font-semibold text-[#11141B] truncate group-hover:text-[#8B5CF6] transition-colors">
                              {repo.name}
                            </h4>
                          </div>

                          <button
                            onClick={e => handleToggleBookmark(repo.id, e)}
                            className={`p-1.5 rounded-md border transition-colors ${
                              isBookmarked 
                                ? 'bg-[#F0EDFA] border-[#8B5CF6]/30 text-[#8B5CF6]' 
                                : 'border-transparent text-[#999CA3] hover:text-[#11141B] hover:bg-zinc-100'
                            }`}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
                          >
                            <Bookmark className="size-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <p className="mt-2 text-xs text-[#686D79] line-clamp-2 leading-relaxed">
                          {repo.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-black/5 space-y-2.5">
                        {/* Topic Tags */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {repo.topics.slice(0, 3).map((topic: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F7F7F8] text-[#686D79] border border-black/5">
                                {topic}
                              </span>
                            ))}
                            {repo.topics.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#999CA3]">
                                +{repo.topics.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Metrics Footer */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#686D79]">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-[#8B5CF6]" />
                            <span className="text-[#11141B] font-medium">{repo.language || 'Code'}</span>
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Star className="size-3 text-[#F59E0B]" />
                              <span>{repo.stargazersCount?.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="size-3 text-[#999CA3]" />
                              <span>{repo.forksCount?.toLocaleString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Slide-over Detail Drawer */}
      {selectedRepo && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white border-l border-black/10 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-black/7">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#686D79]">
                    <span>{selectedRepo.owner}</span>
                    <span>/</span>
                    <span className="text-[#11141B] font-semibold">{selectedRepo.name}</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-[#11141B] mt-1">
                    {selectedRepo.fullName}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRepo(null)}
                  className="p-1.5 rounded-md hover:bg-zinc-100 text-[#686D79] hover:text-[#11141B]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-black/7 pb-2">
                <button
                  onClick={() => setDrawerTab('overview')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    drawerTab === 'overview' ? 'bg-[#11141B] text-white' : 'text-[#686D79] hover:text-[#11141B]'
                  }`}
                >
                  Overview & Metrics
                </button>
                <button
                  onClick={() => setDrawerTab('readme')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    drawerTab === 'readme' ? 'bg-[#11141B] text-white' : 'text-[#686D79] hover:text-[#11141B]'
                  }`}
                >
                  README Preview
                </button>
                <button
                  onClick={() => setDrawerTab('contributing')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    drawerTab === 'contributing' ? 'bg-[#11141B] text-white' : 'text-[#686D79] hover:text-[#11141B]'
                  }`}
                >
                  CONTRIBUTING Guide
                </button>
              </div>

              {/* Tab Contents */}
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#686D79] leading-relaxed">
                    {selectedRepo.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#F7F7F8] border border-black/7 text-center">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#686D79]">Stars</div>
                      <div className="text-lg font-bold font-mono text-[#11141B] mt-0.5">{selectedRepo.stargazersCount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#686D79]">Forks</div>
                      <div className="text-lg font-bold font-mono text-[#11141B] mt-0.5">{selectedRepo.forksCount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#686D79]">Open Issues</div>
                      <div className="text-lg font-bold font-mono text-[#11141B] mt-0.5">{selectedRepo.openIssuesCount?.toLocaleString()}</div>
                    </div>
                  </div>

                  {selectedRepo.topics && selectedRepo.topics.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-mono uppercase text-[#686D79] font-semibold mb-2">Topics & Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRepo.topics.map((t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-md bg-[#F7F7F8] text-xs font-mono text-[#686D79] border border-black/6">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'readme' && (
                <div className="p-4 rounded-xl bg-[#11141B] text-[#F8FAFC] text-xs font-mono space-y-2 leading-relaxed">
                  <div className="text-white font-bold text-sm"># {selectedRepo.name}</div>
                  <p className="text-[#C5C8D0]">{selectedRepo.description}</p>
                  <div className="pt-2 text-[#999CA3]">
                    ### Clone URL<br/>
                    <code className="text-[#A78BFA]">git clone https://github.com/{selectedRepo.fullName}.git</code>
                  </div>
                </div>
              )}

              {drawerTab === 'contributing' && (
                <div className="p-4 rounded-xl bg-[#F7F7F8] border border-black/7 text-xs space-y-3 leading-relaxed text-[#686D79]">
                  <div className="text-[#11141B] font-semibold text-sm">Contribution Guidelines</div>
                  <p>
                    1. Fork the repository and create your branch from main.<br/>
                    2. If you have added code that should be tested, add tests.<br/>
                    3. Ensure the test suite passes.<br/>
                    4. Make sure your code lints properly.
                  </p>
                </div>
              )}

            </div>

            {/* Drawer Actions */}
            <div className="pt-6 border-t border-black/7 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={e => handleToggleBookmark(selectedRepo.id, e)}
                icon={<Bookmark className="size-3.5" fill={bookmarkedIds.has(selectedRepo.id) ? 'currentColor' : 'none'} />}
              >
                {bookmarkedIds.has(selectedRepo.id) ? 'Saved' : 'Bookmark'}
              </Button>

              <a
                href={`https://github.com/${selectedRepo.fullName}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="primary" size="sm" icon={<ExternalLink className="size-3.5" />}>
                  Open on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
