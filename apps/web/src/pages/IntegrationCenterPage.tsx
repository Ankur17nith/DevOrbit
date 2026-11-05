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
import { PageContainer, PageHeading, StatusBadge, Button } from '../components/ui/index.js';

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

  // OAuth States
  const [oauthFeedback, setOauthFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPatInput, setShowPatInput] = useState<boolean>(false);
  const [oauthStatus, setOauthStatus] = useState<any>(null);

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

  // Check URL parameters for OAuth return
  useEffect(() => {
    if (!token) return;
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      setModalLoading(true);
      fetch('/api/v1/integrations/github/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, state }),
      })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setOauthFeedback({ type: 'success', message: 'GitHub account connected successfully via OAuth!' });
            fetchIntegrations();
          } else {
            setOauthFeedback({ type: 'error', message: json.error?.message || 'Failed to complete OAuth callback' });
          }
        })
        .catch(err => {
          setOauthFeedback({ type: 'error', message: err.message || 'OAuth network error' });
        })
        .finally(() => {
          setModalLoading(false);
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        });
    }
  }, [token]);

  const handleStartGithubOAuth = async () => {
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch('/api/v1/integrations/github/oauth/url', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Could not initiate OAuth authorization');
      }
      setOauthStatus(json.data);
      if (json.data.authorizationUrl) {
        window.location.href = json.data.authorizationUrl;
      }
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

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
      <PageContainer>
        <div className="h-24 bg-[#12151D] border border-[#1F2430] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const { github, codeforces, leetcode, tuf, striver, ollama } = integrationsData || {};

  return (
    <PageContainer>
      <PageHeading
        title="Integration Center"
        description="Connect your code repositories, competitive programming handles, and algorithmic problem trackers. All tokens are encrypted locally with AES-256-GCM."
        badges={[
          <StatusBadge key="engine" variant="violet">
            Real Integrations Engine
          </StatusBadge>
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchIntegrations}
            icon={<RefreshCw className="size-3.5 text-[#8B5CF6]" />}
          >
            Refresh All Status
          </Button>
        }
      />

      {/* OAuth Feedback Alert Banner */}
      {oauthFeedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          oauthFeedback.type === 'success' 
            ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' 
            : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
        }`}>
          <div className="flex items-center gap-2.5">
            {oauthFeedback.type === 'success' ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            <span className="font-medium">{oauthFeedback.message}</span>
          </div>
          <button 
            onClick={() => setOauthFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

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
              <div className="flex items-center justify-between w-full gap-2">
                <button
                  onClick={handleDisconnectGithub}
                  disabled={syncingMap.github}
                  className="px-2.5 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="size-3" />
                  <span>Disconnect</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveModal('github');
                      setInputToken('');
                      setModalError(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#1F2430] border border-[#1F2430] text-[#C5C8D0] hover:text-[#F8FAFC] text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Plug className="size-3 text-[#8B5CF6]" />
                    <span>Reauthorize</span>
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
                </div>
              </div>
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

      {/* MODAL: GITHUB CONNECTION (OAuth primary + PAT fallback) */}
      {activeModal === 'github' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#12151D] border border-[#1F2430] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GithubIcon className="size-5 text-[#F8FAFC]" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Connect GitHub Account</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#686D79] hover:text-[#F8FAFC]">✕</button>
            </div>

            {/* 1. Primary Prominent Action: Direct OAuth 2.0 PKCE */}
            <div className="p-4 rounded-xl bg-[#181C26] border border-[#8B5CF6]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-[#8B5CF6]" />
                  <span>Direct GitHub OAuth 2.0 (Recommended)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA]">
                  One-Click
                </span>
              </div>
              <p className="text-[11px] text-[#686D79] leading-relaxed">
                Seamlessly authorize repositories through GitHub with cryptographic 32-byte state verification (10-minute TTL).
              </p>
              <button
                type="button"
                onClick={handleStartGithubOAuth}
                disabled={modalLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#8B5CF6]/20"
              >
                {modalLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <GithubIcon className="size-4" />}
                <span>Authorize with GitHub</span>
                <ArrowRight className="size-3.5" />
              </button>

              {oauthStatus && !oauthStatus.isConfigured && (
                <div className="p-3 rounded-xl bg-[#0B0D12] border border-[#1F2430] text-[11px] text-[#C5C8D0] space-y-1.5">
                  <div className="font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-[#F59E0B]" />
                    <span>OAuth App Credentials Notice</span>
                  </div>
                  <p className="text-[#686D79] leading-relaxed">
                    Set <code className="text-[#8B5CF6]">GITHUB_CLIENT_ID</code> and <code className="text-[#8B5CF6]">GITHUB_CLIENT_SECRET</code> in <code className="text-[#8B5CF6]">apps/api/.env</code> to enable direct browser OAuth redirection.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Collapsible Advanced Option: Personal Access Token (PAT) */}
            <div className="border-t border-[#1F2430] pt-3">
              <button
                type="button"
                onClick={() => setShowPatInput(!showPatInput)}
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] flex items-center justify-between w-full font-medium"
              >
                <span>Advanced Option: Personal Access Token (PAT)</span>
                <span className="text-xs font-mono">{showPatInput ? '− Hide' : '+ Show Options'}</span>
              </button>

              {showPatInput && (
                <div className="mt-3 space-y-3 p-3.5 rounded-xl bg-[#181C26]/60 border border-[#1F2430] animate-in fade-in duration-100">
                  <p className="text-[11px] text-[#686D79] leading-relaxed">
                    Provide a PAT with <code className="text-[#8B5CF6]">read:user</code> and <code className="text-[#8B5CF6]">repo</code> scopes. Your token is encrypted with AES-256-GCM before local storage.
                  </p>

                  <div className="space-y-1">
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={inputToken}
                      onChange={e => setInputToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#12151D] border border-[#1F2430] text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectGithubPat}
                    disabled={modalLoading || !inputToken.trim()}
                    className="w-full py-2 px-3 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {modalLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <Plug className="size-3.5 text-[#8B5CF6]" />}
                    <span>Verify & Encrypt PAT</span>
                  </button>
                </div>
              )}
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F2430]">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[#181C26] text-xs text-[#C5C8D0] hover:text-white"
              >
                Close
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

    </PageContainer>
  );
}
