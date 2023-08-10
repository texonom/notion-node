import { getBlockTitle } from './get-block-title'
import { getPageProperty } from './get-page-property'
import { normalizeTitle } from './normalize-title'
import { getTextContent } from './get-text-content'
import { uuidToId } from './uuid-to-id'

import type { ExtendedRecordMap } from '@texonom/ntypes'

/**
 * Gets the canonical, display-friendly version of a page's ID for use in URLs.
 */
export const getCanonicalPageId = (
  pageId: string,
  recordMap: ExtendedRecordMap,
  { uuid = true }: { uuid?: boolean } = {}
): string | null => {
  if (!pageId || !recordMap) return null

  const id = uuidToId(pageId)
  const block = recordMap.block[pageId]?.value

  if (block) {
    const slug =
      (getPageProperty('slug', block, recordMap) as string | null) || normalizeTitle(getBlockTitle(block, recordMap))

    if (slug)
      if (uuid) return `${slug}-${id}`
      else return slug
  } else {
    const collection = recordMap.collection[pageId]?.value
    if (collection) {
      const slug = normalizeTitle(getTextContent(collection.name))
      if (slug)
        if (uuid) return `${slug}-${id}`
        else return slug
    }
  }

  return id
}
