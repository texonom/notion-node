import { findAncestors } from './find-ancestors'
import { getPageContentBlockIds } from './get-page-content-block-ids'

import type { ExtendedRecordMap, PageMap, PageChunk, BlockMap } from '@texonom/ntypes'

export type PageTree = {
  id: string
  type: string
  blocks: number
  pages: number
  parent?: PageTree
  children: PageTree[]
}

type FetchOption = RequestInit & { timeout?: number }

/**
 * Performs a traversal over a given Notion workspace starting from a seed page.
 *
 * Returns a map containing all of the pages that are reachable from the seed
 * page in the space.
 *
 * If `rootSpaceId` is not defined, the space ID of the root page will be used
 * to scope traversal.
 *
 *
 * @param rootPageId - Page ID to start from.
 * @param rootSpaceId - Space ID to scope traversal.
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
    }?: { fetchOption?: FetchOption; concurrency?: number; collectionConcurrency?: number }
  ) => Promise<ExtendedRecordMap>,
  {
    startRecordMap,
    fetchOption = { timeout: 100000 },
    maxPage,
    concurrency = 100,
    collectionConcurrency = 100
  }: {
    startRecordMap?: ExtendedRecordMap
    fetchOption?: FetchOption
    concurrency?: number
    maxPage?: number
    collectionConcurrency?: number
  } = {}
): Promise<{ recordMap: ExtendedRecordMap; pageMap: PageMap; pageTree: PageTree }> {
  const pageMap: PageMap = {}
  const recordMap = startRecordMap ? startRecordMap : await getPage(startPageId, { fetchOption })

  let tempRecordMap: ExtendedRecordMap = JSON.parse(JSON.stringify(recordMap))

  console.time('fetch total')
  while (true) {
    console.info('block length ', Object.keys(recordMap.block).length)

    console.time('getPageContentBlockIds')
    const targetBlocks = Object.keys(tempRecordMap.block)
    const missing = Object.keys(
      targetBlocks.reduce((blockMap, root) => {
        const contentBlockIds = getPageContentBlockIds(recordMap, root, true)
        for (const contentBlockID of contentBlockIds) if (!recordMap.block[contentBlockID]) blockMap[contentBlockID] = true
        return blockMap
      }, {})
    )
    for (const { value: block } of Object.values(tempRecordMap.block))
      if (block && !recordMap.block[block.parent_id] && block.parent_table === 'block') missing.push(block.parent_id)
    console.timeEnd('getPageContentBlockIds')

    console.time('getBlocks')
    tempRecordMap = (await getBlocks(missing, fetchOption)).recordMap as ExtendedRecordMap
    console.timeEnd('getBlocks')
    if (!tempRecordMap?.block) break

    console.time('mapBlocks')
    const contentBlockIds = Object.values(recordMap.block)
      .map(obj => obj.value?.id)
      .filter(Boolean)
    recordMap.block = { ...recordMap.block, ...tempRecordMap.block }
    console.timeEnd('mapBlocks')

    console.time('fetchCollections')
    await fetchCollections(contentBlockIds, recordMap, undefined, { fetchOption, concurrency, collectionConcurrency })
    console.timeEnd('fetchCollections')
    console.info('collection query length ' + Object.keys(recordMap.collection_query).length)

    console.info('new block length ', Object.keys(tempRecordMap.block).length)
    const pageLength = Object.values(recordMap.block)
      .map(obj => obj.value?.type)
      .filter(type => type === 'page').length
    console.info('page length ', pageLength)
    if (Number.isInteger(maxPage) && pageLength >= maxPage) break

    console.info(`memory usage ${process.memoryUsage().rss / 1024 / 1024}MB`)
  }
  console.timeEnd('fetch total')

  console.time('get page map')
  console.info('Total block length ', Object.keys(recordMap.block).length)
  const blockIds = Object.keys(recordMap.block)

  const promises = []
  for (const blockId of blockIds)
    if (recordMap.block[blockId].value?.type === 'page') {
      promises.push(getPageSync(blockId, recordMap, getBlocks).then(pageRecordMap => (pageMap[blockId] = pageRecordMap)))
      await sleep(1)
    }
  await Promise.all(promises)

  console.timeEnd('get page map')
  console.info('Total page length ', Object.keys(pageMap).length)

  console.time('get page tree')
  const pageTree = { id: startPageId, blocks: 1, pages: 1, children: [], type: 'page' }
  recursivePageTree(recordMap, pageTree)
  console.timeEnd('get page tree')

  return { pageMap, pageTree, recordMap }
}

export function recursivePageTree(recordMap: ExtendedRecordMap, pageTree: PageTree): PageTree {
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
    console.debug('No block value')
    delete pageTree.parent
    return pageTree
  }

  if (current.content?.length) {
    for (const ancestor of ancestors) ancestor.blocks += current.content.length
    for (const contentBlockId of current.content) {
      const block = recordMap.block[contentBlockId]?.value
      if (!block) continue
      pageTree.children.push(
        recursivePageTree(recordMap, {
          id: contentBlockId,
          blocks: 1,
          pages: 0,
          children: [],
          type: block.type,
          parent: pageTree
        })
      )
      if (block.type === 'page') for (const ancestor of ancestors) ancestor.pages++
    }
  } else if (current?.type === 'collection_view') {
    const collectionQuery = recordMap.collection_query[current.collection_id]?.[current.view_ids[0]]
    if (!collectionQuery) {
      console.debug('No collection query')
      delete pageTree.parent
      return pageTree
    }
    const childrenMap = {}
    for (const collectionQuery of Object.values(recordMap.collection_query[current.collection_id]))
      if (collectionQuery.collection_group_results.blockIds)
        for (const blockId of collectionQuery.collection_group_results.blockIds) childrenMap[blockId] = true
    const childrenPages = Object.keys(childrenMap)
    for (const ancestor of ancestors) ancestor.pages += childrenPages.length
    for (const ancestor of ancestors) ancestor.blocks += childrenPages.length
    for (const blockId of childrenPages)
      pageTree.children.push(
        recursivePageTree(recordMap, {
          id: blockId,
          blocks: childrenPages.length,
          pages: childrenPages.length,
          children: [],
          type: current.type,
          parent: pageTree
        })
      )
  }
  delete pageTree.parent
  return pageTree
}

export async function getPageSync(
  pageId: string,
  recordMap: ExtendedRecordMap,
  getBlocks: (blockIds: string[], fetchOption?: FetchOption) => Promise<PageChunk>
): Promise<ExtendedRecordMap> {
  let contentBlockIds = getPageContentBlockIds(recordMap, pageId)
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
    if (block?.type === 'alias')
      while (true) {
        const alias = targetBlock?.format?.alias_pointer?.id
        if (!alias) break
        targetBlock = recordMap.block[alias]?.value
        if (!targetBlock) missing.push(alias)
        else blockMap[alias] = { value: targetBlock, role: 'reader' }
      }
  }

  // Missing
  if (missing.length) {
    const responseMap = (await getBlocks(missing).catch(() => ({ recordMap: { block: null } }))).recordMap
    if (responseMap?.block) {
      blockMap = { ...blockMap, ...responseMap.block }
      for (const blockId in responseMap.block) recordMap.block[blockId] = responseMap.block[blockId]
    } else {
      console.debug(`fetching ${missing.length} fail`)
    }
  }

  contentBlockIds = getPageContentBlockIds(recordMap, pageId)
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

const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
