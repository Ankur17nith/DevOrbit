import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  GitPullRequest, 
  Database, 
  Layers, 
  Check, 
  RefreshCw,
  FileCode
} from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer.js';

interface ImpactReport {
  targetFile: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  directDownstreamFiles: string[];
  affectedModules: string[];
  affectedRoutes: string[];
  impactedTestFiles: string[];
  summary: string;
  recommendations: string[];
}

interface MigrationWarning {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  model: string;
  field?: string;
  change: string;
  message: string;
  safeRemediation: string;
}

interface MigrationReport {
  isDestructive: boolean;
  score: number;
  warnings: MigrationWarning[];
  summary: string;
}

export function OrbitSafeChangePage() {
  const [selectedRepo, setSelectedRepo] = useState<string>('DevOrbit');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [changeDescription, setChangeDescription] = useState<string>('apps/api/src/lib/jwt.ts');
  const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  const handleAnalyzeImpact = async () => {
    if (!changeDescription.trim()) return;
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('devorbit_token');
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. Analyze code impact
      const res = await fetch('/api/v1/safechange/impact', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ filePath: changeDescription.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setImpactReport(json.data.impact);
      }

      // 2. Also check migration risk if schema is mentioned
      const migRes = await fetch('/api/v1/safechange/migration', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ 
          schemaContent: changeDescription.includes('model') ? changeDescription : 'model User {\n  id String @id\n  token String\n}' 
        }),
      });
      const migJson = await migRes.json();
      if (migJson.success) {
        setMigrationReport(migJson.data.migration);
      }
    } catch (err) {
      console.error('SafeChange analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1240px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Development</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">Orbit SafeChange</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Evidence-based impact analysis with every risk tied to a dependency, contract, migration, or test.
          </p>
        </div>
      </div>

      {/* 2. Top Card: Proposed change */}
      <section className="rounded-xl border border-black/7 bg-white mt-6">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <h3 className="text-[11px] font-semibold text-[#0B0D12]">Proposed change</h3>
          {impactReport && (
            <span className={`inline-flex rounded-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.07em] ${
              impactReport.riskLevel === 'LOW' ? 'bg-[#EBF7EE] text-[#1E8A38]' :
              impactReport.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700' :
              'bg-rose-50 text-rose-700'
            }`}>
              {impactReport.riskLevel} Risk ({impactReport.riskScore}/100)
            </span>
          )}
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <select 
            value={selectedRepo}
            onChange={e => setSelectedRepo(e.target.value)}
            className="h-9 rounded-md border border-black/8 px-3 text-[10px] text-[#0B0D12] bg-white outline-none"
          >
            <option value="DevOrbit">DevOrbit (Local Monorepo)</option>
          </select>

          <select 
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="h-9 rounded-md border border-black/8 px-3 text-[10px] text-[#0B0D12] bg-white outline-none"
          >
            <option value="main">main</option>
            <option value="feature/safechange">feature/safechange</option>
          </select>

          <textarea 
            value={changeDescription}
            onChange={e => setChangeDescription(e.target.value)}
            placeholder="Paste a diff or describe the intended change (e.g. apps/api/src/lib/jwt.ts)…"
            className="h-40 rounded-lg border border-black/8 p-3 font-mono text-[10px] sm:col-span-2 text-[#0B0D12] outline-none"
          />

          <div className="sm:col-span-2">
            <button 
              onClick={handleAnalyzeImpact}
              disabled={analyzing || !changeDescription.trim()}
              className="rounded-md bg-[#11141B] hover:bg-black px-4 py-2.5 text-[10px] font-semibold text-white transition disabled:bg-[#D9DADE]"
            >
              {analyzing ? 'Analyzing impact across dependency graph...' : 'Analyze impact'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Three Evaluation Cards */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* Card 1: Affected modules */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Affected modules</h3>
            {impactReport && (
              <span className="text-[9px] text-[#999CA3]">{impactReport.affectedModules.length} modules</span>
            )}
          </div>

          {impactReport ? (
            <div className="p-4 flex-1 space-y-3">
              <p className="text-[10px] leading-relaxed text-[#686D79]">{impactReport.summary}</p>
              <div className="space-y-1 mt-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#9699A1] block">Direct Downstream:</span>
                {impactReport.directDownstreamFiles.slice(0, 5).map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-[#0B0D12]">
                    <span className="size-1 rounded-full bg-[#8B5CF6]" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <Layers className="size-4.5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">Awaiting analysis</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                No unexplained score or warning is shown.
              </p>
            </div>
          )}
        </section>

        {/* Card 2: Contract and migration risks */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Contract and migration risks</h3>
            {migrationReport && (
              <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
                migrationReport.isDestructive ? 'bg-rose-50 text-rose-700' : 'bg-[#EBF7EE] text-[#1E8A38]'
              }`}>
                {migrationReport.isDestructive ? 'Breaking Change' : 'Compatible'}
              </span>
            )}
          </div>

          {migrationReport ? (
            <div className="p-4 flex-1 space-y-3">
              <p className="text-[10px] leading-relaxed text-[#686D79]">{migrationReport.summary}</p>
              {migrationReport.warnings.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {migrationReport.warnings.map((w, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#F8F9FA] border border-black/5 text-[9px]">
                      <div className="font-semibold text-[#0B0D12]">{w.change}</div>
                      <div className="text-[#858993] mt-0.5">{w.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#EBF7EE] text-[#1E8A38] text-[10px] font-medium">
                  Zero destructive schema mutations detected.
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-56 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <Database className="size-4.5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">Awaiting analysis</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                No unexplained score or warning is shown.
              </p>
            </div>
          )}
        </section>

        {/* Card 3: Relevant test coverage */}
        <section className="rounded-xl border border-black/7 bg-white flex flex-col">
          <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
            <h3 className="text-[11px] font-semibold text-[#0B0D12]">Relevant test coverage</h3>
            {impactReport && (
              <span className="text-[9px] text-[#999CA3]">{impactReport.impactedTestFiles.length} suites</span>
            )}
          </div>

          {impactReport ? (
            <div className="p-4 flex-1 space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#9699A1] block">Test Suites to Run:</span>
              <div className="space-y-1">
                {impactReport.impactedTestFiles.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] font-mono text-[#0B0D12]">
                    <CheckCircle2 className="size-3 text-[#1E8A38]" />
                    <span className="truncate">{t}</span>
                  </div>
                ))}
              </div>
              {impactReport.recommendations && impactReport.recommendations.length > 0 && (
                <div className="pt-2 border-t border-black/5">
                  <span className="text-[9px] text-[#858993]">Recommendation:</span>
                  <p className="text-[10px] text-[#0B0D12] mt-0.5">{impactReport.recommendations[0]}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-56 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <ShieldCheck className="size-4.5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">Awaiting analysis</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                No unexplained score or warning is shown.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
