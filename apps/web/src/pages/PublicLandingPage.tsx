import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Terminal, 
  Cpu, 
  GitBranch, 
  BookOpen, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Code2,
  Compass,
  Zap,
  Activity,
  FolderGit2,
  Lock,
  Search,
  Users,
  Eye,
  Server
} from 'lucide-react';
import { DevOrbitLogo, DevOrbitMark } from '../components/DevOrbitLogo.js';

interface PublicLandingPageProps {
  onNavigate: (route: string) => void;
  onLaunchDemo?: () => void;
}

export function PublicLandingPage({ onNavigate, onLaunchDemo }: PublicLandingPageProps) {
  const [activeCapIndex, setActiveCapIndex] = useState<number>(0);

  const capabilities = [
    {
      id: 'skills',
      title: 'Orbit Skills',
      category: 'Evidence-Backed Growth',
      description: 'Continuous skill attribution grounded in verified git commits, solved algorithmic patterns, and peer pull requests. No fabricated resumes.',
      icon: Activity,
      tag: 'Core Intelligence'
    },
    {
      id: 'dsa',
      title: 'Orbit DSA',
      category: 'Algorithmic Mastery',
      description: 'Spaced repetition engine (SM-2 adapted), LeetCode & Codeforces sync, Striver A2Z sheets, and recall-decay analytics.',
      icon: BookOpen,
      tag: 'Practice'
    },
    {
      id: 'oss',
      title: 'Orbit OSS',
      category: 'Ecosystem Discovery',
      description: 'Live index of GSOC organizations, curated "good first issues", bounty discovery, and cross-repository contribution intelligence.',
      icon: Compass,
      tag: 'Discovery'
    },
    {
      id: 'navigator',
      title: 'Codebase Navigator',
      category: 'Architecture AST',
      description: 'Deep AST dependency maps, structural module analysis, call-graph visualization, and token-efficient codebase understanding.',
      icon: FolderGit2,
      tag: 'Architecture'
    },
    {
      id: 'fix',
      title: 'Orbit Fix',
      category: 'Source-Grounded Debugging',
      description: 'Deterministic root-cause localization with unified diff patches, test verification, and complete reasoning traceability.',
      icon: Zap,
      tag: 'Diagnostics'
    },
    {
      id: 'safechange',
      title: 'Orbit SafeChange',
      category: 'Blast-Radius Analysis',
      description: 'Before you merge: inspect symbol breakages, transitively affected test suites, and API contracts across workspaces.',
      icon: ShieldCheck,
      tag: 'Reliability'
    },
    {
      id: 'recon',
      title: 'Orbit Recon',
      category: 'Binary & Web Reverse Engineering',
      description: 'Powered by REA (Reverse Engineer Anything) for deep binary decompilation, web bundle analysis, and architecture reconstruction.',
      icon: Terminal,
      tag: 'Inspection'
    },
    {
      id: 'ai',
      title: 'Orbit AI',
      category: 'Autonomous Developer Pairing',
      description: 'Run completely offline on Ollama or connect cloud providers. Multi-file code generation with explicit provenance tags.',
      icon: Cpu,
      tag: 'Local LLM'
    },
    {
      id: 'pulse',
      title: 'Orbit Pulse',
      category: 'Developer Flow & Telemetry',
      description: 'Real-time telemetry of local build health, test execution velocity, and commit cadence without cloud surveillance.',
      icon: Sparkles,
      tag: 'Telemetry'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#0E121B] selection:bg-[#8B5CF6]/20 selection:text-[#0E121B] font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. PUBLIC TOP NAVIGATION (Figma-accurate: 72px, clean light)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-left focus:outline-none"
            >
              <DevOrbitLogo variant="light" size="md" showBadge={true} />
            </button>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B5565]">
              <a href="#product" className="hover:text-[#0E121B] transition-colors">Product</a>
              <a href="#features" className="hover:text-[#0E121B] transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-[#0E121B] transition-colors">How it works</a>
              <a href="#integrations" className="hover:text-[#0E121B] transition-colors">Integrations</a>
              <a href="#privacy" className="hover:text-[#0E121B] transition-colors">Privacy</a>
              <button 
                onClick={() => onNavigate('documentation')}
                className="hover:text-[#8B5CF6] transition-colors font-semibold"
              >
                Documentation
              </button>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {onLaunchDemo && (
              <button
                onClick={onLaunchDemo}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-semibold border border-[#8B5CF6]/30 transition-all shadow-xs"
              >
                <Sparkles className="size-3.5" />
                <span>Local Demo</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-sm font-medium text-[#0E121B] hover:text-[#8B5CF6] transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#0E121B] text-white hover:bg-[#1F2430] active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Get started</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Local-first Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E2E8F0] bg-white shadow-xs mb-8 text-xs font-medium text-[#4B5565]">
            <span className="size-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span>Local-first developer intelligence</span>
          </div>

          {/* H1 Headline matching Figma */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#0E121B] leading-[1.08] mb-6">
            Your entire developer journey.{' '}
            <span className="text-[#8B5CF6] bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]">
              One universe.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#4B5565] leading-relaxed mb-10">
            DevOrbit connects your local codebases, git repositories, DSA practice, and open-source contributions into a unified intelligence engine with local LLMs and zero telemetry.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0E121B] text-white font-semibold text-sm hover:bg-[#1F2430] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Get started</span>
              <ArrowRight className="size-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0E121B] font-semibold text-sm hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all flex items-center justify-center"
            >
              Explore features
            </a>
            {onLaunchDemo && (
              <button
                onClick={onLaunchDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] font-semibold text-sm hover:bg-[#8B5CF6]/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="size-4" />
                <span>Try Local Demo Mode</span>
              </button>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-[#64748B]">
            <div className="flex items-center gap-2">
              <Database className="size-3.5 text-[#22C55E]" />
              <span>100% Local SQLite Database</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="size-3.5 text-[#8B5CF6]" />
              <span>Zero Cloud Telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="size-3.5 text-[#60A5FA]" />
              <span>Offline Ollama LLM Ready</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. FRAMED APPLICATION PREVIEW CONTAINER (Figma Mockup)
        ───────────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="rounded-2xl bg-[#0E1117] p-2 sm:p-4 border border-[#1F2430] shadow-2xl overflow-hidden">
            
            {/* Window Chrome Titlebar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1F2430] mb-2 text-xs font-mono text-[#686D79]">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#EF4444]/80 inline-block" />
                <span className="size-3 rounded-full bg-[#F59E0B]/80 inline-block" />
                <span className="size-3 rounded-full bg-[#22C55E]/80 inline-block" />
                <span className="ml-2 text-[#C5C8D0] hidden sm:inline">DevOrbit Desktop — Workspace</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/30">Local-First Engine</span>
              </div>
            </div>

            {/* Embedded Mock Shell */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 rounded-xl overflow-hidden border border-[#1F2430]">
              
              {/* Mock Sidebar (240px equivalent) */}
              <div className="hidden md:flex md:col-span-3 lg:col-span-3 bg-[#0E1117] p-4 flex-col justify-between border-r border-[#1F2430]">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <DevOrbitMark className="size-6" dotColor="#8B5CF6" />
                    <span className="font-bold text-sm text-[#F8FAFC]">DevOrbit</span>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#686D79] tracking-wider mb-2 font-semibold">
                      WORKSPACE
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#181C26] text-[#F8FAFC] font-medium text-xs border border-[#8B5CF6]/30">
                        <Activity className="size-3.5 text-[#8B5CF6]" />
                        <span>Command Center</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#686D79] text-xs">
                        <FolderGit2 className="size-3.5" />
                        <span>Codebase Navigator</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#686D79] text-xs">
                        <BookOpen className="size-3.5" />
                        <span>Orbit DSA</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#686D79] text-xs">
                        <Compass className="size-3.5" />
                        <span>Open Source</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#686D79] text-xs">
                        <Cpu className="size-3.5" />
                        <span>Orbit AI Studio</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1F2430]">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center font-bold text-xs text-[#A78BFA]">
                      DO
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#F8FAFC]">Your Workspace</div>
                      <div className="text-[10px] text-[#22C55E]">● Verified Local</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Command Center Light Canvas */}
              <div className="md:col-span-9 lg:col-span-9 bg-[#F8FAFC] p-4 sm:p-6 text-[#0E121B]">
                
                {/* Canvas Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#0E121B]">Command Center</h3>
                    <span className="text-xs text-[#64748B]">/ Overview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#64748B]">
                      <Search className="size-3" />
                      <span>Search workspace...</span>
                    </div>
                    <div className="size-6 rounded-full bg-[#EDE9FE] text-[#8B5CF6] font-bold text-[10px] flex items-center justify-center border border-[#8B5CF6]/30">
                      DO
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div className="mb-6">
                  <div className="text-[11px] font-mono uppercase font-bold text-[#8B5CF6] tracking-wider mb-1">
                    TUESDAY, 14 MAY
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0E121B]">Good morning, Developer.</h2>
                  <p className="text-xs text-[#64748B]">Your developer workspace at a glance.</p>
                </div>

                {/* 3 Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  
                  {/* Card 1: GitHub */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-[#64748B] font-semibold">GITHUB ACTIVITY</span>
                      <GitBranch className="size-3.5 text-[#64748B]" />
                    </div>
                    <div className="text-sm font-bold text-[#0E121B]">Connect GitHub</div>
                    <div className="text-[11px] text-[#8B5CF6] mt-0.5 flex items-center gap-1">
                      <span>OAuth required</span>
                      <ArrowRight className="size-3" />
                    </div>
                  </div>

                  {/* Card 2: DSA */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-[#64748B] font-semibold">DSA PROGRESS</span>
                      <BookOpen className="size-3.5 text-[#64748B]" />
                    </div>
                    <div className="text-sm font-bold text-[#0E121B]">No problems yet</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">Add your first problem</div>
                  </div>

                  {/* Card 3: Open Source */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-[#64748B] font-semibold">OPEN SOURCE</span>
                      <Compass className="size-3.5 text-[#64748B]" />
                    </div>
                    <div className="text-sm font-bold text-[#0E121B]">No saved issues</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">Discover opportunities</div>
                  </div>

                </div>

                {/* Lower Row: Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  
                  {/* Recent Activity Card */}
                  <div className="sm:col-span-8 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-bold text-[#0E121B]">Recent activity</span>
                      <ExternalLink className="size-3 text-[#64748B]" />
                    </div>
                    <div className="py-8 text-center text-xs text-[#64748B]">
                      <div className="size-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-2 text-[#64748B]">
                        ↗
                      </div>
                      Connect an integration to see activity.
                    </div>
                  </div>

                  {/* Quick Actions (Dark Card) */}
                  <div className="sm:col-span-4 p-4 rounded-xl bg-[#0E1117] text-white border border-[#1F2430] flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#F8FAFC] block mb-3">Quick actions</span>
                      <div className="space-y-1.5">
                        <button className="w-full py-1.5 px-2.5 rounded-lg bg-[#181C26] hover:bg-[#1F2430] text-left text-xs text-[#C5C8D0] flex items-center justify-between">
                          <span>Open repository</span>
                          <span className="text-[#686D79]">→</span>
                        </button>
                        <button className="w-full py-1.5 px-2.5 rounded-lg bg-[#181C26] hover:bg-[#1F2430] text-left text-xs text-[#C5C8D0] flex items-center justify-between">
                          <span>Track DSA problem</span>
                          <span className="text-[#686D79]">→</span>
                        </button>
                        <button className="w-full py-1.5 px-2.5 rounded-lg bg-[#181C26] hover:bg-[#1F2430] text-left text-xs text-[#C5C8D0] flex items-center justify-between">
                          <span>Connect integration</span>
                          <span className="text-[#686D79]">→</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#686D79] font-mono mt-3">
                      DevOrbit v0.1.0 • Local Engine
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE PROBLEM SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="product" className="py-20 border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column */}
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase font-bold text-[#8B5CF6] tracking-wider block mb-2">
                THE PROBLEM
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0E121B] leading-tight mb-4">
                Your developer journey is scattered across too many tools.
              </h2>
              <p className="text-base text-[#4B5565] leading-relaxed">
                DevOrbit creates one coherent workspace without pretending every platform works the same way. We unify practice, codebases, and contributions locally.
              </p>
            </div>

            {/* Right Column: 4 Numbered Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#8B5CF6]/40 transition-colors">
                <span className="font-mono text-xs font-bold text-[#8B5CF6] block mb-2">01 Activity</span>
                <h3 className="text-base font-bold text-[#0E121B] mb-1.5">Fragmented Tracking</h3>
                <p className="text-xs text-[#4B5565] leading-relaxed">
                  GitHub work lives separately from DSA progress, personal notes, and learning roadmaps across dozens of browser tabs.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#8B5CF6]/40 transition-colors">
                <span className="font-mono text-xs font-bold text-[#8B5CF6] block mb-2">02 Discovery</span>
                <h3 className="text-base font-bold text-[#0E121B] mb-1.5">Scattered Open Source</h3>
                <p className="text-xs text-[#4B5565] leading-relaxed">
                  Open-source programs, GSOC organizations, and beginner-friendly issues require endless manual filtering across disconnected platforms.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#8B5CF6]/40 transition-colors">
                <span className="font-mono text-xs font-bold text-[#8B5CF6] block mb-2">03 Understanding</span>
                <h3 className="text-base font-bold text-[#0E121B] mb-1.5">Cognitive Overload</h3>
                <p className="text-xs text-[#4B5565] leading-relaxed">
                  Deciphering complex codebases, AST relationships, and change impact blast radii without unified visualization tools.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#8B5CF6]/40 transition-colors">
                <span className="font-mono text-xs font-bold text-[#8B5CF6] block mb-2">04 Evidence</span>
                <h3 className="text-base font-bold text-[#0E121B] mb-1.5">Unverifiable Growth</h3>
                <p className="text-xs text-[#4B5565] leading-relaxed">
                  Technical skill progression is hard to demonstrate objectively without verified commits and real problem-solving recall retention.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. PRODUCT SYSTEM (Unified Developer Operating System)
      ───────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase font-bold text-[#8B5CF6] tracking-wider block mb-2">
              PRODUCT SYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0E121B] mb-4">
              One workspace. Every part of your developer journey.
            </h2>
            <p className="text-base text-[#4B5565]">
              Six purpose-built engines architected to work in harmony on your local machine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:shadow-md transition-shadow">
              <div className="size-10 rounded-xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center mb-4">
                <Activity className="size-5" />
              </div>
              <span className="font-mono text-xs text-[#8B5CF6] font-bold">01</span>
              <h3 className="text-lg font-bold text-[#0E121B] mt-1 mb-2">Developer Intelligence</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Evidence-backed skills, multi-account GitHub activity, commit frequencies, and algorithmic progress in one unified view.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:shadow-md transition-shadow">
              <div className="size-10 rounded-xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center mb-4">
                <FolderGit2 className="size-5" />
              </div>
              <span className="font-mono text-xs text-[#8B5CF6] font-bold">02</span>
              <h3 className="text-lg font-bold text-[#0E121B] mt-1 mb-2">Codebase Intelligence</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Navigate repositories with AST dependency maps, understand module architecture, and investigate commit histories.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:shadow-md transition-shadow">
              <div className="size-10 rounded-xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center mb-4">
                <Compass className="size-5" />
              </div>
              <span className="font-mono text-xs text-[#8B5CF6] font-bold">03</span>
              <h3 className="text-lg font-bold text-[#0E121B] mt-1 mb-2">Open Source Discovery</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Find relevant organizations, beginner-friendly issues, GSOC programs, and verified bounty opportunities.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:shadow-md transition-shadow">
              <div className="size-10 rounded-xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center mb-4">
                <BookOpen className="size-5" />
              </div>
              <span className="font-mono text-xs text-[#8B5CF6] font-bold">04</span>
              <h3 className="text-lg font-bold text-[#0E121B] mt-1 mb-2">DSA & Learning</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Spaced repetition problem solving, curated Striver A2Z sheets, solution recall decay, and platform synchronization.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:shadow-md transition-shadow">
              <div className="size-10 rounded-xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center mb-4">
                <Zap className="size-5" />
              </div>
              <span className="font-mono text-xs text-[#8B5CF6] font-bold">05</span>
              <h3 className="text-lg font-bold text-[#0E121B] mt-1 mb-2">Development Assistance</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Deterministic bug fixing with Orbit Fix, blast-radius safety checks with SafeChange, and local offline Ollama pairing.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:shadow-md transition-shadow">
              <div className="size-10 rounded-xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center mb-4">
                <Server className="size-5" />
              </div>
              <span className="font-mono text-xs text-[#8B5CF6] font-bold">06</span>
              <h3 className="text-lg font-bold text-[#0E121B] mt-1 mb-2">Integrations & Automation</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Connect developer services using the honest protocol for each: OAuth, public APIs, browser extensions, or JSON.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CAPABILITIES SECTION (Figma Dark Canvas: #0B0D12)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0B0D12] text-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase font-bold text-[#8B5CF6] tracking-wider block mb-2">
              CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              A serious workspace for technical work.
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed">
              Each module solves a distinct developer workflow. Intelligence is grounded in connected data and source context, never decorative AI output.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left list of 9 modules */}
            <div className="lg:col-span-5 space-y-2">
              {capabilities.map((cap, idx) => {
                const Icon = cap.icon;
                const isActive = activeCapIndex === idx;
                return (
                  <button
                    key={cap.id}
                    onClick={() => setActiveCapIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-[#181C26] border-[#8B5CF6] text-white shadow-lg' 
                        : 'bg-[#12151D]/60 border-[#1F2430] text-[#94A3B8] hover:bg-[#181C26] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-[#181C26] text-[#686D79]'}`}>
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{cap.title}</div>
                        <div className="text-[11px] text-[#686D79]">{cap.category}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181C26] text-[#686D79] border border-[#1F2430]">
                      {cap.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Detailed Capability Viewport */}
            <div className="lg:col-span-7 bg-[#12151D] border border-[#1F2430] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 size-64 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
              
              {(() => {
                const cur = capabilities[activeCapIndex];
                const CurIcon = cur.icon;
                return (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                          <CurIcon className="size-6" />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-[#A78BFA]">{cur.category}</span>
                          <h3 className="text-2xl font-bold text-white">{cur.title}</h3>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/30">
                        {cur.tag}
                      </span>
                    </div>

                    <p className="text-sm text-[#CBD5E1] leading-relaxed">
                      {cur.description}
                    </p>

                    <div className="p-4 rounded-xl bg-[#181C26] border border-[#1F2430] space-y-3">
                      <div className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-[#22C55E]" />
                        <span>Key Engineering Principles</span>
                      </div>
                      <ul className="text-xs text-[#94A3B8] space-y-2 list-disc list-inside">
                        <li>Strict local SQLite persistence with transactional guarantees.</li>
                        <li>Source-grounded AST extraction with AST-grep and tree-sitter.</li>
                        <li>Deterministic algorithms with zero simulated or fake responses.</li>
                      </ul>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onNavigate('documentation')}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                      >
                        <span>Read technical documentation</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. HOW IT WORKS (4-Step Pipeline)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase font-bold text-[#8B5CF6] tracking-wider block mb-2">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0E121B] mb-4">
              Get running in minutes. Keep control forever.
            </h2>
            <p className="text-base text-[#4B5565]">
              A 4-step local lifecycle designed for developer privacy and agency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="font-mono text-xs font-bold text-[#8B5CF6] block mb-3">01</span>
              <h3 className="text-base font-bold text-[#0E121B] mb-2">Create your account</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Start with only the profile information your workspace needs. Stored locally in SQLite with bcrypt hashing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="font-mono text-xs font-bold text-[#8B5CF6] block mb-3">02</span>
              <h3 className="text-base font-bold text-[#0E121B] mb-2">Connect platforms</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Authorize or import through the correct method: GitHub OAuth, Codeforces public API, LeetCode data, or DSA sheets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="font-mono text-xs font-bold text-[#8B5CF6] block mb-3">03</span>
              <h3 className="text-base font-bold text-[#0E121B] mb-2">Build your workspace</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Choose learning, open-source, and development priorities. Index your local git repositories for instant AST analysis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="font-mono text-xs font-bold text-[#8B5CF6] block mb-3">04</span>
              <h3 className="text-base font-bold text-[#0E121B] mb-2">Track and improve</h3>
              <p className="text-xs text-[#4B5565] leading-relaxed">
                Use connected evidence to understand your developer journey, retain algorithmic mastery, and build verified skills.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. INTEGRATIONS CAPABILITY TABLE
      ───────────────────────────────────────────────────────────── */}
      <section id="integrations" className="py-20 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase font-bold text-[#8B5CF6] tracking-wider block mb-2">
              INTEGRATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0E121B] mb-4">
              Honest connections. Clear methods.
            </h2>
            <p className="text-base text-[#4B5565]">
              OAuth where it exists. Public APIs, extensions, imports, and local services where they are the right fit.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-mono uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6 font-semibold">Service</th>
                    <th className="py-3.5 px-6 font-semibold">Connection Method</th>
                    <th className="py-3.5 px-6 font-semibold">Data Collected</th>
                    <th className="py-3.5 px-6 font-semibold">Authentication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#0E121B]">
                  <tr className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2">
                      <GitBranch className="size-4 text-[#8B5CF6]" />
                      <span>GitHub</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#8B5CF6] font-semibold">DIRECT OAUTH 2.0</td>
                    <td className="py-4 px-6 text-[#4B5565]">Repositories, commit frequency, languages, pull requests</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] font-medium">PKCE Flow</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2">
                      <Code2 className="size-4 text-[#60A5FA]" />
                      <span>Codeforces</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#60A5FA] font-semibold">USERNAME + PUBLIC API</td>
                    <td className="py-4 px-6 text-[#4B5565]">Contest rating, submission history, solved tags</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[#4B5565] font-medium">Public API</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2">
                      <BookOpen className="size-4 text-[#F59E0B]" />
                      <span>LeetCode</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#F59E0B] font-semibold">BROWSER EXTENSION / IMPORT</td>
                    <td className="py-4 px-6 text-[#4B5565]">Solved problem distribution, acceptance rate, streak</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[#4B5565] font-medium">Export / Sync</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2">
                      <Compass className="size-4 text-[#EC4899]" />
                      <span>Take U Forward</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#EC4899] font-semibold">THIRD-PARTY DATA SOURCE</td>
                    <td className="py-4 px-6 text-[#4B5565]">Striver A2Z DSA sheet taxonomy and subtopic tracking</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[#4B5565] font-medium">Ingestion</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2">
                      <Cpu className="size-4 text-[#8B5CF6]" />
                      <span>Ollama</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#8B5CF6] font-semibold">LOCAL SERVICE</td>
                    <td className="py-4 px-6 text-[#4B5565]">Local LLM model discovery (qwen2.5-coder, llama3, codellama)</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] font-medium">100% Offline</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2">
                      <Layers className="size-4 text-[#64748B]" />
                      <span>DSA Sheets</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#64748B] font-semibold">CSV / JSON IMPORT</td>
                    <td className="py-4 px-6 text-[#4B5565]">Custom topic problems, TLE eliminator lists, personal notes</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[#4B5565] font-medium">Local File</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. YOUR DATA YOUR CONTROL (Dark Card)
      ───────────────────────────────────────────────────────────── */}
      <section id="privacy" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0B0D12] text-white border border-[#1F2430] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-80 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181C26] border border-[#8B5CF6]/30 text-xs font-mono text-[#A78BFA] mb-4">
                <ShieldCheck className="size-3.5 text-[#22C55E]" />
                <span>PRIVACY & SECURITY GUARANTEE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                Your development data. Your control.
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                DevOrbit runs on your machine. We do not operate cloud analytics, we do not train models on your codebases, and your database stays in your local user directory.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-[#C5C8D0]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#22C55E]" />
                  <span>Local SQLite with transaction WAL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#22C55E]" />
                  <span>Zero tracking pixels or telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#22C55E]" />
                  <span>Complete JSON data export anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#22C55E]" />
                  <span>Offline first architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. CALL TO ACTION BANNER (Electric Violet #8B5CF6)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#8B5CF6] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Bring your developer universe together.
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/90 leading-relaxed mb-8">
            Create your workspace, connect what matters, and keep control of everything else.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-[#0E121B] font-bold text-sm hover:bg-[#F8FAFC] active:scale-95 transition-all shadow-lg"
            >
              Create free account
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-all border border-white/20"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. FOOTER (Dark #0B0D12)
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0B0D12] text-[#94A3B8] border-t border-[#1F2430] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#1F2430]">
            
            {/* Left brand block */}
            <div className="md:col-span-2 space-y-4">
              <DevOrbitLogo variant="dark" size="md" showBadge={false} />
              <p className="text-xs text-[#686D79] leading-relaxed max-w-sm">
                Your Skills. Your Code. Your Opportunities. One Universe. The local-first developer intelligence operating system.
              </p>
              <div className="text-[11px] font-mono text-[#8B5CF6]">
                DevOrbit v0.1.0 • Desktop & Local Web
              </div>
            </div>

            {/* Column 1: Product */}
            <div>
              <div className="text-xs font-mono uppercase font-bold text-[#F8FAFC] tracking-wider mb-3">
                PRODUCT
              </div>
              <ul className="text-xs space-y-2.5">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li>
                  <button onClick={() => onNavigate('documentation')} className="hover:text-white transition-colors">
                    Documentation
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div>
              <div className="text-xs font-mono uppercase font-bold text-[#F8FAFC] tracking-wider mb-3">
                COMPANY
              </div>
              <ul className="text-xs space-y-2.5">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><span className="text-[#686D79]">Terms of Service</span></li>
                <li><span className="text-[#686D79]">Security</span></li>
              </ul>
            </div>

            {/* Column 3: Developers */}
            <div>
              <div className="text-xs font-mono uppercase font-bold text-[#F8FAFC] tracking-wider mb-3">
                DEVELOPERS
              </div>
              <ul className="text-xs space-y-2.5">
                <li>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    <span>GitHub</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                </li>
                <li><span className="text-[#686D79]">Local REST API</span></li>
                <li><span className="text-[#686D79]">Status: All Local Systems Operational</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#686D79] gap-4">
            <div>
              © 2026 DevOrbit. All rights reserved.
            </div>
            <div className="font-mono text-[11px]">
              Engineered with Electric Violet & Orbit Black
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
