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

    // Normalize paths to posix format (slashes)
    const toPosix = (p: string) => p.split(path.sep).join(path.posix.sep);

    files.forEach(file => {
      const posixPath = toPosix(file.filePath);
      fileMap.set(posixPath, file);
      // Also register without extension
      const stripped = posixPath.replace(/\.[^/.]+$/, '');
      if (!fileMap.has(stripped)) {
        fileMap.set(stripped, file);
      }
    });

    // 1. Build Nodes
    files.forEach(file => {
      const posixPath = toPosix(file.filePath);
      const parts = posixPath.split('/');
      const group = parts.length > 1 ? parts.slice(0, 2).join('/') : 'root';

      nodes.push({
        id: posixPath,
        label: file.fileName,
        group,
        linesOfCode: file.linesOfCode,
        symbolCount: file.symbols.length,
      });
    });

    // 2. Build Edges from imports
    const edgeKeySet = new Set<string>();

    files.forEach(file => {
      const posixPath = toPosix(file.filePath);
      const fileDir = path.posix.dirname(posixPath);

      file.imports.forEach(imp => {
        // Only resolve local relative imports
        if (imp.startsWith('.')) {
          let resolved = path.posix.normalize(path.posix.join(fileDir, imp));
          // Strip any .js/.ts/.tsx extensions that TypeScript uses
          const stripped = resolved.replace(/\.[^/.]+$/, '');

          // Resolve direct match, extension-less match, or index.ts/index.js match
          let targetFile = fileMap.get(resolved) || fileMap.get(stripped);
          if (!targetFile) {
            targetFile = fileMap.get(path.posix.join(stripped, 'index')) ||
                         fileMap.get(path.posix.join(stripped, 'index.ts')) ||
                         fileMap.get(path.posix.join(stripped, 'index.js'));
          }

          if (targetFile && toPosix(targetFile.filePath) !== posixPath) {
            const targetPosix = toPosix(targetFile.filePath);
            const edgeKey = `${posixPath}->${targetPosix}`;
            if (!edgeKeySet.has(edgeKey)) {
              edgeKeySet.add(edgeKey);
              edges.push({
                from: posixPath,
                to: targetPosix,
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

    // Keep track of which node IDs are actually rendered into the diagram
    const renderedNodeIds = new Set<string>();

    // Render Subgraphs (limit to active groups)
    Array.from(groups.entries())
      .slice(0, 12) // Limit for visual clarity
      .forEach(([groupName, groupNodes]) => {
        const subId = sanitizeId(`sub_${groupName}`);
        const safeGroup = groupName.replace(/["<>\n]/g, '');
        lines.push(`  subgraph ${subId} ["${safeGroup}"]`);
        
        groupNodes.slice(0, 8).forEach(node => {
          renderedNodeIds.add(node.id);
          const nodeId = sanitizeId(node.id);
          const safeLabel = `${node.label.replace(/["<>\n]/g, '')} (${node.linesOfCode}L)`;
          lines.push(`    ${nodeId}["${safeLabel}"]`);
        });

        lines.push('  end');
      });

    // Render Edges only between nodes that were actually rendered
    edges.slice(0, 30).forEach(edge => {
      if (renderedNodeIds.has(edge.from) && renderedNodeIds.has(edge.to)) {
        const fromId = sanitizeId(edge.from);
        const toId = sanitizeId(edge.to);
        lines.push(`  ${fromId} --> ${toId}`);
      }
    });

    return lines.join('\n');
  }
}
