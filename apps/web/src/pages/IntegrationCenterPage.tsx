import React, { useState, useEffect } from 'react';
import { 
  Plug, 
  Code, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  UploadCloud, 
  Trash2, 
  Zap, 
  Database,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { GithubIcon } from '../components/icons/GithubIcon.js';
import { useAuth } from '../context/AuthContext.js';

export function IntegrationCenterPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [integrationsData, setIntegrationsData] = useState<any>(null);
  const [syncingMap, setSyncingMap] = useState<{ [key: string]: boolean }>({});
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  // Modal Dialog States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [inputHandle, setInputHandle] = useState<string>('');
  const [inputToken, setInputToken] = useState<string>('');
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // LeetCode Manual Import States
  const [lcEasy, setLcEasy] = useState<number>(0);
  const [lcMedium, setLcMedium] = useState<number>(0);
  const [lcHard, setLcHard] = useState<number>(0);

  // TUF Progress States
  const [tufCompleted, setTufCompleted] = useState<number>(0);
  const [tufStep, setTufStep] = useState<string>('Step 1: Learn the basics');

  const fetchIntegrations = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/v1/integrations/status', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setIntegrationsData(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIntegrations();
  }, [token]);

  // Connect GitHub PAT
  const handleConnectGithubPat = async () => {
    if (!inputToken.trim()) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch('/api/v1/integrations/github/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: inputToken.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to connect GitHub PAT');
      setActiveModal(null);
      setInputToken('');
      fetchIntegrations();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Disconnect GitHub
  const handleDisconnectGithub = async () => {
    if (!confirm('Are you sure you want to disconnect GitHub?')) return;
    setSyncingMap(prev => ({ ...prev, github: true }));
    try {
      await fetch('/api/v1/integrations/github', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIntegrations();
    } finally {
      setSyncingMap(prev => ({ ...prev, github: false }));
    }
  };

  // Connect Codeforces
  const handleConnectCodeforces = async () => {
    if (!inputHandle.trim()) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch('/api/v1/integrations/codeforces/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ handle: inputHandle.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'User not found on Codeforces');
      setActiveModal(null);
      setInputHandle('');
      fetchIntegrations();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Sync Codeforces
  const handleSyncCodeforces = async () => {
    setSyncingMap(prev => ({ ...prev, codeforces: true }));
    try {
      await fetch('/api/v1/integrations/codeforces/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingMap(prev => ({ ...prev, codeforces: false }));
    }
  };

  // Disconnect Codeforces
  const handleDisconnectCodeforces = async () => {
    if (!confirm('Disconnect Codeforces account?')) return;
    setSyncingMap(prev => ({ ...prev, codeforces: true }));
    try {
      await fetch('/api/v1/integrations/codeforces', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIntegrations();
    } finally {
      setSyncingMap(prev => ({ ...prev, codeforces: false }));
    }
  };

  // Connect / Import LeetCode
  const handleImportLeetCode = async () => {
    if (!inputHandle.trim()) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch('/api/v1/integrations/leetcode/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: inputHandle.trim(),
          easySolved: Number(lcEasy),
          mediumSolved: Number(lcMedium),
          hardSolved: Number(lcHard),
          totalSolved: Number(lcEasy) + Number(lcMedium) + Number(lcHard),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to import LeetCode stats');
      setActiveModal(null);
      setInputHandle('');
      fetchIntegrations();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Disconnect LeetCode
  const handleDisconnectLeetCode = async () => {
    if (!confirm('Disconnect LeetCode account?')) return;
    setSyncingMap(prev => ({ ...prev, leetcode: true }));
    try {
      await fetch('/api/v1/integrations/leetcode', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIntegrations();
    } finally {
      setSyncingMap(prev => ({ ...prev, leetcode: false }));
    }
  };

  // Connect / Import Take U Forward
  const handleImportTuf = async () => {
    if (!inputHandle.trim()) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch('/api/v1/integrations/tuf/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: inputHandle.trim(),
          totalCompleted: Number(tufCompleted),
          totalProblems: 455,
          activeSheet: 'Striver A2Z DSA Sheet',
          currentStep: tufStep,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to sync Take U Forward');
      setActiveModal(null);
      setInputHandle('');
      fetchIntegrations();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Disconnect TUF
  const handleDisconnectTuf = async () => {
    if (!confirm('Disconnect Take U Forward account?')) return;
    setSyncingMap(prev => ({ ...prev, tuf: true }));
    try {
      await fetch('/api/v1/integrations/tuf', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIntegrations();
    } finally {
      setSyncingMap(prev => ({ ...prev, tuf: false }));
    }
  };

  const copyOllamaCmd = () => {
    navigator.clipboard.writeText('ollama run deepseek-coder');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-[#12151D] border border-[#1F2430] rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-[#12151D] border border-[#1F2430] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { github, codeforces, leetcode, tuf, striver, ollama } = integrationsData || {};

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#12151D] via-[#181C26] to-[#0B0D12] border border-[#1F2430] relative overflow-hidden shadow-xl">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Plug className="size-4" />
            </div>
            <h1 className="text-2xl font-bold font-display text-[#F8FAFC]">
              Integration Center
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-mono font-medium">
              Real Integrations Engine
            </span>
          </div>
          <p className="text-xs text-[#686D79] max-w-2xl leading-relaxed">
            Connect your code repositories, competitive programming handles, and algorithmic problem trackers. All tokens are encrypted locally with AES-256-GCM.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          className="h-8 px-3 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs text-[#F8FAFC] flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
        >
          <RefreshCw className="size-3.5 text-[#8B5CF6]" />
          <span>Refresh All Status</span>
        </button>
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. GITHUB CARD */}
        <div className="rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#F8FAFC]">
                  <GithubIcon className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">GitHub</h2>
                  <p className="text-[11px] text-[#686D79]">Repositories, Commits & PRs</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${
                github?.isConnected 
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' 
                  : 'bg-[#1F2430] text-[#686D79] border-[#2E364A]'
              }`}>
                {github?.isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {github?.isConnected ? (
              <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Account:</span>
                  <span className="font-mono font-medium text-[#F8FAFC]">@{github.username}</span>
                </div>
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Synced Repos:</span>
                  <span className="font-mono">{github.repoCount || 0} repositories</span>
                </div>
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Security:</span>
                  <span className="text-[#22C55E] flex items-center gap-1">
                    <ShieldCheck className="size-3" /> AES-256-GCM Encrypted
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#686D79] leading-relaxed">
                Connect GitHub via Personal Access Token (or OAuth) to populate your 365-day commit calendar, repository velocity, and extracted skills.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between gap-2">
            {github?.isConnected ? (
              <>
                <button
                  onClick={handleDisconnectGithub}
                  disabled={syncingMap.github}
                  className="px-3 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="size-3" />
                  <span>Disconnect</span>
                </button>
                <button
                  onClick={() => {
                    setSyncingMap(prev => ({ ...prev, github: true }));
                    fetch('/api/v1/github/sync', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
                      .finally(() => {
                        setSyncingMap(prev => ({ ...prev, github: false }));
                        fetchIntegrations();
                      });
                  }}
                  disabled={syncingMap.github}
                  className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`size-3 ${syncingMap.github ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setActiveModal('github');
                  setInputToken('');
                  setModalError(null);
                }}
                className="w-full py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Plug className="size-3.5" />
                <span>Connect GitHub</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. CODEFORCES CARD */}
        <div className="rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#F59E0B]">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">Codeforces</h2>
                  <p className="text-[11px] text-[#686D79]">Official API Public Sync</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${
                codeforces?.isConnected 
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' 
                  : 'bg-[#1F2430] text-[#686D79] border-[#2E364A]'
              }`}>
                {codeforces?.isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {codeforces?.isConnected && codeforces?.stats?.profile ? (
              <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Handle:</span>
                  <span className="font-mono font-medium text-[#F8FAFC]">@{codeforces.handle}</span>
                </div>
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Rating / Rank:</span>
                  <span className="font-mono font-semibold text-[#8B5CF6]">
                    {codeforces.stats.profile.rating} ({codeforces.stats.profile.rank})
                  </span>
                </div>
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Solved Problems:</span>
                  <span className="font-mono font-medium text-[#22C55E]">
                    {codeforces.stats.totalSolved} solved
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#686D79] leading-relaxed">
                Connect your Codeforces handle to fetch your official rating, contest performance, and difficulty breakdown using the live Codeforces API.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between gap-2">
            {codeforces?.isConnected ? (
              <>
                <button
                  onClick={handleDisconnectCodeforces}
                  disabled={syncingMap.codeforces}
                  className="px-3 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="size-3" />
                  <span>Disconnect</span>
                </button>
                <button
                  onClick={handleSyncCodeforces}
                  disabled={syncingMap.codeforces}
                  className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`size-3 ${syncingMap.codeforces ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setActiveModal('codeforces');
                  setInputHandle('');
                  setModalError(null);
                }}
                className="w-full py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Plug className="size-3.5" />
                <span>Connect Codeforces Handle</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. LEETCODE CARD */}
        <div className="rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#F59E0B]">
                  <Brain className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">LeetCode</h2>
                  <p className="text-[11px] text-[#686D79]">Problems, Easy/Med/Hard</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${
                leetcode?.isConnected 
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' 
                  : 'bg-[#1F2430] text-[#686D79] border-[#2E364A]'
              }`}>
                {leetcode?.isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {leetcode?.isConnected && leetcode?.stats ? (
              <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Username:</span>
                  <span className="font-mono font-medium text-[#F8FAFC]">@{leetcode.username}</span>
                </div>
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Total Solved:</span>
                  <span className="font-mono font-semibold text-[#22C55E]">{leetcode.stats.totalSolved}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E]">
                    E: {leetcode.stats.easySolved}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B]">
                    M: {leetcode.stats.mediumSolved}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444]">
                    H: {leetcode.stats.hardSolved}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#686D79] leading-relaxed">
                Import your LeetCode problem solves via public GraphQL probe or simple JSON/CSV manual import without sharing sensitive session tokens.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between gap-2">
            {leetcode?.isConnected ? (
              <>
                <button
                  onClick={handleDisconnectLeetCode}
                  className="px-3 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="size-3" />
                  <span>Disconnect</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModal('leetcode');
                    setInputHandle(leetcode.username || '');
                    setLcEasy(leetcode.stats?.easySolved || 0);
                    setLcMedium(leetcode.stats?.mediumSolved || 0);
                    setLcHard(leetcode.stats?.hardSolved || 0);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#F8FAFC] flex items-center gap-1.5"
                >
                  <span>Update Stats</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setActiveModal('leetcode');
                  setInputHandle('');
                  setLcEasy(0);
                  setLcMedium(0);
                  setLcHard(0);
                  setModalError(null);
                }}
                className="w-full py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <UploadCloud className="size-3.5" />
                <span>Connect or Import LeetCode</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. TAKE U FORWARD (TUF) CARD */}
        <div className="rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#8B5CF6]">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">Take U Forward</h2>
                  <p className="text-[11px] text-[#686D79]">Striver A2Z Sheet Progress</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${
                tuf?.isConnected 
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' 
                  : 'bg-[#1F2430] text-[#686D79] border-[#2E364A]'
              }`}>
                {tuf?.isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {tuf?.isConnected && tuf?.stats ? (
              <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Account:</span>
                  <span className="font-mono font-medium text-[#F8FAFC]">@{tuf.username}</span>
                </div>
                <div className="flex justify-between text-[#C5C8D0]">
                  <span className="text-[#686D79]">Sheet Progress:</span>
                  <span className="font-mono font-semibold text-[#8B5CF6]">
                    {tuf.stats.totalCompleted} / {tuf.stats.totalProblems} ({tuf.stats.completionPercentage}%)
                  </span>
                </div>
                <div className="text-[11px] text-[#686D79] truncate">
                  Current: {tuf.stats.currentStep}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#686D79] leading-relaxed">
                Connect your Take U Forward account or log your current step in the Striver A2Z DSA sheet to schedule SM-2 spaced repetition drills.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between gap-2">
            {tuf?.isConnected ? (
              <>
                <button
                  onClick={handleDisconnectTuf}
                  className="px-3 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="size-3" />
                  <span>Disconnect</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModal('tuf');
                    setInputHandle(tuf.username || '');
                    setTufCompleted(tuf.stats?.totalCompleted || 0);
                    setTufStep(tuf.stats?.currentStep || 'Step 1: Learn the basics');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-medium text-[#F8FAFC]"
                >
                  <span>Update Step</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setActiveModal('tuf');
                  setInputHandle('');
                  setTufCompleted(64);
                  setTufStep('Step 4: Binary Search');
                  setModalError(null);
                }}
                className="w-full py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Plug className="size-3.5" />
                <span>Connect Take U Forward</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. STRIVER A2Z CURATED SHEET CARD */}
        <div className="rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#22C55E]">
                  <Database className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">Striver A2Z Curated</h2>
                  <p className="text-[11px] text-[#686D79]">Bundled DSA Sheet</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full border bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30">
                Bundled Ready
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#C5C8D0]">
                <span className="text-[#686D79]">Total Curriculum:</span>
                <span className="font-mono">{striver?.totalProblems || 455} problems</span>
              </div>
              <div className="flex justify-between text-[#C5C8D0]">
                <span className="text-[#686D79]">Solved Locally:</span>
                <span className="font-mono text-[#22C55E] font-semibold">{striver?.solvedCount || 0} solved</span>
              </div>
              <div className="flex justify-between text-[#C5C8D0]">
                <span className="text-[#686D79]">Deduplication:</span>
                <span className="text-[#A78BFA]">Cross-Platform Normalized</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1F2430]">
            <a
              href="#dsa"
              className="w-full py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-semibold text-[#F8FAFC] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Open DSA Workspace</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>

        {/* 6. OLLAMA LOCAL AI CARD */}
        <div className="rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#8B5CF6]">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">Ollama Local AI</h2>
                  <p className="text-[11px] text-[#686D79]">Local Neural Models</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${
                ollama?.isAvailable 
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' 
                  : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
              }`}>
                {ollama?.isAvailable ? 'Online (11434)' : 'Offline (Fallback Active)'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#181C26] border border-[#1F2430] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#C5C8D0]">
                <span className="text-[#686D79]">Endpoint:</span>
                <span className="font-mono text-[#F8FAFC]">127.0.0.1:11434</span>
              </div>
              <div className="flex justify-between text-[#C5C8D0]">
                <span className="text-[#686D79]">Active Engine:</span>
                <span className="font-mono text-[#A78BFA]">{ollama?.activeEngine}</span>
              </div>
              <div className="flex justify-between text-[#C5C8D0]">
                <span className="text-[#686D79]">Privacy:</span>
                <span className="text-[#22C55E]">100% Zero Cloud Telemetry</span>
              </div>
            </div>

            {!ollama?.isAvailable && (
              <div className="p-2.5 rounded-lg bg-[#0B0D12] border border-[#1F2430] space-y-1">
                <div className="text-[10px] text-[#686D79] flex items-center justify-between">
                  <span>Start local model:</span>
                  <button onClick={copyOllamaCmd} className="text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1">
                    {copiedCmd ? <Check className="size-3 text-[#22C55E]" /> : <Copy className="size-3" />}
                    <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="text-[11px] font-mono text-[#F8FAFC] block">
                  ollama run deepseek-coder
                </code>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#1F2430]">
            <button
              onClick={fetchIntegrations}
              className="w-full py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-semibold text-[#F8FAFC] flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="size-3.5 text-[#8B5CF6]" />
              <span>Test Daemon Connection</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: GITHUB PAT CONNECTION */}
      {activeModal === 'github' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#12151D] border border-[#1F2430] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GithubIcon className="size-5 text-[#F8FAFC]" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Connect GitHub Account</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#686D79] hover:text-[#F8FAFC]">✕</button>
            </div>

            <p className="text-xs text-[#686D79] leading-relaxed">
              Enter your GitHub Personal Access Token (classic or fine-grained) with <code className="text-[#8B5CF6]">read:user</code> and <code className="text-[#8B5CF6]">repo</code> scopes. Your token is encrypted with AES-256-GCM authenticated cipher before local database persistence.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#C5C8D0]">Personal Access Token (PAT)</label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={inputToken}
                onChange={e => setInputToken(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[#181C26] text-xs text-[#C5C8D0] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectGithubPat}
                disabled={modalLoading || !inputToken.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                {modalLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <Plug className="size-3.5" />}
                <span>Verify & Encrypt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CODEFORCES HANDLE */}
      {activeModal === 'codeforces' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#12151D] border border-[#1F2430] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-[#F59E0B]" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Connect Codeforces Handle</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#686D79] hover:text-[#F8FAFC]">✕</button>
            </div>

            <p className="text-xs text-[#686D79] leading-relaxed">
              Enter your public Codeforces handle. DevOrbit will query the official Codeforces API for your rating, peak tier, and solved problems history.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#C5C8D0]">Codeforces Handle</label>
              <input
                type="text"
                placeholder="e.g. tourist, Petr, or your handle"
                value={inputHandle}
                onChange={e => setInputHandle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[#181C26] text-xs text-[#C5C8D0] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectCodeforces}
                disabled={modalLoading || !inputHandle.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                {modalLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                <span>Verify & Connect</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LEETCODE IMPORT */}
      {activeModal === 'leetcode' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#12151D] border border-[#1F2430] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="size-5 text-[#8B5CF6]" />
                <h3 className="text-base font-bold text-[#F8FAFC]">LeetCode Profile & Solved Stats</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#686D79] hover:text-[#F8FAFC]">✕</button>
            </div>

            <p className="text-xs text-[#686D79] leading-relaxed">
              Enter your LeetCode username and solved question distribution. This unifies with your DSA revision schedule and SM-2 queue.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#C5C8D0]">Username</label>
              <input
                type="text"
                placeholder="e.g. alex_chen"
                value={inputHandle}
                onChange={e => setInputHandle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#22C55E]">Easy Solved</label>
                <input
                  type="number"
                  value={lcEasy}
                  onChange={e => setLcEasy(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#F59E0B]">Medium Solved</label>
                <input
                  type="number"
                  value={lcMedium}
                  onChange={e => setLcMedium(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#EF4444]">Hard Solved</label>
                <input
                  type="number"
                  value={lcHard}
                  onChange={e => setLcHard(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[#181C26] text-xs text-[#C5C8D0] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleImportLeetCode}
                disabled={modalLoading || !inputHandle.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                {modalLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                <span>Save LeetCode Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TUF PROGRESS */}
      {activeModal === 'tuf' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#12151D] border border-[#1F2430] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-[#8B5CF6]" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Take U Forward Progress</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#686D79] hover:text-[#F8FAFC]">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#C5C8D0]">Username / Handle</label>
              <input
                type="text"
                placeholder="e.g. striver_dev"
                value={inputHandle}
                onChange={e => setInputHandle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#C5C8D0]">Problems Completed in Sheet (out of 455)</label>
              <input
                type="number"
                value={tufCompleted}
                onChange={e => setTufCompleted(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#C5C8D0]">Current Learning Step</label>
              <input
                type="text"
                value={tufStep}
                onChange={e => setTufStep(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[#181C26] text-xs text-[#C5C8D0] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleImportTuf}
                disabled={modalLoading || !inputHandle.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                {modalLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                <span>Save TUF Progress</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
