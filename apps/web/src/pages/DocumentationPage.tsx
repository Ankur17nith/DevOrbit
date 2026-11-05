import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Terminal, 
  Cpu, 
  GitBranch, 
  Database, 
  ShieldCheck, 
  FolderGit2, 
  Zap, 
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  Code2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DevOrbitLogo } from '../components/DevOrbitLogo.js';

interface DocumentationPageProps {
  onNavigate: (route: string) => void;
  onLaunchWorkspace?: () => void;
}

interface DocSection {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: React.ReactNode;
}

export function DocumentationPage({ onNavigate, onLaunchWorkspace }: DocumentationPageProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const docSections: DocSection[] = [
    {
      id: 'quickstart',
      category: 'GETTING STARTED',
      title: 'Quick Start & Architecture Overview',
      summary: 'Set up DevOrbit on your local workstation in under 2 minutes.',
      content: (
        <div className="space-y-6 text-sm text-[#4B5565] leading-relaxed">
          <p>
            DevOrbit is a local-first, multi-user Developer Intelligence Operating System. It integrates code intelligence, algorithm practice, open-source discovery, and local offline AI into one fast, private workspace.
          </p>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <h4 className="text-xs font-mono uppercase font-bold text-[#0E121B]">Architecture Principles</h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs">
              <li><strong className="text-[#0E121B]">Local-First:</strong> All application state is persisted to a local SQLite database with WAL mode enabled.</li>
              <li><strong className="text-[#0E121B]">Zero Telemetry:</strong> DevOrbit does not report analytical tracking events, telemetry pings, or code telemetry to any third party.</li>
              <li><strong className="text-[#0E121B]">Offline AI Capability:</strong> Integrates directly with locally running Ollama services (<code className="px-1.5 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#0E121B] font-mono text-[11px]">http://localhost:11434</code>).</li>
            </ul>
          </div>

          <h3 className="text-base font-bold text-[#0E121B] pt-2">Local Development Setup</h3>
          <p>
            Clone the repository and launch both the Node API and React Vite web workspace using npm:
          </p>

          <div className="relative rounded-xl bg-[#0B0D12] p-4 text-xs font-mono text-[#F8FAFC] border border-[#1F2430]">
            <button
              onClick={() => handleCopy(`git clone https://github.com/DevOrbit/DevOrbit.git\ncd DevOrbit\nnpm install\nnpm run dev`, 'clone')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#181C26] hover:bg-[#2E364A] text-[#94A3B8] hover:text-white transition-colors"
              title="Copy code"
            >
              {copiedCode === 'clone' ? <Check className="size-3.5 text-[#22C55E]" /> : <Copy className="size-3.5" />}
            </button>
            <pre className="overflow-x-auto">
{`# 1. Install workspace dependencies
npm install

# 2. Initialize local SQLite database
npm run db:push

# 3. Start local development servers
npm run dev`}
            </pre>
          </div>

          <p className="text-xs text-[#64748B]">
            API server starts at <code className="text-[#8B5CF6]">http://localhost:3001</code> and the frontend workspace launches at <code className="text-[#8B5CF6]">http://localhost:5173</code>.
          </p>
        </div>
      )
    },
    {
      id: 'github',
      category: 'INTEGRATIONS',
      title: 'GitHub Direct OAuth & Repository Sync',
      summary: 'Authorize your GitHub repositories and analyze commit cadence with zero secret leakage.',
      content: (
        <div className="space-y-6 text-sm text-[#4B5565] leading-relaxed">
          <p>
            DevOrbit connects directly to GitHub using standard OAuth 2.0 PKCE or Personal Access Tokens (PAT). Repository metadata, branch structures, pull requests, and commit statistics are synchronized to your local database for AST navigation and skill attribution.
          </p>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3">
            <h4 className="text-xs font-bold text-[#0E121B] flex items-center gap-2">
              <GitBranch className="size-4 text-[#8B5CF6]" />
              <span>OAuth Authorization Flow</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#4B5565]">
              <li>Navigate to <strong className="text-[#0E121B]">Integrations</strong> in the sidebar.</li>
              <li>Click <strong className="text-[#0E121B]">Authorize with GitHub</strong>.</li>
              <li>The API generates a cryptographically secure 32-byte state parameter stored with a 10-minute TTL.</li>
              <li>Upon OAuth callback, the exchange token is securely converted to an access token and stored in your local SQLite store.</li>
            </ol>
          </div>

          <h3 className="text-base font-bold text-[#0E121B]">REST Endpoint Reference</h3>
          <div className="rounded-xl bg-[#0B0D12] p-4 text-xs font-mono text-[#F8FAFC] border border-[#1F2430]">
            <pre className="overflow-x-auto">
{`# Initiate GitHub OAuth Authorization
GET /api/v1/integrations/github/oauth/authorize
Response: { "authUrl": "https://github.com/login/oauth/authorize?client_id=...&state=..." }

# Complete OAuth Callback
POST /api/v1/integrations/github/oauth/callback
Payload: { "code": "github_temp_code", "state": "cryptographic_state" }`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'dsa',
      category: 'INTELLIGENCE ENGINES',
      title: 'Orbit DSA & Spaced Repetition Engine',
      summary: 'Mathematical recall retention based on an adapted SM-2 spaced repetition algorithm.',
      content: (
        <div className="space-y-6 text-sm text-[#4B5565] leading-relaxed">
          <p>
            Orbit DSA replaces ad-hoc spreadsheet tracking with an intelligent, decay-modeled revision scheduler. It tracks problem solving across platforms (LeetCode, Codeforces, Take U Forward) and computes exact revision dates.
          </p>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <h4 className="text-xs font-mono uppercase font-bold text-[#0E121B]">SM-2 Formula Parameters</h4>
            <div className="text-xs space-y-1.5">
              <p><strong className="text-[#0E121B]">Quality (q):</strong> Recall rating scale from 1 (Complete Blackout) to 5 (Effortless Master).</p>
              <p><strong className="text-[#0E121B]">Easiness Factor (EF):</strong> Initialized at 2.5 and updated after each repetition session.</p>
              <p><strong className="text-[#0E121B]">Assistance Penalties:</strong> Independent solves retain 100% credit; solves using hints receive 65%; AI-generated solves receive 20% credit.</p>
            </div>
          </div>

          <h3 className="text-base font-bold text-[#0E121B]">Importing DSA Sheets</h3>
          <p>
            You can import Striver A2Z or custom topic sheets via CSV format directly from the Orbit DSA interface:
          </p>
          <div className="rounded-xl bg-[#0B0D12] p-4 text-xs font-mono text-[#F8FAFC] border border-[#1F2430]">
            <pre className="overflow-x-auto">
{`title,platform,difficulty,topic,subtopic,url
Two Sum,LeetCode,EASY,Arrays,Two Pointers,https://leetcode.com/problems/two-sum
3Sum,LeetCode,MEDIUM,Arrays,Two Pointers,https://leetcode.com/problems/3sum`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      category: 'INTELLIGENCE ENGINES',
      title: 'Orbit AI Studio & Local Ollama Pairing',
      summary: 'Autonomous developer assistance with offline LLMs, zero simulated responses, and provenance tags.',
      content: (
        <div className="space-y-6 text-sm text-[#4B5565] leading-relaxed">
          <p>
            Orbit AI provides conversational code generation, architecture planning, and debugging assistance. It guarantees transparent model execution: when connected to Ollama, responses are streamed from your local model; when offline, deterministic rule-based analysis is explicitly labeled.
          </p>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <h4 className="text-xs font-bold text-[#0E121B] flex items-center gap-2">
              <Cpu className="size-4 text-[#8B5CF6]" />
              <span>Supported Local Models</span>
            </h4>
            <ul className="list-disc list-inside text-xs space-y-1 text-[#4B5565]">
              <li><strong className="text-[#0E121B]">qwen2.5-coder:</strong> Optimized for syntax analysis, AST patch generation, and test authoring.</li>
              <li><strong className="text-[#0E121B]">llama3 / llama3.2:</strong> General code reasoning, architecture decomposition, and refactoring advice.</li>
              <li><strong className="text-[#0E121B]">codellama:</strong> Python, C++, TypeScript algorithm walkthroughs.</li>
            </ul>
          </div>

          <h3 className="text-base font-bold text-[#0E121B]">Starting Ollama for DevOrbit</h3>
          <div className="rounded-xl bg-[#0B0D12] p-4 text-xs font-mono text-[#F8FAFC] border border-[#1F2430]">
            <pre className="overflow-x-auto">
{`# 1. Start Ollama service locally
ollama serve

# 2. Pull recommended developer model
ollama pull qwen2.5-coder:7b

# 3. DevOrbit automatically discovers active models on port 11434`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      category: 'SECURITY & PRIVACY',
      title: 'Local-First Data Guarantees & Multi-User Isolation',
      summary: 'Cryptographic data isolation, strict ownership validation, and zero cloud lock-in.',
      content: (
        <div className="space-y-6 text-sm text-[#4B5565] leading-relaxed">
          <p>
            DevOrbit is engineered specifically for privacy-conscious developers and corporate environments. Every user account on your local instance has strictly isolated database tables, bookmarks, and chat histories.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <h5 className="font-bold text-xs text-[#0E121B] mb-1">IDOR Protection</h5>
              <p className="text-xs text-[#64748B]">
                All mutations and queries enforce <code className="text-[#8B5CF6]">where: {'{ id, userId }'}</code> scopes at the Prisma ORM layer.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <h5 className="font-bold text-xs text-[#0E121B] mb-1">Session Invalidation</h5>
              <p className="text-xs text-[#64748B]">
                Logging out deletes the session record from SQLite, immediately invalidating subsequent JWT calls with HTTP 401.
              </p>
            </div>
          </div>

          <h3 className="text-base font-bold text-[#0E121B]">Database Backup & Export</h3>
          <p>
            DevOrbit provides one-click JSON database export at <code className="text-[#8B5CF6]">GET /api/v1/backup/export</code>, ensuring complete data ownership and zero lock-in.
          </p>
        </div>
      )
    }
  ];

  const filteredSections = docSections.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDoc = docSections.find(doc => doc.id === selectedDocId) || docSections[0];

  return (
    <div className="min-h-screen bg-white text-[#0E121B] selection:bg-[#8B5CF6]/20 font-sans flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 focus:outline-none"
            >
              <DevOrbitLogo variant="light" size="md" showBadge={false} />
            </button>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#EDE9FE] text-[#8B5CF6] border border-[#8B5CF6]/30 hidden sm:inline">
              Documentation
            </span>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] w-72">
            <Search className="size-3.5 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Search DevOrbit docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[#0E121B] placeholder-[#94A3B8] w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            {onLaunchWorkspace && (
              <button
                onClick={onLaunchWorkspace}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-semibold border border-[#8B5CF6]/30 transition-all shadow-xs"
              >
                <span>Launch Demo</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('landing')}
              className="text-xs font-medium text-[#64748B] hover:text-[#0E121B] transition-colors"
            >
              Landing
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0E121B] text-white hover:bg-[#1F2430] transition-all flex items-center gap-1.5"
            >
              <span>Sign in</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Documentation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase font-bold text-[#8B5CF6] tracking-wider px-3 mb-2">
                DOCS DIRECTORY
              </div>
              {filteredSections.map(doc => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] font-semibold border border-[#8B5CF6]/30' 
                        : 'text-[#4B5565] hover:bg-[#F8FAFC] hover:text-[#0E121B]'
                    }`}
                  >
                    <span>{doc.title}</span>
                    {isSelected && <ChevronRight className="size-3.5 text-[#8B5CF6]" />}
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="text-xs font-bold text-[#0E121B] flex items-center gap-1.5">
                <Terminal className="size-3.5 text-[#8B5CF6]" />
                <span>DevOrbit Local Shell</span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                DevOrbit runs without reliance on public cloud APIs. Built for offline resilience.
              </p>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-[#0E121B] hover:bg-[#1F2430] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Right Article Content */}
          <main className="md:col-span-8 lg:col-span-9 bg-white p-6 sm:p-10 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-8">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
              <span className="text-[#8B5CF6]">{activeDoc.category}</span>
              <span>/</span>
              <span>{activeDoc.title}</span>
            </div>

            {/* Header */}
            <div className="space-y-2 pb-6 border-b border-[#E2E8F0]">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E121B]">
                {activeDoc.title}
              </h1>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {activeDoc.summary}
              </p>
            </div>

            {/* Dynamic Content */}
            <div>
              {activeDoc.content}
            </div>

            {/* Article Footer */}
            <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-[#64748B]">
                Last verified: May 2026 • DevOrbit v0.1.0 Documentation
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('landing')}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0E121B] font-medium transition-colors"
                >
                  ← Home
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold transition-colors"
                >
                  Get Started →
                </button>
              </div>
            </div>

          </main>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-6 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DevOrbit Local-first Architecture Documentation</span>
          <span>© 2026 DevOrbit. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
