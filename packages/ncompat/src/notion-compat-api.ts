import type { Client } from '@notionhq/client'
import { parsePageId } from '@texonom/nutils'
import PQueue from 'p-queue'

import { convertPage } from './convert-page'

import type { BlockMap, PageMap, ParentMap, BlockChildrenMap, Block, Page, BlockChildren } from './types'
import type { ExtendedRecordMap } from '@texonom/ntypes'
import type { GetBlockResponse, GetPageResponse } from '@notionhq/client/build/src/api-endpoints'

const DEFAULT_BUDGET = { maxBlocks: 10_000, maxDepth: 64, timeoutMs: 120_000 }

export type ResolveBudget = {
  /** Blocks the whole page may hold, child pages included. */
  maxBlocks?: number
  /** Levels of nesting below the root. */
  maxDepth?: number
  timeoutMs?: number
}

/** A page larger, deeper or slower than its budget; resolution stops instead of returning part of it. */
export class ResolveBudgetError extends Error {}

export class NotionCompatAPI {
  client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getPage(rawPageId: string, budget: ResolveBudget = {}): Promise<ExtendedRecordMap> {
    const pageId = parsePageId(rawPageId)

    const [page, block, children] = await Promise.all([
      this.client.pages.retrieve({ page_id: pageId }),
      this.client.blocks.retrieve({ block_id: pageId }),
      this.getAllBlockChildren(pageId, { maxBlocks: budget.maxBlocks ?? DEFAULT_BUDGET.maxBlocks })
    ])
    const { blockMap, blockChildrenMap, pageMap, parentMap } = await this.resolvePage(pageId, budget)

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
      concurrency = 4,
      maxBlocks = DEFAULT_BUDGET.maxBlocks,
      maxDepth = DEFAULT_BUDGET.maxDepth,
      timeoutMs = DEFAULT_BUDGET.timeoutMs
    }: {
      concurrency?: number
    } & ResolveBudget = {}
  ) {
    const blockMap: BlockMap = {}
    const pageMap: PageMap = {}
    const parentMap: ParentMap = {}
    const blockChildrenMap: BlockChildrenMap = {}
    const visitedBlockIds = new Set<string>()
    const queue = new PQueue({ concurrency })
    const deadline = Date.now() + timeoutMs
    let blockCount = 0
    let exceeded: ResolveBudgetError | undefined

    const stop = (reason: string) => {
      exceeded ??= new ResolveBudgetError(`Page ${rootBlockId} exceeds its budget: ${reason}`)
      queue.clear()
    }

    const processBlock = async (blockId: string, depth = 0) => {
      if (!blockId || visitedBlockIds.has(blockId) || exceeded) return
      if (depth > maxDepth) return stop(`nested more than ${maxDepth} levels`)

      visitedBlockIds.add(blockId)
      queue.add(async () => {
        if (exceeded) return
        if (Date.now() > deadline) return stop(`still resolving after ${timeoutMs} ms`)
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

          const children = await this.getAllBlockChildren(blockId, { maxBlocks: maxBlocks - blockCount, deadline })
          blockChildrenMap[blockId] = children.map(child => child.id)

          for (const child of children) {
            const childBlock = child as Block
            const mappedChildBlock = blockMap[child.id] as Block
            if (!mappedChildBlock || (!mappedChildBlock.type && childBlock.type)) {
              if (!mappedChildBlock && ++blockCount > maxBlocks) return stop(`more than ${maxBlocks} blocks`)
              blockMap[child.id] = childBlock
              parentMap[child.id] = blockId

              // Mentions and link_to_page remain references. Integration access
              // to their targets is broader than this root's export scope.
              if (childBlock.has_children && childBlock.type !== 'child_database') processBlock(childBlock.id, depth + 1)
            }
          }
        } catch (err) {
          if (err instanceof ResolveBudgetError) return stop(err.message)
          console.warn('failed resolving block', blockId, err.message)
        }
      })
    }

    await processBlock(rootBlockId)
    await queue.onIdle()
    if (exceeded) throw exceeded

    return {
      blockMap,
      blockChildrenMap,
      pageMap,
      parentMap
    }
  }

  async getAllBlockChildren(blockId: string, { maxBlocks = Infinity, deadline = Infinity } = {}) {
    let blocks: BlockChildren = []
    let cursor: string

    do {
      if (blocks.length > maxBlocks) throw new ResolveBudgetError(`more than ${maxBlocks} blocks under ${blockId}`)
      if (Date.now() > deadline) throw new ResolveBudgetError(`still listing ${blockId} at its deadline`)
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
