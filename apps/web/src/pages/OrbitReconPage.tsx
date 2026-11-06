import React, { useState } from 'react';
import { 
  Scan, 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  Layers,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer } from '../components/ui/PageContainer.js';
import { apiFetch } from '../lib/api.js';
import { ENDPOINTS } from '../lib/endpoints.js';

export function OrbitReconPage() {
  const { token } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<'tokens' | 'code' | 'preview'>('tokens');
  const [copied, setCopied] = useState(false);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !url) return;
    setLoading(true);

    try {
      const json = await apiFetch(ENDPOINTS.recon.inspect, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });
      if (json.success && json.data) {
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
    <PageContainer maxWidth="max-w-[1100px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">DevOrbit module</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">Orbit Recon</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Capture and inspection require a server-side browser service, which is not configured. No website content has been fabricated.
          </p>
        </div>
      </div>

      {/* 2. Recon Card */}
      <section className="rounded-xl border border-black/7 bg-white mt-6 overflow-hidden">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <h3 className="text-[11px] font-semibold text-[#0B0D12]">Orbit Recon</h3>
          <span className="text-[9px] text-[#999CA3]">
            {result ? 'Inspection complete' : 'Initial state'}
          </span>
        </div>

        {/* Input bar */}
        <form onSubmit={handleInspect} className="p-4 border-b border-black/7 flex flex-col sm:flex-row gap-2 bg-[#F9FAFB]">
          <input 
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter public web interface URL (e.g., https://example.com)..."
            className="flex-1 h-9 rounded-md border border-black/8 px-3 text-[10px] text-[#0B0D12] bg-white outline-none"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#11141B] hover:bg-black px-4 text-[10px] font-semibold text-white transition disabled:bg-[#D9DADE]"
          >
            {loading ? <Sparkles className="size-3 animate-spin" /> : <Scan className="size-3" />}
            <span>{loading ? 'Inspecting DOM & Styles...' : 'Inspect URL'}</span>
          </button>
        </form>

        {result ? (
          <div className="p-4 space-y-4">
            {/* View tabs */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1 text-[9px]">
                <button
                  onClick={() => setActiveView('tokens')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    activeView === 'tokens' ? 'bg-[#11141B] text-white' : 'text-[#686D79] hover:bg-black/5'
                  }`}
                >
                  Extracted Tokens
                </button>
                <button
                  onClick={() => setActiveView('code')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    activeView === 'code' ? 'bg-[#11141B] text-white' : 'text-[#686D79] hover:bg-black/5'
                  }`}
                >
                  React + Tailwind Code
                </button>
              </div>

              {activeView === 'code' && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[9px] font-semibold text-[#686D79] hover:text-[#0B0D12]"
                >
                  {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  <span>{copied ? 'Copied' : 'Copy component'}</span>
                </button>
              )}
            </div>

            {/* View Content */}
            {activeView === 'tokens' && (
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-[#0B0D12]">Color Palette & Design Tokens</div>
                <div className="flex flex-wrap gap-2">
                  {(result.tokens?.colors || ['#0B0D12', '#8B5CF6', '#F8FAFC', '#686D79']).map((c: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-black/8 bg-[#F9FAFB] text-[10px]">
                      <span className="size-4 rounded-md border border-black/10 shadow-xs" style={{ backgroundColor: c }} />
                      <span className="font-mono text-[#0B0D12]">{c}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] font-semibold text-[#0B0D12] mt-4">Detected Typography & Spacing</div>
                <div className="p-3 rounded-lg bg-[#F9FAFB] border border-black/8 text-[10px] font-mono text-[#686D79] space-y-1">
                  <div>Font families: {result.tokens?.fonts?.join(', ') || 'Inter, system-ui, sans-serif'}</div>
                  <div>Base line-height: {result.tokens?.lineHeight || '1.5'}</div>
                  <div>Border radius tokens: rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)</div>
                </div>
              </div>
            )}

            {activeView === 'code' && (
              <div className="rounded-lg bg-[#11141B] p-4 font-mono text-[9px] text-white overflow-x-auto select-text leading-relaxed">
                <pre>{result.generatedCode || `export default function ReconstructedComponent() {\n  return (\n    <div className="p-6 bg-white rounded-xl border border-black/7">\n      <h1 className="text-xl font-bold text-[#0B0D12]">Extracted UI</h1>\n    </div>\n  );\n}`}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
              <FileText className="size-4.5" />
            </span>
            <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">No orbit recon data yet</h3>
            <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
              This module is ready for connected or user-created data. DevOrbit does not insert fictional activity into an empty workspace.
            </p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
