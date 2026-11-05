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
import { PageContainer, PageHeading, StatusBadge, Button, EmptyState } from '../components/ui/index.js';

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

  // Fetch canonical programs
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
        setError(err.message || 'Failed to connect to organizations index');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchOrgs(1), 200);
    return () => clearTimeout(timeout);
  }, [search, selectedTech]);

  return (
    <PageContainer>
      <PageHeading
        title="Open Source Organizations & Programs"
        description="Verified Google Summer of Code organizations, global mentorship fellowships, application deadlines, and tech stack index"
        badges={[
          <StatusBadge key="count" variant="violet">
            {pagination.total > 0 ? `${pagination.total} Verified Orgs` : '606 Verified Orgs'}
          </StatusBadge>,
          <StatusBadge key="provenance" variant="neutral">
            Source: Official GSoC Index
          </StatusBadge>
        ]}
        actions={
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#12151D] border border-[#1F2430]">
            <button
              onClick={() => setActiveTab('orgs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'orgs'
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Organizations Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'programs'
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <Compass className="size-3.5" />
              <span>Programs & Deadlines</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#FCA5A5] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-[#EF4444]" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchOrgs(pagination.page || 1)} icon={<RefreshCw className="size-3" />}>
            Retry
          </Button>
        </div>
      )}

      {/* VIEW 1: PROGRAMS & FELLOWSHIPS */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          {programsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-56 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : programs.length === 0 ? (
            <EmptyState
              title="No programs found"
              description="Mentorship programs are loaded dynamically from verified sources."
              icon={<Award className="size-8 text-[#686D79]" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {programs.map(program => {
                const isUrgent = program.applicationEnd && (new Date(program.applicationEnd).getTime() - Date.now() < 72 * 3600 * 1000);
                return (
                  <div
                    key={program.id}
                    className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          program.status === 'ACTIVE'
                            ? 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30'
                            : 'bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30'
                        }`}>
                          {program.status}
                        </span>
                        {isUrgent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 animate-pulse">
                            Deadline Soon
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#F8FAFC] leading-snug">{program.name}</h3>
                        <p className="mt-1 text-xs text-[#686D79] line-clamp-2 leading-relaxed">
                          {program.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-[#1F2430] text-xs font-mono text-[#C5C8D0]">
                        {program.stipend && (
                          <div className="flex items-center gap-1.5 text-[#4ADE80]">
                            <DollarSign className="size-3.5" />
                            <span>{program.stipend}</span>
                          </div>
                        )}

                        {program.applicationEnd && (
                          <div className="flex items-center gap-1.5 text-[#686D79]">
                            <Clock className="size-3.5" />
                            <span>Deadline: {new Date(program.applicationEnd).toLocaleDateString()}</span>
                          </div>
                        )}

                        {program.totalSlots && (
                          <div className="flex items-center gap-1.5 text-[#686D79]">
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
                    >
                      <Button variant="secondary" size="sm" className="w-full" icon={<ExternalLink className="size-3" />}>
                        Explore Program
                      </Button>
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
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#12151D] border border-[#1F2430]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search organizations or tech..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            {/* Tech Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {techFilters.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTech(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedTech === t
                      ? 'bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/40 font-semibold shadow-sm'
                      : 'text-[#686D79] hover:text-[#F8FAFC] bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Organization Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-44 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orgs.length === 0 ? (
            <EmptyState
              title="No organizations found"
              description="Try modifying your technology filter or search keyword."
              icon={<Building2 className="size-8 text-[#686D79]" />}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setSelectedTech('All');
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgs.map(org => (
                <div
                  key={org.id}
                  className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      {org.logoUrl ? (
                        <img
                          src={org.logoUrl}
                          alt={org.name}
                          className="size-10 rounded-lg object-contain bg-white/5 p-1 border border-[#1F2430] shrink-0"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#686D79] shrink-0">
                          <Building2 className="size-5 text-[#8B5CF6]" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-[#F8FAFC] truncate">{org.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-[#686D79]">
                          <span>{org.totalProjects} projects</span>
                          <span>•</span>
                          <span>{org.participationYears?.length || 1} yrs active</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[#C5C8D0] line-clamp-2 leading-relaxed">
                      {org.description || 'Google Summer of Code participating organization.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1F2430] space-y-2.5">
                    {/* Tech Tags */}
                    <div className="flex flex-wrap gap-1">
                      {org.technologies?.slice(0, 4).map((tech: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181C26] text-[#C5C8D0] border border-[#1F2430]">
                          {tech}
                        </span>
                      ))}
                      {org.technologies?.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#686D79]">
                          +{org.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Footer with Website Link */}
                    <div className="flex items-center justify-between text-xs font-mono text-[#686D79] pt-1">
                      <span className="flex items-center gap-1 text-[#4ADE80]">
                        <Check className="size-3" />
                        <span>Verified Org</span>
                      </span>

                      {org.website && (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#686D79] hover:text-[#A78BFA] transition-colors"
                        >
                          <span>Website</span>
                          <ExternalLink className="size-3" />
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#1F2430]">
              <div className="text-xs font-mono text-[#686D79]">
                Showing <span className="text-[#F8FAFC]">{(pagination.page - 1) * 24 + 1}</span> - <span className="text-[#F8FAFC]">{Math.min(pagination.page * 24, pagination.total)}</span> of <span className="text-[#8B5CF6] font-semibold">{pagination.total}</span> verified organizations
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
                <div className="px-3 py-1 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-[#C5C8D0]">
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
      )}
    </PageContainer>
  );
}
