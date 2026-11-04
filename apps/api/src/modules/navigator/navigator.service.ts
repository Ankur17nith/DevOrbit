import fs from 'fs';
import path from 'path';
import { AstParser } from './ast_parser.js';
import { GraphBuilder } from './graph_builder.js';
import {
  CodeSymbol,
  DependencyGraph,
  FileIndex,
  RepositorySummary,
  SymbolKind,
  TreeNode,
} from './navigator.types.js';

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  '.system_generated',
  '.prisma',
  '.cache',
  'target',
]);

const ALLOWED_EXTENSIONS = new Set([
  'ts',
  'tsx',
  'mts',
  'cts',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'py',
  'go',
  'rs',
  'json',
  'md',
]);

export class NavigatorService {
  private static cachedRoot: string | null = null;
  private static cachedFiles: FileIndex[] = [];
  private static cachedTree: TreeNode | null = null;
  private static cachedGraph: DependencyGraph | null = null;
  private static lastIndexedAt: string | null = null;

  /**
   * Index a local repository path
   */
  public async indexRepository(
    targetPath: string = process.cwd()
  ): Promise<RepositorySummary> {
    const rootPath = path.resolve(targetPath);

    if (!fs.existsSync(rootPath)) {
      throw new Error(`Target path does not exist: ${rootPath}`);
    }

    const fileIndices: FileIndex[] = [];
    const rootTree: TreeNode = {
      name: path.basename(rootPath),
      path: '',
      type: 'directory',
      children: [],
      linesOfCode: 0,
      symbolCount: 0,
    };

    // Recursive directory scanner
    const scanDir = (dir: string, currentTreeNode: TreeNode) => {
      let entries: fs.Dirent[] = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (err) {
        return;
      }

      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.env') {
          // Skip dot folders (e.g. .git, .gemini)
          if (entry.isDirectory()) continue;
        }

        if (entry.isDirectory()) {
          if (IGNORED_DIRS.has(entry.name)) continue;

          const subDirPath = path.join(dir, entry.name);
          const relativePath = path.relative(rootPath, subDirPath);
          const childDirNode: TreeNode = {
            name: entry.name,
            path: relativePath,
            type: 'directory',
            children: [],
            linesOfCode: 0,
            symbolCount: 0,
          };

          currentTreeNode.children?.push(childDirNode);
          scanDir(subDirPath, childDirNode);

          currentTreeNode.linesOfCode = (currentTreeNode.linesOfCode || 0) + (childDirNode.linesOfCode || 0);
          currentTreeNode.symbolCount = (currentTreeNode.symbolCount || 0) + (childDirNode.symbolCount || 0);
        } else if (entry.isFile()) {
          const ext = entry.name.split('.').pop()?.toLowerCase() || '';
          if (!ALLOWED_EXTENSIONS.has(ext)) continue;

          const fullFilePath = path.join(dir, entry.name);
          const relativeFilePath = path.relative(rootPath, fullFilePath);

          try {
            const content = fs.readFileSync(fullFilePath, 'utf8');
            const fileIndex = AstParser.parseFile(relativeFilePath, fullFilePath, content);
            fileIndices.push(fileIndex);

            const fileNode: TreeNode = {
              name: entry.name,
              path: relativeFilePath,
              type: 'file',
              language: fileIndex.language,
              linesOfCode: fileIndex.linesOfCode,
              symbolCount: fileIndex.symbols.length,
            };

            currentTreeNode.children?.push(fileNode);
            currentTreeNode.linesOfCode = (currentTreeNode.linesOfCode || 0) + fileIndex.linesOfCode;
            currentTreeNode.symbolCount = (currentTreeNode.symbolCount || 0) + fileIndex.symbols.length;
          } catch (readErr) {
            // Non-fatal: skip binary or locked files
          }
        }
      }
    };

    scanDir(rootPath, rootTree);

    // Build Graph
    const graph = GraphBuilder.buildGraph(fileIndices);

    // Calculate language distribution
    const languages: Record<string, { files: number; lines: number }> = {};
    let totalLines = 0;
    let totalSymbols = 0;

    fileIndices.forEach(f => {
      totalLines += f.linesOfCode;
      totalSymbols += f.symbols.length;
      if (!languages[f.language]) {
        languages[f.language] = { files: 0, lines: 0 };
      }
      languages[f.language].files += 1;
      languages[f.language].lines += f.linesOfCode;
    });

    // Cache results
    NavigatorService.cachedRoot = rootPath;
    NavigatorService.cachedFiles = fileIndices;
    NavigatorService.cachedTree = rootTree;
    NavigatorService.cachedGraph = graph;
    NavigatorService.lastIndexedAt = new Date().toISOString();

    return {
      rootPath,
      totalFiles: fileIndices.length,
      totalLines,
      totalSymbols,
      languages,
      fileTree: rootTree,
      indexedAt: NavigatorService.lastIndexedAt,
    };
  }

  /**
   * Get cached summary or re-index if not yet indexed
   */
  public async getSummary(targetPath?: string): Promise<RepositorySummary> {
    if (!NavigatorService.cachedRoot || (targetPath && NavigatorService.cachedRoot !== path.resolve(targetPath))) {
      return this.indexRepository(targetPath);
    }

    const languages: Record<string, { files: number; lines: number }> = {};
    let totalLines = 0;
    let totalSymbols = 0;

    NavigatorService.cachedFiles.forEach(f => {
      totalLines += f.linesOfCode;
      totalSymbols += f.symbols.length;
      if (!languages[f.language]) {
        languages[f.language] = { files: 0, lines: 0 };
      }
      languages[f.language].files += 1;
      languages[f.language].lines += f.linesOfCode;
    });

    return {
      rootPath: NavigatorService.cachedRoot,
      totalFiles: NavigatorService.cachedFiles.length,
      totalLines,
      totalSymbols,
      languages,
      fileTree: NavigatorService.cachedTree!,
      indexedAt: NavigatorService.lastIndexedAt || new Date().toISOString(),
    };
  }

  /**
   * Search indexed symbols across the repository
   */
  public searchSymbols(
    query: string,
    kind?: SymbolKind
  ): Array<CodeSymbol & { filePath: string; link: string }> {
    const q = query.toLowerCase().trim();
    const results: Array<CodeSymbol & { filePath: string; link: string }> = [];

    for (const file of NavigatorService.cachedFiles) {
      for (const sym of file.symbols) {
        if (kind && sym.kind !== kind) continue;
        if (!q || sym.name.toLowerCase().includes(q)) {
          results.push({
            ...sym,
            filePath: file.filePath,
            link: `file:///${path.join(NavigatorService.cachedRoot || '', file.filePath)}#L${sym.startLine}-L${sym.endLine}`,
          });
        }
      }
    }

    return results.slice(0, 100);
  }

  /**
   * Get dependency graph & Mermaid string
   */
  public getGraph(): DependencyGraph {
    if (!NavigatorService.cachedGraph) {
      throw new Error('Repository has not been indexed yet.');
    }
    return NavigatorService.cachedGraph;
  }

  /**
   * Read source file details, symbols, and contents
   */
  public getFileDetails(
    relativeFilePath: string
  ): { fileIndex: FileIndex | null; content: string } {
    if (!NavigatorService.cachedRoot) {
      throw new Error('Repository has not been indexed yet.');
    }

    const normalizedPath = path.normalize(relativeFilePath).replace(/^\//, '');
    const fileIndex =
      NavigatorService.cachedFiles.find(f => f.filePath === normalizedPath) || null;

    const fullPath = path.join(NavigatorService.cachedRoot, normalizedPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${normalizedPath}`);
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    return {
      fileIndex,
      content,
    };
  }
}
