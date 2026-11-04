export interface StackFrame {
  functionName: string;
  filePath: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  isProjectFile: boolean;
  sourceLine?: string;
}

export interface ParsedError {
  errorType: string;
  message: string;
  frames: StackFrame[];
  primaryFrame?: StackFrame;
  rawLog: string;
  runtime: 'node' | 'python' | 'go' | 'rust' | 'vitest' | 'unknown';
}

export type BugCategory = 
  | 'NULL_UNDEFINED'
  | 'TYPE_MISMATCH'
  | 'SYNTAX_OR_IMPORT'
  | 'OUT_OF_BOUNDS'
  | 'ASSERTION_FAILURE'
  | 'ASYNC_PROMISE'
  | 'UNKNOWN';

export interface CodeContextLine {
  lineNumber: number;
  content: string;
  isErrorLine: boolean;
}

export interface RootCauseAnalysis {
  errorType: string;
  category: BugCategory;
  confidence: number; // 0 - 100%
  summary: string;
  affectedSymbol?: string;
  filePath?: string;
  lineNumber?: number;
  codeContext: CodeContextLine[];
  explanation: string;
  recommendedAction: string;
}

export interface PatchProposal {
  id: string;
  filePath: string;
  unifiedDiff: string;
  originalSnippet: string;
  patchedSnippet: string;
  explanation: string;
  confidence: number;
}

export interface VerificationResult {
  verified: boolean;
  status: 'PASSED' | 'FAILED' | 'SYNTAX_ERROR';
  message: string;
  executionTimeMs: number;
  checksRun: string[];
}
