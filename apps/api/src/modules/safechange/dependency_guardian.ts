import fs from 'fs';
import path from 'path';
import { DependencyAuditItem, EngineeringQualityReport } from './safechange.types.js';

export class DependencyGuardian {
  /**
   * Audit workspace dependencies and compute test-to-code quality metrics across apps/api and apps/web
   */
  public static audit(workspaceRoot?: string): EngineeringQualityReport {
    const dependencies: DependencyAuditItem[] = [];

    const root = workspaceRoot
      ? workspaceRoot
      : fs.existsSync(path.join(process.cwd(), 'apps'))
      ? process.cwd()
      : path.resolve(process.cwd(), '../..');

    // 1. Audit Root, API, and Web package.json files
    const packageFiles = [
      path.join(root, 'package.json'),
      path.join(root, 'apps/api/package.json'),
      path.join(root, 'apps/web/package.json'),
      path.resolve(process.cwd(), 'package.json'),
    ];

    const seenPackages = new Map<string, { version: string; category: 'production' | 'development' }>();

    packageFiles.forEach(pkgPath => {
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

          if (pkg.dependencies) {
            Object.entries(pkg.dependencies).forEach(([name, version]) => {
              if (!seenPackages.has(name)) {
                seenPackages.set(name, {
                  version: String(version).replace(/[\^~]/, ''),
                  category: 'production',
                });
              }
            });
          }

          if (pkg.devDependencies) {
            Object.entries(pkg.devDependencies).forEach(([name, version]) => {
              if (!seenPackages.has(name)) {
                seenPackages.set(name, {
                  version: String(version).replace(/[\^~]/, ''),
                  category: 'development',
                });
              }
            });
          }
        } catch {
          // Skip if parse error
        }
      }
    });

    // Inspect real licenses from node_modules
    for (const [name, meta] of seenPackages.entries()) {
      let license = 'UNKNOWN';
      const candidatePaths = [
        path.join(root, 'node_modules', name, 'package.json'),
        path.join(root, 'apps/api/node_modules', name, 'package.json'),
        path.join(root, 'apps/web/node_modules', name, 'package.json'),
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try {
            const installedPkg = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (typeof installedPkg.license === 'string') {
              license = installedPkg.license;
            } else if (installedPkg.license && typeof installedPkg.license.type === 'string') {
              license = installedPkg.license.type;
            } else if (Array.isArray(installedPkg.licenses) && installedPkg.licenses[0]?.type) {
              license = installedPkg.licenses[0].type;
            }
            break;
          } catch {}
        }
      }

      dependencies.push({
        packageName: name,
        currentVersion: meta.version,
        category: meta.category,
        license,
        status: 'UNKNOWN',
      });
    }

    // 2. Measure Test Volume & Count Tests across both API and Web
    let totalSourceLines = 0;
    let totalTestLines = 0;
    let totalTestSuites = 0;
    let totalAutomatedTests = 0;

    const testDirs = [
      path.join(root, 'apps/api/src/tests'),
      path.join(root, 'apps/web/src/tests'),
    ];

    const scanTestFiles = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanTestFiles(full);
        } else if (entry.isFile() && (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx') || entry.name.endsWith('.spec.ts') || entry.name.endsWith('.spec.tsx'))) {
          totalTestSuites++;
          try {
            const content = fs.readFileSync(full, 'utf8');
            totalTestLines += content.split('\n').length;
            const matches = content.match(/\b(it|test)\s*\(/g);
            if (matches) {
              totalAutomatedTests += matches.length;
            }
          } catch {}
        }
      }
    };

    testDirs.forEach(d => scanTestFiles(d));

    // 3. Estimate Total Source Lines across both API and Web
    const srcDirs = [
      path.join(root, 'apps/api/src'),
      path.join(root, 'apps/web/src'),
    ];

    const scanSourceLines = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'tests' && !entry.name.startsWith('.')) {
          scanSourceLines(full);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          try {
            const content = fs.readFileSync(full, 'utf8');
            totalSourceLines += content.split('\n').length;
          } catch {}
        }
      }
    };

    srcDirs.forEach(d => scanSourceLines(d));

    const testToCodeRatio = totalSourceLines > 0
      ? Math.round((totalTestLines / totalSourceLines) * 100)
      : 0;

    // Technical Debt Score (0 - 100, lower is better)
    let techDebtScore = 12; // Baseline low tech debt
    if (testToCodeRatio < 10) techDebtScore += 20;
    else if (testToCodeRatio < 15) techDebtScore += 10;
    if (dependencies.length > 50) techDebtScore += 10;
    techDebtScore = Math.min(100, Math.max(5, techDebtScore));

    const healthGrade = techDebtScore <= 15 ? 'A+' : techDebtScore <= 25 ? 'A' : 'B';

    return {
      totalSourceLines,
      totalTestLines,
      testToCodeRatio,
      totalTestSuites,
      totalAutomatedTests,
      techDebtScore,
      healthGrade,
      dependencies: dependencies.slice(0, 30),
    };
  }
}
