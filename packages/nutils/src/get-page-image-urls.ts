import { getBlockIcon } from './get-block-icon'
import { isUrl } from './is-url'

import type { Block, ExtendedRecordMap } from '@texonom/ntypes'

/**
 * Gets URLs of all images contained on the given page.
 */
export const getPageImageUrls = (
  recordMap: ExtendedRecordMap,
  {
    mapImageUrl
  }: {
    mapImageUrl: (url: string, block: Block) => string | null
  }
): string[] => {
  const blockIds = Object.keys(recordMap.block)
  const imageUrls: string[] = blockIds
    .flatMap(blockId => {
      const block = recordMap.block[blockId]?.value
      const images: Array<{ block: Block; url: string }> = []

      if (block) {
        if (block.type === 'image') {
          const signedUrl = recordMap.signed_urls?.[block.id]
          let source = signedUrl || block.properties?.source?.[0]?.[0]
          if (source.includes('file.notion.so')) source = block.properties?.source?.[0]?.[0]

          if (source)
            images.push({
              block,
              url: source
            })
        }

        if (block.format?.page_cover) {
          const source = block.format.page_cover

          images.push({
            block,
            url: source
          })
        }

        if (block.format?.bookmark_cover) {
          const source = block.format.bookmark_cover

          images.push({
            block,
            url: source
          })
        }

        if (block.format?.bookmark_icon) {
          const source = block.format.bookmark_icon

          images.push({
            block,
            url: source
          })
        }

        const pageIcon = getBlockIcon(block, recordMap)
        if (pageIcon && isUrl(pageIcon))
          images.push({
            block,
            url: pageIcon
          })
      }

      return images
    })
    .filter(Boolean)
    .map(({ block, url }) => mapImageUrl(url, block))
    .filter(Boolean)

  return Array.from(new Set(imageUrls))
}
