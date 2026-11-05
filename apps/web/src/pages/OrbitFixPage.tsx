import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Copy, 
  Sparkles, 
  RefreshCw, 
  Play
} from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer.js';

interface CodeContextLine {
  lineNumber: number;
  content: string;
  isErrorLine: boolean;
}

interface RootCauseAnalysis {
  errorType: string;
  category: string;
  confidence: number;
  summary: string;
  affectedSymbol?: string;
  filePath?: string;
  lineNumber?: number;
  codeContext: CodeContextLine[];
  explanation: string;
  recommendedAction: string;
}

interface PatchProposal {
  id: string;
  filePath: string;
  unifiedDiff: string;
  originalSnippet: string;
  patchedSnippet: string;
  explanation: string;
  confidence: number;
}

export function OrbitFixPage() {
  const [errorLog, setErrorLog] = useState<string>('');
  const [samples, setSamples] = useState<Array<{ name: string; category: string; log: string }>>([]);
  const [analysis, setAnalysis] = useState<RootCauseAnalysis | null>(null);
  const [patch, setPatch] = useState<PatchProposal | null>(null);
  const [verification, setVerification] = useState<any | null>(null);

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [patching, setPatching] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [copiedDiff, setCopiedDiff] = useState<boolean>(false);
  const [selectedRuntime, setSelectedRuntime] = useState<string>('Node.js');

  useEffect(() => {
    fetch('/api/v1/fix/samples')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.samples) {
          setSamples(json.data.samples);
          if (json.data.samples.length > 0 && !errorLog) {
            setErrorLog(json.data.samples[0].log);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleAnalyze = async () => {
    if (!errorLog.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    setPatch(null);
    setVerification(null);

    try {
      const res = await fetch('/api/v1/fix/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawLog: errorLog }),
      });
      const json = await res.json();
      if (json.success) {
        setAnalysis(json.data.analysis);
      }
    } catch (err) {
      console.error('Error analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGeneratePatch = async () => {
    if (!analysis) return;
    setPatching(true);
    try {
      const res = await fetch('/api/v1/fix/patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis }),
      });
      const json = await res.json();
      if (json.success) {
        setPatch(json.data.patch);
      }
    } catch (err) {
      console.error('Patch generation failed:', err);
    } finally {
      setPatching(false);
    }
  };

  const handleVerifyPatch = async () => {
    if (!patch) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/v1/fix/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patchId: patch.id, patchProposal: patch }),
      });
      const json = await res.json();
      if (json.success) {
        setVerification(json.data.verification);
      }
    } catch (err) {
      console.error('Patch verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyDiff = () => {
    if (!patch?.unifiedDiff) return;
    navigator.clipboard.writeText(patch.unifiedDiff);
    setCopiedDiff(true);
    setTimeout(() => setCopiedDiff(false), 2000);
  };

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Development</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">Orbit Fix</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Investigate evidence and review a proposed patch before any file is changed.
          </p>
        </div>
      </div>

      {/* 2. Top Dual Cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Left: Error input */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Error input</h3>
            {samples.length > 0 && (
              <span className="text-[9px] text-[#999CA3]">{samples.length} presets available</span>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select 
                  onChange={e => {
                    const sample = samples.find(s => s.name === e.target.value);
                    if (sample) setErrorLog(sample.log);
                  }}
                  className="h-9 rounded-md border border-black/8 px-3 text-[10px] text-[#0B0D12] bg-white outline-none"
                >
                  <option value="">Sample: Choose an error log...</option>
                  {samples.map((s, idx) => (
                    <option key={idx} value={s.name}>{s.name} ({s.category})</option>
                  ))}
                </select>

                <select 
                  value={selectedRuntime}
                  onChange={e => setSelectedRuntime(e.target.value)}
                  className="h-9 rounded-md border border-black/8 px-3 text-[10px] text-[#0B0D12] bg-white outline-none"
                >
                  <option value="Node.js">Node.js</option>
                  <option value="Python">Python</option>
                  <option value="Browser">Browser</option>
                </select>
              </div>

              <textarea 
                value={errorLog}
                onChange={e => setErrorLog(e.target.value)}
                placeholder="Paste a stack trace or error log…"
                className="mt-3 h-52 w-full resize-none rounded-lg border border-black/8 bg-[#11141B] p-4 font-mono text-[10px] text-white outline-none placeholder:text-white/25"
              />
              <p className="mt-3 text-[9px] text-[#858993]">
                Analysis requires an indexed repository and available model.
              </p>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={analyzing || !errorLog.trim()}
              className="mt-3 rounded-md bg-[#11141B] hover:bg-black px-4 py-2.5 text-[10px] font-semibold text-white transition disabled:bg-[#D9DADE]"
            >
              {analyzing ? 'Analyzing error...' : 'Analyze error'}
            </button>
          </div>
        </section>

        {/* Right: Analysis */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Analysis</h3>
            {analysis && (
              <span className="inline-flex rounded-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.07em] bg-[#F0EDFA] text-[#8B5CF6]">
                {Math.round(analysis.confidence * 100)}% Confidence
              </span>
            )}
          </div>

          {analysis ? (
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#F8F9FA] border border-black/5">
                  <div className="flex items-center justify-between text-[9px] text-[#858993]">
                    <span>Category: {analysis.category}</span>
                    <span className="font-mono">{analysis.errorType}</span>
                  </div>
                  <h4 className="mt-1 text-xs font-semibold text-[#0B0D12]">{analysis.summary}</h4>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-[#686D79]">{analysis.explanation}</p>
                </div>

                {analysis.filePath && (
                  <div className="text-[10px] font-mono text-[#0B0D12]">
                    <span className="text-[#858993]">File: </span>
                    <span className="font-semibold">{analysis.filePath}</span>
                    {analysis.lineNumber && <span className="text-[#8B5CF6]">:{analysis.lineNumber}</span>}
                  </div>
                )}

                {analysis.codeContext && analysis.codeContext.length > 0 && (
                  <div className="rounded-lg bg-[#11141B] p-3 font-mono text-[9px] text-white/90 overflow-x-auto">
                    {analysis.codeContext.map((c, i) => (
                      <div 
                        key={i} 
                        className={`flex gap-3 ${c.isErrorLine ? 'bg-red-500/20 text-red-200 -mx-3 px-3 py-0.5 font-bold' : 'text-white/60'}`}
                      >
                        <span className="w-6 text-right select-none text-white/30">{c.lineNumber}</span>
                        <pre className="whitespace-pre">{c.content}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGeneratePatch}
                  disabled={patching}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-[#11141B] hover:bg-black py-2.5 text-[10px] font-semibold text-white transition disabled:bg-[#D9DADE]"
                >
                  {patching ? <RefreshCw className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  <span>{patching ? 'Generating patch diff...' : 'Generate patch proposal'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <Bug className="size-4.5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">No analysis yet</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                Root-cause hypotheses, supporting source evidence, relevant files, and suggested fixes will appear only after analysis completes.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* 3. Bottom Card: Patch Preview */}
      <section className="rounded-xl border border-black/7 bg-white mt-4 overflow-hidden">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <h3 className="text-[11px] font-semibold text-[#0B0D12]">Patch preview</h3>
          <div className="flex items-center gap-3">
            {patch && (
              <button 
                onClick={handleCopyDiff}
                className="flex items-center gap-1 text-[9px] font-semibold text-[#686D79] hover:text-[#0B0D12]"
              >
                {copiedDiff ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                <span>{copiedDiff ? 'Copied' : 'Copy diff'}</span>
              </button>
            )}
            <span className="text-[9px] text-[#999CA3]">
              {patch ? `Patch for ${patch.filePath}` : 'No patch generated'}
            </span>
          </div>
        </div>

        {patch ? (
          <div className="p-4 space-y-4">
            <div className="rounded-lg bg-[#11141B] p-4 font-mono text-[9px] text-white/90 overflow-x-auto leading-relaxed select-text">
              {patch.unifiedDiff.split('\n').map((line, idx) => {
                const isAdd = line.startsWith('+') && !line.startsWith('+++');
                const isDel = line.startsWith('-') && !line.startsWith('---');
                const isHeader = line.startsWith('@@') || line.startsWith('diff') || line.startsWith('---') || line.startsWith('+++');
                return (
                  <div 
                    key={idx} 
                    className={
                      isAdd ? 'text-emerald-400 bg-emerald-500/10' :
                      isDel ? 'text-rose-400 bg-rose-500/10' :
                      isHeader ? 'text-[#A78BFA] font-bold' :
                      'text-white/70'
                    }
                  >
                    {line}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[9px] text-[#858993]">{patch.explanation}</span>
              <button
                onClick={handleVerifyPatch}
                disabled={verifying}
                className="inline-flex items-center gap-2 rounded-md bg-[#11141B] hover:bg-black px-4 py-2 text-[10px] font-semibold text-white transition disabled:bg-[#D9DADE]"
              >
                {verifying ? <RefreshCw className="size-3 animate-spin" /> : <Play className="size-3" />}
                <span>{verifying ? 'Running checks...' : 'Verify patch with test suite'}</span>
              </button>
            </div>

            {verification && (
              <div className={`p-3 rounded-lg border text-xs ${verification.verified ? 'bg-[#EBF7EE] border-[#1E8A38]/30 text-[#1E8A38]' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  <span>{verification.status}: {verification.message}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-48 bg-[#11141B] p-5 font-mono text-[9px] text-white/25 flex items-center justify-center text-center">
            A unified diff will appear here. Applying a patch always requires confirmation.
          </div>
        )}
      </section>
    </PageContainer>
  );
}
