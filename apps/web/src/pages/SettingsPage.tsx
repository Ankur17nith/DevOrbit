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
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function SettingsPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'ai' | 'backup' | 'app'>('account');
  const [ecoMode, setEcoMode] = useState<boolean>(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [backupLoading, setBackupLoading] = useState<boolean>(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/system/health')
      .then(r => r.json())
      .then(setHealthData)
      .catch(() => {});

    fetch('/api/v1/ai/status')
      .then(r => r.json())
      .then(j => j.success && setAiStatus(j.data))
      .catch(() => {});

    fetch('/api/v1/ai/models')
      .then(r => r.json())
      .then(j => j.success && setModels(j.data.models || []))
      .catch(() => {});
  }, []);

  const handleDownloadBackup = async () => {
    if (!token) return;
    setBackupLoading(true);
    try {
      const res = await fetch('/api/v1/system/backup', {
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
        const res = await fetch('/api/v1/system/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ backup: payload }),
        });
        const json = await res.json();
        if (json.success) {
          setRestoreStatus(json.message);
        } else {
          setRestoreStatus('Failed to restore backup: ' + (json.error || 'Invalid file'));
        }
      } catch (err: any) {
        setRestoreStatus('Error reading file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#1F2430]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#F8FAFC]">
            Settings & System Preferences
          </h1>
          <p className="text-xs text-[#686D79] mt-1">
            Manage your account credentials, local AI runtime, database backups, and hardware resource footprint.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1F2430] pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('account')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'account' ? 'bg-[#181C26] text-white font-semibold border border-[#1F2430]' : 'text-[#686D79] hover:text-[#C5C8D0]'
          }`}
        >
          <User className="size-3.5" />
          <span>Account Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'ai' ? 'bg-[#181C26] text-white font-semibold border border-[#1F2430]' : 'text-[#686D79] hover:text-[#C5C8D0]'
          }`}
        >
          <Sparkles className="size-3.5 text-[#8B5CF6]" />
          <span>Local AI Runtime</span>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'backup' ? 'bg-[#181C26] text-white font-semibold border border-[#1F2430]' : 'text-[#686D79] hover:text-[#C5C8D0]'
          }`}
        >
          <Database className="size-3.5 text-[#22C55E]" />
          <span>Backups & Restore</span>
        </button>
        <button
          onClick={() => setActiveTab('app')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'app' ? 'bg-[#181C26] text-white font-semibold border border-[#1F2430]' : 'text-[#686D79] hover:text-[#C5C8D0]'
          }`}
        >
          <Zap className="size-3.5 text-[#F59E0B]" />
          <span>App Preferences</span>
        </button>
      </div>

      {/* 1. Account Settings */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
            <h2 className="text-sm font-semibold text-[#F8FAFC]">Active User Session</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1">
                <span className="text-[#686D79]">Username</span>
                <p className="font-mono font-medium text-white">@{user?.username || 'alex_developer'}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1">
                <span className="text-[#686D79]">Email Address</span>
                <p className="font-mono font-medium text-white">{user?.email || 'alex@devorbit.local'}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1">
                <span className="text-[#686D79]">Full Name</span>
                <p className="font-medium text-white">{user?.name || 'Alex Chen'}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1">
                <span className="text-[#686D79]">Session Token Integrity</span>
                <p className="font-mono text-[#22C55E] flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Authenticated JWT (UUID jti)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI Runtime Settings */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#F8FAFC]">Ollama Daemon Configuration</h2>
                <p className="text-xs text-[#686D79] mt-0.5">
                  DevOrbit connects to local LLMs over HTTP on <code className="text-[#8B5CF6]">127.0.0.1:11434</code>.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                aiStatus?.ollamaAvailable 
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' 
                  : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
              }`}>
                {aiStatus?.ollamaAvailable ? 'Online' : 'Offline (Fallback Mode)'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#181C26] border border-[#1F2430] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#686D79]">Active Intelligence Engine:</span>
                <span className="font-mono font-semibold text-[#A78BFA]">{aiStatus?.activeEngine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686D79]">Default Model:</span>
                <span className="font-mono text-white">{aiStatus?.defaultModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686D79]">Privacy Guarantee:</span>
                <span className="text-[#22C55E] font-medium">{aiStatus?.privacy}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#C5C8D0]">Discovered Models</h3>
              <div className="divide-y divide-[#1F2430] rounded-xl bg-[#181C26] border border-[#1F2430] text-xs">
                {models.map((m: any) => (
                  <div key={m.name} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-medium text-white">{m.name}</span>
                      {m.description && <p className="text-[11px] text-[#686D79]">{m.description}</p>}
                    </div>
                    {m.isFallback ? (
                      <span className="px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] text-[10px] font-mono">
                        Deterministic Fallback
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-mono">
                        Neural LLM
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Backups & Restore */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Local Data Backup & Disaster Recovery</h2>
              <p className="text-xs text-[#686D79] mt-0.5">
                Export your full algorithmic progress, custom sheets, skill profiles, bookmarks, and preferences as an offline JSON snapshot.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleDownloadBackup}
                disabled={backupLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="size-3.5" />
                <span>{backupLoading ? 'Generating Snapshot...' : 'Export Local JSON Backup'}</span>
              </button>

              <label className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="size-3.5 text-[#22C55E]" />
                <span>Restore From Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>

            {restoreStatus && (
              <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{restoreStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. App Preferences */}
      {activeTab === 'app' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
            <h2 className="text-sm font-semibold text-[#F8FAFC]">Performance & Diagnostics</h2>

            {healthData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1">
                  <span className="text-[#686D79]">SQLite Query Latency</span>
                  <p className="font-mono text-white font-medium">{healthData.database?.latencyMs} ms</p>
                </div>
                <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1">
                  <span className="text-[#686D79]">Free System RAM</span>
                  <p className="font-mono text-white font-medium">{healthData.system?.freeMemoryMb} MB</p>
                </div>
                <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1">
                  <span className="text-[#686D79]">Platform Architecture</span>
                  <p className="font-mono text-white font-medium">{healthData.system?.platform} ({healthData.system?.arch})</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Eco Mode</span>
                <p className="text-[11px] text-[#686D79]">Throttles background poll intervals when idle to minimize laptop battery draw.</p>
              </div>
              <button
                onClick={() => setEcoMode(!ecoMode)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  ecoMode ? 'bg-[#8B5CF6]' : 'bg-[#1F2430]'
                }`}
              >
                <div className={`size-5 rounded-full bg-white transition-transform ${
                  ecoMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
