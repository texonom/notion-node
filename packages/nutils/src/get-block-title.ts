import { getBlockCollectionId } from './get-block-collection-id'
import { getTextContent } from './get-text-content'

import type { Block, ExtendedRecordMap } from '@texonom/ntypes'

export function getBlockTitle(block: Block, recordMap: ExtendedRecordMap) {
  if (block.properties?.title) return getTextContent(block.properties.title)

  if (block.type === 'collection_view_page' || block.type === 'collection_view') {
    const collectionId = getBlockCollectionId(block, recordMap)
    if (collectionId) {
      const collection = recordMap.collection[collectionId]?.value
      if (collection) return getTextContent(collection.name)
    }
  }
  return ''
}
