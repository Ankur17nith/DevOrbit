export type ImpactRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ChangedSymbol {
  name: string;
  kind: string;
  changeType: 'ADDED' | 'MODIFIED' | 'DELETED';
  filePath: string;
}

export interface ImpactReport {
  targetFile: string;
  riskLevel: ImpactRiskLevel;
  riskScore: number; // 0 - 100
  directDownstreamFiles: string[];
  affectedModules: string[];
  affectedRoutes: string[];
  impactedTestFiles: string[];
  summary: string;
  recommendations: string[];
}

export interface MigrationSafetyWarning {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  model: string;
  field?: string;
  change: string;
  message: string;
  safeRemediation: string;
}

export interface MigrationSafetyReport {
  isDestructive: boolean;
  score: number; // 0 - 100 (100 = completely safe)
  warnings: MigrationSafetyWarning[];
  summary: string;
}

export interface DependencyAuditItem {
  packageName: string;
  currentVersion: string;
  category: 'production' | 'development';
  license: string;
  status: 'STABLE' | 'OUTDATED' | 'REVIEW_NEEDED' | 'UNKNOWN';
}

export interface EngineeringQualityReport {
  totalSourceLines: number;
  totalTestLines: number;
  testToCodeRatio: number; // Percentage
  totalTestSuites: number;
  totalAutomatedTests: number;
  techDebtScore: number; // 0 - 100 (lower is better)
  healthGrade: 'A+' | 'A' | 'B' | 'C';
  dependencies: DependencyAuditItem[];
}
