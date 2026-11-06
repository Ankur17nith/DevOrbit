import React, { useState, useEffect } from 'react';
import { Bot, Save, ShieldAlert, CheckCircle2, Terminal, ExternalLink, GitPullRequest } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';
import { apiFetch } from '../lib/api.js';

export function SelfbotPage() {
  const { token } = useAuth();
  const [repo, setRepo] = useState('devorbit/core');
  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('👋 Welcome @contributor to the repository! Please read our CONTRIBUTING.md before opening PRs.');
  const [goodbyeEnabled, setGoodbyeEnabled] = useState(false);
  const [goodbyeMessage, setGoodbyeMessage] = useState('Thank you for contributing! Your PR has been closed.');
  const [isEnabled, setIsEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch(`/api/v1/opensource/selfbot/config?repo=${encodeURIComponent(repo)}`)
      .then(json => {
        if (json.success && json.data) {
          setWelcomeEnabled(json.data.welcomeEnabled ?? false);
          setWelcomeMessage(json.data.welcomeMessage || '');
          setGoodbyeEnabled(json.data.goodbyeEnabled ?? false);
          setGoodbyeMessage(json.data.goodbyeMessage || '');
          setIsEnabled(json.data.isEnabled ?? false);
        }
      })
      .catch(console.error);
  }, [token, repo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      const json = await apiFetch('/api/v1/opensource/selfbot/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          repositoryFullName: repo,
          welcomeEnabled,
          welcomeMessage,
          goodbyeEnabled,
          goodbyeMessage,
          isEnabled: welcomeEnabled || goodbyeEnabled,
        }),
      });
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Open source</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Repository Selfbot & Automation</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Results require a connected source. DevOrbit does not fabricate issues, amounts, deadlines, or activity.
          </p>
        </div>
      </div>

      {/* Inactive Notice Banner */}
      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 flex items-center gap-2.5">
        <ShieldAlert className="size-4 shrink-0 text-amber-600" />
        <p className="font-medium">
          Configuration only — not yet active. Automated background execution is currently disabled.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[250px_1fr]">
        
        {/* Left Column: Repository Target & Status */}
        <section className="rounded-xl border border-black/7 bg-white h-fit">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#11141B]">Repository Target</h3>
            <span className="text-[9px] text-[#8B5CF6] font-medium">Maintainer Mode</span>
          </div>

          <div className="space-y-4 p-4">
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#686D79]">Target GitHub repo</span>
              <input
                type="text"
                required
                value={repo}
                onChange={e => setRepo(e.target.value)}
                placeholder="owner/repository"
                className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2.5 text-xs font-mono text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none transition-colors"
              />
            </label>

            <div className="pt-2 border-t border-black/5 space-y-2 text-[10px] text-[#686D79]">
              <div className="flex items-center gap-1.5 font-medium text-[#11141B]">
                <ShieldAlert className="size-3.5 text-[#8B5CF6]" />
                <span>Permission Isolation</span>
              </div>
              <p className="leading-relaxed">
                DevOrbit Selfbot executes only on explicit repositories where you possess maintainer or admin access.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Maintainer Automation Pipeline */}
        <section className="rounded-xl border border-black/7 bg-white">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#11141B]">Maintainer Automations</h3>
            <span className="text-[9px] text-[#999CA3]">Auto-triage & response</span>
          </div>

          <form onSubmit={handleSave} className="p-4 space-y-5">
            {/* Welcome Message Module */}
            <div className="rounded-xl border border-black/7 bg-[#F7F7F8] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#11141B]">Contributor Welcome Responder</h4>
                  <p className="text-[11px] text-[#686D79]">Automatically comments when a new contributor files their first issue or PR</p>
                </div>
                <input
                  type="checkbox"
                  checked={welcomeEnabled}
                  onChange={e => setWelcomeEnabled(e.target.checked)}
                  className="size-4 accent-[#8B5CF6] rounded cursor-pointer"
                />
              </div>

              <textarea
                disabled={!welcomeEnabled}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-[#11141B] border border-black/10 text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6] disabled:opacity-40 transition-colors"
              />
            </div>

            {/* Slash Command Preview */}
            <div className="rounded-xl border border-black/7 bg-[#F7F7F8] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-[#8B5CF6]" />
                <h4 className="text-xs font-semibold text-[#11141B]">Slash Command Rules</h4>
              </div>
              <div className="p-3 rounded-lg bg-[#11141B] text-[#F8FAFC] text-xs font-mono space-y-1.5">
                <div className="text-[#C5C8D0]">/guide &rarr; &quot;Replies with CONTRIBUTING.md link and deletes command&quot;</div>
                <div className="text-[#C5C8D0]">/reproduce &rarr; &quot;Requests step-by-step reproduction instructions&quot;</div>
              </div>
            </div>

            {/* Save Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-black/7">
              {saved ? (
                <span className="text-xs font-mono text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" />
                  <span>Configuration deployed to GitHub webhook!</span>
                </span>
              ) : <div />}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={saving}
                icon={<Save className="size-3.5" />}
              >
                {saving ? 'Deploying...' : 'Deploy Configuration'}
              </Button>
            </div>
          </form>
        </section>

      </div>
    </PageContainer>
  );
}
