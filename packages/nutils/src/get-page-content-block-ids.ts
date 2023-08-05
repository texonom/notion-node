import type { ExtendedRecordMap, Decoration } from '@texonom/ntypes'

/**
 * Gets the IDs of all blocks contained on a page starting from a root block ID.
 */
export const getPageContentBlockIds = (recordMap: ExtendedRecordMap, blockId?: string): string[] => {
  const rootBlockId = blockId || Object.keys(recordMap.block)[0]
  const contentBlockIds = new Set<string>()

  function addContentBlocks(blockId: string, nested = false) {
    if (contentBlockIds.has(blockId)) return
    contentBlockIds.add(blockId)
    if (!nested) return
    const block = recordMap.block[blockId]?.value
    if (!block) return
    const { content, type, properties, format } = block
    if (properties)
      for (const key of Object.keys(properties)) {
        const p = properties[key]
        p.map((d: Decoration) => {
          const value = d?.[0]?.[1]?.[0]
          if (value?.[0] === 'p' && value[1]) addContentBlocks(value[1])
        })
        p.map((d: Decoration) => {
          const value = d?.[1]?.[0]
          if ((value?.[0] === 'p' || value?.[0] === 'eoi') && value[1]) addContentBlocks(value[1])
        })
      }

    if (format) {
      const referenceId = format.transclusion_reference_pointer?.id
      if (referenceId) addContentBlocks(referenceId)
    }
    // no child content blocks to recurse on
    if (!content || !Array.isArray(content)) return
    // ignore the content of other pages and collections
    if (blockId !== rootBlockId) if (type === 'page' || type === 'collection_view_page') return
    for (const blockId of content) addContentBlocks(blockId)
  }
  addContentBlocks(rootBlockId, true)
  return Array.from(contentBlockIds)
}

/**
 * Gets the IDs of all blocks contained on a page starting from a root block ID.
 */
export const getPageContentUserIds = (recordMap: ExtendedRecordMap, blockId?: string): string[] => {
  const rootBlockId = blockId || Object.keys(recordMap.block)[0]
  const contentUserIDs = new Set<string>()
  const block = recordMap.block[rootBlockId]?.value

  if (block?.created_by_id) contentUserIDs.add(block?.created_by_id)
  if (block?.last_edited_by_id) contentUserIDs.add(block?.last_edited_by_id)

  // Property
  const { properties } = block
  if (properties)
    for (const key of Object.keys(properties)) {
      const p = properties[key]
      p.map((d: Decoration) => {
        const value = d?.[1]?.[0]
        if (value?.[0] === 'u' && value[1]) contentUserIDs.add(value[1])
      })
    }

  return Array.from(contentUserIDs)
}
