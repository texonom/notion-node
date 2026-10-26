import { describe, expect, it, vi } from 'vitest'
import { getAllInSpace } from './get-all-in-space'
import { scopeRecordMap } from './scope-record-map'
import type { Block, ExtendedRecordMap, PageChunk } from '@texonom/ntypes'

const record = (id: string, parent_id: string, extra: Record<string, unknown> = {}) => ({
  role: 'reader' as const,
  value: {
    id,
    parent_id,
    parent_table: 'block',
    type: 'page',
    space_id: 'workspace',
    properties: { title: [[id]] },
    ...extra
  } as Block
})
function fixture(): ExtendedRecordMap {
  return {
    block: {
      root: record('root', 'ancestor', {
        content: ['inside', 'alias', 'sync', 'database', 'linked-db', 'foreign', 'missing']
      }),
      inside: record('inside', 'root', { properties: { title: [['Inside', [['p', 'mentioned-secret']]]] } }),
      alias: record('alias', 'root', { type: 'alias', format: { alias_pointer: { id: 'alias-secret' } } }),
      sync: record('sync', 'root', {
        type: 'transclusion_reference',
        format: { transclusion_reference_pointer: { id: 'synced-secret' } }
      }),
      database: record('database', 'root', { type: 'collection_view', collection_id: 'owned', view_ids: ['owned-view'] }),
      'linked-db': record('linked-db', 'root', {
        type: 'collection_view',
        collection_id: 'external',
        view_ids: ['external-view']
      }),
      ancestor: record('ancestor', 'space', { content: ['root', 'sibling'] }),
      sibling: record('sibling', 'ancestor', { content: ['sibling-child'] }),
      foreign: record('foreign', 'root', { space_id: 'another-workspace', content: ['foreign-child'] })
    },
    collection: {
      owned: {
        role: 'reader',
        value: { id: 'owned', parent_id: 'database', parent_table: 'block', name: [['Owned']], schema: {} }
      },
      external: {
        role: 'reader',
        value: { id: 'external', parent_id: 'sibling', parent_table: 'block', name: [['Secret']], schema: {} }
      }
    },
    collection_view: { 'owned-view': { value: { id: 'owned-view' } }, 'external-view': { value: { id: 'external-view' } } },
    collection_query: {},
    notion_user: { secretUser: { value: { id: 'secretUser' } } },
    signed_urls: { foreign: 'https://secret.example/file' },
    space: { workspace: { value: { id: 'workspace' } }, foreign: { value: { id: 'foreign' } } }
  } as unknown as ExtendedRecordMap
}

describe('root-scoped traversal', () => {
  it('fetches containment children and owned collection rows without expanding references', async () => {
    const input = fixture()
    const getPage = vi.fn(async () => input)
    const getBlocks = vi.fn(async (ids: string[]) => {
      expect(ids).toEqual(['missing'])
      return {
        recordMap: { block: { missing: record('missing', 'root'), unsolicited: record('unsolicited', 'elsewhere') } },
        cursor: { stack: [] }
      } as PageChunk
    })
    const fetchCollections = vi.fn(async (ids: string[], map: ExtendedRecordMap) => {
      expect(ids).toEqual(['database'])
      map.block.row = record('row', 'owned', { parent_table: 'collection' })
      map.block['foreign-row'] = record('foreign-row', 'owned', {
        parent_table: 'collection',
        space_id: 'another-workspace'
      })
      map.collection_query.owned = {
        'owned-view': {
          type: 'table',
          total: 2,
          blockIds: ['row', 'foreign-row'],
          aggregationResults: [],
          collection_group_results: { blockIds: ['row', 'foreign-row'], type: 'results', hasMore: false }
        }
      }
      return map
    })
    const result = await getAllInSpace('root', getPage, getBlocks, fetchCollections)
    expect(getBlocks).toHaveBeenCalledTimes(1)
    expect(fetchCollections).toHaveBeenCalledTimes(1)
    expect(Object.keys(result.recordMap.block).sort()).toEqual([
      'alias',
      'database',
      'inside',
      'linked-db',
      'missing',
      'root',
      'row',
      'sync'
    ])
    expect(Object.keys(result.pageMap).sort()).toEqual(['inside', 'missing', 'root', 'row'])
    expect(Object.keys(result.recordMap.collection)).toEqual(['owned'])
    expect(result.recordMap.collection_query.owned['owned-view'].collection_group_results.blockIds).toEqual(['row'])
    expect(result.recordMap.notion_user).toEqual({})
    expect(result.recordMap.signed_urls).toEqual({})
    expect(Object.keys(result.recordMap.space)).toEqual(['workspace'])
    expect(JSON.stringify(result.pageMap)).not.toContain('unsolicited')
    expect(JSON.stringify(result.pageTree)).not.toContain('foreign')
    expect(input.block.row).toBeUndefined()
  })

  it('applies the same scope to cached maps and checks an explicit workspace', async () => {
    const getPage = vi.fn()
    const getBlocks = vi.fn(async () => ({ recordMap: { block: {} } }) as PageChunk)
    const fetchCollections = vi.fn(async (_ids: string[], map: ExtendedRecordMap) => map)
    const result = await getAllInSpace('root', getPage, getBlocks, fetchCollections, { startRecordMap: fixture() })
    expect(getPage).not.toHaveBeenCalled()
    expect(getBlocks).toHaveBeenCalledTimes(1)
    expect(result.recordMap.block.foreign).toBeUndefined()
    expect(result.recordMap.block.sibling).toBeUndefined()
    expect(() => scopeRecordMap(fixture(), 'root', 'another-workspace')).toThrow(/outside/)
  })

  it('rejects forged containment and missing workspace metadata', () => {
    const input = fixture()
    input.block.inside.value.parent_id = 'sibling'
    delete input.block.foreign.value.space_id
    const result = scopeRecordMap(input, 'root')
    expect(result.block.inside).toBeUndefined()
    expect(result.block.foreign).toBeUndefined()
  })
})
