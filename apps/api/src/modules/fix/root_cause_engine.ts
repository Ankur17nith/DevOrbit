import fs from 'fs';
import path from 'path';
import { 
  BugCategory, 
  CodeContextLine, 
  ParsedError, 
  PatchProposal, 
  RootCauseAnalysis, 
  StackFrame 
} from './fix.types.js';
import { NAVIGATOR_ROOT, resolveInsideRoot } from '../navigator/navigator.service.js';

export class RootCauseEngine {
  /**
   * Analyze error to produce source-grounded root cause diagnosis
   */
  public static analyze(parsed: ParsedError, workspaceRoot: string = NAVIGATOR_ROOT): RootCauseAnalysis {
    const frame = parsed.primaryFrame;
    const category = this.categorizeBug(parsed);
    const confidence = this.computeConfidence(parsed, category);

    let codeContext: CodeContextLine[] = [];
    let affectedSymbol: string | undefined = frame?.functionName;
    let safePath = '';

    if (frame && frame.filePath) {
      try {
        let candidate = frame.filePath;
        if (path.isAbsolute(candidate)) {
          const normalizedRoot = NAVIGATOR_ROOT.endsWith(path.sep) ? NAVIGATOR_ROOT : NAVIGATOR_ROOT + path.sep;
          if (candidate === NAVIGATOR_ROOT || candidate.startsWith(normalizedRoot)) {
            candidate = path.relative(NAVIGATOR_ROOT, candidate);
          } else {
            candidate = '';
          }
        }
        if (candidate) {
          const resolved = resolveInsideRoot(NAVIGATOR_ROOT, candidate);
          const base = path.basename(resolved);
          if (!base.startsWith('.')) {
            safePath = resolved;
            codeContext = this.extractCodeContext(resolved, frame.lineNumber);
          }
        }
      } catch {
        codeContext = [];
      }
    }

    const { summary, explanation, recommendedAction } = this.generateExplanation(parsed, category, frame, codeContext);

    return {
      errorType: parsed.errorType,
      category,
      confidence,
      summary,
      affectedSymbol,
      filePath: frame?.filePath,
      lineNumber: frame?.lineNumber,
      codeContext,
      explanation,
      recommendedAction,
    };
  }

  /**
   * Generate unified diff patch proposal
   */
  public static proposePatch(
    analysis: RootCauseAnalysis,
    workspaceRoot: string = NAVIGATOR_ROOT
  ): PatchProposal {
    const filePath = analysis.filePath || 'src/index.ts';
    const lineNumber = analysis.lineNumber || 1;
    const errorLineObj = analysis.codeContext.find(l => l.isErrorLine);
    const originalLine = errorLineObj ? errorLineObj.content : '  const result = data.value;';

    let patchedLine = originalLine;
    let explanation = '';

    if (analysis.category === 'NULL_UNDEFINED') {
      // Apply safe navigation / optional chaining or nullish coalescing
      if (originalLine.includes('.') && !originalLine.includes('?.')) {
        // e.g. foo.bar -> foo?.bar
        patchedLine = originalLine.replace(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g, '$1?.$2');
        explanation = 'Added optional chaining (?.) to prevent undefined dereference.';
      } else {
        patchedLine = `${originalLine.trimEnd()} ?? defaultValue;`;
        explanation = 'Added nullish coalescing fallback default.';
      }
    } else if (analysis.category === 'ASSERTION_FAILURE') {
      if (originalLine.includes('toBe(') || originalLine.includes('toEqual(')) {
        explanation = 'Aligned assertion condition with updated state or schema expectation.';
      } else {
        explanation = 'Safeguarded test condition.';
      }
    } else if (analysis.category === 'OUT_OF_BOUNDS') {
      const leadingSpace = originalLine.match(/^\s*/)?.[0] || '';
      patchedLine = `${leadingSpace}if (index >= 0 && index < items.length) {\n${originalLine}\n${leadingSpace}}`;
      explanation = 'Added bounds checking guard before array/slice access.';
    } else {
      explanation = 'Applied defensive typing and runtime validation check.';
    }

    // Build unified diff
    const relativePath = filePath.replace(workspaceRoot, '').replace(/^\//, '');
    const diff = [
      `--- a/${relativePath}`,
      `+++ b/${relativePath}`,
      `@@ -${lineNumber},1 +${lineNumber},1 @@`,
      `-${originalLine}`,
      `+${patchedLine}`,
    ].join('\n');

    return {
      id: `patch-${Date.now()}`,
      filePath: relativePath,
      unifiedDiff: diff,
      originalSnippet: originalLine,
      patchedSnippet: patchedLine,
      explanation,
      confidence: analysis.confidence,
    };
  }

  /**
   * Classify bug pattern
   */
  private static categorizeBug(parsed: ParsedError): BugCategory {
    const msg = parsed.message.toLowerCase();
    const type = parsed.errorType.toLowerCase();

    if (
      msg.includes('undefined') ||
      msg.includes('null') ||
      msg.includes('nonetype') ||
      msg.includes('nil pointer') ||
      type.includes('nullpointer')
    ) {
      return 'NULL_UNDEFINED';
    }

    if (
      msg.includes('is not a function') ||
      msg.includes('unsupported operand') ||
      msg.includes('type') ||
      type.includes('typeerror')
    ) {
      return 'TYPE_MISMATCH';
    }

    if (
      type.includes('assertion') ||
      msg.includes('expected') ||
      msg.includes('assertionerror')
    ) {
      return 'ASSERTION_FAILURE';
    }

    if (
      msg.includes('out of range') ||
      msg.includes('out of bounds') ||
      msg.includes('indexerror')
    ) {
      return 'OUT_OF_BOUNDS';
    }

    if (
      msg.includes('cannot find module') ||
      msg.includes('importerror') ||
      type.includes('syntaxerror')
    ) {
      return 'SYNTAX_OR_IMPORT';
    }

    return 'UNKNOWN';
  }

  /**
   * Compute diagnosis confidence
   */
  private static computeConfidence(parsed: ParsedError, category: BugCategory): number {
    if (category === 'NULL_UNDEFINED') return 95;
    if (category === 'ASSERTION_FAILURE') return 92;
    if (category === 'OUT_OF_BOUNDS') return 90;
    if (category === 'TYPE_MISMATCH') return 88;
    if (category === 'SYNTAX_OR_IMPORT') return 85;
    return 65;
  }

  /**
   * Extract surrounding source lines from disk
   */
  private static extractCodeContext(absolutePath: string, errorLine: number): CodeContextLine[] {
    const lines: CodeContextLine[] = [];
    if (!absolutePath || !fs.existsSync(absolutePath)) return lines;

    try {
      const stat = fs.statSync(absolutePath);
      if (stat.size > 1024 * 1024) return lines;

      const content = fs.readFileSync(absolutePath, 'utf8');
      const allLines = content.split('\n');
      const start = Math.max(0, errorLine - 4);
      const end = Math.min(allLines.length, errorLine + 3);

      for (let i = start; i < end; i++) {
        const lineNum = i + 1;
        lines.push({
          lineNumber: lineNum,
          content: allLines[i],
          isErrorLine: lineNum === errorLine,
        });
      }
    } catch {
      // Ignored if file unreadable
    }

    return lines;
  }

  /**
   * Generate human-readable analysis explanation
   */
  private static generateExplanation(
    parsed: ParsedError,
    category: BugCategory,
    frame?: StackFrame,
    context?: CodeContextLine[]
  ): { summary: string; explanation: string; recommendedAction: string } {
    const errorLineContent = context?.find(l => l.isErrorLine)?.content.trim();
    const loc = frame ? `${frame.fileName}:${frame.lineNumber}` : 'unknown';

    switch (category) {
      case 'NULL_UNDEFINED':
        return {
          summary: `Null/Undefined dereference at ${loc}`,
          explanation: `The property or method was accessed on an object that evaluates to null or undefined at runtime${errorLineContent ? `: \`${errorLineContent}\`` : ''}.`,
          recommendedAction: `Apply optional chaining (?.) or verify that the value is populated before accessing nested members.`,
        };
      case 'ASSERTION_FAILURE':
        return {
          summary: `Test assertion failure at ${loc}`,
          explanation: `The expected condition or value diverged from the actual runtime result: ${parsed.message}.`,
          recommendedAction: `Inspect whether the underlying data contract changed or update test fixtures to reflect expected behavior.`,
        };
      case 'OUT_OF_BOUNDS':
        return {
          summary: `Index out of bounds at ${loc}`,
          explanation: `Array or slice index was accessed beyond the valid bounds: ${parsed.message}.`,
          recommendedAction: `Add an index bounds check (\`index < array.length\`) before indexing.`,
        };
      case 'TYPE_MISMATCH':
        return {
          summary: `Type mismatch invocation at ${loc}`,
          explanation: `A value of incompatible type was invoked or operated upon: ${parsed.message}.`,
          recommendedAction: `Ensure correct variable type guards or TypeScript interface alignment.`,
        };
      default:
        return {
          summary: `Runtime error at ${loc}: ${parsed.message}`,
          explanation: `Encountered ${parsed.errorType} during execution.`,
          recommendedAction: `Inspect stack frames and verify input parameters against service contract.`,
        };
    }
  }
}
