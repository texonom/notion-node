import { describe, expect, it } from 'vitest'
import { estimatePageReadTime } from './estimate-page-read-time'
import type { Block, ExtendedRecordMap } from '@texonom/ntypes'

const mapOf = (blocks: Record<string, unknown>[]) =>
  ({
    block: Object.fromEntries(blocks.map(value => [value.id, { value, role: 'reader' }])),
    collection: {},
    collection_view: {},
    collection_query: {},
    notion_user: {},
    signed_urls: {}
  }) as unknown as ExtendedRecordMap

const reference = (id: string, to: string) => ({
  id,
  type: 'transclusion_reference',
  format: { transclusion_reference_pointer: { id: to } }
})

describe('estimatePageReadTime', () => {
  it('counts every reference to a synced block, reading the block once', () => {
    // Each layer references the one below twice, so re-reading every reference costs 2^30.
    const layers = 30
    const blocks: Record<string, unknown>[] = [{ id: 'page', type: 'page', content: ['ref-a-0', 'ref-b-0'] }]
    for (let i = 0; i < layers; i++) {
      blocks.push(reference(`ref-a-${i}`, `sync-${i}`), reference(`ref-b-${i}`, `sync-${i}`))
      blocks.push({
        id: `sync-${i}`,
        type: 'transclusion_container',
        content: i + 1 < layers ? [`ref-a-${i + 1}`, `ref-b-${i + 1}`] : ['words']
      })
    }
    blocks.push({ id: 'words', type: 'text', properties: { title: [['two words']] } })
    const map = mapOf(blocks)

    const started = performance.now()
    const estimate = estimatePageReadTime(map.block.page.value as Block, map)
    expect(performance.now() - started).toBeLessThan(500)
    expect(estimate.numWords).toBe(2 * 2 ** layers)
  })

  it('stops at a synced block that references its own ancestor', () => {
    const map = mapOf([
      { id: 'page', type: 'page', content: ['sync'] },
      { id: 'sync', type: 'transclusion_container', content: ['words', 'back'] },
      { id: 'words', type: 'text', properties: { title: [['three words here']] } },
      reference('back', 'sync')
    ])
    expect(estimatePageReadTime(map.block.page.value as Block, map).numWords).toBe(3)
  })
})
