import { findAncestors } from './find-ancestors'
import { getPageContentBlockIds } from './get-page-content-block-ids'
import { getBlockTitle } from './get-block-title'
import { getRecordMapScope, scopeRecordMap } from './scope-record-map'
import { getBlockCollectionId } from './get-block-collection-id'

import type { ExtendedRecordMap, PageMap, PageChunk, BlockMap } from '@texonom/ntypes'

export type PageTree = {
  id: string
  type: string
  title: string
  blocks: number
  pages: number
  parent?: PageTree
  children: PageTree[]
}

type FetchOption = RequestInit & { timeout?: number }

/**
 * Performs a traversal over a given Notion workspace starting from a seed page.
 *
 * Returns the seed page's contained descendants and owned collection rows.
 * References and ancestors never expand the export scope. The getPage callback
 * should disable eager reference fetching; responses are also filtered here.
 *
 * If `rootSpaceId` is not defined, the space ID of the root page will be used
 * to scope traversal.
 *
 *
 * @param startPageId - Page ID to start from.
 * @param getPage - Function used to fetch a single page.
 * @param opts - Optional config
 */
export async function getAllInSpace(
  startPageId: string,
  getPage: (pageId: string, { fetchOption }?: { fetchOption?: FetchOption }) => Promise<ExtendedRecordMap>,
  getBlocks: (blockIds: string[], fetchOption?: FetchOption) => Promise<PageChunk>,
  fetchCollections: (
    contentBlockIds: string[],
    recordMap: ExtendedRecordMap,
    pageId?: string,
    {
      fetchOption,
      concurrency,
      collectionConcurrency
    }?: { fetchOption?: FetchOption; concurrency: number; collectionConcurrency?: number }
  ) => Promise<ExtendedRecordMap>,
  {
    startRecordMap,
    rootSpaceId,
    fetchOption = { timeout: 100000 },
    maxPage,
    debug,
    concurrency = 100,
    collectionConcurrency = 100
  }: {
    startRecordMap?: ExtendedRecordMap
    rootSpaceId?: string
    fetchOption?: FetchOption
    concurrency?: number
    maxPage?: number
    debug?: boolean
    collectionConcurrency?: number
  } = {}
): Promise<{ recordMap: ExtendedRecordMap; pageMap: PageMap; pageTree: PageTree }> {
  const pageMap: PageMap = {}
  let recordMap = structuredClone(startRecordMap ?? (await getPage(startPageId, { fetchOption })))
  const attemptedBlocks = new Set<string>()
  const attemptedCollections = new Set<string>()

  while (true) {
    const scope = getRecordMapScope(recordMap, startPageId, rootSpaceId)
    const missing = [...scope.missing].filter(id => !attemptedBlocks.has(id))
    const collectionBlocks = [...scope.blocks].filter(id => {
      const block = recordMap.block[id].value
      const collectionId = getBlockCollectionId(block, recordMap)
      return scope.collections.has(collectionId) && !attemptedCollections.has(id)
    })
    if (!missing.length && !collectionBlocks.length) break
    if (
      Number.isInteger(maxPage) &&
      [...scope.blocks].filter(id => recordMap.block[id].value.type === 'page').length >= maxPage
    )
      break

    for (const id of missing) attemptedBlocks.add(id)
    if (missing.length) {
      const response = await getBlocks(missing, fetchOption)
      recordMap.block = { ...recordMap.block, ...response.recordMap?.block }
      recordMap.collection = { ...recordMap.collection, ...response.recordMap?.collection }
      recordMap.collection_view = { ...recordMap.collection_view, ...response.recordMap?.collection_view }
    }
    for (const id of collectionBlocks) attemptedCollections.add(id)
    if (collectionBlocks.length)
      await fetchCollections(collectionBlocks, recordMap, undefined, { fetchOption, concurrency, collectionConcurrency })
  }

  // Filter responses as well as requests: API responses and local caches can
  // contain ancestors, linked pages and records from other workspaces.
  recordMap = scopeRecordMap(recordMap, startPageId, rootSpaceId)
  for (const [id, entry] of Object.entries(recordMap.block))
    if (entry.value.type === 'page' || entry.value.type === 'collection_view_page')
      pageMap[id] = await getPageSync(id, recordMap, getBlocks, { followReferences: false, fetchMissing: false })

  if (debug) console.time('get page tree')
  const pageTree = {
    id: startPageId,
    title: getBlockTitle(recordMap.block[startPageId].value, recordMap),
    blocks: 1,
    pages: 1,
    children: [],
    type: 'page'
  }
  recursivePageTree(recordMap, pageTree)
  if (debug) console.timeEnd('get page tree')

  return { pageMap, pageTree, recordMap }
}

export function recursivePageTree(recordMap: ExtendedRecordMap, pageTree: PageTree, visited = new Set<string>()): PageTree {
  visited.add(pageTree.id)
  // Save ancestors to update the count
  const ancestors = [pageTree]
  let ancestor = pageTree
  while (true)
    if (ancestor.parent) {
      ancestors.push(ancestor.parent)
      ancestor = ancestor.parent
    } else {
      break
    }

  const current = recordMap.block[pageTree.id]?.value
  if (!current) {
    console.warn(`No block value for ${pageTree.id}`)
    delete pageTree.parent
    return pageTree
  }

  if (current.content?.length) {
    for (const ancestor of ancestors) ancestor.blocks += current.content.length
    for (const contentBlockId of current.content) {
      if (visited.has(contentBlockId)) continue
      const block = recordMap.block[contentBlockId]?.value
      if (!block) continue
      pageTree.children.push(
        recursivePageTree(
          recordMap,
          {
            id: contentBlockId,
            title: getBlockTitle(block, recordMap),
            blocks: 1,
            pages: 0,
            children: [],
            type: block.type,
            parent: pageTree
          },
          visited
        )
      )
      if (block.type === 'page') for (const ancestor of ancestors) ancestor.pages++
    }
  } else if (current?.type === 'collection_view' || current?.type === 'collection_view_page') {
    const collectionQuery = recordMap.collection_query[current.collection_id]?.[current.view_ids[0]]
    if (!collectionQuery) {
      console.warn(`No collection query for ${pageTree.id}`)
      delete pageTree.parent
      return pageTree
    }
    const childrenMap = {}
    for (const collectionQuery of Object.values(recordMap.collection_query[current.collection_id]))
      if (collectionQuery?.collection_group_results?.blockIds)
        for (const blockId of collectionQuery.collection_group_results.blockIds) childrenMap[blockId] = true
    const childrenPages = Object.keys(childrenMap)
    for (const ancestor of ancestors) ancestor.pages += childrenPages.length
    for (const ancestor of ancestors) ancestor.blocks += childrenPages.length
    for (const blockId of childrenPages) {
      if (visited.has(blockId) || !recordMap.block[blockId]?.value) continue
      pageTree.children.push(
        recursivePageTree(
          recordMap,
          {
            id: blockId,
            title: getBlockTitle(recordMap.block[blockId].value, recordMap),
            blocks: childrenPages.length,
            pages: childrenPages.length,
            children: [],
            type: current.type,
            parent: pageTree
          },
          visited
        )
      )
    }
  }
  delete pageTree.parent
  return pageTree
}

export async function getPageSync(
  pageId: string,
  recordMap: ExtendedRecordMap,
  getBlocks: (blockIds: string[], fetchOption?: FetchOption) => Promise<PageChunk>,
  { followReferences = true, fetchMissing = true }: { followReferences?: boolean; fetchMissing?: boolean } = {}
): Promise<ExtendedRecordMap> {
  let contentBlockIds = getPageContentBlockIds(recordMap, pageId, false, { followReferences })
  let blockMap: BlockMap = { [pageId]: { value: recordMap.block[pageId].value, role: 'reader' } }
  const collectionMap = {}
  const collectionViewMap = {}
  const collectionQueryMap = {}

  const missing = []
  for (const contentBlockId of contentBlockIds) {
    const block = recordMap.block[contentBlockId]?.value
    if (!block) {
      missing.push(contentBlockId)
      continue
    }
    blockMap[contentBlockId] = { value: block, role: 'reader' }
    if (block.type === 'collection_view' || block.type === 'collection_view_page') {
      if (recordMap.collection[block.collection_id])
        collectionMap[block.collection_id] = recordMap.collection[block.collection_id]
      if (recordMap.collection_query[block.collection_id])
        collectionQueryMap[block.collection_id] = recordMap.collection_query[block.collection_id]
      for (const viewId of block.view_ids)
        if (recordMap.collection_view[viewId]) {
          collectionViewMap[viewId] = recordMap.collection_view[viewId]
          const blockIds = recordMap.collection_query[block?.collection_id]?.[viewId]?.collection_group_results?.blockIds
          if (blockIds?.length)
            for (const blockId of blockIds) {
              const block = recordMap.block[blockId]?.value
              if (block) blockMap[blockId] = { value: block, role: 'reader' }
              else missing.push(blockId)
            }
        }
    }
  }

  // Ancestor
  const ancesters = findAncestors(recordMap, recordMap.block[pageId].value)
  for (const ancester of ancesters) {
    const block = recordMap.block[ancester]?.value
    if (block) blockMap[ancester] = { value: block, role: 'reader' }
    const collection = recordMap.collection[ancester]?.value
    if (collection) collectionMap[ancester] = { value: collection }
  }

  // Alias
  for (const blockId of Object.keys(blockMap)) {
    const block = blockMap[blockId].value
    let targetBlock = block
    const aliases = new Set<string>()
    if (followReferences && block?.type === 'alias')
      while (true) {
        const alias = targetBlock?.format?.alias_pointer?.id
        if (!alias || aliases.has(alias)) break
        aliases.add(alias)
        targetBlock = recordMap.block[alias]?.value
        if (!targetBlock) missing.push(alias)
        else blockMap[alias] = { value: targetBlock, role: 'reader' }
      }
  }

  // Missing
  if (fetchMissing && missing.length) {
    const responseMap = (await getBlocks(missing).catch(() => ({ recordMap: { block: null } }))).recordMap
    if (responseMap?.block) {
      blockMap = { ...blockMap, ...responseMap.block }
      for (const blockId in responseMap.block) recordMap.block[blockId] = responseMap.block[blockId]
    } else {
      console.warn(`fetching ${missing.length} fail for ${pageId}`)
    }
  }

  contentBlockIds = getPageContentBlockIds(recordMap, pageId, false, { followReferences })
  for (const contentBlockId of contentBlockIds) {
    const block = recordMap.block[contentBlockId]?.value
    if (!block) continue
    blockMap[contentBlockId] = { value: block, role: 'reader' }
    if (block.type === 'collection_view' || block.type === 'collection_view_page') {
      if (recordMap.collection[block.collection_id])
        collectionMap[block.collection_id] = recordMap.collection[block.collection_id]
      if (recordMap.collection_query[block.collection_id])
        collectionQueryMap[block.collection_id] = recordMap.collection_query[block.collection_id]
      for (const viewId of block.view_ids)
        if (recordMap.collection_view[viewId]) {
          collectionViewMap[viewId] = recordMap.collection_view[viewId]
          const blockIds = recordMap.collection_query[block?.collection_id]?.[viewId]?.collection_group_results?.blockIds
          if (blockIds?.length)
            for (const blockId of blockIds) {
              const block = recordMap.block[blockId]?.value
              if (block) blockMap[blockId] = { value: block, role: 'reader' }
            }
        }
    }
  }

  return {
    block: blockMap,
    collection: collectionMap,
    collection_view: collectionViewMap,
    collection_query: collectionQueryMap,
    signed_urls: {},
    notion_user: {}
  }
}
