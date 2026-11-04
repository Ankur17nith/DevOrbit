import path from 'path';
import { NavigatorService } from '../navigator/navigator.service.js';
import { ImpactReport, ImpactRiskLevel } from './safechange.types.js';

export class ImpactAnalyzer {
  private navigator: NavigatorService;

  constructor() {
    this.navigator = new NavigatorService();
  }

  /**
   * Analyze ripple effects of modifying target file across indexed codebase
   */
  public async analyzeImpact(targetFilePath: string): Promise<ImpactReport> {
    const summary = await this.navigator.getSummary();
    const graph = this.navigator.getGraph();

    const normalizedTarget = path.normalize(targetFilePath).replace(/^\//, '');

    // 1. Direct and Transitive Downstream Search
    const directDownstream = new Set<string>();
    const transitiveDownstream = new Set<string>();

    graph.edges.forEach(edge => {
      // If edge.to matches target, then edge.from imports it
      if (edge.to.includes(normalizedTarget) || normalizedTarget.includes(edge.to)) {
        directDownstream.add(edge.from);
      }
    });

    // One level of transitive dependencies
    directDownstream.forEach(directFile => {
      graph.edges.forEach(edge => {
        if (edge.to === directFile && edge.from !== normalizedTarget) {
          transitiveDownstream.add(edge.from);
        }
      });
    });

    const allDownstream = Array.from(new Set([...directDownstream, ...transitiveDownstream]));

    // 2. Identify Affected Modules, Routes, and Tests
    const affectedModulesSet = new Set<string>();
    const affectedRoutes: string[] = [];
    const impactedTestFiles: string[] = [];

    allDownstream.forEach(file => {
      const parts = file.split('/');
      if (parts.includes('modules')) {
        const modIdx = parts.indexOf('modules');
        if (parts[modIdx + 1]) affectedModulesSet.add(parts[modIdx + 1]);
      } else if (parts.length > 1) {
        affectedModulesSet.add(parts[0]);
      }

      if (file.includes('.routes.') || file.includes('app.ts') || file.includes('server.ts')) {
        affectedRoutes.push(file);
      }

      if (file.includes('.test.') || file.includes('/tests/')) {
        impactedTestFiles.push(file);
      }
    });

    // 3. Compute Risk Score & Level
    let riskScore = 15; // Baseline
    const isCoreUtility = 
      normalizedTarget.includes('/lib/') ||
      normalizedTarget.includes('/middleware/') ||
      normalizedTarget.includes('schema.prisma') ||
      normalizedTarget.includes('config');

    if (isCoreUtility) riskScore += 45;
    riskScore += directDownstream.size * 8;
    riskScore += affectedRoutes.length * 10;
    riskScore += impactedTestFiles.length * 5;
    riskScore = Math.min(100, Math.max(10, riskScore));

    let riskLevel: ImpactRiskLevel = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    // 4. Generate Recommendations
    const recommendations: string[] = [];
    if (impactedTestFiles.length > 0) {
      recommendations.push(`Execute affected automated test suites: ${impactedTestFiles.slice(0, 3).join(', ')}`);
    } else {
      recommendations.push('Add automated integration test coverage for modified code paths.');
    }

    if (affectedRoutes.length > 0) {
      recommendations.push(`Verify API contract compatibility for affected routes (${affectedRoutes.length} endpoints).`);
    }

    if (isCoreUtility) {
      recommendations.push('Core shared utility modified. Perform regression audit on authentication and session tokens.');
    }

    const summaryText = directDownstream.size === 0
      ? `Change to ${path.basename(normalizedTarget)} is isolated with 0 direct downstream imports.`
      : `Change to ${path.basename(normalizedTarget)} impacts ${directDownstream.size} direct and ${transitiveDownstream.size} transitive files across ${affectedModulesSet.size} modules.`;

    return {
      targetFile: normalizedTarget,
      riskLevel,
      riskScore,
      directDownstreamFiles: Array.from(directDownstream),
      affectedModules: Array.from(affectedModulesSet),
      affectedRoutes,
      impactedTestFiles,
      summary: summaryText,
      recommendations,
    };
  }
}
