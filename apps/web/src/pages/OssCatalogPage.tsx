import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Star, 
  GitFork, 
  CircleAlert, 
  Bookmark, 
  ExternalLink, 
  X, 
  BookOpen, 
  FileText,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

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
    if (search) params.append('search', search);
    if (selectedLanguage !== 'All') params.append('language', selectedLanguage);

    fetch(`/api/v1/opensource/catalog?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setRepos(json.data.repos);
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
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Tagline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Curated Open Source Catalog</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Handpicked, active repositories with beginner-friendly contribution avenues
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-2.5 size-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects, topics..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#09AE5B]"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs focus:outline-none focus:border-[#09AE5B]"
          >
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
            <option value="issues">Open Issues</option>
            <option value="recent">Recently Active</option>
          </select>
        </div>
      </div>

      {/* Language Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedLanguage === lang
                ? 'bg-[#25262C] text-[#E5E5E5] border border-neutral-600'
                : 'text-neutral-400 hover:text-white bg-transparent border border-neutral-800/80 hover:bg-white/[0.03]'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Repository Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-[#181819] border border-[#242424] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-2xl bg-[#181819] border border-[#242424]">
          <BookOpen className="size-8 text-neutral-500 mx-auto" />
          <h3 className="mt-3 text-sm font-semibold text-white">No repositories match your query</h3>
          <p className="mt-1 text-xs text-neutral-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map(repo => {
            const isBookmarked = bookmarkedIds.has(repo.id);
            return (
              <div
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className="p-5 rounded-xl bg-[#181819] border border-[#242424] hover:border-neutral-600 hover:bg-[#1F1F20] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-neutral-400 truncate">{repo.owner}</span>
                        {repo.isVerified && <BadgeCheck className="size-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <h3 className="text-base font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {repo.name}
                      </h3>
                    </div>

                    <button
                      onClick={e => handleToggleBookmark(repo.id, e)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked 
                          ? 'bg-purple-950/60 border-purple-800 text-purple-400' 
                          : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/[0.05]'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
                    >
                      <Bookmark className="size-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#242424]/60 space-y-2">
                  {/* Topic Tags */}
                  <div className="flex flex-wrap gap-1">
                    {repo.topics?.slice(0, 3).map((topic: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800">
                        {topic}
                      </span>
                    ))}
                    {repo.topics?.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-500">
                        +{repo.topics.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Metrics Footer */}
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400"></span>
                      <span>{repo.language || 'Code'}</span>
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="size-3 text-amber-400" />
                        <span>{repo.stargazersCount?.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="size-3 text-neutral-400" />
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

      {/* Slide-over Detail Drawer */}
      {selectedRepo && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0E0F10] border-l border-[#242424] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#242424]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                    <span>{selectedRepo.owner}</span>
                    <span>/</span>
                    <span className="text-white font-semibold">{selectedRepo.name}</span>
                  </div>
                  <h2 className="text-xl font-bold font-display text-white mt-1">
                    {selectedRepo.fullName}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRepo(null)}
                  className="p-1 rounded-lg hover:bg-white/[0.05] text-neutral-400 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#242424] pb-2">
                <button
                  onClick={() => setDrawerTab('overview')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    drawerTab === 'overview' ? 'bg-white/[0.08] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Overview & Metrics
                </button>
                <button
                  onClick={() => setDrawerTab('readme')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    drawerTab === 'readme' ? 'bg-white/[0.08] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  README Preview
                </button>
                <button
                  onClick={() => setDrawerTab('contributing')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    drawerTab === 'contributing' ? 'bg-white/[0.08] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  CONTRIBUTING Guide
                </button>
              </div>

              {/* Tab Contents */}
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {selectedRepo.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#181819] border border-[#242424] text-center">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-neutral-500">Stars</div>
                      <div className="text-lg font-bold font-mono text-white mt-0.5">{selectedRepo.stargazersCount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-neutral-500">Forks</div>
                      <div className="text-lg font-bold font-mono text-white mt-0.5">{selectedRepo.forksCount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-neutral-500">Open Issues</div>
                      <div className="text-lg font-bold font-mono text-white mt-0.5">{selectedRepo.openIssuesCount?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase text-neutral-400 font-semibold mb-2">Topics & Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRepo.topics?.map((t: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-[#181819] text-xs font-mono text-neutral-300 border border-[#242424]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'readme' && (
                <div className="p-4 rounded-xl bg-[#181819] border border-[#242424] text-xs font-mono text-neutral-300 space-y-2 leading-relaxed">
                  <div className="text-white font-bold text-sm"># {selectedRepo.name}</div>
                  <p>{selectedRepo.description}</p>
                  <div className="pt-2 text-neutral-400">
                    ### Installation<br/>
                    <code className="text-emerald-400">git clone https://github.com/{selectedRepo.fullName}.git</code>
                  </div>
                </div>
              )}

              {drawerTab === 'contributing' && (
                <div className="p-4 rounded-xl bg-[#181819] border border-[#242424] text-xs space-y-3 leading-relaxed">
                  <div className="text-white font-bold text-sm">Contribution Guidelines</div>
                  <p className="text-neutral-300">
                    1. Fork the repository and create your branch from main.<br/>
                    2. If you've added code that should be tested, add tests.<br/>
                    3. Ensure the test suite passes.<br/>
                    4. Make sure your code lints properly.
                  </p>
                </div>
              )}

            </div>

            {/* Drawer Actions */}
            <div className="pt-6 border-t border-[#242424] flex items-center justify-between">
              <button
                onClick={e => handleToggleBookmark(selectedRepo.id, e)}
                className="px-4 py-2 rounded-lg bg-[#181819] hover:bg-[#222223] border border-[#242424] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
              >
                <Bookmark className="size-3.5" fill={bookmarkedIds.has(selectedRepo.id) ? 'currentColor' : 'none'} />
                <span>{bookmarkedIds.has(selectedRepo.id) ? 'Saved' : 'Bookmark'}</span>
              </button>

              <a
                href={`https://github.com/${selectedRepo.fullName}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-[#09AE5B]/20"
              >
                <span>Open on GitHub</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
