import { test, expect } from 'vitest'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { NotionContextProvider } from './context'
import { PageIconImpl } from './components/page-icon'

const block: any = {
  id: '1',
  type: 'page',
  parent_id: '1',
  parent_table: 'block',
  version: 0,
  created_time: 0,
  last_edited_time: 0,
  alive: true,
  created_by_table: 'notion_user',
  created_by_id: '1',
  last_edited_by_table: 'notion_user',
  last_edited_by_id: '1',
  properties: { title: [['Title']] },
  format: { page_icon: 'https://example.com/icon.png' }
}

const render = (jsx: React.ReactElement) =>
  ReactDOMServer.renderToStaticMarkup(<NotionContextProvider>{jsx}</NotionContextProvider>)

test('PageIcon forwards priority to LazyImage', () => {
  const html = render(<PageIconImpl block={block} priority />)
  expect(html).toContain('fetchPriority="high"')
})
