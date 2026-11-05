import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Code, 
  Copy, 
  Check, 
  Plus, 
  SlidersHorizontal, 
  History, 
  Trash2, 
  Edit2, 
  RefreshCw, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Search,
  MessageSquare,
  Cpu,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { StatusBadge, Button } from '../components/ui/index.js';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch status and models
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
            setSelectedModel('devorbit-deterministic-v1');
          }
        }
      });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Fetch user conversations
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

  // Scroll to bottom on message
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

  const handleSend = async (forcedPrompt?: string) => {
    const text = forcedPrompt || input;
    if (!text.trim() || loading || !token) return;

    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

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
          prompt: text.trim(),
          conversationId: activeConvId,
          modelName: selectedModel,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const newConvId = json.data.conversationId;
        setActiveConvId(newConvId);
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: json.data.message.content,
          isFallback: json.data.isFallback,
          model: json.data.model,
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Refresh conversation history list
        setConversations(prev => {
          const exists = prev.find(c => c.id === newConvId);
          if (exists) {
            return prev.map(c => c.id === newConvId ? { ...c, updatedAt: new Date().toISOString() } : c);
          } else {
            return [{ id: newConvId, title: text.slice(0, 36) + '...', updatedAt: new Date().toISOString(), messages: [] }, ...prev];
          }
        });
      }
    } catch (err) {
      console.error('Error querying Orbit AI', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyOllamaCmd = () => {
    navigator.clipboard.writeText('ollama run qwen2.5-coder');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchConvQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-56px-28px)] flex bg-[#0B0D12] overflow-hidden animate-in fade-in duration-200">
      
      {/* ── LEFT PANEL: Conversation History & Models ── */}
      <aside className="w-64 bg-[#0E1117] border-r border-[#1F2430] flex flex-col shrink-0 select-none">
        
        {/* Panel Header */}
        <div className="p-3.5 border-b border-[#1F2430] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-[#8B5CF6]" />
            <span className="text-xs font-bold text-[#F8FAFC]">Conversations</span>
          </div>
          <button
            onClick={handleStartNewChat}
            className="p-1.5 rounded-xl bg-[#181C26] hover:bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all"
            title="Start New Thread"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Search Conversations */}
        <div className="p-2.5 border-b border-[#1F2430]">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#12151D] border border-[#1F2430] text-xs">
            <Search className="size-3.5 text-[#686D79]" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchConvQuery}
              onChange={e => setSearchConvQuery(e.target.value)}
              className="bg-transparent text-xs text-[#F8FAFC] placeholder:text-[#686D79] focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#686D79]">
              {searchConvQuery ? 'No matching conversations' : 'No previous threads. Start a new chat!'}
            </div>
          ) : (
            filteredConversations.map(c => (
              <div
                key={c.id}
                onClick={() => handleSelectConversation(c.id)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs transition-colors group cursor-pointer ${
                  activeConvId === c.id
                    ? 'bg-[#1A1E29] text-[#F8FAFC] border border-[#8B5CF6]/40 font-medium'
                    : 'text-[#C5C8D0] hover:bg-[#181C26]/60 hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  <MessageSquare className="size-3.5 text-[#8B5CF6] shrink-0" />
                  {editingConvId === c.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editTitleInput}
                      onChange={e => setEditTitleInput(e.target.value)}
                      onBlur={() => handleSaveRename(c.id)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveRename(c.id)}
                      className="bg-[#202431] px-1.5 py-0.5 rounded text-xs text-white focus:outline-none w-full"
                    />
                  ) : (
                    <span className="truncate">{c.title || 'Untitled Session'}</span>
                  )}
                </div>

                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                  <button
                    onClick={e => handleStartRename(e, c)}
                    className="p-1 rounded text-[#686D79] hover:text-[#F8FAFC]"
                    title="Rename"
                  >
                    <Edit2 className="size-3" />
                  </button>
                  <button
                    onClick={e => handleDeleteConversation(e, c.id)}
                    className="p-1 rounded text-[#686D79] hover:text-[#EF4444]"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Runtime Status Footer */}
        <div className="p-3 border-t border-[#1F2430] bg-[#0B0D12] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#686D79] font-medium">Model Engine:</span>
            <button 
              onClick={checkStatus} 
              disabled={checkingRuntime}
              className="text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 text-[10px]"
            >
              <RefreshCw className={`size-3 ${checkingRuntime ? 'animate-spin' : ''}`} />
              <span>Probe</span>
            </button>
          </div>

          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            disabled={!aiStatus?.reachable && models.length === 0}
            className="w-full bg-[#12151D] border border-[#1F2430] text-[#F8FAFC] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#8B5CF6] disabled:opacity-80 font-mono"
          >
            {models.length > 0 ? (
              models.map(m => (
                <option key={m.name} value={m.name}>
                  {m.name} {m.size ? `(${Math.round(m.size / (1024 * 1024))}MB)` : ''}
                </option>
              ))
            ) : (
              <option value="devorbit-deterministic-v1">
                Deterministic Rule Engine (Offline Fallback)
              </option>
            )}
          </select>

          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className={`size-1.5 rounded-full ${aiStatus?.reachable ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} />
            <span className={aiStatus?.reachable ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
              {aiStatus?.reachable ? 'Local Ollama Connected (11434)' : 'Offline / Fallback Mode'}
            </span>
          </div>
        </div>
      </aside>

      {/* ── CENTER PANEL: Main Chat Workspace ── */}
      <main className="flex-1 flex flex-col bg-[#0B0D12] overflow-hidden">
        
        {/* Workspace Top Header */}
        <div className="h-12 border-b border-[#1F2430] px-4 flex items-center justify-between bg-[#12151D]/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-4 text-[#8B5CF6]" />
            <span className="text-xs font-bold text-[#F8FAFC]">Orbit AI Developer Studio</span>
            <span className="text-[#1F2430]">|</span>
            <span className="text-[11px] font-mono text-[#686D79]">
              Active: {aiStatus?.reachable && selectedModel !== 'devorbit-deterministic-v1' ? selectedModel : 'Deterministic Engine (Offline Fallback)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge variant="success" size="sm" dot>
              100% Local-First
            </StatusBadge>
          </div>
        </div>

        {/* Offline Ollama Informative Notice Banner */}
        {!aiStatus?.reachable && (
          <div className="bg-[#181C26] border-b border-[#1F2430] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#F59E0B]">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                Local Ollama is unreachable. Run <code className="bg-[#0B0D12] px-1.5 py-0.5 rounded text-[#F8FAFC] font-mono text-[11px]">ollama run qwen2.5-coder</code> or configure an external endpoint in Settings.
              </span>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                onClick={copyOllamaCmd}
                variant="primary"
                size="sm"
                icon={copiedCmd ? Check : Copy}
              >
                {copiedCmd ? 'Copied' : 'Copy command'}
              </Button>
            </div>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto py-12 text-center space-y-4">
              <div className="size-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mx-auto shadow-lg shadow-[#8B5CF6]/10">
                <Sparkles className="size-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold font-display text-[#F8FAFC]">
                  Orbit AI Assistant Ready
                </h2>
                <p className="text-xs text-[#686D79] max-w-sm mx-auto">
                  Ask architectural questions, request code reviews, algorithmic derivations, or security audits.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
                {[
                  { title: 'Explain REST API Architecture', prompt: 'Explain what a REST API is and contrast it with GraphQL and gRPC.' },
                  { title: 'Security Audit Checklist', prompt: 'Please review our authentication flow for potential security vulnerabilities.' },
                  { title: 'DSA: Two Pointers Optimal', prompt: 'How to solve Two Sum and Trapping Rain Water using algorithms?' },
                  { title: 'GSoC Open Source Strategy', prompt: 'What is the optimal strategy to find high-impact open source issues?' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(item.prompt)}
                    className="p-3.5 rounded-2xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/50 hover:bg-[#181C26] transition-all group"
                  >
                    <div className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#686D79] mt-0.5 line-clamp-1">
                      {item.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="size-8 rounded-xl bg-[#181C26] border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shrink-0 mt-0.5 shadow-sm">
                    <Bot className="size-4" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-1.5 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  
                  {/* Assistant Engine Badge */}
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                        m.isFallback 
                          ? 'bg-[#181C26] text-[#94A3B8] border-[#334155]' 
                          : 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30'
                      }`}>
                        {m.isFallback ? (
                          <>
                            <SlidersHorizontal className="size-3 text-[#94A3B8]" />
                            <span>Generated via Deterministic Rule Engine (Offline Fallback)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3 text-[#8B5CF6]" />
                            <span>Local Neural Model: {m.model || 'qwen2.5-coder'}</span>
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Message Card */}
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                    m.role === 'user'
                      ? 'bg-[#1A1E29] text-white border border-[#8B5CF6]/40 rounded-tr-none font-medium shadow-md shadow-[#8B5CF6]/10'
                      : 'bg-[#12151D] border border-[#1F2430] text-[#F8FAFC] rounded-tl-none font-sans'
                  }`}>
                    {m.content}
                  </div>

                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={() => handleCopyCode(m.content, idx)}
                        className="text-[10px] text-[#686D79] hover:text-[#C5C8D0] flex items-center gap-1 transition-colors"
                      >
                        {copiedIndex === idx ? <Check className="size-3 text-[#22C55E]" /> : <Copy className="size-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy response'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="size-8 rounded-xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-xs">
                    {user?.username ? user.username.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-xl bg-[#181C26] border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shrink-0 animate-pulse">
                <Bot className="size-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#12151D] border border-[#1F2430] text-xs text-[#686D79] flex items-center gap-2">
                <RefreshCw className="size-3 animate-spin text-[#8B5CF6]" />
                <span>Generating developer intelligence...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Composer Input Bar */}
        <div className="p-4 border-t border-[#1F2430] bg-[#12151D]/60 backdrop-blur-md shrink-0">
          <div className="max-w-4xl mx-auto flex items-end gap-2 p-2.5 rounded-2xl bg-[#181C26] border border-[#1F2430] focus-within:border-[#8B5CF6]/60 transition-colors">
            <textarea
              ref={textareaRef}
              rows={2}
              placeholder="Ask Orbit AI (Enter sends, Shift+Enter for newline)..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-xs text-[#F8FAFC] placeholder:text-[#686D79] resize-none focus:outline-none p-1.5 max-h-32"
            />
            
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="size-9 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
              title="Send Message"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>

      </main>

    </div>
  );
}
