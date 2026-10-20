// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'

import { NotionRenderer } from '../renderer'
import { readTitle, selectTitle, titleOffset } from './editable-text'

import type { Decoration, ExtendedRecordMap } from '@texonom/ntypes'

const PAGE = '11111111-1111-4111-8111-111111111111'
const LINKED = '99999999-9999-4999-8999-999999999999'
const id = (n: number) => `${String(n).padStart(8, '0')}-2222-4222-8222-222222222222`

const TITLES: Record<string, Decoration[]> = {
  plain: [['plain words']],
  styled: [
    ['bold', [['b']]],
    [' and '],
    ['both', [['i'], ['b']]],
    [' code', [['c']]],
    [' under', [['_']]],
    [' gone', [['s']]]
  ],
  colored: [
    ['red', [['h', 'red']]],
    [' on yellow', [['h', 'yellow_background']]]
  ],
  linked: [['see '], ['texonom', [['a', 'https://texonom.com/']]], [' now']],
  mention: [['before '], ['‣', [['p', LINKED]]], [' after']],
  workspace: [['inside', [['a', `/${LINKED.replace(/-/g, '')}`]]], [' outside']],
  comma: [['a'], [','], ['b']],
  lines: [['one\ntwo']],
  comment: [['note', [['m', 'discussion']]]]
}

type Spec = { type: string; title?: Decoration[]; checked?: boolean; editable: boolean }

const SPECS: Spec[] = [
  { type: 'text', title: TITLES.plain, editable: true },
  { type: 'text', title: TITLES.styled, editable: true },
  { type: 'text', title: TITLES.colored, editable: true },
  { type: 'text', title: TITLES.linked, editable: true },
  { type: 'text', title: TITLES.mention, editable: true },
  { type: 'text', title: TITLES.workspace, editable: true },
  { type: 'text', title: TITLES.comma, editable: true },
  { type: 'text', title: TITLES.lines, editable: true },
  { type: 'text', editable: true },
  { type: 'header', title: [['A heading']], editable: true },
  { type: 'sub_header', title: [['A smaller one', [['i']]]], editable: true },
  { type: 'bulleted_list', title: [['first']], editable: true },
  { type: 'bulleted_list', title: [['second']], editable: true },
  { type: 'numbered_list', title: [['one']], editable: true },
  { type: 'numbered_list', title: [['two', [['b']]]], editable: true },
  { type: 'to_do', title: [['done thing']], checked: true, editable: true },
  { type: 'quote', title: [['quoted']], editable: true },
  { type: 'toggle', title: [['folded']], editable: true },
  { type: 'text', title: TITLES.comment, editable: false },
  { type: 'callout', title: [['called out']], editable: false }
]

const recordMap = {
  block: {
    [PAGE]: {
      value: { id: PAGE, type: 'page', content: SPECS.map((_, n) => id(n)), properties: { title: [['Page']] } }
    },
    [LINKED]: { value: { id: LINKED, type: 'page', parent_id: PAGE, properties: { title: [['Linked page']] } } },
    ...Object.fromEntries(
      SPECS.map((spec, n) => [
        id(n),
        {
          value: {
            id: id(n),
            type: spec.type,
            parent_id: PAGE,
            ...(spec.title && { properties: { title: spec.title, ...(spec.checked && { checked: [['Yes']] }) } })
          }
        }
      ])
    )
  },
  collection: {},
  collection_view: {},
  collection_query: {},
  notion_user: {},
  signed_urls: {}
} as unknown as ExtendedRecordMap

const render = (editable?: boolean) =>
  renderToStaticMarkup(<NotionRenderer recordMap={recordMap} fullPage={false} editable={editable} />)

/** The editable render with everything editing adds taken back out. */
function withoutEditing(html: string): string {
  const host = document.createElement('div')
  host.innerHTML = html
  for (const island of Array.from(host.querySelectorAll('[data-segment]'))) island.replaceWith(...island.childNodes)
  for (const item of Array.from(host.querySelectorAll('li[data-block-id]'))) item.removeAttribute('data-block-id')
  for (const editable of Array.from(host.querySelectorAll('.notion-text-editable'))) {
    // An empty text block holds its line with a break where the reader writes &nbsp;.
    if (editable.parentElement?.classList.contains('notion-blank')) editable.replaceWith(' ')
    else editable.replaceWith(...editable.childNodes)
  }
  return host.innerHTML
}

describe('edit mode', () => {
  it('leaves the render untouched when editing is off', () => {
    expect(render()).toBe(render(false))
    expect(render(false)).not.toContain('notion-text-editable')
  })

  it('draws exactly what readers get, plus elements that draw nothing', () => {
    const reader = document.createElement('div')
    reader.innerHTML = render(false)
    expect(withoutEditing(render(true))).toBe(reader.innerHTML)
  })

  it('makes every title it can write back editable, and leaves the rest alone', () => {
    const host = document.createElement('div')
    host.innerHTML = render(true)
    const editable = new Set(
      Array.from(host.querySelectorAll<HTMLElement>('.notion-text-editable')).map(node => node.dataset.blockId)
    )
    SPECS.forEach((spec, n) => expect([spec.type, editable.has(id(n))]).toEqual([spec.type, spec.editable]))
  })
})

const roots: Array<ReturnType<typeof createRoot>> = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

async function mount(map: ExtendedRecordMap) {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  const root = createRoot(document.body.appendChild(document.createElement('div')))
  roots.push(root)
  const draw = (next: ExtendedRecordMap) =>
    act(() => root.render(<NotionRenderer recordMap={next} fullPage={false} editable />))
  await draw(map)
  return draw
}

const editableOf = (blockId: string) =>
  document.querySelector<HTMLElement>(`.notion-text-editable[data-block-id="${blockId}"]`)!

describe('reading a title back', () => {
  it('reads every kind of title back exactly as it was drawn', async () => {
    await mount(recordMap)
    SPECS.forEach((spec, n) => {
      if (!spec.editable) return
      expect([spec.type, readTitle(editableOf(id(n)))]).toEqual([spec.type, spec.title ?? []])
    })
  })

  it('reads what was typed, formats and kept pieces included', async () => {
    await mount(recordMap)
    const node = editableOf(id(4))
    node.firstChild!.textContent = 'typed '
    const bold = document.createElement('b')
    bold.textContent = 'loud'
    node.appendChild(bold)
    expect(readTitle(node)).toEqual([['typed '], ['‣', [['p', LINKED]]], [' after'], ['loud', [['b']]]])
  })

  it('counts characters the way the title does, a kept piece as its text', async () => {
    await mount(recordMap)
    const node = editableOf(id(4))
    const selection = document.getSelection()!
    // "before " is 7 characters, the mention 1, " after" 6.
    for (const offset of [0, 3, 7, 8, 11, 14]) {
      selectTitle(node, offset)
      expect(titleOffset(node, selection.anchorNode!, selection.anchorOffset)).toBe(offset)
    }
  })
})

describe('redrawing', () => {
  const titled = (title: Decoration[]) =>
    ({
      ...recordMap,
      block: { ...recordMap.block, [id(0)]: { value: { ...recordMap.block[id(0)].value, properties: { title } } } }
    }) as unknown as ExtendedRecordMap

  it('leaves typed text alone when the host hands back what it read', async () => {
    const draw = await mount(titled([['plain words']]))
    const node = editableOf(id(0))
    node.firstChild!.textContent = 'plain words typed'
    const read = readTitle(node)
    node.setAttribute('data-title', JSON.stringify(read))
    await draw(titled(read))
    expect(editableOf(id(0))).toBe(node)
    expect(node.textContent).toBe('plain words typed')
  })

  it('redraws from scratch for a title from anywhere else', async () => {
    const draw = await mount(titled([['plain words']]))
    const node = editableOf(id(0))
    await draw(titled([['changed in ', [['b']]], ['Notion']]))
    const redrawn = editableOf(id(0))
    expect(redrawn).not.toBe(node)
    expect(redrawn.innerHTML).toBe('<b>changed in </b>Notion')
  })
})
