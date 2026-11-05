import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  GitPullRequest, 
  Database, 
  Package, 
  Activity, 
  FileCode, 
  Layers, 
  ArrowRight, 
  Check, 
  X, 
  Sparkles,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { PageContainer, PageHeading, StatusBadge, Button } from '../components/ui/index.js';

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

interface QualityReport {
  totalSourceLines: number;
  totalTestLines: number;
  testToCodeRatio: number;
  totalTestSuites: number;
  totalAutomatedTests: number;
  techDebtScore: number;
  healthGrade: string;
  dependencies: Array<{
    packageName: string;
    currentVersion: string;
    category: string;
    license: string;
    status: string;
  }>;
}

export function OrbitSafeChangePage() {
  const [activeTab, setActiveTab] = useState<'impact' | 'migration' | 'guardian'>('impact');

  // Impact State
  const [targetFile, setTargetFile] = useState<string>('apps/api/src/lib/jwt.ts');
  const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);
  const [impactLoading, setImpactLoading] = useState<boolean>(false);

  // Migration State
  const [schemaText, setSchemaText] = useState<string>(`model User {\n  id String @id\n  newStrictField String\n}`);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);
  const [migrationLoading, setMigrationLoading] = useState<boolean>(false);

  // Quality Guardian State
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [qualityLoading, setQualityLoading] = useState<boolean>(false);

  // Analyze impact
  const handleAnalyzeImpact = async (filePathToAnalyze?: string) => {
    const file = filePathToAnalyze || targetFile;
    if (!file) return;
    setImpactLoading(true);
    try {
      const res = await fetch('/api/v1/safechange/impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: file }),
      });
      const json = await res.json();
      if (json.success) {
        setImpactReport(json.data.impact);
      }
    } catch (err) {
      console.error('Impact analysis failed:', err);
    } finally {
      setImpactLoading(false);
    }
  };

  // Check migration
  const handleCheckMigration = async (schemaToCheck?: string) => {
    const schema = schemaToCheck !== undefined ? schemaToCheck : schemaText;
    setMigrationLoading(true);
    try {
      const res = await fetch('/api/v1/safechange/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemaContent: schema }),
      });
      const json = await res.json();
      if (json.success) {
        setMigrationReport(json.data.report);
      }
    } catch (err) {
      console.error('Migration check failed:', err);
    } finally {
      setMigrationLoading(false);
    }
  };

  // Fetch quality guardian on mount or tab change
  const fetchQuality = async () => {
    setQualityLoading(true);
    try {
      const res = await fetch('/api/v1/safechange/quality');
      const json = await res.json();
      if (json.success) {
        setQualityReport(json.data.quality);
      }
    } catch (err) {
      console.error('Quality audit failed:', err);
    } finally {
      setQualityLoading(false);
    }
  };

  useEffect(() => {
    handleAnalyzeImpact();
    fetchQuality();
  }, []);

  return (
    <PageContainer>
      
      {/* Top Header */}
      <PageHeading
        title="Orbit SafeChange & Quality Guardian"
        description="Local-first change impact ripple analysis, non-destructive migration safety checker, and engineering quality guardian"
        icon={ShieldCheck}
        badge={
          <>
            <ShieldCheck className="size-3" />
            <span>Blast Radius & Migration Safety</span>
          </>
        }
        actions={
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#12151D] border border-[#1F2430]">
            <button
              onClick={() => setActiveTab('impact')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'impact'
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <GitPullRequest className="size-3.5" />
              <span>Change Impact</span>
            </button>

            <button
              onClick={() => setActiveTab('migration')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'migration'
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <Database className="size-3.5" />
              <span>Migration Safety</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('guardian');
                if (!qualityReport) fetchQuality();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'guardian'
                  ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-[#686D79] hover:text-[#C5C8D0]'
              }`}
            >
              <Activity className="size-3.5" />
              <span>Quality Guardian</span>
            </button>
          </div>
        }
      />

      {/* TAB 1: CHANGE IMPACT & BLAST RADIUS */}
      {activeTab === 'impact' && (
        <div className="space-y-5">
          {/* File Selector Bar */}
          <div className="p-4 rounded-2xl bg-[#12151D] border border-[#1F2430] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <span className="text-xs font-mono text-[#686D79] whitespace-nowrap">Target File:</span>
              <input
                type="text"
                value={targetFile}
                onChange={e => setTargetFile(e.target.value)}
                placeholder="Relative file path..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#0B0D12] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {['apps/api/src/lib/jwt.ts', 'apps/api/src/modules/github/github.service.ts', 'apps/api/prisma/schema.prisma'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => {
                      setTargetFile(preset);
                      handleAnalyzeImpact(preset);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-[11px] font-mono text-[#C5C8D0] transition-colors whitespace-nowrap"
                  >
                    {preset.split('/').pop()}
                  </button>
                ))}
              </div>

              <Button
                onClick={() => handleAnalyzeImpact()}
                loading={impactLoading}
                icon={Sparkles}
                size="sm"
              >
                Analyze Blast Radius
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          {impactReport && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Risk Badge & Recommendations */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#686D79]">Blast Radius Risk Level</span>
                    <StatusBadge
                      variant={
                        impactReport.riskLevel === 'CRITICAL' ? 'danger' :
                        impactReport.riskLevel === 'HIGH' ? 'warning' :
                        impactReport.riskLevel === 'MEDIUM' ? 'violet' : 'success'
                      }
                      size="md"
                    >
                      {impactReport.riskLevel} Risk ({impactReport.riskScore}/100)
                    </StatusBadge>
                  </div>

                  <p className="text-xs text-[#C5C8D0] leading-relaxed">
                    {impactReport.summary}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#1F2430]">
                    <span className="text-xs font-semibold text-[#F8FAFC]">Actionable Recommendations:</span>
                    <ul className="space-y-1.5">
                      {impactReport.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-[#C5C8D0] flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-[#8B5CF6] shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column: Ripple Dependents Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
                  <h3 className="text-xs font-semibold text-[#F8FAFC] flex items-center justify-between">
                    <span>Direct Downstream Dependents ({impactReport.directDownstreamFiles.length})</span>
                    <span className="text-[11px] font-mono text-[#686D79]">{impactReport.affectedModules.length} Modules</span>
                  </h3>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                    {impactReport.directDownstreamFiles.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[#181C26] text-xs text-[#686D79] text-center">
                        Zero downstream dependencies detected. Change is completely isolated.
                      </div>
                    ) : (
                      impactReport.directDownstreamFiles.map((file, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#181C26] border border-[#1F2430] flex items-center justify-between text-xs font-mono">
                          <span className="text-[#C5C8D0] truncate">{file}</span>
                          <StatusBadge variant="violet" size="sm">
                            Imports Target
                          </StatusBadge>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Impacted Test Suites */}
                  <div className="pt-3 border-t border-[#1F2430] space-y-2">
                    <span className="text-xs font-semibold text-[#F8FAFC]">Impacted Test Suites ({impactReport.impactedTestFiles.length}):</span>
                    {impactReport.impactedTestFiles.length === 0 ? (
                      <div className="text-xs text-[#686D79]">No direct automated tests depend on this specific file.</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {impactReport.impactedTestFiles.map((testFile, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1.5">
                            <Check className="size-3" />
                            <span>{testFile.split('/').pop()}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MIGRATION SAFETY CHECKER */}
      {activeTab === 'migration' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Proposed Schema Editor */}
            <div className="lg:col-span-6 space-y-3">
              <div className="p-4 rounded-2xl bg-[#12151D] border border-[#1F2430] flex flex-col h-[460px]">
                <div className="pb-3 border-b border-[#1F2430] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#C5C8D0] flex items-center gap-1.5">
                    <Database className="size-3.5 text-[#8B5CF6]" />
                    <span>Proposed Prisma Schema</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <button
                      onClick={() => {
                        const badField = `model User {\n  id String @id\n  newStrictField String\n}`;
                        setSchemaText(badField);
                        handleCheckMigration(badField);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-[10px] text-[#EF4444]"
                    >
                      Sample Risky Non-Null
                    </button>
                    <button
                      onClick={() => {
                        const dropModel = `model User {\n  id String @id\n}`;
                        setSchemaText(dropModel);
                        handleCheckMigration(dropModel);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-[10px] text-[#EF4444]"
                    >
                      Sample Drop Tables
                    </button>
                  </div>
                </div>

                <textarea
                  value={schemaText}
                  onChange={e => setSchemaText(e.target.value)}
                  className="flex-1 w-full mt-3 p-3 rounded-xl bg-[#0B0D12] border border-[#1F2430] text-[#F8FAFC] font-mono text-xs placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] resize-none leading-relaxed"
                />

                <div className="pt-3 border-t border-[#1F2430] flex justify-end">
                  <Button
                    onClick={() => handleCheckMigration()}
                    loading={migrationLoading}
                    icon={Sparkles}
                    size="sm"
                  >
                    Audit Migration Safety
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Migration Audit Results */}
            <div className="lg:col-span-6 space-y-3">
              {!migrationReport ? (
                <div className="h-[460px] rounded-2xl bg-[#12151D] border border-[#1F2430] flex flex-col items-center justify-center p-8 text-center text-[#686D79]">
                  <Database className="size-10 text-[#1F2430] mb-3" />
                  <span className="text-xs">Click "Audit Migration Safety" to validate proposed schema changes.</span>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4 h-[460px] overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
                    <StatusBadge
                      variant={migrationReport.isDestructive ? 'danger' : 'success'}
                      size="md"
                    >
                      {migrationReport.isDestructive ? 'Destructive Migration' : 'Safe Non-Destructive'}
                    </StatusBadge>
                    <span className="text-xs font-mono text-[#686D79]">
                      Safety Score: {migrationReport.score}/100
                    </span>
                  </div>

                  <p className="text-xs text-[#C5C8D0]">
                    {migrationReport.summary}
                  </p>

                  <div className="space-y-3 pt-2">
                    {migrationReport.warnings.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#181C26] border border-[#EF4444]/30 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#EF4444]">{w.change}</span>
                          <span className="text-[10px] font-mono text-[#686D79]">model: {w.model}</span>
                        </div>
                        <p className="text-[#F8FAFC] font-medium leading-snug">{w.message}</p>
                        <div className="text-[11px] text-[#A78BFA] pt-1">
                          <span className="font-semibold text-white">Safe Remediation: </span>
                          <span>{w.safeRemediation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUALITY GUARDIAN & TECH DEBT */}
      {activeTab === 'guardian' && (
        <div className="space-y-5">
          {qualityReport && (
            <div className="space-y-5">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#686D79]">Health Grade</div>
                    <div className="text-2xl font-mono font-bold text-[#22C55E] mt-0.5">{qualityReport.healthGrade}</div>
                  </div>
                  <ShieldCheck className="size-8 text-[#22C55E]/40" />
                </div>

                <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#686D79]">Test-to-Code Ratio</div>
                    <div className="text-2xl font-mono font-bold text-[#8B5CF6] mt-0.5">{qualityReport.testToCodeRatio}%</div>
                  </div>
                  <TrendingUp className="size-8 text-[#8B5CF6]/40" />
                </div>

                <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#686D79]">Automated Tests</div>
                    <div className="text-2xl font-mono font-bold text-[#F8FAFC] mt-0.5">{qualityReport.totalAutomatedTests}</div>
                  </div>
                  <Activity className="size-8 text-[#686D79]/40" />
                </div>

                <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#686D79]">Tech Debt Index</div>
                    <div className="text-2xl font-mono font-bold text-[#A78BFA] mt-0.5">{qualityReport.techDebtScore}/100</div>
                  </div>
                  <CheckCircle2 className="size-8 text-[#8B5CF6]/40" />
                </div>
              </div>

              {/* Dependency Inventory */}
              <div className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1F2430] pb-3">
                  <h3 className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-2">
                    <Package className="size-4 text-[#8B5CF6]" />
                    <span>Workspace Dependency Inventory ({qualityReport.dependencies.length})</span>
                  </h3>
                  <StatusBadge variant="success" size="sm">
                    100% Zero High-Risk Licenses
                  </StatusBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                  {qualityReport.dependencies.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/30 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-mono font-bold text-[#F8FAFC] truncate">{pkg.packageName}</div>
                        <div className="text-[11px] font-mono text-[#686D79]">v{pkg.currentVersion} • {pkg.license}</div>
                      </div>
                      <StatusBadge variant="success" size="sm">
                        {pkg.status}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </PageContainer>
  );
}
