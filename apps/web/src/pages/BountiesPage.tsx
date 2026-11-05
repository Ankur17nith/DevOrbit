import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Bookmark, Filter, ShieldCheck, DollarSign, Award, CircleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';

export function BountiesPage() {
  const { token } = useAuth();
  
  const getInitialParams = () => {
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    return {
      difficulty: params.get('difficulty') || 'All',
      currency: params.get('currency') || 'All',
    };
  };

  const initial = getInitialParams();
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initial.difficulty);
  const [selectedCurrency, setSelectedCurrency] = useState(initial.currency);

  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];
  const currencies = ['All', 'USD', 'EUR', 'USDC'];

  useEffect(() => {
    const urlParams = new URLSearchParams();
    if (selectedDifficulty !== 'All') urlParams.set('difficulty', selectedDifficulty);
    if (selectedCurrency !== 'All') urlParams.set('currency', selectedCurrency);
    const qs = urlParams.toString();
    const newPath = qs ? `${window.location.pathname}#bounties?${qs}` : `${window.location.pathname}#bounties`;
    window.history.replaceState(null, '', newPath);
  }, [selectedDifficulty, selectedCurrency]);

  useEffect(() => {
    fetch('/api/v1/opensource/bounties')
      .then(r => r.json())
      .then(json => {
        if (json.success) setBounties(json.data.bounties || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBounties = bounties.filter(b => {
    if (selectedDifficulty !== 'All' && (b.difficulty || '').toLowerCase() !== selectedDifficulty.toLowerCase()) {
      return false;
    }
    if (selectedCurrency !== 'All' && (b.currency || 'USD').toUpperCase() !== selectedCurrency.toUpperCase()) {
      return false;
    }
    return true;
  });

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Open source</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Bounties</h2>
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
            {selectedDifficulty !== 'All' && (
              <button
                onClick={() => setSelectedDifficulty('All')}
                className="text-[10px] text-[#8B5CF6] hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-4 p-4">
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Difficulty</span>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
              >
                {difficulties.map(d => (
                  <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </label>

            <div className="pt-2 border-t border-black/5 space-y-2 text-[10px] text-[#686D79]">
              <div className="flex items-center gap-1.5 font-medium text-[#11141B]">
                <ShieldCheck className="size-3.5 text-[#8B5CF6]" />
                <span>Verified Escrow Bounties</span>
              </div>
              <p className="leading-relaxed">
                Rewards are tracked from Algora, GitHub Sponsors, or public bounty programs with backed escrow funds.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Bounties Grid */}
        <section className="rounded-xl border border-black/7 bg-white">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#11141B]">Active Bounties</h3>
            <span className="text-[9px] text-[#999CA3]">
              {loading ? 'Searching...' : `${filteredBounties.length} bounties available`}
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-40 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
                ))}
              </div>
            ) : filteredBounties.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                  <DollarSign className="size-5" />
                </span>
                <h3 className="mt-4 text-xs font-semibold text-[#11141B]">No open bounties right now</h3>
                <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                  Check back soon for newly funded issues and bug bounty challenges from verified repositories.
                </p>
                <button
                  onClick={() => setSelectedDifficulty('All')}
                  className="mt-5 rounded-md border border-black/9 bg-white px-3 py-2 text-[10px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredBounties.map(b => (
                  <div
                    key={b.id}
                    className="group flex flex-col justify-between rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 hover:shadow-xs transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-mono text-[#686D79] truncate block">
                            {b.repository?.fullName || 'Open Source Repo'}
                          </span>
                          <h4 className="mt-1 text-sm font-semibold text-[#11141B] group-hover:text-[#8B5CF6] transition-colors leading-snug">
                            {b.title}
                          </h4>
                        </div>

                        <span className="px-2.5 py-1 rounded-md bg-[#F0EDFA] border border-[#8B5CF6]/25 text-[#8B5CF6] font-mono text-xs font-bold shrink-0">
                          ${b.bountyAmount} {b.currency || 'USD'}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#686D79] line-clamp-2 leading-relaxed">
                        {b.body || 'Open source contribution with verified cash reward upon merge.'}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F7F7F8] text-[#686D79] border border-black/5">
                          {b.difficulty || 'intermediate'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                          Escrow Backed
                        </span>
                      </div>

                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-black/9 bg-[#11141B] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-black transition-colors"
                      >
                        <span>Solve</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
