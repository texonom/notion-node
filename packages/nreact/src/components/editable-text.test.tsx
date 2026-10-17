import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NotionRenderer } from '../renderer'
import { isPlainTitle } from './editable-text'

import type { ExtendedRecordMap } from '@texonom/ntypes'

describe('isPlainTitle', () => {
  it('accepts unformatted text', () => {
    expect(isPlainTitle([['plain words']])).toBe(true)
    expect(isPlainTitle([['one'], ['two']])).toBe(true)
  })

  it('refuses anything carrying formatting', () => {
    expect(isPlainTitle([['bold', [['b']]]])).toBe(false)
    expect(isPlainTitle([['a link', [['a', 'https://texonom.com']]]])).toBe(false)
    expect(isPlainTitle([['‣', [['p', 'page-id']]]])).toBe(false)
  })

  it('refuses a missing title', () => {
    expect(isPlainTitle(undefined)).toBe(false)
  })
})

const PAGE = '11111111-1111-4111-8111-111111111111'
const PLAIN = '22222222-2222-4222-8222-222222222222'
const BOLD = '33333333-3333-4333-8333-333333333333'

const recordMap = {
  block: {
    [PAGE]: { value: { id: PAGE, type: 'page', content: [PLAIN, BOLD], properties: { title: [['Page']] } } },
    [PLAIN]: { value: { id: PLAIN, type: 'text', parent_id: PAGE, properties: { title: [['plain words']] } } },
    [BOLD]: { value: { id: BOLD, type: 'text', parent_id: PAGE, properties: { title: [['bold words', [['b']]]] } } },
  },
  collection: {},
  collection_view: {},
  collection_query: {},
  notion_user: {},
  signed_urls: {},
} as unknown as ExtendedRecordMap

const render = (editable?: boolean) =>
  renderToStaticMarkup(<NotionRenderer recordMap={recordMap} fullPage={false} editable={editable} />)

describe('edit mode', () => {
  it('leaves the render untouched when editing is off', () => {
    expect(render()).toBe(render(false))
    expect(render(false)).not.toContain('notion-text-editable')
    expect(render(false)).toContain('plain words')
  })

  it('makes only plain titles editable', () => {
    const html = render(true)
    expect(html.match(/notion-text-editable/g)).toHaveLength(1)
    // The formatted block keeps its read-only render, bold and all.
    expect(html).toContain('bold words')
  })
})
