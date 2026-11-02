import { expect, it } from 'vitest'
import { NotionExporter } from './index'
import type { ExtendedRecordMap } from '@texonom/ntypes'

const page = '11111111-1111-4111-8111-111111111111'
const id = (n: number) => `22222222-2222-4222-8222-${String(n).padStart(12, '0')}`
const block = (n: number, type: string, title: string, extra: Record<string, unknown> = {}) => ({
  [id(n)]: { value: { id: id(n), type, parent_id: page, parent_table: 'block', properties: { title: [[title]] }, ...extra } }
})

it('writes each top-level block on its own line', async () => {
  const recordMap = {
    block: {
      [page]: {
        value: { id: page, type: 'page', properties: { title: [['Grokking']] }, content: [1, 2, 3, 4, 5].map(id) }
      },
      ...block(1, 'sub_sub_header', 'Phases'),
      ...block(2, 'numbered_list', 'memorization'),
      ...block(3, 'numbered_list', 'in-distribution'),
      ...block(4, 'text', 'A paragraph after the list.'),
      ...block(5, 'toggle', 'Details', { content: [id(6)] }),
      ...block(6, 'text', 'inside the toggle')
    },
    collection: {},
    collection_view: {},
    collection_query: {},
    notion_user: {},
    signed_urls: {}
  } as unknown as ExtendedRecordMap

  const markdown = await new NotionExporter({ page: '' }).pageToMarkdown(page, recordMap)
  const lines = markdown.split('\n')
  for (const line of [
    '### Phases',
    '1. memorization',
    '2. in-distribution',
    'A paragraph after the list.',
    'inside the toggle'
  ])
    expect(lines).toContain(line)
})
