import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  Code, 
  Copy, 
  Check, 
  Bookmark, 
  GitPullRequest, 
  ScanSearch, 
  Plus, 
  Paperclip, 
  SlidersHorizontal, 
  ChevronRight, 
  Cpu, 
  Zap,
  MessageSquare,
  FileCode,
  Layers,
  History,
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  contextChips?: string[];
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
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'Architecture' | 'Debugging' | 'Learning' | 'Contribution'>('Architecture');
  const [attachedContext, setAttachedContext] = useState<string[]>(['DevOrbit Monorepo', 'GSoC 2026']);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch user conversations
  useEffect(() => {
    if (!token) return;
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/v1/ai/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            setConversations(json.data);
            setActiveConvId(json.data[0].id);
            setMessages(json.data[0].messages || []);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      }
    };
    fetchConversations();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages || []);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || !token) return;

    const userMessage: Message = { 
      role: 'user', 
      content: text,
      contextChips: [...attachedContext],
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: text,
          conversationId: activeConvId,
          mode: selectedMode,
          contextChips: attachedContext,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const newConvId = json.data.conversationId;
        setActiveConvId(newConvId);
        setMessages(prev => [...prev, json.data.message]);

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

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTriggerAction = (actionName: string) => {
    setCopiedAction(actionName);
    setTimeout(() => setCopiedAction(null), 2500);
  };

  const suggestedPrompts = [
    {
      category: 'Open Source Strategy',
      title: 'Analyze GSoC 2026 Timeline & Orgs',
      desc: 'Filter 606+ historical organizations for high acceptance and beginner tags.',
      prompt: 'Analyze GSoC 2026 timeline and recommend high-acceptance organizations in TypeScript and Rust with beginner mentorship.',
    },
    {
      category: 'Algorithmic Mastery',
      title: 'Optimal Two Pointers & Trapping Rain Water',
      desc: 'Deconstruct O(1) space two-pointer derivation with boundary proofs.',
      prompt: 'Explain the Two Pointers pattern and show the optimal O(1) space Trapping Rain Water derivation with edge-case proofs.',
    },
    {
      category: 'Codebase Architecture',
      title: 'DevOrbit Architecture Audit',
      desc: 'Contrast local-first modular Express/Prisma design against standard cloud SaaS.',
      prompt: 'Compare DevOrbit architecture against standard developer platforms and outline the Orbit Fix patch verification engine.',
    },
    {
      category: 'Contribution Drafting',
      title: 'Draft PR Proposal for Large Repo',
      desc: 'Formulate an RFC-style PR description adhering to Conventional Commits.',
      prompt: 'Draft an RFC-style contribution proposal for an open-source project following Conventional Commits and automated test standards.',
    },
  ];

  return (
    <div className="h-[calc(100vh-56px)] flex bg-[#0B0D12] overflow-hidden animate-in fade-in duration-200">
      
      {/* ── LEFT PANEL: Conversation History & Saved Prompts ── */}
      <aside className="w-64 bg-[#12151D] border-r border-[#1F2430] flex flex-col shrink-0">
        
        {/* Panel Header */}
        <div className="p-3 border-b border-[#1F2430] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-[#8B5CF6]" />
            <span className="text-xs font-bold text-[#F8FAFC]">Conversations</span>
          </div>
          <button
            onClick={handleStartNewChat}
            className="p-1 rounded-lg bg-[#181C26] hover:bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all"
            title="Start New Thread"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#686D79]">
              No previous threads. Start a new session!
            </div>
          ) : (
            conversations.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectConversation(c)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  activeConvId === c.id
                    ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 font-medium'
                    : 'text-[#C5C8D0] hover:bg-[#181C26]/60 hover:text-[#F8FAFC]'
                }`}
              >
                <MessageSquare className="size-3.5 text-[#8B5CF6] shrink-0" />
                <span className="truncate">{c.title || 'Conversation'}</span>
              </button>
            ))
          )}
        </div>

        {/* Bottom Pinned Contexts */}
        <div className="p-3 border-t border-[#1F2430] bg-[#0B0D12]/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#686D79] mb-2 font-semibold">
            Active Context Scope
          </div>
          <div className="flex flex-wrap gap-1.5">
            {attachedContext.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30"
              >
                <span>{chip}</span>
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* ── CENTER PANEL: Main Workspace & Chat Thread ── */}
      <main className="flex-1 flex flex-col bg-[#0B0D12] overflow-hidden">
        
        {/* Workspace Top Bar */}
        <div className="h-12 border-b border-[#1F2430] px-4 flex items-center justify-between bg-[#12151D]/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F8FAFC]">
              <Sparkles className="size-4 text-[#8B5CF6]" />
              <span>Orbit AI Workspace</span>
            </div>
            <span className="text-[#1F2430]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#686D79]">Mode:</span>
              <select
                value={selectedMode}
                onChange={e => setSelectedMode(e.target.value as any)}
                className="bg-[#181C26] border border-[#1F2430] text-[#A78BFA] text-xs rounded-md px-2 py-1 outline-none focus:border-[#8B5CF6]"
              >
                <option value="Architecture">Architecture Design</option>
                <option value="Debugging">Root-Cause Debugging</option>
                <option value="Learning">Algorithmic Learning</option>
                <option value="Contribution">OSS Contribution</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
              <span className="size-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>Deterministic Rule-Engine Ready</span>
            </span>

            <button
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                inspectorOpen 
                  ? 'bg-[#181C26] text-[#A78BFA] border-[#8B5CF6]/40' 
                  : 'bg-[#12151D] text-[#686D79] border-[#1F2430] hover:text-[#F8FAFC]'
              }`}
              title="Toggle Context & Model Inspector"
            >
              <SlidersHorizontal className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Action notification toast */}
        {copiedAction && (
          <div className="mx-4 mt-2 p-2 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#F8FAFC] text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="size-3.5 text-[#22C55E]" />
            <span>{copiedAction}</span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.length === 0 ? (
            /* Categorized Empty State */
            <div className="max-w-2xl mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="size-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mx-auto shadow-lg shadow-[#8B5CF6]/10">
                  <Sparkles className="size-6" />
                </div>
                <h2 className="text-lg font-bold font-display text-[#F8FAFC]">Orbit AI Developer Intelligence</h2>
                <p className="text-xs text-[#686D79] max-w-md mx-auto">
                  Ground your code exploration in verified repositories, real algorithmic sheets, and local architectural models.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.prompt)}
                    className="p-3.5 rounded-xl bg-[#12151D] border border-[#1F2430] hover:border-[#8B5CF6]/50 hover:bg-[#181C26] transition-all text-left group"
                  >
                    <div className="text-[10px] font-mono text-[#A78BFA] font-semibold uppercase mb-1">
                      {p.category}
                    </div>
                    <div className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors mb-1">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-[#686D79] leading-relaxed">
                      {p.desc}
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
                  <div className="size-8 rounded-lg bg-[#181C26] border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shrink-0 mt-0.5 shadow-sm">
                    <Bot className="size-4" />
                  </div>
                )}

                <div className={`max-w-3xl space-y-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  
                  {/* Context Chips Attached to Message */}
                  {m.contextChips && m.contextChips.length > 0 && (
                    <div className={`flex flex-wrap gap-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.contextChips.map((c, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#181C26] text-[#A78BFA] border border-[#1F2430]">
                          @{c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#181C26] border border-[#8B5CF6]/40 text-[#F8FAFC] rounded-tr-sm inline-block'
                        : 'bg-[#12151D] border border-[#1F2430] text-[#C5C8D0] rounded-tl-sm space-y-3'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-left">
                      {m.content}
                    </div>

                    {/* Rich Assistant Action Bar */}
                    {m.role === 'assistant' && (
                      <div className="pt-2 border-t border-[#1F2430] flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(m.content, idx)}
                          className="px-2.5 py-1 rounded-md bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-[11px] text-[#F8FAFC] transition-colors flex items-center gap-1.5"
                        >
                          {copiedIndex === idx ? <Check className="size-3 text-[#22C55E]" /> : <Copy className="size-3 text-[#686D79]" />}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy Response'}</span>
                        </button>

                        <button
                          onClick={() => handleTriggerAction('Added guidance snippet to private DSA Notes')}
                          className="px-2.5 py-1 rounded-md bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-[11px] text-[#F8FAFC] transition-colors flex items-center gap-1.5"
                        >
                          <Bookmark className="size-3 text-[#A78BFA]" />
                          <span>Add to DSA Notes</span>
                        </button>

                        <button
                          onClick={() => handleTriggerAction('Added targeted issue to Contribution Pipeline')}
                          className="px-2.5 py-1 rounded-md bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-[11px] text-[#F8FAFC] transition-colors flex items-center gap-1.5"
                        >
                          <GitPullRequest className="size-3 text-[#22C55E]" />
                          <span>Create Pipeline Item</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {m.role === 'user' && (
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces'}
                    alt={user?.name}
                    className="size-8 rounded-full shrink-0 object-cover mt-0.5 border border-[#8B5CF6]/30"
                  />
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-[#A78BFA] font-mono p-3 bg-[#12151D] border border-[#1F2430] rounded-xl max-w-xs">
              <div className="size-3.5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
              <span>Orbit AI Synthesizing Architecture...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-4 border-t border-[#1F2430] bg-[#12151D]">
          <div className="relative rounded-xl bg-[#181C26] border border-[#1F2430] focus-within:border-[#8B5CF6] transition-all">
            <textarea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Orbit AI about architecture, DSA weaknesses, or GSoC strategies (Ctrl/Cmd + Enter to send)..."
              className="w-full px-4 pt-3 pb-10 bg-transparent text-[#F8FAFC] text-xs placeholder:text-[#686D79] outline-none resize-none"
            />

            {/* Composer Footer Bar */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAttachedContext(prev => [...prev, 'Repo: facebook/react'])}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#12151D] hover:bg-[#202431] text-[#C5C8D0] border border-[#1F2430] transition-colors flex items-center gap-1"
                >
                  <Paperclip className="size-2.5 text-[#8B5CF6]" />
                  <span>+ Attach Repo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttachedContext(prev => [...prev, 'Problem: Two Sum'])}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#12151D] hover:bg-[#202431] text-[#C5C8D0] border border-[#1F2430] transition-colors flex items-center gap-1"
                >
                  <FileCode className="size-2.5 text-[#60A5FA]" />
                  <span>+ Attach DSA</span>
                </button>
              </div>

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold transition-all shadow-sm shadow-[#8B5CF6]/20 disabled:opacity-40 flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT PANEL (Collapsible): Context & Model Inspector ── */}
      {inspectorOpen && (
        <aside className="w-72 bg-[#12151D] border-l border-[#1F2430] flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right-4 duration-150">
          <div className="p-3 border-b border-[#1F2430] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="size-4 text-[#8B5CF6]" />
              <span className="text-xs font-bold text-[#F8FAFC]">Runtime Inspector</span>
            </div>
            <button
              onClick={() => setInspectorOpen(false)}
              className="p-1 rounded text-[#686D79] hover:text-[#F8FAFC]"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-4 text-xs">
            {/* Active Model Card */}
            <div className="p-3 rounded-xl bg-[#181C26] border border-[#1F2430] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#686D79] font-semibold">Active Engine</div>
              <div className="flex items-center gap-2 text-[#F8FAFC] font-semibold">
                <Zap className="size-4 text-[#F59E0B]" />
                <span>Deterministic Rule Engine</span>
              </div>
              <div className="text-[11px] text-[#686D79]">
                Zero-telemetry offline model with GSoC, DSA, and architecture knowledge bases.
              </div>
            </div>

            {/* Ollama Local Integration Status */}
            <div className="p-3 rounded-xl bg-[#181C26] border border-[#1F2430] space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-[#686D79] font-semibold">Local LLM Gateway</div>
              <div className="flex items-center justify-between">
                <span className="text-[#F8FAFC]">Ollama Daemon</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
                  Ready (M8)
                </span>
              </div>
              <div className="text-[11px] text-[#686D79]">
                Target model: `qwen2.5-coder:7b` / `llama3.2:3b` via `http://localhost:11434`.
              </div>
            </div>

            {/* Context Payload Breakdown */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#686D79] font-semibold">Attached Context Data</div>
              <div className="p-2.5 rounded-lg bg-[#0B0D12] border border-[#1F2430] font-mono text-[10px] text-[#C5C8D0] space-y-1">
                <div>{`{`}</div>
                <div className="pl-3">"mode": "{selectedMode}",</div>
                <div className="pl-3">"tokensEstimate": ~412,</div>
                <div className="pl-3">"userRole": "{user?.role || 'DEVELOPER'}",</div>
                <div className="pl-3">"attachments": {JSON.stringify(attachedContext)}</div>
                <div>{`}`}</div>
              </div>
            </div>

            {/* Model Hyperparameters */}
            <div className="space-y-2 pt-2 border-t border-[#1F2430]">
              <div className="text-[10px] font-mono uppercase text-[#686D79] font-semibold">Inference Settings</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#C5C8D0]">
                  <span>Temperature</span>
                  <span className="font-mono text-[#A78BFA]">0.2 (Precise)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.2"
                  className="w-full accent-[#8B5CF6] h-1 bg-[#181C26] rounded-lg cursor-pointer"
                />
              </div>
            </div>

          </div>
        </aside>
      )}

    </div>
  );
}
