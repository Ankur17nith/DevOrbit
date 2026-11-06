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

    const normalizedTarget = path.posix.normalize(targetFilePath.replace(/\\/g, '/')).replace(/^\//, '');

    // 1. Direct and Transitive Downstream Search using Exact Path Matching & BFS
    const directDownstream = new Set<string>();
    const transitiveDownstream = new Set<string>();

    // Build reverse adjacency graph (target -> dependents who import it)
    const importersMap = new Map<string, string[]>();
    graph.edges.forEach(edge => {
      const from = path.posix.normalize(edge.from.replace(/\\/g, '/'));
      const to = path.posix.normalize(edge.to.replace(/\\/g, '/'));
      const list = importersMap.get(to) || [];
      list.push(from);
      importersMap.set(to, list);
    });

    const direct = importersMap.get(normalizedTarget) || [];
    direct.forEach(f => directDownstream.add(f));

    // BFS transitive closure with depth cap
    const queue: { file: string; depth: number }[] = direct.map(f => ({ file: f, depth: 1 }));
    const visited = new Set<string>([normalizedTarget, ...direct]);

    while (queue.length > 0) {
      const { file, depth } = queue.shift()!;
      if (depth >= 10) continue;
      const nextImporters = importersMap.get(file) || [];
      for (const nextFile of nextImporters) {
        if (!visited.has(nextFile)) {
          visited.add(nextFile);
          transitiveDownstream.add(nextFile);
          queue.push({ file: nextFile, depth: depth + 1 });
        }
      }
    }

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
      /(?:^|\/)(?:lib|middleware|config)(?:\/|$)/.test(normalizedTarget) ||
      normalizedTarget.endsWith('schema.prisma');

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
