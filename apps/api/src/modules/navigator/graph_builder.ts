import path from 'path';
import { DependencyGraph, FileIndex, GraphEdge, GraphNode } from './navigator.types.js';

export class GraphBuilder {
  /**
   * Build complete dependency graph and Mermaid diagram from indexed files
   */
  public static buildGraph(files: FileIndex[]): DependencyGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const fileMap = new Map<string, FileIndex>();

    // Normalize and index files by relative path (without extension for easy resolution)
    files.forEach(file => {
      fileMap.set(file.filePath, file);
      // Also register without extension for JS/TS import resolution
      const stripped = file.filePath.replace(/\.[^/.]+$/, '');
      fileMap.set(stripped, file);
    });

    // 1. Build Nodes
    files.forEach(file => {
      const parts = file.filePath.split('/');
      const group = parts.length > 1 ? parts.slice(0, 2).join('/') : 'root';

      nodes.push({
        id: file.filePath,
        label: file.fileName,
        group,
        linesOfCode: file.linesOfCode,
        symbolCount: file.symbols.length,
      });
    });

    // 2. Build Edges from imports
    const edgeKeySet = new Set<string>();

    files.forEach(file => {
      const fileDir = path.dirname(file.filePath);

      file.imports.forEach(imp => {
        // Only resolve local relative imports
        if (imp.startsWith('.')) {
          let resolved = path.normalize(path.join(fileDir, imp));
          // Strip any .js/.ts/.tsx extensions that TypeScript uses
          resolved = resolved.replace(/\.[^/.]+$/, '');

          const targetFile = fileMap.get(resolved);
          if (targetFile && targetFile.filePath !== file.filePath) {
            const edgeKey = `${file.filePath}->${targetFile.filePath}`;
            if (!edgeKeySet.has(edgeKey)) {
              edgeKeySet.add(edgeKey);
              edges.push({
                from: file.filePath,
                to: targetFile.filePath,
                label: 'imports',
              });
            }
          }
        }
      });
    });

    // 3. Generate Clean Mermaid Flowchart String
    const mermaid = this.generateMermaid(nodes, edges);

    return {
      nodes,
      edges,
      mermaid,
    };
  }

  /**
   * Generate valid Mermaid flowchart TD string with grouped subgraphs
   */
  private static generateMermaid(nodes: GraphNode[], edges: GraphEdge[]): string {
    const lines: string[] = ['flowchart TD'];

    // Group nodes by module
    const groups = new Map<string, GraphNode[]>();
    nodes.forEach(node => {
      const groupNodes = groups.get(node.group) || [];
      groupNodes.push(node);
      groups.set(node.group, groupNodes);
    });

    // Helper to sanitize Mermaid IDs
    const sanitizeId = (id: string) => id.replace(/[^a-zA-Z0-9_]/g, '_');

    // Render Subgraphs (limit to active groups)
    Array.from(groups.entries())
      .slice(0, 12) // Limit for visual clarity
      .forEach(([groupName, groupNodes]) => {
        const subId = sanitizeId(`sub_${groupName}`);
        const safeGroup = groupName.replace(/["<>\n]/g, '');
        lines.push(`  subgraph ${subId} ["${safeGroup}"]`);
        
        groupNodes.slice(0, 8).forEach(node => {
          const nodeId = sanitizeId(node.id);
          const safeLabel = `${node.label.replace(/["<>\n]/g, '')} (${node.linesOfCode}L)`;
          lines.push(`    ${nodeId}["${safeLabel}"]`);
        });

        lines.push('  end');
      });

    // Render Edges
    const validNodeIds = new Set(nodes.map(n => n.id));
    edges.slice(0, 30).forEach(edge => {
      if (validNodeIds.has(edge.from) && validNodeIds.has(edge.to)) {
        const fromId = sanitizeId(edge.from);
        const toId = sanitizeId(edge.to);
        lines.push(`  ${fromId} --> ${toId}`);
      }
    });

    return lines.join('\n');
  }
}
