import type { ExtendedRecordMap, Block, Collection } from '@texonom/ntypes'

export function findAncestors(recordMap: ExtendedRecordMap, block: Block | Collection, list: string[] = []): string[] {
  if (block.parent_id) {
    list.push(block.parent_id)
    const table = block.parent_table as 'block' | 'collection'
    if (recordMap[table][block.parent_id]?.value)
      return findAncestors(recordMap, recordMap[table][block.parent_id].value, list)
  }
  return list
}
