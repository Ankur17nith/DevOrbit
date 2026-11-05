import React, { useState, useEffect } from 'react';
import { Bot, Save, ShieldAlert, CheckCircle2, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, PageHeading, StatusBadge, Button } from '../components/ui/index.js';

export function SelfbotPage() {
  const { token } = useAuth();
  const [repo, setRepo] = useState('devorbit/core');
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('👋 Welcome @contributor to the repository! Please read our CONTRIBUTING.md before opening PRs.');
  const [goodbyeEnabled, setGoodbyeEnabled] = useState(false);
  const [goodbyeMessage, setGoodbyeMessage] = useState('Thank you for contributing! Your PR has been closed.');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/v1/opensource/selfbot/config?repo=${repo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setWelcomeEnabled(json.data.welcomeEnabled);
          setWelcomeMessage(json.data.welcomeMessage || '');
          setGoodbyeEnabled(json.data.goodbyeEnabled);
          setGoodbyeMessage(json.data.goodbyeMessage || '');
        }
      })
      .catch(console.error);
  }, [token, repo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      const res = await fetch('/api/v1/opensource/selfbot/config', {
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
          isEnabled: true,
        }),
      });
      const json = await res.json();
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
    <PageContainer>
      <PageHeading
        title="GitHub Selfbot Automator"
        description="Zero-action GitHub maintainer automation: auto-respond to first-time contributors and manage slash commands"
        badges={[
          <StatusBadge key="badge" variant="violet">
            Maintainer Automation
          </StatusBadge>
        ]}
      />

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-start gap-3">
        <ShieldAlert className="size-5 text-[#8B5CF6] shrink-0 mt-0.5" />
        <div className="text-xs text-[#C5C8D0] leading-relaxed">
          <strong className="text-[#F8FAFC]">Strict Permission Isolation:</strong> DevOrbit Selfbot operates only on explicit repositories where you possess maintainer or admin access. Automation runs under your identity and requires explicit activation.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Repo Target */}
        <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-3">
          <label className="block text-xs font-medium text-[#C5C8D0]">Target GitHub Repository</label>
          <input
            type="text"
            required
            value={repo}
            onChange={e => setRepo(e.target.value)}
            placeholder="owner/repository"
            className="w-full px-3 py-2 rounded-lg bg-[#0B0D12] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>

        {/* Welcome Message Module */}
        <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Contributor Welcome Message</h3>
              <p className="text-xs text-[#686D79]">Automatically replies when a new contributor files their first issue or PR</p>
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
            className="w-full p-3 rounded-xl bg-[#0B0D12] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6] disabled:opacity-40 transition-colors"
          />
        </div>

        {/* Slash Command Preview */}
        <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-[#8B5CF6]" />
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Slash Command Rules</h3>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0D12] border border-[#1F2430] text-xs font-mono space-y-1.5">
            <div className="text-[#C5C8D0]">/guide &rarr; &quot;Replies with CONTRIBUTING.md link and deletes command&quot;</div>
            <div className="text-[#C5C8D0]">/reproduce &rarr; &quot;Requests step-by-step reproduction instructions&quot;</div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-mono text-[#4ADE80] flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              <span>Selfbot configuration deployed!</span>
            </span>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={saving}
            icon={<Save className="size-4" />}
            className="ml-auto"
          >
            {saving ? 'Deploying...' : 'Deploy Configuration'}
          </Button>
        </div>

      </form>
    </PageContainer>
  );
}
