import { getBlockCollectionId } from './get-block-collection-id'
import type { Decoration, ExtendedRecordMap } from '@texonom/ntypes'

/** Only containment edges grant export scope. Mentions, aliases, synced-block
 * pointers and linked databases do not grant access to their targets. */
export function getRecordMapScope(recordMap: ExtendedRecordMap, rootId: string, rootSpaceId?: string) {
  const root = recordMap.block[rootId]?.value
  if (!root) throw new Error('Export root is missing from the record map')
  const spaceId = rootSpaceId ?? root.space_id
  if (spaceId && root.space_id !== spaceId) throw new Error('Export root is outside the selected workspace')

  const blocks = new Set<string>()
  const missing = new Set<string>()
  const collections = new Set<string>()
  const views = new Set<string>()

  const visit = (id: string, parentId?: string, parentTable = 'block') => {
    if (blocks.has(id)) return
    const block = recordMap.block[id]?.value
    if (!block) {
      missing.add(id)
      return
    }
    if (block.id !== id || (spaceId && block.space_id !== spaceId)) return
    if (parentId && (block.parent_id !== parentId || block.parent_table !== parentTable)) return
    blocks.add(id)
    for (const childId of block.content ?? []) visit(childId, id)

    if (block.type === 'collection_view' || block.type === 'collection_view_page') {
      const collectionId = getBlockCollectionId(block, recordMap)
      const collection = recordMap.collection?.[collectionId]?.value
      // A view of another page's database is a reference, not an owned child.
      if (!collection || collection.parent_id !== id || collection.parent_table !== 'block') return
      collections.add(collectionId)
      for (const viewId of block.view_ids ?? []) {
        views.add(viewId)
        const query = recordMap.collection_query?.[collectionId]?.[viewId]
        const rowIds = [
          ...(query?.blockIds ?? []),
          ...(query?.collection_group_results?.blockIds ?? []),
          ...(query?.groupResults?.flatMap(group => group.blockIds) ?? [])
        ]
        for (const rowId of rowIds) visit(rowId, collectionId, 'collection')
      }
    }
  }
  visit(rootId)
  return { blocks, missing, collections, views, spaceId }
}

export function scopeRecordMap(recordMap: ExtendedRecordMap, rootId: string, rootSpaceId?: string): ExtendedRecordMap {
  const scope = getRecordMapScope(recordMap, rootId, rootSpaceId)
  const pick = <T>(table: Record<string, T> = {}, ids: Set<string>): Record<string, T> =>
    Object.fromEntries([...ids].filter(id => Object.hasOwn(table, id)).map(id => [id, table[id]]))
  const block = pick(recordMap.block, scope.blocks)
  const users = new Set<string>()
  for (const [id, entry] of Object.entries(block)) {
    const value = entry.value
    block[id] = {
      ...entry,
      value: {
        ...value,
        ...(value.content && {
          content: value.content.filter(
            child =>
              scope.blocks.has(child) &&
              child !== id &&
              recordMap.block[child].value.parent_id === id &&
              recordMap.block[child].value.parent_table === 'block'
          )
        })
      }
    }
    if (value.created_by_id) users.add(value.created_by_id)
    if (value.last_edited_by_id) users.add(value.last_edited_by_id)
    for (const decorations of Object.values(value.properties ?? {}) as Decoration[][])
      for (const [, formats] of decorations)
        for (const format of formats ?? []) {
          if (format[0] === 'u') users.add(format[1])
          if (format[0] === '‣' && format[1][0] === 'u') users.add(format[1][1])
        }
  }

  const collectionQuery: ExtendedRecordMap['collection_query'] = {}
  for (const collectionId of scope.collections) {
    collectionQuery[collectionId] = {}
    for (const [viewId, query] of Object.entries(recordMap.collection_query?.[collectionId] ?? {})) {
      if (!scope.views.has(viewId)) continue
      collectionQuery[collectionId][viewId] = {
        ...query,
        ...(query.blockIds && { blockIds: query.blockIds.filter(id => scope.blocks.has(id)) }),
        ...(query.collection_group_results && {
          collection_group_results: {
            ...query.collection_group_results,
            blockIds: query.collection_group_results.blockIds.filter(id => scope.blocks.has(id))
          }
        }),
        ...(query.groupResults && {
          groupResults: query.groupResults.map(group => ({
            ...group,
            blockIds: group.blockIds.filter(id => scope.blocks.has(id))
          }))
        })
      }
    }
  }

  return {
    block,
    collection: pick(recordMap.collection, scope.collections),
    collection_view: pick(recordMap.collection_view, scope.views),
    collection_query: collectionQuery,
    notion_user: pick(recordMap.notion_user, users),
    signed_urls: pick(recordMap.signed_urls, scope.blocks),
    space: pick(recordMap.space, new Set(scope.spaceId ? [scope.spaceId] : []))
  }
}
