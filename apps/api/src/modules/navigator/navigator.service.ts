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
import { BadRequestError, ForbiddenError, NotFoundError } from '../../lib/errors.js';

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

export const ALLOWED_EXTENSIONS = new Set([
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

function findRepoRoot(): string {
  let cur = process.cwd();
  while (cur !== path.dirname(cur)) {
    if (fs.existsSync(path.join(cur, 'package.json')) && fs.existsSync(path.join(cur, '.git'))) {
      return cur;
    }
    cur = path.dirname(cur);
  }
  return process.cwd();
}

const rawNavigatorRoot = process.env.NAVIGATOR_ROOT || findRepoRoot();
export const NAVIGATOR_ROOT = fs.existsSync(rawNavigatorRoot)
  ? fs.realpathSync(rawNavigatorRoot)
  : path.resolve(rawNavigatorRoot);

/**
 * Resolves a relative path inside an allowed root, preventing path traversal and symlink escapes.
 */
export function resolveInsideRoot(root: string, rel: string): string {
  if (!rel || typeof rel !== 'string') {
    throw new BadRequestError('Relative path must be a non-empty string');
  }

  const normalizedRel = path.normalize(rel);
  const segments = normalizedRel.split(path.sep);
  if (segments.some(seg => seg === '..' || seg.startsWith('.env') || seg === '.git')) {
    throw new ForbiddenError('Path traversal detected: access to sensitive files or parent directories is denied');
  }

  const resolved = path.resolve(root, rel);
  const normalizedRoot = root.endsWith(path.sep) ? root : root + path.sep;

  if (resolved !== root && !resolved.startsWith(normalizedRoot)) {
    throw new ForbiddenError('Path traversal detected: path is outside the allowed root directory');
  }

  if (fs.existsSync(resolved)) {
    const real = fs.realpathSync(resolved);
    if (real !== root && !real.startsWith(normalizedRoot)) {
      throw new ForbiddenError('Path traversal detected: symlink points outside the allowed root directory');
    }
    return real;
  }

  return resolved;
}

interface UserIndexCache {
  rootPath: string;
  files: FileIndex[];
  tree: TreeNode;
  graph: DependencyGraph;
  indexedAt: string;
}

export class NavigatorService {
  private static userCaches = new Map<string, UserIndexCache>();

  /**
   * Index a local repository path scoped to the user
   */
  public async indexRepository(
    userIdOrPath: string = 'default',
    maybeSubPath?: string
  ): Promise<RepositorySummary> {
    let userId = userIdOrPath;
    let subPath = maybeSubPath;

    if (path.isAbsolute(userIdOrPath) || userIdOrPath.startsWith('.')) {
      userId = 'default';
      const resolved = path.resolve(userIdOrPath);
      subPath = resolved === NAVIGATOR_ROOT ? undefined : path.relative(NAVIGATOR_ROOT, resolved);
    }

    const rootPath = subPath ? resolveInsideRoot(NAVIGATOR_ROOT, subPath) : NAVIGATOR_ROOT;

    if (!fs.existsSync(rootPath)) {
      throw new NotFoundError(`Target path does not exist: ${rootPath}`);
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

    // Recursive directory scanner with 5,000 files limit and 1MB size limit
    const scanDir = async (dir: string, currentTreeNode: TreeNode) => {
      if (fileIndices.length >= 5000) return;

      let entries: fs.Dirent[] = [];
      try {
        entries = await fs.promises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (fileIndices.length >= 5000) break;

        // Skip all dotfiles and hidden folders (.git, .env*, .gemini, etc.)
        if (entry.name.startsWith('.')) continue;

        if (entry.isDirectory()) {
          if (IGNORED_DIRS.has(entry.name)) continue;

          const subDirPath = path.join(dir, entry.name);
          const relativePath = path.relative(rootPath, subDirPath).split(path.sep).join('/');
          const childDirNode: TreeNode = {
            name: entry.name,
            path: relativePath,
            type: 'directory',
            children: [],
            linesOfCode: 0,
            symbolCount: 0,
          };

          currentTreeNode.children?.push(childDirNode);
          await scanDir(subDirPath, childDirNode);

          currentTreeNode.linesOfCode = (currentTreeNode.linesOfCode || 0) + (childDirNode.linesOfCode || 0);
          currentTreeNode.symbolCount = (currentTreeNode.symbolCount || 0) + (childDirNode.symbolCount || 0);
        } else if (entry.isFile()) {
          const ext = entry.name.split('.').pop()?.toLowerCase() || '';
          if (!ALLOWED_EXTENSIONS.has(ext)) continue;

          const fullFilePath = path.join(dir, entry.name);
          const relativeFilePath = path.relative(rootPath, fullFilePath).split(path.sep).join('/');

          try {
            const stat = await fs.promises.stat(fullFilePath);
            if (stat.size > 1024 * 1024) continue; // Skip files > 1MB

            const content = await fs.promises.readFile(fullFilePath, 'utf8');
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
          } catch {
            // Non-fatal: skip binary or locked files
          }
        }
      }
    };

    await scanDir(rootPath, rootTree);

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

    const indexedAt = new Date().toISOString();
    const cacheEntry: UserIndexCache = {
      rootPath,
      files: fileIndices,
      tree: rootTree,
      graph,
      indexedAt,
    };

    NavigatorService.userCaches.set(userId, cacheEntry);

    return {
      rootPath,
      totalFiles: fileIndices.length,
      totalLines,
      totalSymbols,
      languages,
      fileTree: rootTree,
      indexedAt,
    };
  }

  /**
   * Get cached summary or re-index if not yet indexed for this user
   */
  public async getSummary(userIdOrSubPath?: string, maybeSubPath?: string): Promise<RepositorySummary> {
    let userId = userIdOrSubPath || 'default';
    let subPath = maybeSubPath;

    if (userIdOrSubPath && (userIdOrSubPath.startsWith('/') || userIdOrSubPath.startsWith('.'))) {
      userId = 'default';
      subPath = userIdOrSubPath === NAVIGATOR_ROOT ? undefined : path.relative(NAVIGATOR_ROOT, userIdOrSubPath);
    }

    const cached = NavigatorService.userCaches.get(userId);
    if (!cached) {
      return this.indexRepository(userId, subPath);
    }

    const languages: Record<string, { files: number; lines: number }> = {};
    let totalLines = 0;
    let totalSymbols = 0;

    cached.files.forEach(f => {
      totalLines += f.linesOfCode;
      totalSymbols += f.symbols.length;
      if (!languages[f.language]) {
        languages[f.language] = { files: 0, lines: 0 };
      }
      languages[f.language].files += 1;
      languages[f.language].lines += f.linesOfCode;
    });

    return {
      rootPath: cached.rootPath,
      totalFiles: cached.files.length,
      totalLines,
      totalSymbols,
      languages,
      fileTree: cached.tree,
      indexedAt: cached.indexedAt,
    };
  }

  /**
   * Search indexed symbols across the user's indexed repository
   */
  public searchSymbols(
    userIdOrQuery: string = 'default',
    query?: string,
    kind?: SymbolKind
  ): Array<CodeSymbol & { filePath: string; link: string }> {
    let userId = userIdOrQuery;
    let q = query;

    if (query === undefined) {
      userId = 'default';
      q = userIdOrQuery;
    }

    const cached = NavigatorService.userCaches.get(userId);
    const files = cached ? cached.files : [];
    const rootPath = cached ? cached.rootPath : NAVIGATOR_ROOT;

    const searchTerm = (q || '').toLowerCase().trim();
    const results: Array<CodeSymbol & { filePath: string; link: string }> = [];

    for (const file of files) {
      for (const sym of file.symbols) {
        if (kind && sym.kind !== kind) continue;
        if (!searchTerm || sym.name.toLowerCase().includes(searchTerm)) {
          results.push({
            ...sym,
            filePath: file.filePath,
            link: `file:///${path.join(rootPath, file.filePath)}#L${sym.startLine}-L${sym.endLine}`,
          });
        }
      }
    }

    return results.slice(0, 100);
  }

  /**
   * Get dependency graph & Mermaid string for user
   */
  public getGraph(userId: string = 'default'): DependencyGraph {
    const cached = NavigatorService.userCaches.get(userId) || NavigatorService.userCaches.get('default');
    if (!cached || !cached.graph) {
      throw new BadRequestError('Repository has not been indexed yet. Call /navigator/index first.');
    }
    return cached.graph;
  }

  /**
   * Read source file details, symbols, and contents with strict path traversal prevention
   */
  public async getFileDetails(
    userIdOrFile: string = 'default',
    maybeFilePath?: string
  ): Promise<{ fileIndex: FileIndex | null; content: string }> {
    let userId = userIdOrFile;
    let relativeFilePath = maybeFilePath;

    if (!maybeFilePath) {
      userId = 'default';
      relativeFilePath = userIdOrFile;
    }

    if (!relativeFilePath) {
      throw new BadRequestError('filePath is required');
    }

    const cached = NavigatorService.userCaches.get(userId);
    const root = cached ? cached.rootPath : NAVIGATOR_ROOT;

    // Strict path traversal check
    const fullPath = resolveInsideRoot(root, relativeFilePath);
    const baseName = path.basename(fullPath);

    if (baseName.startsWith('.')) {
      throw new ForbiddenError('Access to hidden or dotfiles is denied');
    }

    const ext = baseName.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestError(`File extension .${ext} is not allowed`);
    }

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundError(`File not found: ${relativeFilePath}`);
    }

    const stat = await fs.promises.stat(fullPath);
    if (stat.size > 1024 * 1024) {
      throw new BadRequestError('File exceeds 1MB limit');
    }

    const normalizedPath = path.normalize(relativeFilePath).replace(/^\//, '');
    const fileIndex = cached?.files.find(f => f.filePath === normalizedPath) || null;

    const content = await fs.promises.readFile(fullPath, 'utf8');
    return {
      fileIndex,
      content,
    };
  }
}
