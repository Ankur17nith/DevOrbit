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

    const isNodeExported = (node: ts.Node): boolean => {
      return (
        (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
        (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
      );
    };

    const visit = (node: ts.Node) => {
      // 1. Imports
      if (ts.isImportDeclaration(node)) {
        if (ts.isStringLiteral(node.moduleSpecifier)) {
          imports.push(node.moduleSpecifier.text);
        }
      }

      // 2. Export Declarations
      if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach(el => exports.push(el.name.text));
        }
      }

      // 3. Functions
      if (ts.isFunctionDeclaration(node) && node.name) {
        const startLine = getLineAndChar(node.getStart(sourceFile));
        const endLine = getLineAndChar(node.getEnd());
        const exported = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
        const name = node.name.text;
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
      if (ts.isClassDeclaration(node) && node.name) {
        const startLine = getLineAndChar(node.getStart(sourceFile));
        const endLine = getLineAndChar(node.getEnd());
        const exported = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
        const name = node.name.text;
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
        node.members.forEach(member => {
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
      if (ts.isInterfaceDeclaration(node)) {
        const startLine = getLineAndChar(node.getStart(sourceFile));
        const endLine = getLineAndChar(node.getEnd());
        const exported = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
        const name = node.name.text;
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
      if (ts.isTypeAliasDeclaration(node)) {
        const startLine = getLineAndChar(node.getStart(sourceFile));
        const endLine = getLineAndChar(node.getEnd());
        const exported = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
        const name = node.name.text;
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
      if (ts.isEnumDeclaration(node)) {
        const startLine = getLineAndChar(node.getStart(sourceFile));
        const endLine = getLineAndChar(node.getEnd());
        const exported = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
        const name = node.name.text;
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

      // 8. Variable Statements (const/let exports, arrow functions)
      if (ts.isVariableStatement(node)) {
        const exported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
        node.declarationList.declarations.forEach(decl => {
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

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return { symbols, imports, exports };
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
        symbols.push({
          name: classMatch[1],
          kind: 'class',
          startLine: lineNum,
          endLine: lineNum,
          signature: `class ${classMatch[1]}`,
          exported: !classMatch[1].startsWith('_'),
        });
      }

      // Functions / Methods
      const funcMatch = trimmed.match(/^(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\((.*?)\):/);
      if (funcMatch) {
        symbols.push({
          name: funcMatch[1],
          kind: 'function',
          startLine: lineNum,
          endLine: lineNum,
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
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Import statement
      const importMatch = trimmed.match(/^import\s+(?:\((.*?)\)|"([^"]+)")/);
      if (importMatch && importMatch[2]) {
        imports.push(importMatch[2]);
      }

      // Functions & Methods
      const funcMatch = trimmed.match(/^func\s+(?:\(.*?\)\s+)?([A-Za-z0-9_]+)\s*\(/);
      if (funcMatch) {
        const isExported = /^[A-Z]/.test(funcMatch[1]);
        symbols.push({
          name: funcMatch[1],
          kind: 'function',
          startLine: lineNum,
          endLine: lineNum,
          signature: `func ${funcMatch[1]}(...)`,
          exported: isExported,
        });
        if (isExported) exports.push(funcMatch[1]);
      }

      // Structs and Interfaces
      const typeMatch = trimmed.match(/^type\s+([A-Za-z0-9_]+)\s+(struct|interface)/);
      if (typeMatch) {
        const isExported = /^[A-Z]/.test(typeMatch[1]);
        symbols.push({
          name: typeMatch[1],
          kind: typeMatch[2] === 'struct' ? 'struct' : 'interface',
          startLine: lineNum,
          endLine: lineNum,
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
        symbols.push({
          name: fnMatch[1],
          kind: 'function',
          startLine: lineNum,
          endLine: lineNum,
          signature: `fn ${fnMatch[1]}(...)`,
          exported: isExported,
        });
        if (isExported) exports.push(fnMatch[1]);
      }

      // Structs and Enums
      const structMatch = trimmed.match(/^(?:pub(?:\(.*?\))?\s+)?(struct|enum|trait)\s+([a-zA-Z0-9_]+)/);
      if (structMatch) {
        const isExported = trimmed.startsWith('pub');
        symbols.push({
          name: structMatch[2],
          kind: structMatch[1] === 'struct' ? 'struct' : 'enum',
          startLine: lineNum,
          endLine: lineNum,
          signature: `${structMatch[1]} ${structMatch[2]}`,
          exported: isExported,
        });
        if (isExported) exports.push(structMatch[2]);
      }
    });

    return { symbols, imports, exports };
  }
}
