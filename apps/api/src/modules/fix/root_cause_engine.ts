import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { 
  BugCategory, 
  CodeContextLine, 
  ParsedError, 
  PatchProposal, 
  PatchResult,
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

    const confidence = this.computeConfidence(parsed, category, Boolean(safePath), codeContext.length);
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
   * Generate AST-based unified diff patch proposal.
   * Modifies only the matching property access node for null dereferences.
   * Returns { patch: null, reason } when no safe automatic patch exists.
   */
  public static proposePatch(
    analysis: RootCauseAnalysis,
    workspaceRoot: string = NAVIGATOR_ROOT
  ): PatchResult {
    const filePath = analysis.filePath || 'src/index.ts';
    let lineNumber = analysis.lineNumber || 1;
    if (analysis.category !== 'NULL_UNDEFINED') {
      return {
        patch: null,
        reason: `Automated patch generation is not safely applicable for category '${analysis.category}' without domain-level invariant knowledge.`,
      };
    }

    // Extract target property from summary or explanation: e.g. "reading 'fullName'" or "reading 'name'"
    const propMatch = (analysis.summary + ' ' + analysis.explanation).match(/reading ['"]([^'"]+)['"]/i) ||
                      (analysis.summary + ' ' + analysis.explanation).match(/property ['"]([^'"]+)['"]/i);
    const targetProperty = propMatch ? propMatch[1] : null;

    if (!targetProperty) {
      return {
        patch: null,
        reason: 'Cannot safely infer dereferenced property name from error diagnostic.',
      };
    }

    const lineWithProp = analysis.codeContext.find(l => l.isErrorLine && l.content.includes(targetProperty)) ||
                          analysis.codeContext.find(l => l.content.includes(targetProperty));
    const originalLine = lineWithProp ? lineWithProp.content : `    const result = obj.${targetProperty};`;
    lineNumber = lineWithProp ? lineWithProp.lineNumber : lineNumber;
    let patchedLine = originalLine;
    let explanation = '';

    // Parse with TypeScript AST
    const sourceFile = ts.createSourceFile('snippet.ts', originalLine, ts.ScriptTarget.Latest, true);
    let matchedNode: ts.PropertyAccessExpression | null = null;

    const visit = (node: ts.Node) => {
      if (ts.isPropertyAccessExpression(node) && node.name.text === targetProperty) {
        if (node.questionDotToken === undefined) {
          matchedNode = node;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);

    if (!matchedNode) {
      return {
        patch: null,
        reason: `No matching property access node found for property '${targetProperty}' on error line.`,
      };
    }

    // Safe modification: insert ?. before the property name
    const exprEnd = (matchedNode as ts.PropertyAccessExpression).expression.end;
    const dotAndName = originalLine.slice(exprEnd, (matchedNode as ts.PropertyAccessExpression).end);
    if (dotAndName.startsWith('.')) {
      patchedLine = originalLine.slice(0, exprEnd) + '?.' + dotAndName.slice(1) + originalLine.slice((matchedNode as ts.PropertyAccessExpression).end);
      explanation = `Added optional chaining (?.) to '${targetProperty}' to prevent null or undefined dereference.`;
    } else {
      return {
        patch: null,
        reason: `Property access syntax for '${targetProperty}' is not standard dot access.`,
      };
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

    const patch: PatchProposal = {
      id: `patch-${Date.now()}`,
      filePath: relativePath,
      unifiedDiff: diff,
      originalSnippet: originalLine,
      patchedSnippet: patchedLine,
      explanation,
      confidence: analysis.confidence,
    };

    return {
      patch,
      ...patch,
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
   * Compute diagnosis confidence using documented heuristic factors:
   * Factor 1: Error category specificity (0 - 30)
   * Factor 2: Stack frame accuracy & line location (0 - 25)
   * Factor 3: Workspace source file presence on disk (0 - 25)
   * Factor 4: Extracted surrounding source context (0 - 20)
   */
  private static computeConfidence(
    parsed: ParsedError,
    category: BugCategory,
    hasFileOnDisk: boolean,
    contextLineCount: number
  ): number {
    let score = 0;

    // Factor 1: Category specificity
    if (category === 'NULL_UNDEFINED') score += 40;
    else if (category === 'TYPE_MISMATCH' || category === 'SYNTAX_OR_IMPORT') score += 30;
    else if (category === 'ASSERTION_FAILURE' || category === 'OUT_OF_BOUNDS') score += 25;
    else score += 15;

    // Factor 2: Stack frame accuracy
    if (parsed.primaryFrame) {
      if (parsed.primaryFrame.lineNumber > 0) score += 25;
      if (parsed.primaryFrame.columnNumber > 0) score += 15;
      if (parsed.primaryFrame.functionName) score += 10;
    }

    // Factor 3: Workspace file presence
    if (hasFileOnDisk) score += 10;

    // Factor 4: Surrounding code context lines
    if (contextLineCount >= 3) score += 10;
    else if (contextLineCount > 0) score += 5;

    return Math.min(100, Math.max(20, score));
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
          summary: `Null/Undefined dereference at ${loc}: ${parsed.message}`,
          explanation: `The property or method was accessed on an object that evaluates to null or undefined at runtime${errorLineContent ? `: \`${errorLineContent}\`` : ''}. Diagnostic: ${parsed.message}.`,
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
