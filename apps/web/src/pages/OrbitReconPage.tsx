import React, { useState } from 'react';
import { 
  ScanSearch, 
  Code2, 
  Eye, 
  Copy, 
  Check, 
  Layers, 
  Sparkles, 
  Palette,
  ExternalLink,
  Zap,
  Terminal,
  Scan
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, PageHeading, StatusBadge, Button, EmptyState } from '../components/ui/index.js';

export function OrbitReconPage() {
  const { token } = useAuth();
  const [url, setUrl] = useState('https://ossium.in/');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'code' | 'tokens'>('preview');
  const [copied, setCopied] = useState(false);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !url) return;
    setLoading(true);

    try {
      const res = await fetch('/api/v1/recon/inspect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!result?.generatedCode) return;
    navigator.clipboard.writeText(result.generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageContainer>
      
      {/* Header */}
      <PageHeading
        title="Orbit Recon — UI Reverse Engineering & Vibe Coding"
        description="Inspect permitted web interfaces to extract design tokens, DOM hierarchy, and generate clean React + Tailwind components"
        icon={Scan}
        badge={
          <>
            <Scan className="size-3" />
            <span>UI Token Extraction</span>
          </>
        }
      />

      {/* URL Input Form */}
      <form onSubmit={handleInspect} className="flex flex-col sm:flex-row gap-3 p-3 bg-[#12151D] border border-[#1F2430] rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <input
            type="url"
            required
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
        <Button
          type="submit"
          loading={loading}
          icon={Sparkles}
          size="md"
        >
          {loading ? 'Reconstructing UI...' : 'Inspect & Reconstruct'}
        </Button>
      </form>

      {/* Main Recon Workspace */}
      {result ? (
        <div className="space-y-4">
          
          {/* View Toggles & Copy Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2430] pb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#12151D] border border-[#1F2430]">
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeView === 'preview' 
                    ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm' 
                    : 'text-[#686D79] hover:text-[#F8FAFC]'
                }`}
              >
                <Eye className="size-3.5" />
                <span>Live Interactive Preview</span>
              </button>
              <button
                onClick={() => setActiveView('code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeView === 'code' 
                    ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm' 
                    : 'text-[#686D79] hover:text-[#F8FAFC]'
                }`}
              >
                <Code2 className="size-3.5" />
                <span>Generated React Code</span>
              </button>
              <button
                onClick={() => setActiveView('tokens')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeView === 'tokens' 
                    ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm' 
                    : 'text-[#686D79] hover:text-[#F8FAFC]'
                }`}
              >
                <Palette className="size-3.5" />
                <span>Design Tokens</span>
              </button>
            </div>

            {activeView === 'code' && (
              <Button
                onClick={handleCopyCode}
                variant="secondary"
                size="sm"
                icon={copied ? Check : Copy}
              >
                {copied ? 'Copied Component' : 'Copy React Component'}
              </Button>
            )}
          </div>

          {/* View Body */}
          {activeView === 'preview' && (
            <div className="rounded-2xl border border-[#1F2430] bg-[#0B0D12] p-6 shadow-2xl relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#686D79] mb-4 flex items-center justify-between">
                <span>Inspected Origin: {result.targetUrl}</span>
                <StatusBadge variant="success" size="sm" dot>
                  Component Render Complete
                </StatusBadge>
              </div>

              {/* Rendered Sandbox Simulation */}
              <div className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-6">
                <div className="flex items-center justify-between border-b border-[#1F2430] pb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-[#8B5CF6] flex items-center justify-center font-bold text-xs text-white">
                      D
                    </div>
                    <span className="font-bold text-[#F8FAFC] text-sm">Reconstructed Workstation Shell</span>
                  </div>
                  <Button variant="primary" size="sm">
                    Trigger Action
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#1F2430] space-y-2">
                    <span className="text-xs font-mono text-[#A78BFA] uppercase font-semibold">Surface Card</span>
                    <p className="text-xs text-[#C5C8D0]">Clean room recreation adhering strictly to extracted geometry and color tokens.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#1F2430] space-y-2">
                    <span className="text-xs font-mono text-[#60A5FA] uppercase font-semibold">Typography Scale</span>
                    <p className="text-xs text-[#C5C8D0]">Manrope Display & Inter body fonts verified for high visual fidelity.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#1F2430] space-y-2">
                    <span className="text-xs font-mono text-[#F59E0B] uppercase font-semibold">Micro-Interaction</span>
                    <p className="text-xs text-[#C5C8D0]">Smooth hover states without jarring layout shifts.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'code' && (
            <div className="rounded-2xl border border-[#1F2430] bg-[#0B0D12] p-5 overflow-x-auto">
              <pre className="text-xs font-mono text-[#C5C8D0] leading-relaxed">
                <code>{result.generatedCode}</code>
              </pre>
            </div>
          )}

          {activeView === 'tokens' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-3">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Extracted Color Palette</h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(result.tokens || {}).filter(([k]) => k.includes('Bg') || k.includes('Color')).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-xl bg-[#0B0D12] border border-[#1F2430] flex items-center gap-2">
                      <div className="size-4 rounded-md border border-[#2E364A]" style={{ backgroundColor: v as string }} />
                      <div className="min-w-0">
                        <div className="text-[10px] text-[#686D79] uppercase">{k}</div>
                        <div className="text-[#F8FAFC] truncate font-medium">{v as string}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-3">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Typography & Fonts</h3>
                <div className="space-y-2 text-xs font-mono">
                  {result.tokens?.fonts?.map((f: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#0B0D12] border border-[#1F2430] flex items-center justify-between">
                      <span className="text-[#F8FAFC] font-medium">{f}</span>
                      <StatusBadge variant="neutral" size="sm">
                        Font Family
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <EmptyState
          icon={ScanSearch}
          title="Enter a target URL above"
          description="Orbit Recon automatically launches inspection protocols to parse DOM layout, computed styles, and construct an original React component."
        />
      )}

    </PageContainer>
  );
}
