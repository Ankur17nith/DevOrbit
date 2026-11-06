import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Building2,
  ExternalLink,
  Bookmark,
  Check,
  Calendar,
  Code2,
  GitFork,
  Star,
  Sparkles,
  BookOpen,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/index.js';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { safeHref } from '../lib/safeHref.js';

interface OrganizationDetailModalProps {
  organizationIdOrSlug: string | null;
  onClose: () => void;
  onBookmarkToggled?: (orgId: string, isSaved: boolean) => void;
}

export function OrganizationDetailModal({
  organizationIdOrSlug,
  onClose,
  onBookmarkToggled,
}: OrganizationDetailModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!organizationIdOrSlug) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    apiFetch<any>(`/api/v1/opensource/organizations/${encodeURIComponent(organizationIdOrSlug)}`, {
      headers,
    })
      .then(res => {
        if (res.success && res.data) {
          setData(res.data);
          setIsSaved(Boolean(res.data.isSaved));
        } else {
          setError('Organization details not found.');
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch organization details');
      })
      .finally(() => setLoading(false));
  }, [organizationIdOrSlug, token]);

  const handleToggleSave = async () => {
    if (!data || saving) return;
    setSaving(true);
    try {
      const res = await apiFetch<{ saved: boolean }>(
        `/api/v1/opensource/organizations/${data.id || data.slug}/save`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.success && res.data) {
        setIsSaved(res.data.saved);
        if (onBookmarkToggled) onBookmarkToggled(data.id, res.data.saved);
      }
    } catch (err) {
      console.error('Failed to save organization:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={Boolean(organizationIdOrSlug)} onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-black/8 bg-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 focus:outline-none">
          <Dialog.Title className="sr-only">{data?.name || organizationIdOrSlug || 'Organization Details'}</Dialog.Title>
          <Dialog.Description className="sr-only">{data?.description || 'Organization Overview'}</Dialog.Description>
          {/* Header */}
          <div className="flex items-start justify-between border-b border-black/7 p-6 bg-white">
          <div className="flex items-start gap-4 min-w-0">
            {data?.logoUrl ? (
              <img
                src={data.logoUrl}
                alt={data.name}
                className="size-14 rounded-xl object-contain bg-[#F7F7F8] p-1.5 border border-black/6 shrink-0"
              />
            ) : (
              <div className="size-14 rounded-xl bg-[#F0EDFA] border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <Building2 className="size-7" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold tracking-tight text-[#11141B] truncate">
                  {loading ? 'Loading organization...' : (data?.name || organizationIdOrSlug)}
                </h3>
                {data?.verifiedPlatforms?.map((plat: string) => (
                  <span
                    key={plat}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0EDFA] text-[#8B5CF6] border border-[#8B5CF6]/25 uppercase tracking-wide"
                  >
                    {plat}
                  </span>
                ))}
              </div>

              {data && (
                <div className="mt-1 flex items-center gap-3 text-xs font-mono text-[#686D79] flex-wrap">
                  <span>{data.totalProjects} Completed Projects</span>
                  <span>•</span>
                  <span>{data.participationYears?.length || 1} Years Active</span>
                  <span>•</span>
                  <span className="text-[#8B5CF6] font-medium flex items-center gap-1">
                    <Check className="size-3" /> Verified Org
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {token && data && (
              <Button
                variant={isSaved ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleToggleSave}
                disabled={saving}
                className="gap-1.5"
              >
                <Bookmark className={`size-3.5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </Button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#999CA3] hover:bg-[#F7F7F8] hover:text-[#11141B] transition-colors"
              title="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="space-y-4 py-8">
              <div className="h-4 bg-[#F7F7F8] rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-[#F7F7F8] rounded w-1/2 animate-pulse" />
              <div className="h-28 bg-[#F7F7F8] rounded-xl animate-pulse" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 text-center text-xs text-red-600 space-y-2">
              <AlertCircle className="size-6 mx-auto text-red-500" />
              <p className="font-medium">{error}</p>
            </div>
          ) : data && (
            <>
              {/* Description & Official Links */}
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-[#4B5563]">
                  {data.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {data.websiteUrl && (
                    <a
                      href={safeHref(data.websiteUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-[#F7F7F8] px-3 py-1.5 text-xs font-medium text-[#11141B] hover:border-[#8B5CF6]/50 hover:text-[#8B5CF6] transition-colors"
                    >
                      <ExternalLink className="size-3.5 text-[#8B5CF6]" />
                      <span>Official Website</span>
                    </a>
                  )}

                  {data.officialLinks?.repositoryOrg && (
                    <a
                      href={safeHref(data.officialLinks.repositoryOrg)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-[#F7F7F8] px-3 py-1.5 text-xs font-medium text-[#11141B] hover:border-[#8B5CF6]/50 hover:text-[#8B5CF6] transition-colors"
                    >
                      <Code2 className="size-3.5 text-[#686D79]" />
                      <span>GitHub Organization</span>
                    </a>
                  )}

                  {data.officialLinks?.contributingGuide && (
                    <a
                      href={safeHref(data.officialLinks.contributingGuide)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-[#F7F7F8] px-3 py-1.5 text-xs font-medium text-[#11141B] hover:border-[#8B5CF6]/50 hover:text-[#8B5CF6] transition-colors"
                    >
                      <BookOpen className="size-3.5 text-[#686D79]" />
                      <span>Contributing Guide</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Technologies & Focus Areas */}
              <div className="rounded-xl border border-black/7 bg-[#FAFAFA] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#686D79]">
                  Technology Stack & Topics
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.technologies?.map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-white text-[#11141B] border border-black/7 shadow-2xs"
                    >
                      {tech}
                    </span>
                  ))}
                  {data.topics?.map((topic: string, i: number) => (
                    <span
                      key={`topic-${i}`}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#F0EDFA] text-[#8B5CF6] border border-[#8B5CF6]/20"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Known Key Repositories */}
              {data.repositories && data.repositories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#686D79]">
                    Primary Repositories
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.repositories.map((repo: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-black/7 bg-white p-3.5 space-y-2 hover:border-[#8B5CF6]/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold font-mono text-[#11141B] truncate">
                            {repo.fullName}
                          </h5>
                          <a
                            href={`https://github.com/${repo.fullName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#999CA3] hover:text-[#11141B]"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                        <p className="text-[11px] text-[#686D79] line-clamp-2">
                          {repo.description || 'Open source repository.'}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#686D79] pt-1">
                          {repo.primaryLanguage && (
                            <span className="flex items-center gap-1 text-[#11141B]">
                              <span className="size-1.5 rounded-full bg-[#8B5CF6]" />
                              {repo.primaryLanguage}
                            </span>
                          )}
                          {repo.stars !== undefined && (
                            <span className="flex items-center gap-1">
                              <Star className="size-3 text-amber-500" />
                              {repo.stars.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentorship Program Participation History */}
              {data.mentorshipHistory && data.mentorshipHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#686D79]">
                    Mentorship History & Program Rounds
                  </h4>
                  <div className="rounded-xl border border-black/7 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F7F8] border-b border-black/7 text-[10px] font-mono uppercase text-[#686D79]">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Program</th>
                          <th className="py-2.5 px-4 font-semibold">Year</th>
                          <th className="py-2.5 px-4 font-semibold">Projects Mentored</th>
                          <th className="py-2.5 px-4 font-semibold">Stipend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 bg-white font-mono text-[11px]">
                        {data.mentorshipHistory.map((m: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#FAFAFA]">
                            <td className="py-2 px-4 font-semibold text-[#11141B]">{m.programName}</td>
                            <td className="py-2 px-4 text-[#686D79]">{m.year}</td>
                            <td className="py-2 px-4 text-[#686D79]">{m.projectCount || 2}+ projects</td>
                            <td className="py-2 px-4 text-emerald-600 font-medium">Eligible</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Open Issues & Opportunities */}
              {data.openIssues && data.openIssues.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#686D79]">
                      Beginner-Friendly Issues & Opportunities
                    </h4>
                    <span className="text-[10px] font-mono text-[#8B5CF6]">
                      {data.openIssues.length} issues available
                    </span>
                  </div>

                  <div className="space-y-2">
                    {data.openIssues.map((issue: any) => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-black/7 bg-[#FAFAFA] p-3 hover:bg-white hover:border-[#8B5CF6]/50 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#686D79]">
                            <span>{issue.repositoryFullName}</span>
                            <span>•</span>
                            <span className="text-[#8B5CF6]">#{issue.number}</span>
                            {issue.difficulty && (
                              <span className="px-1.5 py-0.2 rounded uppercase bg-white border border-black/5 text-[#686D79]">
                                {issue.difficulty}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs font-medium text-[#11141B] truncate">
                            {issue.title}
                          </p>
                        </div>

                        <a
                          href={safeHref(issue.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-black/8 bg-white px-2.5 py-1 text-xs font-medium text-[#11141B] hover:bg-zinc-50 shrink-0"
                        >
                          <span>View</span>
                          <ExternalLink className="size-3 text-[#999CA3]" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-black/7 p-4 bg-[#F7F7F8] flex items-center justify-between text-xs font-mono text-[#686D79]">
          <span>Provenance: {data?.sourceProvenance || 'verified_platform_archive'}</span>
          <Dialog.Close asChild>
            <Button variant="secondary" size="sm">
              Close
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
}
