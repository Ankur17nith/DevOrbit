import ts from 'typescript';
import { CodeSymbol, FileIndex, SymbolKind } from './navigator.types.js';

export class AstParser {
  /**
   * Determine language category from file extension
   */
  public static detectLanguage(filePath: string): FileIndex['language'] {
    const ext = filePath.toLowerCase().split('.').pop() || '';
    if (['ts', 'tsx', 'mts', 'cts'].includes(ext)) return 'typescript';
    if (['js', 'jsx', 'mjs', 'cjs'].includes(ext)) return 'javascript';
    if (ext === 'py') return 'python';
    if (ext === 'go') return 'go';
    if (ext === 'rs') return 'rust';
    if (ext === 'json') return 'json';
    if (['md', 'markdown'].includes(ext)) return 'markdown';
    return 'other';
  }

  /**
   * Parse a file and extract symbols, imports, and exports
   */
  public static parseFile(
    filePath: string,
    absolutePath: string,
    content: string
  ): FileIndex {
    const language = this.detectLanguage(filePath);
    const lines = content.split('\n');
    const linesOfCode = lines.length;
    const sizeBytes = Buffer.byteLength(content, 'utf8');
    const extension = filePath.split('.').pop() || '';
    const fileName = filePath.split('/').pop() || filePath;

    let symbols: CodeSymbol[] = [];
    let imports: string[] = [];
    let exports: string[] = [];

    if (language === 'typescript' || language === 'javascript') {
      const parsed = this.parseTypeScript(filePath, content);
      symbols = parsed.symbols;
      imports = parsed.imports;
      exports = parsed.exports;
    } else if (language === 'python') {
      const parsed = this.parsePython(content);
      symbols = parsed.symbols;
      imports = parsed.imports;
      exports = parsed.exports;
    } else if (language === 'go') {
      const parsed = this.parseGo(content);
      symbols = parsed.symbols;
      imports = parsed.imports;
      exports = parsed.exports;
    } else if (language === 'rust') {
      const parsed = this.parseRust(content);
      symbols = parsed.symbols;
      imports = parsed.imports;
      exports = parsed.exports;
    }

    return {
      filePath,
      absolutePath,
      fileName,
      extension,
      language,
      linesOfCode,
      sizeBytes,
      imports,
      exports,
      symbols,
    };
  }

  /**
   * Native TypeScript AST Parser using TypeScript Compiler API
   */
  private static parseTypeScript(
    filePath: string,
    content: string
  ): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    const symbols: CodeSymbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const getLineAndChar = (pos: number) => {
      const { line } = sourceFile.getLineAndCharacterOfPosition(pos);
      return line + 1; // 1-indexed
    };

    for (const stmt of sourceFile.statements) {
      // 1. Imports
      if (ts.isImportDeclaration(stmt)) {
        if (ts.isStringLiteral(stmt.moduleSpecifier)) {
          imports.push(stmt.moduleSpecifier.text);
        }
      }

      // 2. Export Declarations
      if (ts.isExportDeclaration(stmt)) {
        if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
          stmt.exportClause.elements.forEach(el => exports.push(el.name.text));
        }
      }

      // 3. Functions
      if (ts.isFunctionDeclaration(stmt) && stmt.name) {
        const startLine = getLineAndChar(stmt.getStart(sourceFile));
        const endLine = getLineAndChar(stmt.getEnd());
        const exported = (ts.getCombinedModifierFlags(stmt) & ts.ModifierFlags.Export) !== 0;
        const name = stmt.name.text;
        if (exported) exports.push(name);

        symbols.push({
          name,
          kind: 'function',
          startLine,
          endLine,
          signature: `function ${name}(...)`,
          exported,
        });
      }

      // 4. Classes
      if (ts.isClassDeclaration(stmt) && stmt.name) {
        const startLine = getLineAndChar(stmt.getStart(sourceFile));
        const endLine = getLineAndChar(stmt.getEnd());
        const exported = (ts.getCombinedModifierFlags(stmt) & ts.ModifierFlags.Export) !== 0;
        const name = stmt.name.text;
        if (exported) exports.push(name);

        symbols.push({
          name,
          kind: 'class',
          startLine,
          endLine,
          signature: `class ${name}`,
          exported,
        });

        // Scan methods inside class
        stmt.members.forEach(member => {
          if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
            const mStart = getLineAndChar(member.getStart(sourceFile));
            const mEnd = getLineAndChar(member.getEnd());
            symbols.push({
              name: `${name}.${member.name.text}`,
              kind: 'method',
              startLine: mStart,
              endLine: mEnd,
              signature: `${member.name.text}(...)`,
              exported: false,
            });
          }
        });
      }

      // 5. Interfaces
      if (ts.isInterfaceDeclaration(stmt)) {
        const startLine = getLineAndChar(stmt.getStart(sourceFile));
        const endLine = getLineAndChar(stmt.getEnd());
        const exported = (ts.getCombinedModifierFlags(stmt) & ts.ModifierFlags.Export) !== 0;
        const name = stmt.name.text;
        if (exported) exports.push(name);

        symbols.push({
          name,
          kind: 'interface',
          startLine,
          endLine,
          signature: `interface ${name}`,
          exported,
        });
      }

      // 6. Type Aliases
      if (ts.isTypeAliasDeclaration(stmt)) {
        const startLine = getLineAndChar(stmt.getStart(sourceFile));
        const endLine = getLineAndChar(stmt.getEnd());
        const exported = (ts.getCombinedModifierFlags(stmt) & ts.ModifierFlags.Export) !== 0;
        const name = stmt.name.text;
        if (exported) exports.push(name);

        symbols.push({
          name,
          kind: 'type',
          startLine,
          endLine,
          signature: `type ${name}`,
          exported,
        });
      }

      // 7. Enums
      if (ts.isEnumDeclaration(stmt)) {
        const startLine = getLineAndChar(stmt.getStart(sourceFile));
        const endLine = getLineAndChar(stmt.getEnd());
        const exported = (ts.getCombinedModifierFlags(stmt) & ts.ModifierFlags.Export) !== 0;
        const name = stmt.name.text;
        if (exported) exports.push(name);

        symbols.push({
          name,
          kind: 'enum',
          startLine,
          endLine,
          signature: `enum ${name}`,
          exported,
        });
      }

      // 8. Variable Statements (top-level const/let exports, arrow functions)
      if (ts.isVariableStatement(stmt)) {
        const exported = stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
        stmt.declarationList.declarations.forEach(decl => {
          if (ts.isIdentifier(decl.name)) {
            const name = decl.name.text;
            if (exported) exports.push(name);
            const startLine = getLineAndChar(decl.getStart(sourceFile));
            const endLine = getLineAndChar(decl.getEnd());
            const isFunction =
              decl.initializer &&
              (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer));

            symbols.push({
              name,
              kind: isFunction ? 'function' : 'variable',
              startLine,
              endLine,
              signature: isFunction ? `const ${name} = (...) =>` : `const ${name}`,
              exported,
            });
          }
        });
      }
    }

    return { symbols, imports, exports };
  }

  /**
   * Helper to calculate closing brace endLine
   */
  private static findBraceEndLine(lines: string[], startIdx: number): number {
    let depth = 0;
    let foundOpen = false;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === '{') {
          depth++;
          foundOpen = true;
        } else if (char === '}') {
          depth--;
          if (foundOpen && depth <= 0) {
            return i + 1;
          }
        }
      }
    }
    return startIdx + 1;
  }

  /**
   * Python Symbol & Import Parser
   */
  private static parsePython(
    content: string
  ): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    const symbols: CodeSymbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    const lines = content.split('\n');

    const findPythonEndLine = (startIdx: number, baseIndent: number): number => {
      let lastLine = startIdx + 1;
      for (let i = startIdx + 1; i < lines.length; i++) {
        const l = lines[i];
        if (!l.trim() || l.trim().startsWith('#')) continue;
        const indent = l.match(/^\s*/)?.[0].length || 0;
        if (indent > baseIndent) {
          lastLine = i + 1;
        } else {
          break;
        }
      }
      return lastLine;
    };

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Imports
      const importMatch = trimmed.match(/^(?:from\s+([a-zA-Z0-9_.]+)\s+import|import\s+([a-zA-Z0-9_., ]+))/);
      if (importMatch) {
        imports.push(importMatch[1] || importMatch[2]);
      }

      // Classes
      const classMatch = trimmed.match(/^class\s+([a-zA-Z0-9_]+)(?:\((.*?)\))?:/);
      if (classMatch) {
        const baseIndent = line.match(/^\s*/)?.[0].length || 0;
        const endLine = findPythonEndLine(index, baseIndent);
        symbols.push({
          name: classMatch[1],
          kind: 'class',
          startLine: lineNum,
          endLine,
          signature: `class ${classMatch[1]}`,
          exported: !classMatch[1].startsWith('_'),
        });
      }

      // Functions / Methods
      const funcMatch = trimmed.match(/^(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\((.*?)\):/);
      if (funcMatch) {
        const baseIndent = line.match(/^\s*/)?.[0].length || 0;
        const endLine = findPythonEndLine(index, baseIndent);
        symbols.push({
          name: funcMatch[1],
          kind: 'function',
          startLine: lineNum,
          endLine,
          signature: `def ${funcMatch[1]}(...)`,
          exported: !funcMatch[1].startsWith('_'),
        });
      }
    });

    return { symbols, imports, exports };
  }

  /**
   * Go Symbol & Import Parser
   */
  private static parseGo(
    content: string
  ): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    const symbols: CodeSymbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    const lines = content.split('\n');
    let inImportBlock = false;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Import statement blocks
      if (trimmed.startsWith('import (')) {
        inImportBlock = true;
        return;
      }
      if (inImportBlock) {
        if (trimmed === ')') {
          inImportBlock = false;
          return;
        }
        const m = trimmed.match(/"([^"]+)"/);
        if (m) imports.push(m[1]);
        return;
      }

      // Single line import
      const importMatch = trimmed.match(/^import\s+(?:\w+\s+)?"([^"]+)"/);
      if (importMatch && importMatch[1]) {
        imports.push(importMatch[1]);
      }

      // Functions & Methods
      const funcMatch = trimmed.match(/^func\s+(?:\(.*?\)\s+)?([A-Za-z0-9_]+)\s*\(/);
      if (funcMatch) {
        const isExported = /^[A-Z]/.test(funcMatch[1]);
        const endLine = this.findBraceEndLine(lines, index);
        symbols.push({
          name: funcMatch[1],
          kind: 'function',
          startLine: lineNum,
          endLine,
          signature: `func ${funcMatch[1]}(...)`,
          exported: isExported,
        });
        if (isExported) exports.push(funcMatch[1]);
      }

      // Structs and Interfaces
      const typeMatch = trimmed.match(/^type\s+([A-Za-z0-9_]+)\s+(struct|interface)/);
      if (typeMatch) {
        const isExported = /^[A-Z]/.test(typeMatch[1]);
        const endLine = this.findBraceEndLine(lines, index);
        symbols.push({
          name: typeMatch[1],
          kind: typeMatch[2] === 'struct' ? 'struct' : 'interface',
          startLine: lineNum,
          endLine,
          signature: `type ${typeMatch[1]} ${typeMatch[2]}`,
          exported: isExported,
        });
        if (isExported) exports.push(typeMatch[1]);
      }
    });

    return { symbols, imports, exports };
  }

  /**
   * Rust Symbol & Import Parser
   */
  private static parseRust(
    content: string
  ): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    const symbols: CodeSymbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Use / imports
      const useMatch = trimmed.match(/^use\s+([a-zA-Z0-9_:]+)/);
      if (useMatch) {
        imports.push(useMatch[1]);
      }

      // Functions
      const fnMatch = trimmed.match(/^(?:pub(?:\(.*?\))?\s+)?fn\s+([a-zA-Z0-9_]+)\s*\(/);
      if (fnMatch) {
        const isExported = trimmed.startsWith('pub');
        const endLine = this.findBraceEndLine(lines, index);
        symbols.push({
          name: fnMatch[1],
          kind: 'function',
          startLine: lineNum,
          endLine,
          signature: `fn ${fnMatch[1]}(...)`,
          exported: isExported,
        });
        if (isExported) exports.push(fnMatch[1]);
      }

      // Structs, Enums, and Traits
      const structMatch = trimmed.match(/^(?:pub(?:\(.*?\))?\s+)?(struct|enum|trait)\s+([a-zA-Z0-9_]+)/);
      if (structMatch) {
        const isExported = trimmed.startsWith('pub');
        const endLine = this.findBraceEndLine(lines, index);
        const kind = structMatch[1] === 'struct' ? 'struct' : structMatch[1] === 'trait' ? 'interface' : 'enum';
        symbols.push({
          name: structMatch[2],
          kind,
          startLine: lineNum,
          endLine,
          signature: `${structMatch[1]} ${structMatch[2]}`,
          exported: isExported,
        });
        if (isExported) exports.push(structMatch[2]);
      }
    });

    return { symbols, imports, exports };
  }
}
