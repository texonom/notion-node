import type { Client } from '@notionhq/client'
import { parsePageId } from '@texonom/nutils'
import PQueue from 'p-queue'

import { convertPage } from './convert-page'

import type { BlockMap, PageMap, ParentMap, BlockChildrenMap, Block, Page, BlockChildren } from './types'
import type { ExtendedRecordMap } from '@texonom/ntypes'
import type { GetBlockResponse, GetPageResponse } from '@notionhq/client/build/src/api-endpoints'

export class NotionCompatAPI {
  client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getPage(rawPageId: string): Promise<ExtendedRecordMap> {
    const pageId = parsePageId(rawPageId)

    const [page, block, children] = await Promise.all([
      this.client.pages.retrieve({ page_id: pageId }),
      this.client.blocks.retrieve({ block_id: pageId }),
      this.getAllBlockChildren(pageId)
    ])
    const { blockMap, blockChildrenMap, pageMap, parentMap } = await this.resolvePage(pageId)

    const recordMap = convertPage({
      pageId,
      blockMap,
      blockChildrenMap,
      pageMap,
      parentMap
    })

    ;(
      recordMap as ExtendedRecordMap & {
        raw: { page: GetPageResponse; block: GetBlockResponse; children: GetBlockResponse[] }
      }
    ).raw = {
      page,
      block,
      children
    }

    return recordMap
  }

  async resolvePage(
    rootBlockId: string,
    {
      concurrency = 4
    }: {
      concurrency?: number
    } = {}
  ) {
    const blockMap: BlockMap = {}
    const pageMap: PageMap = {}
    const parentMap: ParentMap = {}
    const blockChildrenMap: BlockChildrenMap = {}
    const visitedBlockIds = new Set<string>()
    const queue = new PQueue({ concurrency })

    const processBlock = async (blockId: string) => {
      if (!blockId || visitedBlockIds.has(blockId)) return

      visitedBlockIds.add(blockId)
      queue.add(async () => {
        try {
          let partialBlock = blockMap[blockId]
          if (!partialBlock) {
            partialBlock = await this.client.blocks.retrieve({
              block_id: blockId
            })
            blockMap[blockId] = partialBlock
          }

          const block = partialBlock as Block
          if (block.type === 'child_page') {
            if (!pageMap[blockId]) {
              const partialPage = await this.client.pages.retrieve({
                page_id: blockId
              })

              pageMap[blockId] = partialPage

              const page = partialPage as Page
              switch (page.parent?.type) {
                case 'page_id':
                  if (!parentMap[blockId]) parentMap[blockId] = page.parent.page_id

                  break

                case 'database_id':
                  if (!parentMap[blockId]) parentMap[blockId] = page.parent.database_id

                  break
              }
            }

            if (blockId !== rootBlockId)
              // don't fetch children or recurse on subpages
              return
          }

          // Copied synced blocks expose another page's children through this API.
          // Keep the pointer for rendering, without expanding the source's data.
          if (block.type === 'synced_block' && block.synced_block.synced_from) return

          const children = await this.getAllBlockChildren(blockId)
          blockChildrenMap[blockId] = children.map(child => child.id)

          for (const child of children) {
            const childBlock = child as Block
            const mappedChildBlock = blockMap[child.id] as Block
            if (!mappedChildBlock || (!mappedChildBlock.type && childBlock.type)) {
              blockMap[child.id] = childBlock
              parentMap[child.id] = blockId

              // Mentions and link_to_page remain references. Integration access
              // to their targets is broader than this root's export scope.
              if (childBlock.has_children && childBlock.type !== 'child_database') processBlock(childBlock.id)
            }
          }
        } catch (err) {
          console.warn('failed resolving block', blockId, err.message)
        }
      })
    }

    await processBlock(rootBlockId)
    await queue.onIdle()

    return {
      blockMap,
      blockChildrenMap,
      pageMap,
      parentMap
    }
  }

  async getAllBlockChildren(blockId: string) {
    let blocks: BlockChildren = []
    let cursor: string

    do {
      console.debug('blocks.children.list', { blockId, cursor })
      const res = await this.client.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor
      })

      blocks = blocks.concat(res.results)
      cursor = res.next_cursor
    } while (cursor)

    return blocks
  }
}
