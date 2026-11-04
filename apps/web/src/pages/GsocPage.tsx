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
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">Google Summer of Code (GSoC) Organizations</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 font-mono text-xs font-semibold">
              606+ Organizations
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Historical and current mentorship organization directory with verified participation years and tech stacks
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search organizations or tech..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#09AE5B]"
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
                ? 'bg-[#25262C] text-[#E5E5E5] border border-neutral-600'
                : 'text-neutral-400 hover:text-white bg-transparent border border-neutral-800/80 hover:bg-white/[0.03]'
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
            <div key={i} className="h-44 bg-[#181819] border border-[#242424] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-2xl bg-[#181819] border border-[#242424]">
          <Building2 className="size-8 text-neutral-500 mx-auto" />
          <h3 className="mt-3 text-sm font-semibold text-white">No organizations found</h3>
          <p className="mt-1 text-xs text-neutral-400">Try modifying your technology or query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map(org => (
            <div
              key={org.id}
              className="p-5 rounded-xl bg-[#181819] border border-[#242424] hover:border-neutral-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  {org.logoUrl ? (
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      className="size-10 rounded-lg object-contain bg-white/5 p-1 border border-neutral-800 shrink-0"
                    />
                  ) : (
                    <div className="size-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                      <Building2 className="size-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white truncate">{org.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-neutral-400">
                      <span>{org.totalProjects} projects</span>
                      <span>•</span>
                      <span>{org.participationYears?.length || 1} yrs active</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {org.description || 'Google Summer of Code participating organization.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#242424]/60 space-y-2.5">
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1">
                  {org.technologies?.slice(0, 4).map((tech: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {tech}
                    </span>
                  ))}
                  {org.technologies?.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-500">
                      +{org.technologies.length - 4}
                    </span>
                  )}
                </div>

                {/* Footer with Website Link */}
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="size-3" />
                    <span>Verified Org</span>
                  </span>

                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
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
            className="px-3 py-1.5 rounded-lg bg-[#181819] border border-[#242424] text-xs font-medium text-neutral-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-neutral-400 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchOrgs(pagination.page + 1)}
            className="px-3 py-1.5 rounded-lg bg-[#181819] border border-[#242424] text-xs font-medium text-neutral-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
