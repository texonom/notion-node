import { test, expect } from 'vitest'
import React from '../packages/nreact/node_modules/react'
import { renderToReadableStream } from '../packages/nreact/node_modules/react-dom/server.edge'
import { NotionRenderer } from '../packages/nreact/src/renderer'
import type { ExtendedRecordMap } from '../packages/ntypes/src/maps'

const recordMap: ExtendedRecordMap = {
  block: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '1': {
      role: 'reader',
      value: {
        id: '1',
        type: 'page',
        properties: { title: [['Test']] },
        parent_id: '',
        parent_table: 'space',
        version: 1,
        created_time: 0,
        last_edited_time: 0,
        alive: true,
        created_by_table: 'user',
        created_by_id: '',
        last_edited_by_table: 'user',
        last_edited_by_id: ''
      }
    }
  },
  collection: {},
  collection_view: {},
  notion_user: {},
  collection_query: {},
  signed_urls: {}
}

test('server component renders to stream', async () => {
  const stream = await renderToReadableStream(<NotionRenderer recordMap={recordMap} />)
  const reader = stream.getReader()
  const chunk = await reader.read()
  expect(chunk.done).toBe(false)
})
