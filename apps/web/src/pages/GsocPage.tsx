import React, { useState, useEffect } from 'react';
import { Search, Building2, ExternalLink, Calendar, Code, Check } from 'lucide-react';

export function GsocPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const techFilters = ['All', 'python', 'c++', 'javascript', 'rust', 'go', 'robotics', 'ros', 'opencv', 'cloud'];

  const fetchOrgs = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '24',
    });
    if (search) params.append('search', search);
    if (selectedTech !== 'All') params.append('technology', selectedTech);

    fetch(`/api/v1/opensource/gsoc?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setOrgs(json.data.orgs);
          setPagination(json.data.pagination);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchOrgs(1), 200);
    return () => clearTimeout(timeout);
  }, [search, selectedTech]);

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">
              Google Summer of Code (GSoC) Organizations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] font-mono text-xs font-semibold">
              606+ Organizations
            </span>
          </div>
          <p className="text-xs text-[#686D79] mt-1">
            Historical and current mentorship organization directory with verified participation years and tech stacks
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search organizations or tech..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
      </div>

      {/* Tech Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {techFilters.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTech(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedTech === t
                ? 'bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/40 font-semibold'
                : 'text-[#686D79] hover:text-[#F8FAFC] bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Organization Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-2xl bg-[#12151D] border border-[#1F2430]">
          <Building2 className="size-8 text-[#686D79] mx-auto" />
          <h3 className="mt-3 text-sm font-semibold text-[#F8FAFC]">No organizations found</h3>
          <p className="mt-1 text-xs text-[#686D79]">Try modifying your technology or query.</p>
        </div>
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
                  <span className="flex items-center gap-1 text-[#22C55E]">
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
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchOrgs(pagination.page - 1)}
            className="px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#C5C8D0] disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-[#686D79] px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchOrgs(pagination.page + 1)}
            className="px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#C5C8D0] disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
