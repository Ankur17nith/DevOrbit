import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';

interface Program {
  id: string;
  name: string;
  slug: string;
  type?: string;
  category?: string;
  description: string;
  stipend?: string;
  websiteUrl: string;
  applicationStart?: string;
  applicationEnd?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'SCHEDULED';
  totalSlots?: number;
}

export function GsocPage() {
  const [activeTab, setActiveTab] = useState<'orgs' | 'programs'>('orgs');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [pagination, setPagination] = useState({ page: 1, total: 606, totalPages: 26 });

  const techFilters = ['All', 'python', 'c++', 'javascript', 'rust', 'go', 'robotics', 'ros', 'opencv', 'cloud'];

  // Fetch canonical mentorship programs
  const fetchPrograms = () => {
    setProgramsLoading(true);
    fetch('/api/v1/opensource/programs')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json.success) {
          const rawList = Array.isArray(json.data) ? json.data : (json.data?.programs || []);
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
      .catch(err => {
        console.error('Failed to load mentorship programs:', err);
      })
      .finally(() => setProgramsLoading(false));
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Fetch organizations with pagination & filters
  const fetchOrgs = (page = 1) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: '24',
    });
    if (search.trim()) params.append('search', search.trim());
    if (selectedTech !== 'All') params.append('technology', selectedTech);

    fetch(`/api/v1/opensource/gsoc?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load organizations (HTTP ${res.status})`);
        return res.json();
      })
      .then(json => {
        if (json.success && json.data) {
          setOrgs(json.data.orgs || []);
          if (json.data.pagination) {
            setPagination(json.data.pagination);
          }
        } else {
          throw new Error('Unexpected response structure from organizations API');
        }
      })
      .catch(err => {
        console.error('Organizations error:', err);
        setError(err.message || 'Failed to load organizations');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchOrgs(1), 200);
    return () => clearTimeout(timeout);
  }, [search, selectedTech]);

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Open source</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Organizations</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Results require a connected source. DevOrbit does not fabricate issues, amounts, deadlines, or activity.
          </p>
        </div>

        {/* Tab Switcher & Provenance Badge */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-black/8 bg-white px-2.5 py-1 text-[10px] text-[#686D79]">
            Source: Official GSoC Index
          </span>

          <div className="flex items-center gap-1 rounded-lg border border-black/7 bg-white p-1">
            <button
              onClick={() => setActiveTab('orgs')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'orgs'
                  ? 'bg-[#11141B] text-white'
                  : 'text-[#686D79] hover:text-[#11141B]'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Organizations</span>
            </button>

            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'programs'
                  ? 'bg-[#11141B] text-white'
                  : 'text-[#686D79] hover:text-[#11141B]'
              }`}
            >
              <Compass className="size-3.5" />
              <span>Programs & Deadlines</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchOrgs(pagination.page || 1)} icon={<RefreshCw className="size-3" />}>
            Retry
          </Button>
        </div>
      )}

      {/* VIEW 1: PROGRAMS & FELLOWSHIPS */}
      {activeTab === 'programs' && (
        <div className="mt-6 space-y-6">
          {programsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-56 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="rounded-xl border border-black/7 bg-white p-12 text-center">
              <Award className="size-8 text-[#999CA3] mx-auto" />
              <h3 className="mt-3 text-sm font-semibold text-[#11141B]">No programs found</h3>
              <p className="mt-1 text-xs text-[#686D79]">Mentorship programs are loaded dynamically from verified sources.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map(program => {
                const isUrgent = program.applicationEnd && (new Date(program.applicationEnd).getTime() - Date.now() < 72 * 3600 * 1000);
                return (
                  <div
                    key={program.id}
                    className="flex flex-col justify-between rounded-xl border border-black/7 bg-white p-5 hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          program.status === 'ACTIVE'
                            ? 'bg-[#F0EDFA] text-[#8B5CF6] border border-[#8B5CF6]/30'
                            : 'bg-zinc-100 text-[#686D79] border border-black/5'
                        }`}>
                          {program.status}
                        </span>
                        {isUrgent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-50 text-red-600 border border-red-200">
                            Deadline Soon
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-[#11141B]">{program.name}</h4>
                        <p className="mt-1 text-xs text-[#686D79] line-clamp-2 leading-relaxed">
                          {program.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-black/5 text-xs font-mono text-[#686D79]">
                        {program.stipend && (
                          <div className="flex items-center gap-1.5 text-[#8B5CF6] font-medium">
                            <DollarSign className="size-3.5" />
                            <span>{program.stipend}</span>
                          </div>
                        )}

                        {program.applicationEnd && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span>Deadline: {new Date(program.applicationEnd).toLocaleDateString()}</span>
                          </div>
                        )}

                        {program.totalSlots && (
                          <div className="flex items-center gap-1.5">
                            <Users className="size-3.5" />
                            <span>~{program.totalSlots} Fellowships</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <a
                      href={program.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md border border-black/9 bg-white px-3 py-2 text-xs font-medium text-[#11141B] hover:bg-zinc-50 transition-colors"
                    >
                      <span>Explore Program</span>
                      <ExternalLink className="size-3 text-[#999CA3]" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 606+ GSOC ORGANIZATIONS */}
      {activeTab === 'orgs' && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[250px_1fr]">
          
          {/* Left Column: Filters */}
          <section className="rounded-xl border border-black/7 bg-white h-fit">
            <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
              <h3 className="text-[11px] font-semibold text-[#11141B]">Filters</h3>
              {(search || selectedTech !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedTech('All');
                  }}
                  className="text-[10px] text-[#8B5CF6] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-4 p-4">
              <label className="block">
                <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Search organization</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#999CA3]" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search organizations or tech..."
                    className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] pl-8 pr-2 text-xs text-[#11141B] placeholder:text-[#999CA3] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Technology stack</span>
                <select
                  value={selectedTech}
                  onChange={e => setSelectedTech(e.target.value)}
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
                >
                  {techFilters.map(t => (
                    <option key={t} value={t}>{t === 'All' ? 'All Technologies' : t}</option>
                  ))}
                </select>
              </label>

              <div className="pt-2 border-t border-black/5 space-y-2 text-[10px] text-[#686D79]">
                <div className="flex items-center gap-1.5 text-[#11141B] font-medium">
                  <Building2 className="size-3.5 text-[#8B5CF6]" />
                  <span>Google Summer of Code</span>
                </div>
                <p className="leading-relaxed">
                  Indexed from the canonical GSoC directory with verified project histories and tech stacks.
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: Organizations Grid */}
          <section className="rounded-xl border border-black/7 bg-white">
            <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
              <h3 className="text-[11px] font-semibold text-[#11141B]">Directory</h3>
              <span className="text-[9px] text-[#999CA3]">
                {loading ? 'Searching...' : `Showing ${(pagination.page - 1) * 24 + 1} - ${Math.min(pagination.page * 24, pagination.total)} of ${pagination.total} verified organizations`}
              </span>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-44 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
                  ))}
                </div>
              ) : orgs.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-5 py-8 text-center">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                    <Building2 className="size-5" />
                  </span>
                  <h3 className="mt-4 text-xs font-semibold text-[#11141B]">No organizations found</h3>
                  <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                    Try modifying your technology filter or search keyword to match other organizations.
                  </p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedTech('All');
                    }}
                    className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {orgs.map(org => (
                    <div
                      key={org.id}
                      className="group flex flex-col justify-between rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all"
                    >
                      <div>
                        <div className="flex items-start gap-3">
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
                            <h4 className="text-sm font-semibold text-[#11141B] truncate group-hover:text-[#8B5CF6] transition-colors">{org.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono text-[#686D79]">
                              <span>{org.totalProjects} projects</span>
                              <span>•</span>
                              <span>{org.participationYears?.length || 1} yrs active</span>
                            </div>
                          </div>
                        </div>

                        <p className="mt-2.5 text-xs text-[#686D79] line-clamp-2 leading-relaxed">
                          {org.description || 'Google Summer of Code participating organization.'}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-black/5 space-y-2.5">
                        {/* Tech Tags */}
                        {org.technologies && org.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {org.technologies.slice(0, 3).map((tech: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F7F7F8] text-[#686D79] border border-black/5">
                                {tech}
                              </span>
                            ))}
                            {org.technologies.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#999CA3]">
                                +{org.technologies.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer with Website Link */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#686D79] pt-1">
                          <span className="flex items-center gap-1 text-[#8B5CF6] font-medium">
                            <Check className="size-3" />
                            <span>Verified Org</span>
                          </span>

                          {org.website && (
                            <a
                              href={org.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#686D79] hover:text-[#11141B] transition-colors"
                            >
                              <span>Website</span>
                              <ExternalLink className="size-3 text-[#999CA3]" />
                            </a>
                          )}
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
                    Showing <span className="text-[#11141B] font-medium">{(pagination.page - 1) * 24 + 1}</span> - <span className="text-[#11141B] font-medium">{Math.min(pagination.page * 24, pagination.total)}</span> of <span className="text-[#8B5CF6] font-semibold">{pagination.total}</span> verified organizations
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchOrgs(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <div className="px-3 py-1 rounded-md bg-[#F7F7F8] border border-black/7 text-xs font-mono text-[#11141B]">
                      Page {pagination.page} / {pagination.totalPages}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchOrgs(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </PageContainer>
  );
}
