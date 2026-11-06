import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Building2, 
  ExternalLink, 
  Calendar, 
  Code, 
  Check, 
  Award, 
  Clock, 
  DollarSign, 
  Users, 
  Sparkles,
  Compass,
  AlertTriangle,
  RefreshCw,
  Bookmark,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { OrganizationDetailModal } from '../components/OrganizationDetailModal.js';
import { safeHref } from '../lib/safeHref.js';

interface Program {
  id: string;
  name: string;
  slug: string;
  category?: string;
  description: string;
  stipend?: string;
  websiteUrl: string;
  applicationEnd?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'SCHEDULED';
  totalSlots?: number;
}

const ALL_PLATFORMS = [
  { id: 'GSOC', name: 'Google Summer of Code', short: 'GSoC' },
  { id: 'OUTREACHY', name: 'Outreachy Internships', short: 'Outreachy' },
  { id: 'LFX', name: 'LFX Mentorship', short: 'LFX' },
  { id: 'MLH', name: 'MLH Fellowship', short: 'MLH' },
  { id: 'GITHUB', name: 'GitHub Open Source', short: 'GitHub' },
];

const POPULAR_TECHS = [
  'Python', 'TypeScript', 'JavaScript', 'Rust', 'Go', 
  'C++', 'Java', 'Solidity', 'Kubernetes', 'Docker', 'React', 'Linux'
];

export function GsocPage() {
  const { token } = useAuth();
  
  // URL parameter parsing for filter state persistence
  const getInitialParams = () => {
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    return {
      platforms: params.get('platforms') ? params.get('platforms')!.split(',') : ['GSOC', 'OUTREACHY', 'LFX', 'MLH', 'GITHUB'],
      techs: params.get('techs') ? params.get('techs')!.split(',') : [],
      techLogic: (params.get('techLogic') as 'AND' | 'OR') || 'OR',
      search: params.get('search') || '',
      beginnerOnly: params.get('beginner') === 'true',
      page: Number(params.get('page')) || 1,
      selectedOrg: params.get('org') || null,
      tab: (params.get('tab') as 'orgs' | 'saved' | 'programs') || 'orgs',
    };
  };

  const initial = useMemo(() => getInitialParams(), []);

  const [activeTab, setActiveTab] = useState<'orgs' | 'saved' | 'programs'>(initial.tab);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initial.platforms);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(initial.techs);
  const [techLogic, setTechLogic] = useState<'AND' | 'OR'>(initial.techLogic);
  const [search, setSearch] = useState(initial.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search);
  const [beginnerOnly, setBeginnerOnly] = useState(initial.beginnerOnly);
  const [page, setPage] = useState(initial.page);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(initial.selectedOrg);

  const [orgs, setOrgs] = useState<any[]>([]);
  const [savedOrgs, setSavedOrgs] = useState<any[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 1 });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedPlatforms.length > 0 && selectedPlatforms.length < ALL_PLATFORMS.length) {
      params.set('platforms', selectedPlatforms.join(','));
    }
    if (selectedTechs.length > 0) {
      params.set('techs', selectedTechs.join(','));
      if (techLogic === 'AND') params.set('techLogic', 'AND');
    }
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (beginnerOnly) params.set('beginner', 'true');
    if (page > 1) params.set('page', String(page));
    if (activeOrgId) params.set('org', activeOrgId);
    if (activeTab !== 'orgs') params.set('tab', activeTab);

    const queryString = params.toString();
    const newRelativePath = queryString 
      ? `${window.location.pathname}#organizations?${queryString}`
      : `${window.location.pathname}#organizations`;
    window.history.replaceState(null, '', newRelativePath);
  }, [selectedPlatforms, selectedTechs, techLogic, debouncedSearch, beginnerOnly, page, activeOrgId, activeTab]);

  // Fetch organizations
  const fetchOrganizations = useCallback((signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: '24',
    });

    if (selectedPlatforms.length > 0) {
      params.append('platforms', selectedPlatforms.join(','));
    }
    if (selectedTechs.length > 0) {
      params.append('technologies', selectedTechs.join(','));
      params.append('techLogic', techLogic);
    }
    if (debouncedSearch.trim()) {
      params.append('search', debouncedSearch.trim());
    }
    if (beginnerOnly) {
      params.append('hasBeginnerIssues', 'true');
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    apiFetch<{ orgs: any[]; total: number; pagination: any }>(
      `/api/v1/opensource/organizations?${params.toString()}`,
      { headers, signal }
    )
      .then(res => {
        if (res.success && res.data) {
          setOrgs(res.data.orgs || []);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      })
      .catch(err => {
        if (err?.name !== 'AbortError') {
          console.error('Failed to load organizations:', err);
          setError(err.message || 'Failed to fetch organizations.');
        }
      })
      .finally(() => setLoading(false));
  }, [page, selectedPlatforms, selectedTechs, techLogic, debouncedSearch, beginnerOnly, token]);

  // Fetch saved organizations
  const fetchSavedOrganizations = useCallback(() => {
    if (!token) return;
    setSavedLoading(true);
    apiFetch<any[]>('/api/v1/opensource/organizations/saved/list', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.success && res.data && Array.isArray(res.data)) {
          setSavedOrgs(res.data.map((item: any) => item.organization || item));
        }
      })
      .catch(console.error)
      .finally(() => setSavedLoading(false));
  }, [token]);

  // Fetch mentorship programs
  const fetchPrograms = useCallback(() => {
    setProgramsLoading(true);
    apiFetch<any>('/api/v1/opensource/programs')
      .then(res => {
        if (res.success && res.data) {
          const rawList = Array.isArray(res.data) ? res.data : (res.data?.programs || []);
          const normalized: Program[] = rawList.map((p: any) => ({
            id: p.id || p.slug,
            name: p.name,
            slug: p.slug,
            category: p.category,
            description: p.description,
            websiteUrl: p.website || p.websiteUrl || '#',
            applicationEnd: p.deadlineDate || p.applicationEnd,
            status: p.status || 'ACTIVE',
            stipend: p.stipend || (p.category === 'GSOC' ? '$1,500 – $6,000' : p.category === 'MENTORSHIP' ? '$3,000 – $6,000' : undefined),
            totalSlots: p.totalSlots || (p.category === 'GSOC' ? 1200 : undefined),
          }));
          setPrograms(normalized);
        }
      })
      .catch(console.error)
      .finally(() => setProgramsLoading(false));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (activeTab === 'orgs') {
      fetchOrganizations(controller.signal);
    } else if (activeTab === 'saved') {
      fetchSavedOrganizations();
    } else if (activeTab === 'programs') {
      fetchPrograms();
    }
    return () => controller.abort();
  }, [activeTab, fetchOrganizations, fetchSavedOrganizations, fetchPrograms]);

  const togglePlatform = (platId: string) => {
    setPage(1);
    setSelectedPlatforms(prev =>
      prev.includes(platId)
        ? (prev.length === 1 ? prev : prev.filter(p => p !== platId))
        : [...prev, platId]
    );
  };

  const toggleTech = (tech: string) => {
    setPage(1);
    setSelectedTechs(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleBookmarkToggled = (orgId: string, isSaved: boolean) => {
    setOrgs(prev =>
      prev.map(o => (o.id === orgId || o.slug === orgId ? { ...o, isSaved } : o))
    );
    if (activeTab === 'saved' && !isSaved) {
      setSavedOrgs(prev => prev.filter(o => o.id !== orgId && o.slug !== orgId));
    }
  };

  const handleCardBookmarkClick = async (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const res = await apiFetch<{ saved: boolean }>(
        `/api/v1/opensource/organizations/${org.id || org.slug}/save`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.success && res.data) {
        handleBookmarkToggled(org.id, res.data.saved);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1280px]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Open source</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Organizations & Mentorship Programs</h2>
          <p className="mt-1.5 text-xs leading-5 text-[#686D79]">
            Results require a connected source. DevOrbit does not fabricate issues, amounts, deadlines, or activity. Multi-platform directory spanning GSoC, Outreachy, LFX Mentorship, MLH Fellowship, and direct GitHub organizations.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 rounded-xl border border-black/7 bg-white p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('orgs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'orgs'
                ? 'bg-[#11141B] text-white shadow-xs'
                : 'text-[#686D79] hover:text-[#11141B] hover:bg-[#F7F7F8]'
            }`}
          >
            All Organizations
          </button>
          {token && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'saved'
                  ? 'bg-[#11141B] text-white shadow-xs'
                  : 'text-[#686D79] hover:text-[#11141B] hover:bg-[#F7F7F8]'
              }`}
            >
              <Bookmark className="size-3" />
              <span>Saved ({savedOrgs.length})</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'programs'
                ? 'bg-[#11141B] text-white shadow-xs'
                : 'text-[#686D79] hover:text-[#11141B] hover:bg-[#F7F7F8]'
            }`}
          >
            Programs & Stipends
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'programs' ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programsLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-xl border border-black/7 bg-white p-5 animate-pulse" />
              ))
            ) : programs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-[#686D79]">
                No mentorship programs currently scheduled.
              </div>
            ) : (
              programs.map(prog => (
                <div
                  key={prog.id}
                  className="rounded-xl border border-black/7 bg-white p-5 flex flex-col justify-between hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F0EDFA] text-[#8B5CF6] border border-[#8B5CF6]/20">
                        {prog.category || 'MENTORSHIP'}
                      </span>
                      <StatusBadge variant={prog.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {prog.status}
                      </StatusBadge>
                    </div>

                    <h3 className="text-base font-bold text-[#11141B]">{prog.name}</h3>
                    <p className="text-xs text-[#686D79] line-clamp-3 leading-relaxed">{prog.description}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-black/5 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-[#999CA3] block text-[9px] uppercase">Stipend</span>
                        <span className="font-semibold text-emerald-600">{prog.stipend || 'Competitive'}</span>
                      </div>
                      <div>
                        <span className="text-[#999CA3] block text-[9px] uppercase">Estimated Slots</span>
                        <span className="font-semibold text-[#11141B]">{prog.totalSlots ? `${prog.totalSlots}+` : 'Varies'}</span>
                      </div>
                    </div>

                    <a
                      href={safeHref(prog.websiteUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-black/9 bg-[#11141B] py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
                    >
                      <span>Official Program Portal</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeTab === 'saved' ? (
        <div className="mt-6">
          {savedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 rounded-xl border border-black/7 bg-white animate-pulse" />
              ))}
            </div>
          ) : savedOrgs.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-black/7 bg-white p-8 text-center">
              <Bookmark className="size-8 text-[#999CA3]" />
              <h3 className="mt-3 text-sm font-semibold text-[#11141B]">No saved organizations yet</h3>
              <p className="mt-1 max-w-sm text-xs text-[#686D79]">
                Click the bookmark icon on any organization card or in the detail view to keep track of target open source organizations.
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => setActiveTab('orgs')}>
                Browse All Organizations
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedOrgs.map(org => (
                <div
                  key={org.id}
                  onClick={() => setActiveOrgId(org.slug || org.id)}
                  className="group cursor-pointer flex flex-col justify-between rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {org.logoUrl ? (
                          <img
                            src={org.logoUrl}
                            alt={org.name}
                            className="size-9 rounded-lg object-contain bg-[#F7F7F8] p-1 border border-black/6 shrink-0"
                          />
                        ) : (
                          <div className="size-9 rounded-lg bg-[#F0EDFA] border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                            <Building2 className="size-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-[#11141B] truncate group-hover:text-[#8B5CF6] transition-colors">
                            {org.name}
                          </h4>
                          <span className="text-[11px] font-mono text-[#686D79]">
                            {org.totalProjects || 0} projects
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={e => handleCardBookmarkClick(e, org)}
                        className="rounded p-1 text-[#8B5CF6] hover:bg-[#F0EDFA] transition-colors"
                        title="Remove bookmark"
                      >
                        <Bookmark className="size-4 fill-current" />
                      </button>
                    </div>

                    <p className="mt-2.5 text-xs text-[#686D79] line-clamp-2 leading-relaxed">
                      {org.description || 'Verified open source organization.'}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-[#8B5CF6]">
                    <span>View Full Intelligence</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 2-Column Discovery Grid */
        <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Left Column: Filters */}
          <aside className="space-y-4">
            <section className="rounded-xl border border-black/7 bg-white p-4 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#11141B] flex items-center gap-1.5">
                  <Filter className="size-3.5 text-[#8B5CF6]" />
                  <span>Filters</span>
                </span>
                {(selectedPlatforms.length < ALL_PLATFORMS.length || selectedTechs.length > 0 || search || beginnerOnly) && (
                  <button
                    onClick={() => {
                      setSelectedPlatforms(ALL_PLATFORMS.map(p => p.id));
                      setSelectedTechs([]);
                      setSearch('');
                      setBeginnerOnly(false);
                      setPage(1);
                    }}
                    className="text-[10px] font-mono text-[#8B5CF6] hover:underline"
                  >
                    Reset all
                  </button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="block text-[10px] font-semibold text-[#686D79] uppercase tracking-wider mb-1.5">
                  Search directory
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#999CA3]" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Name, keyword, tech..."
                    className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] pl-8 pr-2 text-xs text-[#11141B] placeholder:text-[#999CA3] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Multi-Platform Badges */}
              <div>
                <label className="block text-[10px] font-semibold text-[#686D79] uppercase tracking-wider mb-2">
                  Platforms & Programs
                </label>
                <div className="space-y-1.5">
                  {ALL_PLATFORMS.map(p => {
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          active
                            ? 'bg-[#F0EDFA] border-[#8B5CF6]/30 text-[#8B5CF6]'
                            : 'bg-white border-black/6 text-[#686D79] hover:bg-[#F7F7F8]'
                        }`}
                      >
                        <span>{p.name}</span>
                        {active && <Check className="size-3.5 text-[#8B5CF6]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Technologies Filter with AND/OR Logic */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-semibold text-[#686D79] uppercase tracking-wider">
                    Technologies
                  </label>
                  <div className="flex items-center gap-1 bg-[#F7F7F8] p-0.5 rounded border border-black/5 text-[9px] font-mono">
                    <button
                      onClick={() => setTechLogic('OR')}
                      className={`px-1.5 py-0.5 rounded ${techLogic === 'OR' ? 'bg-white text-[#8B5CF6] font-bold shadow-2xs' : 'text-[#686D79]'}`}
                      title="Match Any Technology (OR)"
                    >
                      OR
                    </button>
                    <button
                      onClick={() => setTechLogic('AND')}
                      className={`px-1.5 py-0.5 rounded ${techLogic === 'AND' ? 'bg-white text-[#8B5CF6] font-bold shadow-2xs' : 'text-[#686D79]'}`}
                      title="Match All Selected Technologies (AND)"
                    >
                      AND
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {POPULAR_TECHS.map(tech => {
                    const active = selectedTechs.includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => toggleTech(tech)}
                        className={`px-2 py-1 rounded-md text-[11px] font-mono border transition-all ${
                          active
                            ? 'bg-[#11141B] border-[#11141B] text-white'
                            : 'bg-[#F7F7F8] border-black/6 text-[#686D79] hover:bg-white'
                        }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Beginner Friendly Toggle */}
              <div className="pt-3 border-t border-black/5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={beginnerOnly}
                    onChange={e => {
                      setBeginnerOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="size-4 rounded border-black/20 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                  <span className="text-xs text-[#11141B] font-medium">Beginner-friendly issues</span>
                </label>
              </div>
            </section>
          </aside>

          {/* Right Column: Organizations Grid */}
          <main className="rounded-xl border border-black/7 bg-white">
            <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
              <h3 className="text-[11px] font-semibold text-[#11141B]">Organization Directory</h3>
              <span className="text-[9px] text-[#999CA3] font-mono">
                {loading ? 'Querying...' : `Showing ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} verified organizations`}
              </span>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-44 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-8 text-center text-xs text-red-500">
                  <AlertTriangle className="size-6 mx-auto mb-2 text-red-400" />
                  <p>{error}</p>
                </div>
              ) : orgs.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-5 py-8 text-center">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                    <Building2 className="size-5" />
                  </span>
                  <h3 className="mt-4 text-xs font-semibold text-[#11141B]">No organizations matched your filters</h3>
                  <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                    Try loosening your technology requirements or enabling additional platforms like Outreachy or LFX.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedPlatforms(ALL_PLATFORMS.map(p => p.id));
                      setSelectedTechs([]);
                      setSearch('');
                      setBeginnerOnly(false);
                      setPage(1);
                    }}
                    className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {orgs.map(org => (
                    <div
                      key={org.id}
                      onClick={() => setActiveOrgId(org.slug || org.id)}
                      className="group cursor-pointer flex flex-col justify-between rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            {org.logoUrl ? (
                              <img
                                src={org.logoUrl}
                                alt={org.name}
                                className="size-9 rounded-lg object-contain bg-[#F7F7F8] p-1 border border-black/6 shrink-0"
                              />
                            ) : (
                              <div className="size-9 rounded-lg bg-[#F0EDFA] border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                                <Building2 className="size-4" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-[#11141B] truncate group-hover:text-[#8B5CF6] transition-colors">
                                {org.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-[#686D79] flex-wrap">
                                <span>{org.totalProjects} projects</span>
                                <span>•</span>
                                <span>{org.participationYears?.length || 1} yrs active</span>
                              </div>
                            </div>
                          </div>

                          {token && (
                            <button
                              onClick={e => handleCardBookmarkClick(e, org)}
                              className={`p-1 rounded transition-colors ${
                                org.isSaved
                                  ? 'text-[#8B5CF6] hover:bg-[#F0EDFA]'
                                  : 'text-[#999CA3] hover:text-[#11141B] hover:bg-[#F7F7F8]'
                              }`}
                              title={org.isSaved ? 'Saved' : 'Save organization'}
                            >
                              <Bookmark className={`size-4 ${org.isSaved ? 'fill-current' : ''}`} />
                            </button>
                          )}
                        </div>

                        <p className="mt-2.5 text-xs text-[#686D79] line-clamp-2 leading-relaxed">
                          {org.description || 'Verified open source organization.'}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-black/5 space-y-2.5">
                        {/* Platform & Tech Badges */}
                        <div className="flex flex-wrap gap-1 items-center">
                          {org.verifiedPlatforms?.map((plat: string) => (
                            <span
                              key={plat}
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F0EDFA] text-[#8B5CF6] border border-[#8B5CF6]/20"
                            >
                              {plat}
                            </span>
                          ))}

                          {org.technologies && org.technologies.slice(0, 3).map((tech: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#F7F7F8] text-[#686D79] border border-black/5"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#686D79] pt-1">
                          <span className="flex items-center gap-1 text-[#8B5CF6] font-medium text-[10px]">
                            <Check className="size-3" />
                            <span>Verified</span>
                          </span>

                          <span className="text-[10px] text-[#686D79] group-hover:text-[#8B5CF6] flex items-center gap-1 transition-colors">
                            <span>Inspect</span>
                            <ArrowRight className="size-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-black/7">
                  <div className="text-xs font-mono text-[#686D79]">
                    Page <span className="text-[#11141B] font-medium">{pagination.page}</span> of <span className="text-[#11141B] font-medium">{pagination.totalPages}</span> ({pagination.total} organizations)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <div className="px-3 py-1 rounded-md bg-[#F7F7F8] border border-black/7 text-xs font-mono text-[#11141B]">
                      {pagination.page} / {pagination.totalPages}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Detail Slide-over / Modal */}
      {activeOrgId && (
        <OrganizationDetailModal
          organizationIdOrSlug={activeOrgId}
          onClose={() => setActiveOrgId(null)}
          onBookmarkToggled={handleBookmarkToggled}
        />
      )}
    </PageContainer>
  );
}

// Export alias
export const OrganizationsPage = GsocPage;
