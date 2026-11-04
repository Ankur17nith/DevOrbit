import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function OrbitAiPage() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'Developer'}! I am **Orbit AI**, your developer intelligence co-pilot.\n\nAsk me about:\n- Finding open-source issues that match your skills\n- Explaining complex repository architectures\n- Drafting Google Summer of Code (GSoC) contribution plans\n- Overcoming specific DSA weak spots (like Dynamic Programming or Graphs)`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || !token) return;

    const userMessage = { role: 'user', content: text };
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
          conversationId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setConversationId(json.data.conversationId);
        setMessages(prev => [...prev, json.data.message]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How do I pick my first issue in an Apache or CNCF project?',
    'What are my weakest DSA topics and what should I solve today?',
    'Explain the recommended architectural workflow for DevOrbit',
    'Which GSoC organizations work with Rust and Python?',
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1100px] mx-auto space-y-4 h-[calc(100vh-56px)] flex flex-col justify-between animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-3 border-b border-[#242424] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-display">Orbit AI Assistant</h1>
            <p className="text-xs text-neutral-400">Context-aware co-pilot for open source and algorithmic engineering</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400">
          Rule-Engine + Ollama Ready
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="size-7 rounded-lg bg-[#181819] border border-[#242424] flex items-center justify-center text-amber-400 shrink-0 mt-1">
                <Bot className="size-4" />
              </div>
            )}

            <div
              className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#09AE5B] text-white font-medium rounded-tr-sm'
                  : 'bg-[#181819] border border-[#242424] text-neutral-200 rounded-tl-sm space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.content}</div>
            </div>

            {m.role === 'user' && (
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces'}
                alt={user?.name}
                className="size-7 rounded-full shrink-0 object-cover mt-1 border border-[#242424]"
              />
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <div className="size-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Orbit AI is thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#181819] hover:bg-[#222223] border border-[#242424] text-neutral-300 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>{q}</span>
            <ArrowRight className="size-3 text-neutral-500" />
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-[#181819] border border-[#242424]"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Orbit AI anything about your code, issues, or algorithms..."
          className="flex-1 px-3 py-2 bg-transparent text-white text-xs placeholder:text-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white transition-colors disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>

    </div>
  );
}
