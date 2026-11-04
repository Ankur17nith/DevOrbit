import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderTree, 
  Search, 
  FileCode2, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  Network, 
  Layers, 
  Code, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import mermaid from 'mermaid';

// Initialize mermaid with DevOrbit dark aesthetic
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  themeVariables: {
    darkMode: true,
    background: '#12151D',
    primaryColor: '#8B5CF6',
    primaryTextColor: '#F8FAFC',
    primaryBorderColor: '#8B5CF6',
    lineColor: '#686D79',
    secondaryColor: '#181C26',
    tertiaryColor: '#0B0D12',
  },
});

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  language?: string;
  linesOfCode?: number;
  symbolCount?: number;
}

interface CodeSymbol {
  name: string;
  kind: string;
  startLine: number;
  endLine: number;
  signature: string;
  exported: boolean;
  filePath?: string;
  link?: string;
}

interface RepositorySummary {
  rootPath: string;
  totalFiles: number;
  totalLines: number;
  totalSymbols: number;
  languages: Record<string, { files: number; lines: number }>;
  fileTree: TreeNode;
  indexedAt: string;
}

export function CodebaseNavigatorPage() {
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'graph'>('explorer');
  const [summary, setSummary] = useState<RepositorySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [indexing, setIndexing] = useState<boolean>(false);
  const [repoPathInput, setRepoPathInput] = useState<string>('');

  // Selected file and preview state
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileSymbols, setFileSymbols] = useState<CodeSymbol[]>([]);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [symbolFilter, setSymbolFilter] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<CodeSymbol[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Graph state
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [graphLoading, setGraphLoading] = useState<boolean>(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Expanded folders in tree view
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['apps', 'apps/api', 'apps/web']));

  // Fetch summary
  const fetchSummary = async (targetPath?: string) => {
    setLoading(true);
    try {
      const url = targetPath 
        ? `/api/v1/navigator/summary?targetPath=${encodeURIComponent(targetPath)}`
        : '/api/v1/navigator/summary';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
        if (!repoPathInput) setRepoPathInput(json.data.rootPath);
      }
    } catch (err) {
      console.error('Failed to fetch repository summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Trigger re-indexing
  const handleIndexRepository = async () => {
    setIndexing(true);
    try {
      const res = await fetch('/api/v1/navigator/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPath: repoPathInput || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
        if (activeView === 'graph') fetchGraph();
      }
    } catch (err) {
      console.error('Indexing failed:', err);
    } finally {
      setIndexing(false);
    }
  };

  // Fetch file details
  const handleSelectFile = async (filePath: string, jumpLine?: number) => {
    setSelectedFilePath(filePath);
    setFileLoading(true);
    if (jumpLine) setHighlightLine(jumpLine);

    try {
      const res = await fetch(`/api/v1/navigator/file?filePath=${encodeURIComponent(filePath)}`);
      const json = await res.json();
      if (json.success) {
        setFileContent(json.data.content);
        setFileSymbols(json.data.fileIndex?.symbols || []);
      }
    } catch (err) {
      console.error('Failed to load file details:', err);
    } finally {
      setFileLoading(false);
    }
  };

  // Search symbols
  useEffect(() => {
    if (activeView === 'search') {
      const timeout = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const params = new URLSearchParams();
          if (searchQuery) params.append('q', searchQuery);
          if (symbolFilter !== 'all') params.append('kind', symbolFilter);

          const res = await fetch(`/api/v1/navigator/symbols?${params.toString()}`);
          const json = await res.json();
          if (json.success) {
            setSearchResults(json.data.symbols);
          }
        } catch (err) {
          console.error('Symbol search failed:', err);
        } finally {
          setSearchLoading(false);
        }
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, symbolFilter, activeView]);

  // Fetch and render Mermaid Graph
  const fetchGraph = async () => {
    setGraphLoading(true);
    try {
      const res = await fetch('/api/v1/navigator/graph');
      const json = await res.json();
      if (json.success) {
        setMermaidCode(json.data.mermaid);
        renderMermaid(json.data.mermaid);
      }
    } catch (err) {
      console.error('Failed to fetch dependency graph:', err);
    } finally {
      setGraphLoading(false);
    }
  };

  const renderMermaid = async (code: string) => {
    if (!mermaidRef.current || !code) return;
    try {
      const id = `mermaid-graph-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = svg;
      }
    } catch (err) {
      console.error('Mermaid render error:', err);
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `<pre class="text-xs text-rose-400 p-4 font-mono">${code}</pre>`;
      }
    }
  };

  useEffect(() => {
    if (activeView === 'graph') {
      fetchGraph();
    }
  }, [activeView]);

  // Toggle folder expansion
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  // Recursive Tree Node Renderer
  const renderTree = (node: TreeNode, depth = 0) => {
    if (node.type === 'directory') {
      const isExpanded = expandedFolders.has(node.path);
      return (
        <div key={node.path || 'root'} className="select-none">
          {node.path && (
            <button
              onClick={() => toggleFolder(node.path)}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              className="w-full flex items-center gap-1.5 py-1 px-2 text-xs font-mono text-[#C5C8D0] hover:bg-[#181C26] hover:text-[#F8FAFC] rounded-md transition-colors text-left"
            >
              {isExpanded ? (
                <ChevronDown className="size-3 text-[#686D79]" />
              ) : (
                <ChevronRight className="size-3 text-[#686D79]" />
              )}
              {isExpanded ? (
                <FolderOpen className="size-3.5 text-[#8B5CF6]" />
              ) : (
                <Folder className="size-3.5 text-[#8B5CF6]/70" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
          )}

          {(isExpanded || !node.path) && node.children && (
            <div>
              {node.children.map(child => renderTree(child, node.path ? depth + 1 : depth))}
            </div>
          )}
        </div>
      );
    }

    const isSelected = selectedFilePath === node.path;
    return (
      <button
        key={node.path}
        onClick={() => handleSelectFile(node.path)}
        style={{ paddingLeft: `${depth * 12 + 18}px` }}
        className={`w-full flex items-center justify-between py-1 px-2 text-xs font-mono rounded-md transition-colors text-left ${
          isSelected
            ? 'bg-[#8B5CF6]/20 text-[#A78BFA] font-medium border-l-2 border-[#8B5CF6]'
            : 'text-[#686D79] hover:bg-[#181C26] hover:text-[#C5C8D0]'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <FileCode2 className={`size-3.5 ${isSelected ? 'text-[#8B5CF6]' : 'text-[#686D79]'}`} />
          <span className="truncate">{node.name}</span>
        </div>
        {node.symbolCount ? (
          <span className="text-[10px] text-[#686D79] shrink-0 ml-1">
            {node.symbolCount}s
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FolderTree className="size-6 text-[#8B5CF6]" />
            <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">
              Orbit Codebase Navigator
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] text-[11px] font-mono font-semibold">
              AST Indexer & Graphs
            </span>
          </div>
          <p className="text-xs text-[#686D79] mt-1">
            Local-first AST symbol extraction, architectural dependency graphs, and source-grounded exploration
          </p>
        </div>

        {/* Path Input & Index Trigger */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={repoPathInput}
            onChange={e => setRepoPathInput(e.target.value)}
            placeholder="Local repository path..."
            className="w-72 md:w-96 px-3 py-1.5 rounded-lg bg-[#12151D] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
          <button
            onClick={handleIndexRepository}
            disabled={indexing}
            className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${indexing ? 'animate-spin' : ''}`} />
            <span>{indexing ? 'Indexing...' : 'Index'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
            <span className="text-xs text-[#686D79]">Total Files</span>
            <span className="text-lg font-mono font-bold text-[#F8FAFC]">{summary.totalFiles}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
            <span className="text-xs text-[#686D79]">Lines of Code</span>
            <span className="text-lg font-mono font-bold text-[#A78BFA]">{summary.totalLines.toLocaleString()}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
            <span className="text-xs text-[#686D79]">AST Symbols</span>
            <span className="text-lg font-mono font-bold text-[#22C55E]">{summary.totalSymbols.toLocaleString()}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
            <span className="text-xs text-[#686D79]">Primary Stack</span>
            <span className="text-xs font-mono font-bold text-[#8B5CF6]">
              {Object.keys(summary.languages).slice(0, 3).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Navigation View Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[#12151D] border border-[#1F2430] w-fit">
        <button
          onClick={() => setActiveView('explorer')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeView === 'explorer'
              ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
              : 'text-[#686D79] hover:text-[#C5C8D0]'
          }`}
        >
          <FolderTree className="size-3.5" />
          <span>File Tree & Outline</span>
        </button>

        <button
          onClick={() => setActiveView('search')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeView === 'search'
              ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
              : 'text-[#686D79] hover:text-[#C5C8D0]'
          }`}
        >
          <Search className="size-3.5" />
          <span>Symbol Search</span>
        </button>

        <button
          onClick={() => setActiveView('graph')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeView === 'graph'
              ? 'bg-[#181C26] text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-sm'
              : 'text-[#686D79] hover:text-[#C5C8D0]'
          }`}
        >
          <Network className="size-3.5" />
          <span>Architecture Graph</span>
        </button>
      </div>

      {/* VIEW 1: FILE TREE & SYMBOL OUTLINE */}
      {activeView === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
          
          {/* Left: File Tree Explorer */}
          <div className="lg:col-span-3 rounded-2xl bg-[#12151D] border border-[#1F2430] p-3 flex flex-col h-[650px]">
            <div className="pb-2 mb-2 border-b border-[#1F2430] flex items-center justify-between text-xs font-semibold text-[#C5C8D0] px-2">
              <span className="flex items-center gap-1.5">
                <Folder className="size-3.5 text-[#8B5CF6]" />
                <span>Files</span>
              </span>
              <span className="text-[11px] font-mono text-[#686D79]">{summary?.totalFiles || 0}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 no-scrollbar">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-6 bg-[#181C26] rounded animate-pulse" />
                  ))}
                </div>
              ) : summary?.fileTree ? (
                renderTree(summary.fileTree)
              ) : (
                <div className="text-xs text-[#686D79] p-4 text-center">No files indexed</div>
              )}
            </div>
          </div>

          {/* Middle: Symbol Outline Panel */}
          <div className="lg:col-span-3 rounded-2xl bg-[#12151D] border border-[#1F2430] p-3 flex flex-col h-[650px]">
            <div className="pb-2 mb-2 border-b border-[#1F2430] flex items-center justify-between text-xs font-semibold text-[#C5C8D0] px-2">
              <span className="flex items-center gap-1.5">
                <Code className="size-3.5 text-[#8B5CF6]" />
                <span>Symbols Outline</span>
              </span>
              <span className="text-[11px] font-mono text-[#686D79]">{fileSymbols.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
              {fileSymbols.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[#686D79]">
                  <Code className="size-8 text-[#1F2430] mb-2" />
                  <span>Select a source file to inspect its AST symbol hierarchy.</span>
                </div>
              ) : (
                fileSymbols.map((sym, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHighlightLine(sym.startLine)}
                    className="w-full p-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] hover:border-[#8B5CF6]/40 text-left transition-colors space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-[#F8FAFC] truncate">{sym.name}</span>
                      <span className="text-[10px] font-mono text-[#A78BFA] bg-[#8B5CF6]/15 px-1.5 py-0.2 rounded border border-[#8B5CF6]/30">
                        {sym.kind}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#686D79] flex items-center justify-between">
                      <span className="truncate max-w-[140px]">{sym.signature}</span>
                      <span>L{sym.startLine}-{sym.endLine}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Code Viewer Preview */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0B0D12] border border-[#1F2430] flex flex-col h-[650px] overflow-hidden">
            <div className="p-3 bg-[#12151D] border-b border-[#1F2430] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8B5CF6] truncate font-medium">
                {selectedFilePath || 'Select a file to inspect'}
              </span>
              {selectedFilePath && (
                <span className="text-[11px] text-[#686D79]">
                  {fileContent.split('\n').length} lines
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#C5C8D0] leading-relaxed select-text no-scrollbar">
              {fileLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#686D79] gap-2">
                  <div className="size-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
                  <span>Loading source...</span>
                </div>
              ) : fileContent ? (
                <table className="w-full border-collapse">
                  <tbody>
                    {fileContent.split('\n').map((line, index) => {
                      const lineNum = index + 1;
                      const isHighlighted = highlightLine === lineNum;
                      return (
                        <tr
                          key={lineNum}
                          className={`hover:bg-[#181C26]/60 transition-colors ${
                            isHighlighted ? 'bg-[#8B5CF6]/20 text-white font-medium' : ''
                          }`}
                        >
                          <td className="w-12 text-right pr-4 text-[#686D79] select-none align-top">
                            {lineNum}
                          </td>
                          <td className="whitespace-pre font-mono align-top text-[#F8FAFC]">
                            {line || ' '}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#686D79]">
                  No file selected.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: SYMBOL SEARCH */}
      {activeView === 'search' && (
        <div className="space-y-4">
          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#12151D] border border-[#1F2430]">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search symbols by name (e.g. NavigatorService, parseFile)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono placeholder:text-[#686D79] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-mono text-[#686D79] uppercase tracking-wider mr-1">Kind:</span>
              {['all', 'function', 'class', 'interface', 'type', 'variable', 'struct'].map(k => (
                <button
                  key={k}
                  onClick={() => setSymbolFilter(k)}
                  className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${
                    symbolFilter === k
                      ? 'bg-[#181C26] text-[#A78BFA] border border-[#8B5CF6]/40 font-semibold'
                      : 'text-[#686D79] hover:text-[#F8FAFC] border border-transparent'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="rounded-2xl bg-[#12151D] border border-[#1F2430] p-4">
            <div className="text-xs font-mono text-[#686D79] mb-3 flex items-center justify-between">
              <span>Matching Symbols: {searchResults.length}</span>
              {searchLoading && <span className="text-[#8B5CF6] animate-pulse">Searching AST...</span>}
            </div>

            {searchResults.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#686D79]">
                <Search className="size-8 mx-auto text-[#1F2430] mb-2" />
                <span>No symbols found matching your criteria.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((sym, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#181C26] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#F8FAFC] text-xs">{sym.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 uppercase">
                        {sym.kind}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#686D79] truncate">
                      {sym.signature}
                    </div>

                    <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#8B5CF6] truncate max-w-[180px]">{sym.filePath}</span>
                      <button
                        onClick={() => {
                          if (sym.filePath) {
                            handleSelectFile(sym.filePath, sym.startLine);
                            setActiveView('explorer');
                          }
                        }}
                        className="text-[#A78BFA] hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>L{sym.startLine}-{sym.endLine}</span>
                        <ExternalLink className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: ARCHITECTURE & DEPENDENCY GRAPH */}
      {activeView === 'graph' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Module Dependency Flowchart</h3>
              <p className="text-xs text-[#686D79]">Generated live via AST imports resolution across project boundaries</p>
            </div>
            <button
              onClick={fetchGraph}
              className="px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] text-xs font-mono text-[#C5C8D0] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`size-3.5 ${graphLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#0B0D12] border border-[#1F2430] p-6 min-h-[500px] flex items-center justify-center overflow-auto">
            {graphLoading ? (
              <div className="flex flex-col items-center gap-2 text-xs text-[#686D79]">
                <div className="size-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin" />
                <span>Constructing dependency graph...</span>
              </div>
            ) : (
              <div ref={mermaidRef} className="w-full flex justify-center overflow-x-auto" />
            )}
          </div>
        </div>
      )}

    </div>
  );
}
