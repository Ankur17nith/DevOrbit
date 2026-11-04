import React, { useState, useEffect } from 'react';
import { Bot, Save, ShieldAlert, CheckCircle2, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

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
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Bot className="size-6 text-cyan-400" />
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">GitHub Selfbot Automator</h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Zero-action GitHub maintainer automation: auto-respond to first-time contributors and manage slash commands
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3">
        <ShieldAlert className="size-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 leading-relaxed">
          <strong className="text-white">Strict Permission Isolation:</strong> DevOrbit Selfbot operates only on explicit repositories where you possess maintainer or admin access. Automation runs under your identity and requires explicit activation.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Repo Target */}
        <div className="p-5 rounded-2xl bg-[#181819] border border-[#242424] space-y-3">
          <label className="block text-xs font-medium text-neutral-300">Target GitHub Repository</label>
          <input
            type="text"
            required
            value={repo}
            onChange={e => setRepo(e.target.value)}
            placeholder="owner/repository"
            className="w-full px-3 py-2 rounded-lg bg-[#0E0F10] border border-[#242424] text-white text-xs font-mono focus:outline-none focus:border-[#09AE5B]"
          />
        </div>

        {/* Welcome Message Module */}
        <div className="p-5 rounded-2xl bg-[#181819] border border-[#242424] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Contributor Welcome Message</h3>
              <p className="text-xs text-neutral-400">Automatically replies when a new contributor files their first issue or PR</p>
            </div>
            <input
              type="checkbox"
              checked={welcomeEnabled}
              onChange={e => setWelcomeEnabled(e.target.checked)}
              className="size-4 accent-[#09AE5B] rounded cursor-pointer"
            />
          </div>

          <textarea
            disabled={!welcomeEnabled}
            value={welcomeMessage}
            onChange={e => setWelcomeMessage(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl bg-[#0E0F10] border border-[#242424] text-white text-xs font-mono focus:outline-none focus:border-[#09AE5B] disabled:opacity-40"
          />
        </div>

        {/* Slash Command Mockup */}
        <div className="p-5 rounded-2xl bg-[#181819] border border-[#242424] space-y-3">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Slash Command Rules</h3>
          </div>
          <div className="p-3 rounded-xl bg-[#0E0F10] border border-[#242424] text-xs font-mono space-y-1">
            <div className="text-neutral-400">/guide &rarr; "Replies with CONTRIBUTING.md link and deletes command"</div>
            <div className="text-neutral-400">/reproduce &rarr; "Requests step-by-step reproduction instructions"</div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              <span>Selfbot configuration deployed!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto px-6 py-2.5 rounded-xl bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-[#09AE5B]/20 disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{saving ? 'Saving...' : 'Deploy Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
