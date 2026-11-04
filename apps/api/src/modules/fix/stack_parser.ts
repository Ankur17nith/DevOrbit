import path from 'path';
import { ParsedError, StackFrame } from './fix.types.js';

export class StackParser {
  /**
   * Parse arbitrary stack trace / compiler error log into structured error model
   */
  public static parse(rawLog: string): ParsedError {
    const lines = rawLog.split(/\r?\n/).map(l => l.trimEnd());
    if (lines.length === 0) {
      return {
        errorType: 'UnknownError',
        message: 'Empty log provided',
        frames: [],
        rawLog,
        runtime: 'unknown',
      };
    }

    // 1. Detect runtime
    const runtime = this.detectRuntime(rawLog);

    // 2. Parse Error Type and Message
    const { errorType, message } = this.extractErrorHeader(lines, runtime);

    // 3. Parse Stack Frames
    const frames: StackFrame[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match Node/V8: "    at FunctionName (/path/to/file.ts:12:34)" or "    at /path/to/file.ts:12:34"
      const nodeMatch = line.match(/^\s*at\s+(?:(async\s+)?([^\s(]+)\s+\((.*?):(\d+):(\d+)\)|(.*?):(\d+):(\d+))/);
      if (nodeMatch) {
        const fnName = nodeMatch[2] || 'anonymous';
        const filePath = nodeMatch[3] || nodeMatch[6] || '';
        const lineNum = parseInt(nodeMatch[4] || nodeMatch[7] || '0', 10);
        const colNum = parseInt(nodeMatch[5] || nodeMatch[8] || '0', 10);

        if (filePath && lineNum > 0) {
          frames.push(this.createFrame(fnName, filePath, lineNum, colNum));
        }
        continue;
      }

      // Match Vitest: " ❯ src/tests/foo.test.ts:42:15"
      const vitestMatch = line.match(/^\s*❯\s+(.*?):(\d+):(\d+)/);
      if (vitestMatch) {
        const filePath = vitestMatch[1];
        const lineNum = parseInt(vitestMatch[2], 10);
        const colNum = parseInt(vitestMatch[3], 10);
        frames.push(this.createFrame('test', filePath, lineNum, colNum));
        continue;
      }

      // Match Python: '  File "foo.py", line 42, in process'
      const pythonMatch = line.match(/^\s*File\s+"(.*?)",\s+line\s+(\d+)(?:,\s+in\s+(.*))?/);
      if (pythonMatch) {
        const filePath = pythonMatch[1];
        const lineNum = parseInt(pythonMatch[2], 10);
        const fnName = pythonMatch[3] || 'module';
        frames.push(this.createFrame(fnName, filePath, lineNum, 1));
        continue;
      }

      // Match Rust: "at src/main.rs:25:9" or "panicked at '...', src/main.rs:25:9"
      const rustMatch = line.match(/(?:at\s+|,\s+)([^:\s]+):(\d+):(\d+)/);
      if (rustMatch && (rawLog.includes('panicked') || runtime === 'rust')) {
        const filePath = rustMatch[1];
        const lineNum = parseInt(rustMatch[2], 10);
        const colNum = parseInt(rustMatch[3], 10);
        frames.push(this.createFrame('panicked', filePath, lineNum, colNum));
        continue;
      }

      // Match Go: "\t/path/to/main.go:42 +0x3a"
      const goMatch = line.match(/^\s*(\/[^\s:]+\.go):(\d+)/);
      if (goMatch) {
        const prevLine = i > 0 ? lines[i - 1].trim() : 'unknown';
        const filePath = goMatch[1];
        const lineNum = parseInt(goMatch[2], 10);
        frames.push(this.createFrame(prevLine, filePath, lineNum, 1));
        continue;
      }
    }

    // Identify primary frame (first non-node_modules, non-internal frame)
    const primaryFrame = frames.find(f => f.isProjectFile) || frames[0];

    return {
      errorType,
      message,
      frames,
      primaryFrame,
      rawLog,
      runtime,
    };
  }

  /**
   * Detect runtime from stack trace markers
   */
  private static detectRuntime(rawLog: string): ParsedError['runtime'] {
    if (rawLog.includes('vitest') || rawLog.includes('FAIL src/') || rawLog.includes('AssertionError')) {
      return 'vitest';
    }
    if (rawLog.includes('Traceback (most recent call last):') || rawLog.includes('.py", line')) {
      return 'python';
    }
    if (rawLog.includes('goroutine') || (rawLog.includes('panic:') && rawLog.includes('.go:'))) {
      return 'go';
    }
    if (rawLog.includes('panicked at') || rawLog.includes('.rs:')) {
      return 'rust';
    }
    if (rawLog.includes('    at ') || rawLog.includes('TypeError:') || rawLog.includes('ReferenceError:')) {
      return 'node';
    }
    return 'unknown';
  }

  /**
   * Extract exception type and human message
   */
  private static extractErrorHeader(
    lines: string[],
    runtime: ParsedError['runtime']
  ): { errorType: string; message: string } {
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match "ErrorType: message" (e.g. TypeError: Cannot read properties of null)
      const errMatch = trimmed.match(/^([A-Za-z0-9_]+Error|[A-Za-z0-9_]+Exception|panic):\s*(.*)/);
      if (errMatch) {
        return {
          errorType: errMatch[1],
          message: errMatch[2] || errMatch[1],
        };
      }

      // Match Rust panic
      const rustPanic = trimmed.match(/panicked at (?:'(.*?)',|"(.*?)",)/);
      if (rustPanic) {
        return {
          errorType: 'Panic',
          message: rustPanic[1] || rustPanic[2] || 'Thread panicked',
        };
      }
    }

    // Fallback: use first non-empty line
    const firstLine = lines.find(l => l.trim().length > 0) || 'Unknown error';
    return {
      errorType: 'RuntimeError',
      message: firstLine.trim(),
    };
  }

  /**
   * Helper to format StackFrame and flag project vs vendor files
   */
  private static createFrame(
    functionName: string,
    filePath: string,
    lineNumber: number,
    columnNumber: number
  ): StackFrame {
    const isVendor =
      filePath.includes('node_modules') ||
      filePath.includes('/node:') ||
      filePath.includes('internal/process') ||
      filePath.startsWith('node:');

    return {
      functionName,
      filePath,
      fileName: path.basename(filePath),
      lineNumber,
      columnNumber,
      isProjectFile: !isVendor,
    };
  }
}
