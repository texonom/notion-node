import { expect, it, vi } from 'vitest'
import { NotionCompatAPI, ResolveBudgetError } from './notion-compat-api'
import type { Client } from '@notionhq/client'

it('resolves the selected page without retrieving ancestors, mentions, linked pages or synced sources', async () => {
  const root = { id: 'root', type: 'child_page', child_page: { title: 'Root' }, has_children: true }
  const child = { id: 'child', type: 'child_page', child_page: { title: 'Child' }, has_children: true }
  const paragraph = {
    id: 'paragraph',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: 'mention', mention: { type: 'page', page: { id: 'secret-page' } } },
        { type: 'mention', mention: { type: 'database', database: { id: 'secret-db' } } }
      ]
    }
  }
  const link = { id: 'link', type: 'link_to_page', link_to_page: { type: 'page_id', page_id: 'linked-secret' } }
  const synced = {
    id: 'sync',
    type: 'synced_block',
    has_children: true,
    synced_block: { synced_from: { block_id: 'synced-secret' } }
  }
  const nested = { id: 'nested', type: 'toggle', has_children: true, toggle: { rich_text: [] } }
  const retrieveBlock = vi.fn(async ({ block_id }) => {
    expect(block_id).toBe('root')
    return root
  })
  const retrievePage = vi.fn(async ({ page_id }) => ({
    id: page_id,
    parent: { type: 'page_id', page_id: page_id === 'root' ? 'outside-parent' : 'root' }
  }))
  const list = vi.fn(async ({ block_id }) => {
    expect(['root', 'nested']).toContain(block_id)
    return { results: block_id === 'root' ? [child, paragraph, link, synced, nested] : [root], next_cursor: null }
  })
  const client = {
    blocks: { retrieve: retrieveBlock, children: { list } },
    pages: { retrieve: retrievePage }
  } as unknown as Client
  const result = await new NotionCompatAPI(client).resolvePage('root')
  expect(retrieveBlock).toHaveBeenCalledTimes(1)
  expect(retrievePage.mock.calls.map(([args]) => args.page_id).sort()).toEqual(['child', 'root'])
  expect(list.mock.calls.map(([args]) => args.block_id).sort()).toEqual(['nested', 'root'])
  expect(Object.keys(result.blockMap).sort()).toEqual(['child', 'link', 'nested', 'paragraph', 'root', 'sync'])
  expect(result.blockChildrenMap.sync).toBeUndefined()
  expect(result.parentMap.root).toBe('outside-parent')
})

const toggle = (id: string) => ({ id, type: 'toggle', has_children: true, toggle: { rich_text: [] } })

function clientWith(list: (blockId: string) => { results: unknown[]; next_cursor: string | null }) {
  return {
    blocks: {
      retrieve: vi.fn(async ({ block_id }) => toggle(block_id)),
      children: { list: vi.fn(async ({ block_id }) => list(block_id)) }
    },
    pages: { retrieve: vi.fn() }
  } as unknown as Client
}

it('stops resolving a page nested deeper than its budget', async () => {
  const client = clientWith(blockId => ({ results: [toggle(`${blockId}-child`)], next_cursor: null }))
  await expect(new NotionCompatAPI(client).resolvePage('root', { maxDepth: 5 })).rejects.toThrow(ResolveBudgetError)
})

it('stops resolving a page with more blocks than its budget, however they are paginated', async () => {
  const wide = clientWith(blockId => ({
    results: Array.from({ length: 100 }, (_, i) => ({ id: `${blockId}-${i}`, type: 'paragraph', has_children: false })),
    next_cursor: 'more'
  }))
  await expect(new NotionCompatAPI(wide).resolvePage('root', { maxBlocks: 250 })).rejects.toThrow(ResolveBudgetError)
})
