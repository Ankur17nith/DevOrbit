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
  Code, 
  Copy, 
  Check, 
  Sparkles,
  Plus
} from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer.js';
import { apiFetch } from '../lib/api.js';
import { ENDPOINTS } from '../lib/endpoints.js';

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
  const [summary, setSummary] = useState<RepositorySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [indexing, setIndexing] = useState<boolean>(false);
  const [repoPathInput, setRepoPathInput] = useState<string>('');

  // Selected file and preview state
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileSymbols, setFileSymbols] = useState<CodeSymbol[]>([]);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Search state
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [contextTab, setContextTab] = useState<'symbols' | 'ask' | 'graph'>('symbols');
  const [askInput, setAskInput] = useState<string>('');
  const [askResponse, setAskResponse] = useState<string>('');
  const [asking, setAsking] = useState<boolean>(false);

  // Graph state
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Expanded folders in tree view
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['apps', 'apps/api', 'apps/web', 'src']));

  // Fetch summary
  const fetchSummary = async (targetPath?: string) => {
    setLoading(true);
    try {
      const url = targetPath 
        ? `${ENDPOINTS.navigator.summary}?subPath=${encodeURIComponent(targetPath)}`
        : ENDPOINTS.navigator.summary;
      const json = await apiFetch(url);
      if (json.success && json.data) {
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
      const json = await apiFetch('/api/v1/navigator/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (json.success && json.data) {
        setSummary(json.data);
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
    if (jumpLine) setHighlightLine(jumpLine);

    try {
      const json = await apiFetch(`${ENDPOINTS.navigator.file}?filePath=${encodeURIComponent(filePath)}`);
      if (json.success && json.data) {
        setFileContent(json.data.content);
        setFileSymbols(json.data.fileIndex?.symbols || []);
      }
    } catch (err) {
      console.error('Failed to load file details:', err);
    }
  };

  // Graph fetch
  const fetchGraph = async () => {
    try {
      const json = await apiFetch(ENDPOINTS.navigator.graph);
      if (json.success && json.data) {
        setMermaidCode(json.data.mermaid || json.data.mermaidCode);
      }
    } catch (err) {
      console.error('Failed to load architecture graph:', err);
    }
  };

  useEffect(() => {
    if (contextTab === 'graph') {
      fetchGraph();
    }
  }, [contextTab]);

  useEffect(() => {
    let cancelled = false;
    const renderGraph = async () => {
      if (contextTab === 'graph' && mermaidCode && mermaidRef.current) {
        try {
          const mermaidModule = await import('mermaid');
          const mermaid = mermaidModule.default;
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'strict',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            themeVariables: {
              darkMode: true,
              background: '#11141B',
              primaryColor: '#8B5CF6',
              primaryTextColor: '#F8FAFC',
              primaryBorderColor: '#8B5CF6',
              lineColor: '#686D79',
              secondaryColor: '#181C26',
              tertiaryColor: '#0B0D12',
            },
          });
          const { svg } = await mermaid.render('mermaid-nav-' + Date.now(), mermaidCode);
          if (!cancelled && mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (err) {
          console.error('Mermaid render error:', err);
        }
      }
    };
    renderGraph();
    return () => {
      cancelled = true;
    };
  }, [mermaidCode, contextTab]);

  const handleAskContext = async () => {
    if (!askInput.trim()) return;
    setAsking(true);
    setAskResponse('');
    try {
      const json = await apiFetch(ENDPOINTS.ai.prompt, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Context: ${selectedFilePath ? `File: ${selectedFilePath}\nCode excerpt: ${fileContent.slice(0, 1000)}` : 'Repo overview'}\nQuestion: ${askInput}`,
          context: { repository: summary?.rootPath, file: selectedFilePath },
        }),
      });
      if (json.success && json.data) {
        setAskResponse(json.data.reply || json.data.content || 'Analysis complete.');
      } else {
        setAskResponse(json.error?.message || 'Unable to complete request: AI service offline.');
      }
    } catch (err) {
      setAskResponse('Unable to complete request: AI service offline.');
    } finally {
      setAsking(false);
    }
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderPath)) next.delete(folderPath);
      else next.add(folderPath);
      return next;
    });
  };

  const filterTree = (node: TreeNode, query: string): TreeNode | null => {
    if (!query) return node;
    const lowerQuery = query.toLowerCase();
    if (node.type === 'file') {
      return node.name.toLowerCase().includes(lowerQuery) ? node : null;
    }
    if (node.children) {
      const filteredChildren = node.children
        .map(child => filterTree(child, query))
        .filter((child): child is TreeNode => child !== null);
      if (filteredChildren.length > 0 || node.name.toLowerCase().includes(lowerQuery)) {
        return { ...node, children: filteredChildren };
      }
    }
    return null;
  };

  const renderTree = (node: TreeNode, depth = 0) => {
    if (node.type === 'directory') {
      const isExpanded = expandedFolders.has(node.path) || Boolean(searchFilter);
      return (
        <div key={node.path || 'root'} className="select-none">
          {node.path && (
            <button
              onClick={() => toggleFolder(node.path)}
              style={{ paddingLeft: `${depth * 10 + 8}px` }}
              className="w-full flex items-center gap-1.5 py-1 px-2 text-[10px] font-mono text-[#4A4E57] hover:bg-[#F3F4F6] hover:text-[#0B0D12] rounded transition-colors text-left"
            >
              {isExpanded ? (
                <ChevronDown className="size-3 text-[#999CA3]" />
              ) : (
                <ChevronRight className="size-3 text-[#999CA3]" />
              )}
              {isExpanded ? (
                <FolderOpen className="size-3 text-[#8B5CF6]" />
              ) : (
                <Folder className="size-3 text-[#8B5CF6]/80" />
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
        style={{ paddingLeft: `${depth * 10 + 16}px` }}
        className={`w-full flex items-center justify-between py-1 px-2 text-[10px] font-mono rounded transition-colors text-left ${
          isSelected
            ? 'bg-[#F0EDFA] text-[#8B5CF6] font-semibold'
            : 'text-[#686D79] hover:bg-[#F3F4F6] hover:text-[#0B0D12]'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <FileCode2 className={`size-3 ${isSelected ? 'text-[#8B5CF6]' : 'text-[#999CA3]'}`} />
          <span className="truncate">{node.name}</span>
        </div>
      </button>
    );
  };

  const displayedTree = summary?.fileTree ? filterTree(summary.fileTree, searchFilter) : null;

  return (
    <PageContainer maxWidth="max-w-[1400px]">
      {/* 1. Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Development</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">Codebase Navigator</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Select a local or connected repository, then index it before exploring source relationships.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleIndexRepository}
            disabled={indexing}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#11141B] px-4 text-[10px] font-semibold text-white hover:bg-black transition-colors"
          >
            {indexing ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            {indexing ? 'Indexing...' : 'Index repository'}
          </button>
        </div>
      </div>

      {/* 2. 3-Column Figma Container */}
      <div className="mt-6 grid min-h-[620px] overflow-hidden rounded-xl border border-black/8 bg-white lg:grid-cols-[230px_1fr_260px]">
        {/* Column 1: Explorer */}
        <div className="border-r border-black/7 flex flex-col">
          <div className="border-b border-black/7 p-3">
            <p className="text-[10px] font-semibold text-[#0B0D12]">Explorer</p>
            <div className="mt-3 flex items-center gap-2 rounded-md bg-[#F5F6F7] px-2">
              <Search className="size-3 text-[#999CA3]" />
              <input 
                placeholder="Search files"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="h-8 w-full bg-transparent text-[9px] outline-none text-[#0B0D12] placeholder:text-[#999CA3]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 [scrollbar-width:none]">
            {loading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-5 bg-[#F5F6F7] rounded animate-pulse" />
                ))}
              </div>
            ) : displayedTree ? (
              renderTree(displayedTree)
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                  <FolderTree className="size-4.5" />
                </span>
                <h3 className="mt-4 text-xs font-semibold text-[#0B0D12]">No repository</h3>
                <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                  Add a local path or connect GitHub.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Code Viewer */}
        <div className="flex flex-col bg-[#11141B] text-white">
          <div className="flex h-11 items-center justify-between border-b border-white/8 px-4 font-mono text-[9px] text-white/50">
            <span>{selectedFilePath || 'No file open'}</span>
            {fileContent && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(fileContent);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1 text-white/40 hover:text-white transition"
              >
                {copiedCode ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-1 overflow-auto">
            {fileContent ? (
              <div className="w-full p-4 font-mono text-[10px] leading-5 select-text overflow-x-auto">
                {fileContent.split('\n').map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = highlightLine === lineNum;
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-4 ${isHighlighted ? 'bg-[#8B5CF6]/20 text-[#A78BFA] -mx-4 px-4' : 'hover:bg-white/5'}`}
                    >
                      <span className="w-8 shrink-0 select-none text-right text-white/20">{lineNum}</span>
                      <pre className="text-white/85 whitespace-pre">{line}</pre>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-center p-6">
                <div>
                  <Code className="mx-auto size-6 text-white/20" />
                  <p className="mt-3 text-[10px] text-white/35">Select an indexed file to inspect source.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Context */}
        <div className="border-l border-black/7 flex flex-col">
          <div className="border-b border-black/7 p-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#0B0D12]">Context</span>
            <div className="flex gap-1 text-[9px]">
              <button 
                onClick={() => setContextTab('symbols')}
                className={`px-2 py-0.5 rounded ${contextTab === 'symbols' ? 'bg-black/5 font-semibold text-[#0B0D12]' : 'text-[#858993]'}`}
              >
                Symbols
              </button>
              <button 
                onClick={() => setContextTab('ask')}
                className={`px-2 py-0.5 rounded ${contextTab === 'ask' ? 'bg-black/5 font-semibold text-[#0B0D12]' : 'text-[#858993]'}`}
              >
                Ask
              </button>
              <button 
                onClick={() => setContextTab('graph')}
                className={`px-2 py-0.5 rounded ${contextTab === 'graph' ? 'bg-black/5 font-semibold text-[#0B0D12]' : 'text-[#858993]'}`}
              >
                Graph
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col overflow-y-auto">
            {contextTab === 'symbols' && (
              <div className="space-y-2">
                <p className="text-[9px] leading-5 text-[#858993]">
                  {fileSymbols.length > 0 
                    ? `${fileSymbols.length} AST symbols detected in this file:`
                    : 'Dependencies, related symbols, and source-grounded explanations appear here after indexing.'}
                </p>
                {fileSymbols.length > 0 && (
                  <div className="space-y-1 mt-3">
                    {fileSymbols.map((sym, idx) => (
                      <button
                        key={idx}
                        onClick={() => setHighlightLine(sym.startLine)}
                        className="w-full text-left p-2 rounded-md bg-[#F7F7F8] hover:bg-[#EEEEF1] transition flex items-center justify-between text-[9px]"
                      >
                        <span className="font-mono truncate text-[#0B0D12]">{sym.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#EEEAFB] text-[#6D3FE0] font-semibold">{sym.kind}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {contextTab === 'ask' && (
              <div className="flex-1 flex flex-col">
                <p className="text-[9px] leading-5 text-[#858993]">
                  Ask questions grounded in the current repository AST and symbols.
                </p>
                <textarea 
                  value={askInput}
                  onChange={e => setAskInput(e.target.value)}
                  placeholder="Ask about this codebase…"
                  className="mt-4 h-24 w-full resize-none rounded-md border border-black/8 bg-[#F7F7F8] p-3 text-[9px] text-[#0B0D12] outline-none"
                />
                <button 
                  onClick={handleAskContext}
                  disabled={asking || !askInput.trim()}
                  className="mt-2 w-full rounded-md bg-[#11141B] hover:bg-black py-2 text-[9px] font-semibold text-white transition disabled:bg-[#D9DADE]"
                >
                  {asking ? 'Analyzing codebase...' : 'Ask Orbit AI'}
                </button>
                {askResponse && (
                  <div className="mt-3 p-3 rounded-md bg-[#F7F7F8] text-[9px] text-[#0B0D12] font-mono leading-relaxed whitespace-pre-wrap">
                    {askResponse}
                  </div>
                )}
              </div>
            )}

            {contextTab === 'graph' && (
              <div className="flex-1 flex flex-col">
                <p className="text-[9px] leading-5 text-[#858993] mb-2">
                  Architectural module graph extracted from import paths.
                </p>
                <div 
                  ref={mermaidRef} 
                  className="flex-1 bg-[#11141B] p-2 rounded-md overflow-auto flex items-center justify-center text-center"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
