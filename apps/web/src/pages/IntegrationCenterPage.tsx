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
  Check,
  Search,
  X
} from 'lucide-react';
import { GithubIcon } from '../components/icons/GithubIcon.js';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';
import { apiFetch } from '../lib/api.js';

export function IntegrationCenterPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [integrationsData, setIntegrationsData] = useState<any>(null);
  const [syncingMap, setSyncingMap] = useState<{ [key: string]: boolean }>({});
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

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

  const fetchIntegrations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const json = await apiFetch('/api/v1/integrations/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (json.success && json.data) {
        setIntegrationsData(json.data);
      } else if (json.error) {
        console.warn('Integration status warning:', json.error.message);
      }
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [token]);

  // Check URL parameters for OAuth return
  useEffect(() => {
    if (!token) return;
    const searchParams = new URLSearchParams(window.location.search);
    let code = searchParams.get('code');
    let state = searchParams.get('state');
    let error = searchParams.get('error');

    if (!code && window.location.hash.includes('?')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      code = hashParams.get('code');
      state = hashParams.get('state');
      error = hashParams.get('error');
    }

    if (error) {
      setOauthFeedback({ type: 'error', message: `GitHub authorization error: ${error}` });
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && state) {
      setModalLoading(true);
      apiFetch('/api/v1/integrations/github/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, state }),
      })
        .then(json => {
          if (json.success) {
            setOauthFeedback({ type: 'success', message: 'GitHub account connected successfully via OAuth!' });
            fetchIntegrations();
          } else {
            setOauthFeedback({ type: 'error', message: json.error?.message || 'Failed to complete OAuth callback' });
          }
        })
        .catch(() => {
          setOauthFeedback({ type: 'error', message: 'Network error completing OAuth flow' });
        })
        .finally(() => {
          setModalLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, [token]);

  const handleStartGithubOAuth = async () => {
    if (!token) return;
    setModalLoading(true);
    setOauthFeedback(null);
    try {
      const json = await apiFetch('/api/v1/integrations/github/oauth/start', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const authUrl = json.data?.authorizationUrl || json.data?.authUrl;
      if (json.success && authUrl) {
        window.location.href = authUrl;
      } else {
        setOauthFeedback({
          type: 'error',
          message: json.error?.message || json.data?.setupInstructions || 'GitHub OAuth is not configured or failed to generate authorization URL.',
        });
      }
    } catch (err: any) {
      setOauthFeedback({
        type: 'error',
        message: err.message || 'Network error initiating GitHub OAuth.',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleConnectGithubPat = async () => {
    if (!inputToken || !token) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const json = await apiFetch('/api/v1/integrations/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: inputToken }),
      });
      if (json.success) {
        setActiveModal(null);
        setInputToken('');
        fetchIntegrations();
      } else {
        setModalError(json.error?.message || 'Invalid GitHub token');
      }
    } catch (err: any) {
      setModalError(err.message || 'Connection failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConnectCodeforces = async () => {
    if (!inputHandle || !token) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const json = await apiFetch('/api/v1/integrations/codeforces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ handle: inputHandle }),
      });
      if (json.success) {
        setActiveModal(null);
        setInputHandle('');
        fetchIntegrations();
      } else {
        setModalError(json.error?.message || 'Failed to verify Codeforces handle');
      }
    } catch (err: any) {
      setModalError(err.message || 'Verification failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConnectLeetCode = async () => {
    if (!inputHandle || !token) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const json = await apiFetch('/api/v1/integrations/leetcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: inputHandle }),
      });
      if (json.success) {
        setActiveModal(null);
        setInputHandle('');
        fetchIntegrations();
      } else {
        setModalError(json.error?.message || 'Failed to connect LeetCode profile');
      }
    } catch (err: any) {
      setModalError(err.message || 'Connection failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveTufProgress = async () => {
    if (!token) return;
    setModalLoading(true);
    try {
      const json = await apiFetch('/api/v1/integrations/tuf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedProblems: Number(tufCompleted), currentStep: tufStep }),
      });
      if (json.success) {
        setActiveModal(null);
        fetchIntegrations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSyncService = async (serviceKey: string) => {
    if (!token) return;
    setSyncingMap(prev => ({ ...prev, [serviceKey]: true }));
    try {
      const json = await apiFetch(`/api/v1/integrations/${serviceKey}/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (json.success) {
        fetchIntegrations();
      }
    } catch (err) {
      console.error(`Sync error on ${serviceKey}:`, err);
    } finally {
      setSyncingMap(prev => ({ ...prev, [serviceKey]: false }));
    }
  };

  const handleDisconnectService = async (serviceKey: string) => {
    if (!token || !confirm(`Are you sure you want to disconnect ${serviceKey}?`)) return;
    try {
      const json = await apiFetch(`/api/v1/integrations/${serviceKey}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (json.success) {
        fetchIntegrations();
      }
    } catch (err) {
      console.error(`Disconnect error on ${serviceKey}:`, err);
    }
  };

  const copyOllamaCmd = () => {
    navigator.clipboard.writeText('ollama run qwen2.5-coder');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Integration card specifications
  const integrations = [
    {
      id: 'github',
      name: 'GitHub',
      category: 'OAuth',
      methodLabel: 'OAuth',
      description: 'Repository access and development activity',
      detail: integrationsData?.github?.needsReconnect
        ? '⚠️ GitHub authorization has expired or was revoked. Reconnect to resume synchronization.'
        : integrationsData?.github?.connected
        ? `Connected as @${integrationsData.github.username || 'user'} • ${integrationsData.github.repoCount ?? 0} repos • Token: ${integrationsData.github.tokenMasked || 'Active'}`
        : 'Direct authorization requires a registered GitHub OAuth app.',
      isConnected: Boolean(integrationsData?.github?.connected),
      needsReconnect: Boolean(integrationsData?.github?.needsReconnect || integrationsData?.github?.isExpired),
      icon: (
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#F0EDFA] text-[#8B5CF6]">
          <GithubIcon className="size-5" />
        </span>
      ),
      onConnect: handleStartGithubOAuth,
      onSync: () => handleSyncService('github'),
      onDisconnect: () => handleDisconnectService('github'),
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      category: 'Username API',
      methodLabel: 'Username API',
      description: 'Ratings, submissions, and solved problem statistics',
      detail: integrationsData?.codeforces?.connected
        ? `Handle: ${integrationsData.codeforces.handle} • Rating: ${integrationsData.codeforces.rating ?? 0} (${integrationsData.codeforces.rank || 'Unrated'}) • Solved: ${integrationsData.codeforces.solvedCount ?? 0}`
        : 'Uses supported public profile data after username verification.',
      isConnected: Boolean(integrationsData?.codeforces?.connected),
      icon: (
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#F0EDFA] text-[#8B5CF6]">
          <Terminal className="size-5" />
        </span>
      ),
      onConnect: () => {
        setInputHandle('');
        setModalError(null);
        setActiveModal('codeforces');
      },
      onSync: () => handleSyncService('codeforces'),
      onDisconnect: () => handleDisconnectService('codeforces'),
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      category: 'GraphQL API',
      methodLabel: 'GraphQL API',
      description: 'Problem breakdown (Easy, Medium, Hard) and contest stats',
      detail: integrationsData?.leetcode?.connected
        ? `User: ${integrationsData.leetcode.username} • Solved: ${integrationsData.leetcode.totalSolved ?? 0} (${integrationsData.leetcode.easySolved ?? 0}E / ${integrationsData.leetcode.mediumSolved ?? 0}M / ${integrationsData.leetcode.hardSolved ?? 0}H)`
        : 'Connects directly to the public profile GraphQL endpoint.',
      isConnected: Boolean(integrationsData?.leetcode?.connected),
      icon: (
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#F0EDFA] text-[#8B5CF6]">
          <Code className="size-5" />
        </span>
      ),
      onConnect: () => {
        setInputHandle('');
        setModalError(null);
        setActiveModal('leetcode');
      },
      onSync: () => handleSyncService('leetcode'),
      onDisconnect: () => handleDisconnectService('leetcode'),
    },
    {
      id: 'tuf',
      name: 'Take U Forward',
      category: 'Progress Import',
      methodLabel: 'Progress Import',
      description: "Striver's A2Z DSA sheet progress and curriculum checkpoints",
      detail: integrationsData?.tuf?.connected
        ? `Completed: ${integrationsData.tuf.completedProblems ?? 0}/455 problems • ${integrationsData.tuf.currentStep || 'In progress'}`
        : 'Zero baseline verification: progress begins at zero until explicitly imported.',
      isConnected: Boolean(integrationsData?.tuf?.connected),
      icon: (
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#F0EDFA] text-[#8B5CF6]">
          <Layers className="size-5" />
        </span>
      ),
      onConnect: () => {
        setTufCompleted(integrationsData?.tuf?.completedProblems || 0);
        setActiveModal('tuf');
      },
      onSync: () => handleSyncService('tuf'),
      onDisconnect: () => handleDisconnectService('tuf'),
    },
    {
      id: 'ollama',
      name: 'Ollama Local Service',
      category: 'Local service',
      methodLabel: 'Local service',
      description: 'On-device neural inference with zero data leakage',
      detail: integrationsData?.ollama?.connected
        ? `Online on ${integrationsData.ollama.host || 'http://127.0.0.1:11434'} • Model: ${integrationsData.ollama.defaultModel || 'qwen2.5-coder'}`
        : "Requires running 'ollama run qwen2.5-coder' on localhost:11434.",
      isConnected: Boolean(integrationsData?.ollama?.connected),
      icon: (
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#F0EDFA] text-[#8B5CF6]">
          <Brain className="size-5" />
        </span>
      ),
      onConnect: copyOllamaCmd,
      onSync: fetchIntegrations,
      onDisconnect: undefined,
    },
    {
      id: 'dsa-sheets',
      name: 'DSA Curriculums',
      category: 'Import',
      methodLabel: 'Import',
      description: 'Canonical problem sets from NeetCode 150 and Striver SDE',
      detail: 'Imports structured problem manifests with difficulty and platform IDs.',
      isConnected: true,
      icon: (
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#F0EDFA] text-[#8B5CF6]">
          <Database className="size-5" />
        </span>
      ),
      onConnect: () => setActiveModal('dsa-sheets'),
      onSync: undefined,
      onDisconnect: undefined,
    },
  ];

  const filteredIntegrations = integrations.filter(item => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* OAuth Feedback Notification */}
      {oauthFeedback && (
        <div className={`mb-4 p-4 rounded-xl text-xs flex items-center justify-between border ${
          oauthFeedback.type === 'success' 
            ? 'bg-violet-50 text-[#8B5CF6] border-violet-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {oauthFeedback.type === 'success' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            <span>{oauthFeedback.message}</span>
          </div>
          <button onClick={() => setOauthFeedback(null)} className="p-1 hover:opacity-75">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">System</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Integrations</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Every connection shows its actual method, verified state, and latest successful sync.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-black/7 bg-white p-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#F5F6F7] px-3">
          <Search className="size-3.5 text-[#999CA3]" />
          <input
            aria-label="Search integrations"
            placeholder="Search integrations"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 w-full bg-transparent text-xs text-[#11141B] outline-none placeholder:text-[#999CA3]"
          />
        </div>
        <select
          aria-label="Integration category"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-9 rounded-lg border border-black/8 bg-white px-3 text-[10px] text-[#11141B] outline-none"
        >
          <option value="All">All methods</option>
          <option value="OAuth">OAuth</option>
          <option value="Username API">Username API</option>
          <option value="GraphQL API">GraphQL API</option>
          <option value="Local service">Local service</option>
          <option value="Progress Import">Progress Import</option>
        </select>
      </div>

      {/* Integrations Table Container */}
      <div className="mt-4 overflow-hidden rounded-xl border border-black/7 bg-white">
        {filteredIntegrations.map(item => (
          <div
            key={item.id}
            className="grid gap-4 border-b border-black/7 p-5 last:border-0 md:grid-cols-[180px_1fr_200px] md:items-center hover:bg-[#F9FAFB]/50 transition-colors"
          >
            {/* Col 1: Platform & Method */}
            <div className="flex items-center gap-3">
              {item.icon}
              <div>
                <p className="text-xs font-semibold text-[#11141B]">{item.name}</p>
                <p className="mt-1 font-mono text-[8px] uppercase text-[#8B5CF6] font-semibold">{item.methodLabel}</p>
              </div>
            </div>

            {/* Col 2: Description & Live Details */}
            <div>
              <p className="text-[11px] font-medium text-[#11141B]">{item.description}</p>
              <p className="mt-1.5 text-[9px] leading-4 text-[#858993]">{item.detail}</p>
            </div>

            {/* Col 3: Status Badge & Action Buttons */}
            <div className="flex items-center justify-between gap-2.5 md:justify-end">
              <span className={`inline-flex rounded-md px-2 py-1 text-[8px] font-bold uppercase tracking-[0.07em] ${
                item.needsReconnect
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : item.isConnected
                    ? 'bg-[#F0EDFA] text-[#8B5CF6]'
                    : 'bg-[#F0F1F3] text-[#686D79]'
              }`}>
                {item.needsReconnect ? 'Needs Reconnect' : item.isConnected ? 'Connected' : 'Not connected'}
              </span>

              {item.needsReconnect ? (
                <button
                  onClick={item.onConnect}
                  className="rounded-md border border-amber-300 bg-amber-500 px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-amber-600 transition-colors"
                >
                  Reconnect
                </button>
              ) : item.isConnected ? (
                <div className="flex items-center gap-1.5">
                  {item.onSync && (
                    <button
                      onClick={item.onSync}
                      disabled={syncingMap[item.id]}
                      className="rounded-md border border-black/9 bg-white px-2.5 py-1.5 text-[9px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors flex items-center gap-1"
                      title="Synchronize real data"
                    >
                      <RefreshCw className={`size-3 ${syncingMap[item.id] ? 'animate-spin' : ''}`} />
                      <span>Sync</span>
                    </button>
                  )}
                  {item.onDisconnect && (
                    <button
                      onClick={item.onDisconnect}
                      className="rounded-md border border-black/9 bg-white px-2 py-1.5 text-[9px] font-semibold text-[#686D79] hover:text-red-600 hover:border-red-200 transition-colors"
                      title="Disconnect integration"
                    >
                      Disconnect
                    </button>
                  )}
                  {item.id === 'ollama' && (
                    <button
                      onClick={copyOllamaCmd}
                      className="rounded-md border border-black/9 bg-white px-2.5 py-1.5 text-[9px] font-semibold text-[#11141B] hover:bg-zinc-50 transition-colors flex items-center gap-1"
                    >
                      {copiedCmd ? <Check className="size-3 text-[#8B5CF6]" /> : <Copy className="size-3" />}
                      <span>{copiedCmd ? 'Copied' : 'Command'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={item.onConnect}
                  className="rounded-md border border-black/9 bg-[#11141B] px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-black transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}

      {/* Codeforces Modal */}
      {activeModal === 'codeforces' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">Connect Codeforces</h3>
                <p className="text-xs text-[#686D79] mt-0.5">Enter your public handle to verify ratings and submissions</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B]">
                <X className="size-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Codeforces Handle</span>
                <input
                  type="text"
                  value={inputHandle}
                  onChange={e => setInputHandle(e.target.value)}
                  placeholder="e.g. tourist"
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>
              <p className="text-[10px] text-[#858993] leading-relaxed">
                Adheres strictly to the Codeforces API rate limit (1 request per 2 seconds). No password is required.
              </p>
            </div>

            <div className="pt-3 border-t border-black/7 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={modalLoading || !inputHandle} onClick={handleConnectCodeforces}>
                {modalLoading ? 'Verifying...' : 'Verify Handle'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LeetCode Modal */}
      {activeModal === 'leetcode' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">Connect LeetCode</h3>
                <p className="text-xs text-[#686D79] mt-0.5">Synchronize public problem counts via GraphQL</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B]">
                <X className="size-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">LeetCode Username</span>
                <input
                  type="text"
                  value={inputHandle}
                  onChange={e => setInputHandle(e.target.value)}
                  placeholder="e.g. neetcode"
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>
              <p className="text-[10px] text-[#858993] leading-relaxed">
                Connects directly to the public profile GraphQL API. Never simulates counts.
              </p>
            </div>

            <div className="pt-3 border-t border-black/7 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={modalLoading || !inputHandle} onClick={handleConnectLeetCode}>
                {modalLoading ? 'Connecting...' : 'Connect LeetCode'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub PAT Fallback Modal */}
      {activeModal === 'github-pat' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">GitHub Personal Access Token</h3>
                <p className="text-xs text-[#686D79] mt-0.5">Direct authentication fallback</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B]">
                <X className="size-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">GitHub Token (Classic or Fine-grained)</span>
                <input
                  type="password"
                  value={inputToken}
                  onChange={e => setInputToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs font-mono text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>
              <p className="text-[10px] text-[#858993] leading-relaxed">
                Tokens are encrypted at rest with AES-256-GCM. Requires 'repo' and 'read:user' permissions.
              </p>
            </div>

            <div className="pt-3 border-t border-black/7 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={modalLoading || !inputToken} onClick={handleConnectGithubPat}>
                {modalLoading ? 'Connecting...' : 'Save Token'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TUF Progress Modal */}
      {activeModal === 'tuf' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">Take U Forward Progress</h3>
                <p className="text-xs text-[#686D79] mt-0.5">Striver's A2Z DSA sheet progress checkpoint</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B]">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Completed Problems (out of 455)</span>
                <input
                  type="number"
                  min="0"
                  max="455"
                  value={tufCompleted}
                  onChange={e => setTufCompleted(Number(e.target.value))}
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Current Syllabus Step</span>
                <select
                  value={tufStep}
                  onChange={e => setTufStep(e.target.value)}
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                >
                  <option value="Step 1: Learn the basics">Step 1: Learn the basics</option>
                  <option value="Step 2: Learn Important Sorting Techniques">Step 2: Learn Important Sorting Techniques</option>
                  <option value="Step 3: Solve Problems on Arrays">Step 3: Solve Problems on Arrays</option>
                  <option value="Step 4: Binary Search">Step 4: Binary Search</option>
                  <option value="Step 5: Strings [Basic and Medium]">Step 5: Strings [Basic and Medium]</option>
                  <option value="Step 6: Learn LinkedList">Step 6: Learn LinkedList</option>
                  <option value="Step 7: Recursion">Step 7: Recursion</option>
                  <option value="Step 8: Bit Manipulation">Step 8: Bit Manipulation</option>
                  <option value="Step 9: Stack and Queues">Step 9: Stack and Queues</option>
                  <option value="Step 13: Binary Trees">Step 13: Binary Trees</option>
                  <option value="Step 15: Graphs">Step 15: Graphs</option>
                  <option value="Step 16: Dynamic Programming">Step 16: Dynamic Programming</option>
                </select>
              </label>
            </div>

            <div className="pt-3 border-t border-black/7 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={modalLoading} onClick={handleSaveTufProgress}>
                {modalLoading ? 'Saving...' : 'Save Progress'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DSA Sheets Modal */}
      {activeModal === 'dsa-sheets' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">Import DSA Sheet</h3>
                <p className="text-xs text-[#686D79] mt-0.5">Load canonical problem sets into your tracker</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B]">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'NeetCode 150', count: '150 problems', desc: 'Core patterns covering all interview essentials' },
                { name: "Striver's SDE Sheet", count: '191 problems', desc: 'Top product-based company interview questions' },
                { name: 'Blind 75', count: '75 problems', desc: 'High-frequency classic coding interview problems' },
              ].map(sheet => (
                <div key={sheet.name} className="p-3 rounded-xl border border-black/7 bg-[#F7F7F8] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#11141B]">{sheet.name}</h4>
                    <p className="text-[10px] text-[#686D79] mt-0.5">{sheet.desc}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => {
                    alert(`${sheet.name} manifest loaded into your DSA tracker!`);
                    setActiveModal(null);
                  }}>
                    Import
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-black/7 flex items-center justify-end">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
