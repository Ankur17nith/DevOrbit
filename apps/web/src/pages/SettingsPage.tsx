import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Zap,
  Server,
  Bell,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';
import { apiFetch } from '../lib/api.js';
import { ENDPOINTS } from '../lib/endpoints.js';

export function SettingsPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'security' | 'privacy' | 'notifications' | 'ai' | 'backup'>('general');
  const [ecoMode, setEcoMode] = useState<boolean>(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [backupLoading, setBackupLoading] = useState<boolean>(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('qwen2.5-coder:7b');

  useEffect(() => {
    apiFetch(ENDPOINTS.system.health)
      .then(res => setHealthData(res.data || res))
      .catch(() => {});

    apiFetch(ENDPOINTS.ai.status)
      .then(j => j.success && setAiStatus(j.data))
      .catch(() => {});

    apiFetch(ENDPOINTS.ai.models)
      .then(j => j.success && setModels(j.data?.models || []))
      .catch(() => {});
  }, []);

  const handleDownloadBackup = async () => {
    if (!token) return;
    setBackupLoading(true);
    try {
      const baseUrl = (import.meta as any).env?.VITE_API_URL ?? '';
      const backupUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}${ENDPOINTS.system.backup}` : ENDPOINTS.system.backup;
      const res = await fetch(backupUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devorbit-backup-${user?.username || 'user'}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        const json = await apiFetch(ENDPOINTS.system.restore, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ backup: payload }),
        });
        if (json.success) {
          setRestoreStatus(json.message || 'Database restored successfully');
        } else {
          setRestoreStatus('Failed to restore backup: ' + (json.error?.message || 'Invalid file'));
        }
      } catch (err: any) {
        setRestoreStatus('Error reading file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'ai', label: 'AI Settings' },
    { id: 'backup', label: 'Data & Backups' },
  ];

  return (
    <PageContainer maxWidth="max-w-[1100px]">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Settings</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Settings</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Control your workspace, connected data, notifications, local models, and backups.
          </p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-[200px_1fr]">
        
        {/* Left Column: Sections Navigation */}
        <section className="rounded-xl border border-black/7 bg-white h-fit">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#11141B]">Sections</h3>
          </div>
          <div className="p-2 space-y-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id as any)}
                className={`w-full text-left rounded-md px-3 py-2 text-[10px] font-medium transition-colors ${
                  activeTab === s.id
                    ? 'bg-[#11141B] text-white font-semibold'
                    : 'text-[#686D79] hover:text-[#11141B] hover:bg-zinc-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Right Column: Active Tab Content */}
        <section className="rounded-xl border border-black/7 bg-white">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#11141B]">
              {sections.find(s => s.id === activeTab)?.label} Settings
            </h3>
            <span className="text-[9px] text-[#999CA3]">
              {activeTab === 'ai' ? 'Neural Runtime' : activeTab === 'backup' ? 'Encrypted JSON' : 'Verified State'}
            </span>
          </div>

          <div className="p-5 space-y-6">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#11141B]">Workspace Appearance & Units</h4>
                  <p className="text-[10px] text-[#686D79]">Figma light-canvas workspace configuration</p>
                </div>

                <div className="rounded-xl border border-black/7 bg-[#F7F7F8] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#11141B]">Energy Efficient Sync</p>
                      <p className="text-[10px] text-[#686D79]">Throttle background polling when the browser tab is inactive</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={ecoMode}
                      onChange={e => setEcoMode(e.target.checked)}
                      className="size-4 accent-[#8B5CF6] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-black/7 bg-[#F7F7F8] p-4 space-y-3">
                  <p className="text-xs font-medium text-[#11141B]">System Health Diagnostic</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-white border border-black/6">
                      <span className="text-[9px] text-[#858993] block">Status</span>
                      <span className="font-semibold text-[#8B5CF6]">{healthData?.status || 'HEALTHY'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-black/6">
                      <span className="text-[9px] text-[#858993] block">API Environment</span>
                      <span className="text-[#11141B]">{healthData?.environment || 'Development'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-black/6">
                      <span className="text-[9px] text-[#858993] block">Uptime</span>
                      <span className="text-[#11141B]">{healthData?.uptime ? `${Math.round(healthData.uptime)}s` : '100%'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#11141B]">Account Identity</h4>
                  <p className="text-[10px] text-[#686D79]">Your registered developer identity</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-[#686D79] uppercase">Username</span>
                    <input
                      type="text"
                      disabled
                      value={user?.username || 'developer'}
                      className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs text-[#11141B]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-[#686D79] uppercase">Email</span>
                    <input
                      type="text"
                      disabled
                      value={user?.email || 'user@devorbit.local'}
                      className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs text-[#11141B]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-black/7 bg-[#F7F7F8]">
                  <p className="text-xs font-medium text-[#11141B]">Account Role & Tier</p>
                  <p className="text-[10px] text-[#686D79] mt-0.5">Developer Private Edition — Full offline and neural capabilities enabled.</p>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#11141B]">Security & Sessions</h4>
                  <p className="text-[10px] text-[#686D79]">Credential isolation and token rotation</p>
                </div>

                <div className="rounded-xl border border-black/7 bg-[#F7F7F8] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-[#8B5CF6]" />
                    <span className="text-xs font-semibold text-[#11141B]">OAuth Token Protection</span>
                  </div>
                  <p className="text-[10px] text-[#686D79] leading-relaxed">
                    Third-party tokens from GitHub and Codeforces are encrypted with AES-256-GCM. Expiring tokens automatically refresh without exposing raw tokens to the client.
                  </p>
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#11141B]">Telemetry & Data Sovereignty</h4>
                  <p className="text-[10px] text-[#686D79]">Zero analytics trackers or behavioral telemetry</p>
                </div>

                <div className="rounded-xl border border-black/7 bg-[#F7F7F8] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <EyeOff className="size-4 text-[#8B5CF6]" />
                    <span className="text-xs font-semibold text-[#11141B]">Private By Design</span>
                  </div>
                  <p className="text-[10px] text-[#686D79] leading-relaxed">
                    DevOrbit does not transmit repository code, DSA solver notes, or conversation histories to third parties. All evaluations run against your local database and local Ollama instance.
                  </p>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#11141B]">Notification Preferences</h4>
                  <p className="text-[10px] text-[#686D79]">In-app alerts and mentorship deadline updates</p>
                </div>

                <div className="rounded-xl border border-black/7 bg-[#F7F7F8] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#11141B]">SM-2 Spaced Repetition Due Alerts</p>
                      <p className="text-[10px] text-[#686D79]">Show a notice when solved DSA problems are due for recall</p>
                    </div>
                    <input type="checkbox" defaultChecked className="size-4 accent-[#8B5CF6] rounded" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-black/5">
                    <div>
                      <p className="text-xs font-medium text-[#11141B]">Mentorship Deadline Warnings</p>
                      <p className="text-[10px] text-[#686D79]">Alert when GSoC or fellowship applications close within 72 hours</p>
                    </div>
                    <input type="checkbox" defaultChecked className="size-4 accent-[#8B5CF6] rounded" />
                  </div>
                </div>
              </div>
            )}

            {/* AI SETTINGS TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#11141B]">Local Neural Engine & Models</h4>
                  <p className="text-[10px] text-[#686D79]">Configure Ollama on localhost:11434 with automatic rule-based fallback</p>
                </div>

                <div className="rounded-xl border border-black/7 bg-[#F7F7F8] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#11141B]">Local Ollama Connection</p>
                      <p className="text-[10px] text-[#686D79]">Host: {aiStatus?.host || 'http://127.0.0.1:11434'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      aiStatus?.connected 
                        ? 'bg-[#F0EDFA] text-[#8B5CF6]' 
                        : 'bg-zinc-200 text-[#686D79]'
                    }`}>
                      {aiStatus?.connected ? 'Online' : 'Offline / Fallback'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-semibold text-[#686D79] mb-1">Active Neural Model</label>
                    <select
                      value={selectedModel}
                      onChange={e => setSelectedModel(e.target.value)}
                      className="h-9 w-full rounded-md border border-black/8 bg-white px-2.5 text-xs text-[#11141B]"
                    >
                      <option value="qwen2.5-coder:7b">qwen2.5-coder:7b (Recommended)</option>
                      <option value="codellama:7b">codellama:7b</option>
                      <option value="deepseek-coder:6.7b">deepseek-coder:6.7b</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* BACKUP & RESTORE TAB */}
            {activeTab === 'backup' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#11141B]">Data Portability & Backups</h4>
                  <p className="text-[10px] text-[#686D79]">Download your full DevOrbit workspace database or restore from a previous JSON export</p>
                </div>

                {restoreStatus && (
                  <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-xs text-[#8B5CF6]">
                    {restoreStatus}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-black/7 bg-[#F7F7F8] space-y-3 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#11141B]">Export Workspace</p>
                      <p className="text-[10px] text-[#686D79] mt-1 leading-relaxed">
                        Creates a JSON export of your solved problems, SM-2 cards, repos, and configuration.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={backupLoading}
                      onClick={handleDownloadBackup}
                      icon={<Download className="size-3.5" />}
                    >
                      {backupLoading ? 'Generating...' : 'Download JSON Backup'}
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border border-black/7 bg-[#F7F7F8] space-y-3 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#11141B]">Restore Workspace</p>
                      <p className="text-[10px] text-[#686D79] mt-1 leading-relaxed">
                        Restore your workspace data from a verified DevOrbit JSON backup file.
                      </p>
                    </div>
                    <label className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black/9 bg-white px-3 py-2 text-xs font-semibold text-[#11141B] hover:bg-zinc-50 cursor-pointer transition-colors">
                      <Upload className="size-3.5" />
                      <span>Select Backup File</span>
                      <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

      </div>
    </PageContainer>
  );
}
