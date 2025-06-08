import type { PageNode } from './treemap'

export interface ExportStats {
  totalPages: number
  totalBlocks: number
  maxDepth: number
}

export function computeStats(pageTree: PageNode): ExportStats {
  let totalPages = 0
  let totalBlocks = 0
  let maxDepth = 0

  function traverse(node: PageNode, depth: number) {
    totalPages += node.pages || 0
    totalBlocks += node.blocks || 0
    if (depth > maxDepth) maxDepth = depth
    if (node.children) for (const child of node.children) traverse(child, depth + 1)
  }

  traverse(pageTree, 1)
  return { totalPages, totalBlocks, maxDepth }
}

export async function writeStats(file: string, stats: ExportStats) {
  const fs = await import('fs/promises')
  await fs.writeFile(file, JSON.stringify(stats, null, 2), 'utf8')
}
