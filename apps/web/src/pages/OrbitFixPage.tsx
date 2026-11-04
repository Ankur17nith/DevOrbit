import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode2, 
  Play, 
  Check, 
  Copy, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  Code2, 
  ArrowRight,
  Terminal
} from 'lucide-react';

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

interface VerificationResult {
  verified: boolean;
  status: 'PASSED' | 'FAILED' | 'SYNTAX_ERROR';
  message: string;
  executionTimeMs: number;
  checksRun: string[];
}

export function OrbitFixPage() {
  const [errorLog, setErrorLog] = useState<string>('');
  const [samples, setSamples] = useState<Array<{ name: string; category: string; log: string }>>([]);
  const [analysis, setAnalysis] = useState<RootCauseAnalysis | null>(null);
  const [patch, setPatch] = useState<PatchProposal | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [patching, setPatching] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [copiedDiff, setCopiedDiff] = useState<boolean>(false);

  // Load sample errors on mount
  useEffect(() => {
    fetch('/api/v1/fix/samples')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setSamples(json.data.samples);
          if (json.data.samples.length > 0 && !errorLog) {
            setErrorLog(json.data.samples[0].log);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Analyze error
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
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate patch proposal
  const handleProposePatch = async () => {
    if (!analysis) return;
    setPatching(true);
    try {
      const res = await fetch('/api/v1/fix/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis }),
      });
      const json = await res.json();
      if (json.success) {
        setPatch(json.data.patch);
      }
    } catch (err) {
      console.error('Patch proposal failed:', err);
    } finally {
      setPatching(false);
    }
  };

  // Verify patch
  const handleVerify = async () => {
    if (!patch) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/v1/fix/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch }),
      });
      const json = await res.json();
      if (json.success) {
        setVerification(json.data.verification);
      }
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const copyDiffToClipboard = () => {
    if (!patch) return;
    navigator.clipboard.writeText(patch.unifiedDiff);
    setCopiedDiff(true);
    setTimeout(() => setCopiedDiff(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1500px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Wrench className="size-6 text-[#8B5CF6]" />
            <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">
              Orbit Fix: Root-Cause Debugger
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] text-[11px] font-mono font-semibold">
              Source-Grounded Patch Studio
            </span>
          </div>
          <p className="text-xs text-[#686D79] mt-1">
            Ingest stack traces, compiler errors, or test failures to diagnose root causes and generate non-destructive unified diff patches
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-[#686D79] uppercase tracking-wider mr-1">Samples:</span>
          {samples.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setErrorLog(s.log);
                setAnalysis(null);
                setPatch(null);
                setVerification(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] hover:border-[#8B5CF6]/40 text-xs font-mono text-[#C5C8D0] hover:text-[#F8FAFC] transition-colors"
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stack Trace Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#12151D] border border-[#1F2430] p-4 flex flex-col h-[520px]">
            <div className="pb-3 border-b border-[#1F2430] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#C5C8D0] flex items-center gap-1.5">
                <Terminal className="size-3.5 text-[#8B5CF6]" />
                <span>Error Log / Stack Trace Ingest</span>
              </span>
              <button
                onClick={() => setErrorLog('')}
                className="text-[11px] text-[#686D79] hover:text-[#EF4444] font-mono transition-colors"
              >
                Clear
              </button>
            </div>

            <textarea
              value={errorLog}
              onChange={e => setErrorLog(e.target.value)}
              placeholder="Paste raw stack trace, compiler error, or failing test output here..."
              className="flex-1 w-full mt-3 p-3 rounded-xl bg-[#0B0D12] border border-[#1F2430] text-[#F8FAFC] font-mono text-xs placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] resize-none leading-relaxed"
            />

            <div className="pt-3 border-t border-[#1F2430] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#686D79]">
                {errorLog.split('\n').filter(Boolean).length} log lines
              </span>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !errorLog.trim()}
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 shadow-sm"
              >
                <Sparkles className={`size-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Diagnosing...' : 'Diagnose Root Cause'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic & Patch Workspace */}
        <div className="lg:col-span-7 space-y-4">
          {!analysis ? (
            <div className="h-[520px] rounded-2xl bg-[#12151D] border border-[#1F2430] flex flex-col items-center justify-center text-center p-8 text-[#686D79]">
              <Bug className="size-10 text-[#1F2430] mb-3" />
              <h3 className="text-sm font-semibold text-[#C5C8D0]">No Error Analyzed Yet</h3>
              <p className="text-xs mt-1 max-w-sm">
                Paste an error log on the left and click "Diagnose Root Cause" to extract affected source code, categorize bug patterns, and generate patches.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Diagnosis Header Card */}
              <div className="p-4 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
                      {analysis.category}
                    </span>
                    <span className="text-xs font-mono text-[#686D79]">
                      Confidence: {analysis.confidence}%
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#F8FAFC]">
                    {analysis.errorType}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#F8FAFC] leading-snug">
                  {analysis.summary}
                </h3>

                <p className="text-xs text-[#C5C8D0] leading-relaxed">
                  {analysis.explanation}
                </p>

                {/* Recommended Action */}
                <div className="p-3 rounded-xl bg-[#0B0D12] border border-[#1F2430] flex items-start gap-2.5 text-xs text-[#A78BFA]">
                  <CheckCircle2 className="size-4 shrink-0 text-[#8B5CF6] mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Recommended Fix: </span>
                    <span>{analysis.recommendedAction}</span>
                  </div>
                </div>
              </div>

              {/* Code Context Viewer */}
              {analysis.codeContext.length > 0 && (
                <div className="rounded-2xl bg-[#0B0D12] border border-[#1F2430] overflow-hidden">
                  <div className="p-2.5 bg-[#12151D] border-b border-[#1F2430] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8B5CF6] truncate font-medium">
                      {analysis.filePath}:{analysis.lineNumber}
                    </span>
                    {analysis.affectedSymbol && (
                      <span className="text-[#686D79]">symbol: {analysis.affectedSymbol}</span>
                    )}
                  </div>

                  <div className="p-3 font-mono text-xs leading-relaxed overflow-x-auto">
                    <table className="w-full border-collapse">
                      <tbody>
                        {analysis.codeContext.map(line => (
                          <tr
                            key={line.lineNumber}
                            className={`${line.isErrorLine ? 'bg-[#EF4444]/15 border-l-2 border-[#EF4444]' : ''}`}
                          >
                            <td className="w-10 pr-3 text-right text-[#686D79] select-none align-top">
                              {line.lineNumber}
                            </td>
                            <td className={`whitespace-pre align-top ${line.isErrorLine ? 'text-[#FCA5A5] font-semibold' : 'text-[#C5C8D0]'}`}>
                              {line.content || ' '}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Patch Proposal Section */}
              <div className="p-4 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="size-4 text-[#8B5CF6]" />
                    <span className="text-xs font-semibold text-[#F8FAFC]">Unified Diff Patch Studio</span>
                  </div>

                  {!patch ? (
                    <button
                      onClick={handleProposePatch}
                      disabled={patching}
                      className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Sparkles className={`size-3.5 ${patching ? 'animate-spin' : ''}`} />
                      <span>{patching ? 'Synthesizing...' : 'Generate Patch'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyDiffToClipboard}
                        className="px-2.5 py-1 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-mono text-[#C5C8D0] flex items-center gap-1.5 transition-colors"
                      >
                        {copiedDiff ? <Check className="size-3 text-[#22C55E]" /> : <Copy className="size-3" />}
                        <span>{copiedDiff ? 'Copied' : 'Copy Diff'}</span>
                      </button>

                      <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className="px-3.5 py-1.5 rounded-lg bg-[#22C55E]/20 hover:bg-[#22C55E]/30 border border-[#22C55E]/40 text-[#22C55E] text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Play className={`size-3 ${verifying ? 'animate-spin' : ''}`} />
                        <span>{verifying ? 'Verifying...' : 'Test Verification'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {patch && (
                  <div className="space-y-3 pt-2">
                    <div className="rounded-xl bg-[#0B0D12] border border-[#1F2430] p-3 font-mono text-xs overflow-x-auto leading-relaxed">
                      {patch.unifiedDiff.split('\n').map((line, idx) => {
                        const isAdd = line.startsWith('+') && !line.startsWith('+++');
                        const isDel = line.startsWith('-') && !line.startsWith('---');
                        const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
                        return (
                          <div
                            key={idx}
                            className={`whitespace-pre ${
                              isAdd ? 'text-[#22C55E] bg-[#22C55E]/10' :
                              isDel ? 'text-[#EF4444] bg-[#EF4444]/10' :
                              isHeader ? 'text-[#8B5CF6] font-semibold' : 'text-[#686D79]'
                            }`}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </div>

                    {/* Verification Result Banner */}
                    {verification && (
                      <div className="p-3.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-xs space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#22C55E] flex items-center gap-1.5">
                            <CheckCircle2 className="size-4" />
                            <span>Verification Passed ({verification.executionTimeMs}ms)</span>
                          </span>
                          <span className="text-[10px] font-mono text-[#686D79]">
                            {verification.checksRun.length} Checks Validated
                          </span>
                        </div>
                        <p className="text-[#C5C8D0] leading-snug">
                          {verification.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
