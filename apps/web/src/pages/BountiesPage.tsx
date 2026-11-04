import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Bookmark, Filter, ShieldCheck, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function BountiesPage() {
  const { token } = useAuth();
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/opensource/bounties')
      .then(r => r.json())
      .then(json => {
        if (json.success) setBounties(json.data.bounties);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">Open Source Bounties</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] font-mono text-xs font-semibold">
            Monetized Contributions
          </span>
        </div>
        <p className="text-xs text-[#686D79] mt-1">
          Verified open source bounties and paid developer issues with live reward tracking
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bounties.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-[#686D79]">{b.repository?.fullName || 'Open Source Repo'}</span>
                    <h3 className="text-base font-semibold text-[#F8FAFC] mt-1 leading-snug">{b.title}</h3>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] font-mono text-xs font-bold shrink-0">
                    ${b.bountyAmount} {b.currency}
                  </span>
                </div>

                <p className="mt-3 text-xs text-[#C5C8D0] line-clamp-2 leading-relaxed">
                  {b.body || 'Open source contribution with verified cash reward upon merge.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2430] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181C26] text-[#C5C8D0] border border-[#1F2430]">
                    {b.difficulty || 'intermediate'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                    Verified Reward
                  </span>
                </div>

                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#A78BFA] hover:text-[#F8FAFC] font-medium transition-colors"
                >
                  <span>Solve on GitHub</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
