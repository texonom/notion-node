// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
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
    [BOLD]: { value: { id: BOLD, type: 'text', parent_id: PAGE, properties: { title: [['bold words', [['b']]]] } } }
  },
  collection: {},
  collection_view: {},
  collection_query: {},
  notion_user: {},
  signed_urls: {}
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

const withPlainTitle = (title: string) =>
  ({
    ...recordMap,
    block: { ...recordMap.block, [PLAIN]: { value: { ...recordMap.block[PLAIN].value, properties: { title: [[title]] } } } }
  }) as unknown as ExtendedRecordMap

describe('editing in place', () => {
  it('reports a blur edit once, follows a dropped edit, and leaves a focused node alone', async () => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    const reports: string[] = []
    const root = createRoot(document.body.appendChild(document.createElement('div')))
    const draw = (title: string) =>
      act(() =>
        root.render(
          <NotionRenderer
            recordMap={withPlainTitle(title)}
            fullPage={false}
            editable
            onChangeBlock={(_, next) => reports.push(next)}
          />
        )
      )

    await draw('plain words')
    const node = document.querySelector<HTMLElement>('.notion-text-editable')!
    expect(node.innerText).toBe('plain words')

    node.focus()
    node.innerText = 'edited words'
    await act(() => node.blur())
    expect(reports).toEqual(['edited words'])
    // Focus and leave without typing: nothing new to report.
    node.focus()
    await act(() => node.blur())
    expect(reports).toEqual(['edited words'])

    // The host saved the edit, then dropped it: the editor follows.
    await draw('edited words')
    await draw('plain words')
    expect(node.innerText).toBe('plain words')

    // Someone is typing: a change from outside waits rather than resetting the caret.
    node.focus()
    await draw('changed elsewhere')
    expect(node.innerText).toBe('plain words')

    root.unmount()
  })
})
