# Orbit Codebase Navigator: AST Indexing & Architecture Engine

DevOrbit Milestone M5 introduces the **Orbit Codebase Navigator**, a local-first repository indexing and architecture exploration engine.

---

## 1. High-Level Architecture

```mermaid
flowchart TD
    Repo[Local Workspace / Repository] --> Scanner[Recursive File Scanner]
    
    Scanner --> AstParser[Multi-Language AST Parser]
    AstParser --> TS[TypeScript Compiler API]
    AstParser --> PY[Python AST & RegEx]
    AstParser --> GO[Go Syntax Parser]
    AstParser --> RS[Rust Syntax Parser]
    
    TS --> Indexer[Repository Symbol Indexer]
    PY --> Indexer
    GO --> Indexer
    RS --> Indexer
    
    Indexer --> Tree[Hierarchical Directory Tree]
    Indexer --> Symbols[Source-Grounded Symbol Database]
    Indexer --> GraphBuilder[Module Dependency Graph Builder]
    
    GraphBuilder --> Mermaid[Dynamic Mermaid Flowchart]
    
    Tree --> UI[Codebase Navigator UI]
    Symbols --> UI
    Mermaid --> UI
```

---

## 2. Multi-Language AST Parsing

### 2.1 Native TypeScript & JavaScript AST
The AST engine leverages TypeScript's official Compiler API (`ts.createSourceFile`, `ts.forEachChild`, AST nodes):
- **Functions**: Extracts name, parameters, signature, line numbers, and export status.
- **Classes & Methods**: Recursively indexes class declarations and their inner member methods (`Class.method`).
- **Interfaces & Types**: Indexes type definitions and interfaces for contract analysis.
- **Enums & Variables**: Indexes exported constants, arrows, and enum values.
- **Imports & Exports**: Resolves module specifiers for graph linking.

### 2.2 Polyglot Syntax Extraction
- **Python**: Detects classes (`class Foo:`), function definitions (`def bar():`, `async def`), and module imports (`from x import y`).
- **Go**: Identifies receiver methods (`func (r *T) M()`), functions, structs (`type S struct`), and interfaces.
- **Rust**: Identifies functions (`pub fn`), structs (`struct`), enums (`enum`), and `use` namespaces.

---

## 3. Architecture & Dependency Flowchart Generation

### 3.1 Import Resolution
The `GraphBuilder` maps relative import specifiers (`./service`, `../../middleware/auth`) to their corresponding canonical files in the repository index:
- Cross-references resolved dependencies against project boundaries.
- Emits directed graph edges: `File A --> File B`.

### 3.2 Mermaid Flowchart Generation
Constructs sanitized `flowchart TD` diagrams grouping nodes into subgraphs by module directory:
```mermaid
flowchart TD
  subgraph sub_modules_navigator ["modules/navigator"]
    ast_parser_ts["ast_parser.ts (380L)"]
    graph_builder_ts["graph_builder.ts (110L)"]
    navigator_service_ts["navigator.service.ts (240L)"]
  end
  subgraph sub_modules_github ["modules/github"]
    github_client_ts["github.client.ts (210L)"]
    github_service_ts["github.service.ts (340L)"]
  end
  navigator_service_ts --> ast_parser_ts
  navigator_service_ts --> graph_builder_ts
```

---

## 4. Source-Grounded Navigation

Every symbol extracted by the AST parser carries verifiable source grounding:
- Exact 1-indexed `startLine` and `endLine`.
- Standard GitHub-style link formatting: `[symbol.name](file:///absolute/path#L10-L20)`.
- Interactive jumping in the Code Viewer preview panel to highlight the definition line.

---

## 5. Performance & In-Memory Caching
- **Indexing Speed**: Scans and parses standard repositories in under 300ms.
- **Subsequent Queries**: Summary, symbol search, and file retrieval execute from memory in < 5ms.
- **Safety**: Automatically ignores `.git`, `node_modules`, `dist`, `.next`, and build artifacts.
