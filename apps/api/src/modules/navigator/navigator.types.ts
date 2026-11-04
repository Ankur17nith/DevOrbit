export type SymbolKind = 'function' | 'class' | 'interface' | 'type' | 'variable' | 'enum' | 'struct' | 'method';

export interface CodeSymbol {
  name: string;
  kind: SymbolKind;
  startLine: number;
  endLine: number;
  signature: string;
  exported: boolean;
  docstring?: string;
}

export interface FileIndex {
  filePath: string; // Relative to repository root
  absolutePath: string;
  fileName: string;
  extension: string;
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'json' | 'markdown' | 'other';
  linesOfCode: number;
  sizeBytes: number;
  imports: string[];
  exports: string[];
  symbols: CodeSymbol[];
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  language?: string;
  linesOfCode?: number;
  symbolCount?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  linesOfCode: number;
  symbolCount: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  mermaid: string;
}

export interface RepositorySummary {
  rootPath: string;
  totalFiles: number;
  totalLines: number;
  totalSymbols: number;
  languages: Record<string, { files: number; lines: number }>;
  fileTree: TreeNode;
  indexedAt: string;
}
