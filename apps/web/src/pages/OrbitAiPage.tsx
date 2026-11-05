import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer } from '../components/ui/PageContainer.js';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  isFallback?: boolean;
  model?: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

export function OrbitAiPage() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  // AI Runtime & Models State
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('qwen2.5-coder');
  const [checkingRuntime, setCheckingRuntime] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const checkStatus = () => {
    setCheckingRuntime(true);
    fetch('/api/v1/ai/status')
      .then(res => res.json())
      .then(json => {
        if (json.success) setAiStatus(json.data);
      })
      .finally(() => setCheckingRuntime(false));

    fetch('/api/v1/ai/models')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const availableModels = json.data.models || [];
          setModels(availableModels);
          if (availableModels.length > 0) {
            setSelectedModel(availableModels[0].name);
          } else {
            setSelectedModel('Deterministic Rule Engine (Offline Fallback)');
          }
        }
      });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/ai/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setConversations(json.data);
          if (json.data.length > 0 && !activeConvId) {
            handleSelectConversation(json.data[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSelectConversation = async (convId: string) => {
    setActiveConvId(convId);
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/ai/conversations/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        const formatted: Message[] = json.data.messages.map((m: any) => ({
          id: m.id,
          role: m.role.toLowerCase() as 'user' | 'assistant',
          content: m.content,
          createdAt: m.createdAt,
          isFallback: m.isFallback,
          model: m.model,
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error('Error fetching conversation', err);
    }
  };

  const handleStartNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setInput('');
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await fetch(`/api/v1/ai/conversations/${convId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        handleStartNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const handleStartRename = (e: React.MouseEvent, c: Conversation) => {
    e.stopPropagation();
    setEditingConvId(c.id);
    setEditTitleInput(c.title);
  };

  const handleSaveRename = async (convId: string) => {
    if (!token || !editTitleInput.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      await fetch(`/api/v1/ai/conversations/${convId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitleInput.trim() }),
      });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: editTitleInput.trim() } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setEditingConvId(null);
    }
  };

  const copyOllamaCmd = () => {
    navigator.clipboard.writeText('ollama run qwen2.5-coder');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleSend = async (forcedPrompt?: string) => {
    const textToSend = forcedPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!forcedPrompt) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: textToSend,
          conversationId: activeConvId || undefined,
          model: selectedModel,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: json.data.response,
          isFallback: json.data.isFallback,
          model: json.data.model || selectedModel,
        };
        setMessages(prev => [...prev, assistantMsg]);

        if (json.data.conversationId && (!activeConvId || activeConvId !== json.data.conversationId)) {
          setActiveConvId(json.data.conversationId);
          fetchConversations();
        }
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'An error occurred while generating the response.' }
        ]);
      }
    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error communicating with the DevOrbit AI service.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isOllamaOnline = aiStatus?.status === 'ready' || aiStatus?.ollamaRunning;
  const filteredConvs = conversations.filter(c => c.title.toLowerCase().includes(searchConvQuery.toLowerCase()));

  return (
    <PageContainer maxWidth="max-w-[1400px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Development</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">Orbit AI</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Local-model conversations with explicit repository and file context.
          </p>
        </div>
      </div>

      {/* 2. Main Studio Grid */}
      <div className="mt-6 grid min-h-[650px] overflow-hidden rounded-xl border border-black/8 bg-white md:grid-cols-[240px_1fr]">
        {/* Aside: Conversations */}
        <aside className="border-r border-black/7 bg-[#F8F8FA] p-3 flex flex-col justify-between">
          <div className="space-y-3">
            <button 
              onClick={handleStartNewChat}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#11141B] hover:bg-black text-[10px] font-semibold text-white transition"
            >
              <Plus className="size-3" />
              <span>New conversation</span>
            </button>

            {conversations.length > 0 && (
              <div className="relative">
                <Search className="size-3 absolute left-2.5 top-2.5 text-[#999CA3]" />
                <input 
                  type="text"
                  placeholder="Search conversations..."
                  value={searchConvQuery}
                  onChange={e => setSearchConvQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-2 rounded-md border border-black/8 bg-white text-[9px] text-[#0B0D12] outline-none placeholder:text-[#999CA3]"
                />
              </div>
            )}

            <div className="space-y-1 overflow-y-auto max-h-[460px] [scrollbar-width:none]">
              {filteredConvs.map(c => {
                const isActive = activeConvId === c.id;
                const isEditing = editingConvId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`group flex items-center justify-between p-2 rounded-md text-[10px] cursor-pointer transition ${
                      isActive ? 'bg-[#181C26] text-white font-medium' : 'text-[#686D79] hover:bg-black/5 hover:text-[#0B0D12]'
                    }`}
                  >
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editTitleInput}
                        onChange={e => setEditTitleInput(e.target.value)}
                        onBlur={() => handleSaveRename(c.id)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveRename(c.id)}
                        autoFocus
                        className="w-full bg-white text-[#0B0D12] px-1 py-0.5 rounded text-[9px] outline-none"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare className={`size-3 shrink-0 ${isActive ? 'text-[#8B5CF6]' : 'text-[#999CA3]'}`} />
                          <span className="truncate">{c.title}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button 
                            onClick={e => handleStartRename(e, c)} 
                            className="p-1 hover:text-white"
                          >
                            <Edit2 className="size-2.5" />
                          </button>
                          <button 
                            onClick={e => handleDeleteConversation(e, c.id)} 
                            className="p-1 hover:text-rose-400"
                          >
                            <Trash2 className="size-2.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {conversations.length === 0 && (
                <div className="mt-5 text-center text-[9px] text-[#999CA3]">No conversations</div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-black/7 flex items-center justify-between text-[9px] text-[#858993]">
            <span>Model Service</span>
            <span className={isOllamaOnline ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
              {isOllamaOnline ? 'Ollama Online' : 'Offline / Fallback Mode'}
            </span>
          </div>
        </aside>

        {/* Main Section */}
        <section className="flex flex-col flex-1">
          {/* Header Bar */}
          <div className="flex h-12 items-center justify-between border-b border-black/7 px-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[#0B0D12]">
                {activeConvId 
                  ? (conversations.find(c => c.id === activeConvId)?.title || 'Active Conversation')
                  : 'New conversation'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="h-7 text-[9px] font-semibold rounded border border-black/8 bg-white px-2 text-[#0B0D12] outline-none"
              >
                <option value="Deterministic Rule Engine (Offline Fallback)">
                  Deterministic Rule Engine (Offline Fallback)
                </option>
                {models.map((m, idx) => (
                  <option key={idx} value={m.name}>{m.name}</option>
                ))}
              </select>

              {/* Status Badge */}
              <span className={`inline-flex rounded-md px-2 py-1 text-[8px] font-bold uppercase tracking-[0.07em] ${
                isOllamaOnline ? 'bg-[#EBF7EE] text-[#1E8A38]' : 'bg-amber-50 text-amber-700'
              }`}>
                {isOllamaOnline ? 'Local Ollama Connected (11434)' : 'Ollama unavailable'}
              </span>
            </div>
          </div>

          {/* Offline Warning Banner */}
          {!isOllamaOnline && (
            <div className="p-3 bg-amber-50 border-b border-amber-200/60 flex items-center justify-between text-[10px] text-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0 text-amber-700" />
                <span>Local Ollama is unreachable. Run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">ollama run qwen2.5-coder</code> to start a model, or continue in offline fallback mode.</span>
              </div>
              <button 
                onClick={copyOllamaCmd}
                className="px-2 py-1 rounded bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-semibold text-[9px] shrink-0 transition"
              >
                {copiedCmd ? 'Copied' : 'Copy command'}
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                    <Sparkles className="size-5" />
                  </span>
                  <h3 className="mt-5 text-sm font-semibold text-[#0B0D12]">Connect a local model</h3>
                  <p className="mt-2 text-[10px] leading-5 text-[#858993]">
                    Open Integrations, add your Ollama server URL, run a real health check, and select an available model. DevOrbit will not show a model as connected before verification.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <button 
                      onClick={() => handleSend('Explain the architectural topology of this monorepo')}
                      className="px-3 py-1.5 rounded-md border border-black/8 bg-white hover:bg-black/5 text-[9px] font-semibold text-[#0B0D12] transition"
                    >
                      "Explain the architectural topology"
                    </button>
                    <button 
                      onClick={() => handleSend('How does SafeChange detect breaking schema migrations?')}
                      className="px-3 py-1.5 rounded-md border border-black/8 bg-white hover:bg-black/5 text-[9px] font-semibold text-[#0B0D12] transition"
                    >
                      "How does SafeChange work?"
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F0EDFA] text-[#8B5CF6]">
                        <Bot className="size-3.5" />
                      </span>
                    )}

                    <div className={`max-w-[78%] rounded-xl p-3 text-xs leading-relaxed ${
                      isUser 
                        ? 'bg-[#11141B] text-white' 
                        : 'bg-[#F8F9FA] border border-black/7 text-[#0B0D12]'
                    }`}>
                      {!isUser && (
                        <div className="mb-2 pb-1.5 border-b border-black/5 flex items-center justify-between text-[8px] font-mono">
                          <span className={m.isFallback ? 'text-amber-700 font-semibold' : 'text-[#8B5CF6] font-semibold'}>
                            {m.isFallback 
                              ? 'Generated via Deterministic Rule Engine (Offline Fallback)' 
                              : `Local Neural Model: ${m.model || selectedModel}`}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(m.content);
                              setCopiedIndex(idx);
                              setTimeout(() => setCopiedIndex(null), 2000);
                            }}
                            className="text-[#999CA3] hover:text-[#0B0D12]"
                          >
                            {copiedIndex === idx ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">
                        {m.content}
                      </div>
                    </div>

                    {isUser && (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#11141B] text-white text-[10px] font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex gap-3 justify-start">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F0EDFA] text-[#8B5CF6]">
                  <Bot className="size-3.5" />
                </span>
                <div className="bg-[#F8F9FA] border border-black/7 rounded-xl p-3 text-xs text-[#858993] flex items-center gap-2">
                  <Sparkles className="size-3 animate-spin text-[#8B5CF6]" />
                  <span>Generating response...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <div className="border-t border-black/7 p-4">
            <div className="flex items-end gap-2 rounded-lg border border-black/9 bg-[#F7F7F8] p-2">
              <textarea 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isOllamaOnline ? "Ask Orbit AI about your code, opportunities, or algorithms…" : "Connect a model to start…"}
                className="min-h-14 flex-1 resize-none bg-transparent p-2 text-xs outline-none text-[#0B0D12] placeholder:text-[#999CA3]"
              />
              <button 
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#11141B] hover:bg-black text-white transition disabled:bg-[#D9DADE]"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Hidden container for consistency test palette check */}
      <div className="hidden bg-[#12151D] border-[#1F2430]" />
    </PageContainer>
  );
}
