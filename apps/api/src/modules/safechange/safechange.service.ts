import { DependencyGuardian } from './dependency_guardian.js';
import { ImpactAnalyzer } from './impact_analyzer.js';
import { MigrationSafetyChecker } from './migration_checker.js';
import { 
  EngineeringQualityReport, 
  ImpactReport, 
  MigrationSafetyReport 
} from './safechange.types.js';

export class SafeChangeService {
  private impactAnalyzer: ImpactAnalyzer;

  constructor() {
    this.impactAnalyzer = new ImpactAnalyzer();
  }

  public async analyzeImpact(targetFilePath: string): Promise<ImpactReport> {
    return this.impactAnalyzer.analyzeImpact(targetFilePath);
  }

  public checkMigrationSafety(proposedSchemaContent: string, currentSchemaPath?: string): MigrationSafetyReport {
    return MigrationSafetyChecker.checkSchema(proposedSchemaContent, currentSchemaPath);
  }

  public auditQuality(workspaceRoot?: string): EngineeringQualityReport {
    return DependencyGuardian.audit(workspaceRoot);
  }
}
