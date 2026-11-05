import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Bookmark, Filter, ShieldCheck, DollarSign, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, PageHeading, StatusBadge, Button, EmptyState } from '../components/ui/index.js';

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
    <PageContainer>
      <PageHeading
        title="Open Source Bounties"
        description="Verified open source bounties and paid developer issues with live reward tracking"
        badges={[
          <StatusBadge key="badge" variant="violet">
            Monetized Contributions
          </StatusBadge>
        ]}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : bounties.length === 0 ? (
        <EmptyState
          title="No open bounties right now"
          description="Check back soon for new funded issues and bug bounty challenges."
          icon={<DollarSign className="size-8 text-[#686D79]" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bounties.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-[#686D79]">{b.repository?.fullName || 'Open Source Repo'}</span>
                    <h3 className="text-base font-semibold text-[#F8FAFC] mt-1 leading-snug group-hover:text-[#A78BFA] transition-colors">{b.title}</h3>
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30">
                    Verified Reward
                  </span>
                </div>

                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="secondary" size="sm" icon={<ExternalLink className="size-3" />}>
                    Solve on GitHub
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
