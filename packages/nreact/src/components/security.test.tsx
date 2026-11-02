// @vitest-environment happy-dom
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { NotionContextProvider, useNotionContext } from '../context'
import { SearchHighlight } from './search-highlight'
import { SearchDialog } from './search-dialog'
import { Asset } from './asset'
import { Text } from './text'
import { AssetWrapper } from './asset-wrapper'
import { NotionRenderer } from '../renderer'
import type { BaseContentBlock, Block, ExtendedRecordMap } from '@texonom/ntypes'

const pageId = '11111111-1111-4111-8111-111111111111'
const page = { id: pageId, type: 'page', properties: { title: [['Page']] } } as Block
const recordMap = {
  block: { [pageId]: { value: page, role: 'reader' } },
  collection: {},
  collection_view: {},
  collection_query: {},
  notion_user: {},
  signed_urls: {}
} as ExtendedRecordMap
const dom = (content: React.ReactNode) => {
  const host = document.createElement('div')
  host.innerHTML = renderToStaticMarkup(content)
  return host
}

describe('search highlight rendering', () => {
  it('renders only the highlight markers as formatting', () => {
    const host = dom(
      <SearchHighlight text={'before <GZKNFOUU><img src=x onerror=alert(1)>&text</gzkNfoUU> <script>alert(1)</script>'} />
    )
    expect(host.querySelectorAll('b')).toHaveLength(1)
    expect(host.querySelector('b').textContent).toBe('<img src=x onerror=alert(1)>&text')
    expect(host.querySelector('img,script')).toBeNull()
    expect(host.textContent).toContain('<script>alert(1)</script>')
  })

  it('ignores HTML supplied separately by the search service', () => {
    const dialog = new SearchDialog({
      isOpen: true,
      rootBlockId: pageId,
      rootSpaceId: '',
      onClose: () => {},
      searchNotion: vi.fn()
    })
    dialog.state = {
      isLoading: false,
      query: 'Page',
      searchError: null,
      searchResult: {
        total: 1,
        recordMap,
        results: [{ id: pageId, page, highlight: { html: '<img src=x onerror=alert(1)>' } }]
      }
    }
    const host = dom(
      <NotionContextProvider
        recordMap={recordMap}
        components={{ Modal: ({ children }: React.PropsWithChildren) => <div>{children}</div> }}>
        {dialog.render()}
      </NotionContextProvider>
    )
    expect(host.querySelector('img')).toBeNull()
    expect(host.textContent).toContain('Page')
  })
})

describe('navigation and embed sinks', () => {
  const Links = ({ href }: { href: string }) => {
    const { components } = useNotionContext()
    return (
      <>
        <components.Link href={href}>external</components.Link>
        <components.PageLink href={href}>page</components.PageLink>
      </>
    )
  }

  it('blocks unsafe URLs before invoking custom components', () => {
    const Link = vi.fn(({ href, children }) => <a href={href}>{children}</a>)
    const host = dom(
      <NotionContextProvider components={{ Link, PageLink: Link }}>
        <Links href='javascript:alert(1)' />
      </NotionContextProvider>
    )
    expect(Link).not.toHaveBeenCalled()
    expect(host.querySelector('a')).toBeNull()
    expect(host.textContent).toBe('externalpage')
  })

  it('checks default links and rich-text decorations', () => {
    const host = dom(
      <NotionContextProvider recordMap={recordMap}>
        <Links href='data:text/html,<script>alert(1)</script>' />
        <Text block={page} value={[['link', [['a', 'java\nscript:alert(1)']]]]} />
        <Links href='https://example.com' />
      </NotionContextProvider>
    )
    expect([...host.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual([
      'https://example.com',
      'https://example.com'
    ])
  })

  it.each(['embed', 'gist', 'figma', 'maps', 'drive'])('rejects unsafe %s display_source and signed URLs', type => {
    const block = {
      id: 'asset',
      type,
      properties: { source: [['https://example.com/embed']] },
      format: { display_source: 'data:text/html,<script>alert(1)</script>' }
    } as BaseContentBlock
    const host = dom(
      <NotionContextProvider recordMap={recordMap}>
        <Asset block={block}>{null}</Asset>
      </NotionContextProvider>
    )
    expect(host.querySelector('iframe')).toBeNull()
    block.format.display_source = 'https://example.com/embed'
    const signed = { ...recordMap, signed_urls: { asset: 'javascript:alert(1)' } }
    expect(
      dom(
        <NotionContextProvider recordMap={signed}>
          <Asset block={block}>{null}</Asset>
        </NotionContextProvider>
      ).querySelector('iframe')
    ).toBeNull()
  })

  it('keeps valid iframe embeds working', () => {
    const block = { id: 'asset', type: 'embed', properties: { source: [['https://example.com/embed']] } } as BaseContentBlock
    const host = dom(
      <NotionContextProvider recordMap={recordMap}>
        <Asset block={block}>{null}</Asset>
      </NotionContextProvider>
    )
    expect(host.querySelector('iframe').getAttribute('src')).toBe('https://example.com/embed')
  })
})

const id = (n: number) => `22222222-2222-4222-8222-${String(n).padStart(12, '0')}`
const mapOf = (blocks: Record<string, unknown>[]) =>
  ({
    ...recordMap,
    block: Object.fromEntries(blocks.map(value => [value.id, { value, role: 'reader' }]))
  }) as unknown as ExtendedRecordMap

describe('record maps that point back at themselves', () => {
  it('renders a block once on its own path, directly or through a synced block', () => {
    const map = mapOf([
      { id: id(1), type: 'page', content: [id(2)], properties: { title: [['Root']] } },
      { id: id(2), type: 'text', content: [id(2), id(3)], properties: { title: [['looping text']] } },
      { id: id(3), type: 'transclusion_reference', format: { transclusion_reference_pointer: { id: id(2) } } }
    ])
    const html = renderToStaticMarkup(<NotionRenderer recordMap={map} rootPageId={id(1)} fullPage={false} />)
    expect(html.match(/looping text/g)).toHaveLength(1)
  })

  it('still renders a synced block that appears twice side by side', () => {
    const map = mapOf([
      { id: id(1), type: 'page', content: [id(2), id(3), id(4)], properties: { title: [['Root']] } },
      { id: id(2), type: 'transclusion_container', content: [id(5)] },
      { id: id(3), type: 'transclusion_reference', format: { transclusion_reference_pointer: { id: id(2) } } },
      { id: id(4), type: 'transclusion_reference', format: { transclusion_reference_pointer: { id: id(2) } } },
      { id: id(5), type: 'text', properties: { title: [['synced words']] } }
    ])
    const html = renderToStaticMarkup(<NotionRenderer recordMap={map} rootPageId={id(1)} fullPage={false} />)
    expect(html.match(/synced words/g)).toHaveLength(3)
  })
})

describe('image captions as links', () => {
  const imageWith = (caption: string) => {
    const block = {
      id: id(9),
      type: 'image',
      properties: { source: [['https://example.com/a.png']], caption: [[caption]] }
    } as unknown as Block
    return dom(
      <NotionContextProvider recordMap={mapOf([block as unknown as Record<string, unknown>])} rootDomain='texonom.com'>
        <AssetWrapper blockId={block.id} block={block} />
      </NotionContextProvider>
    )
  }

  it('opens an outside link in a new tab with no opener', () => {
    const link = imageWith('https://example.com/x').querySelector('a')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('reads a caption as before, a link or words, and in linear time on a long run', () => {
    expect(imageWith('example.com/a-b_c?x=1#top').querySelector('a')).not.toBeNull()
    expect(imageWith('Figure 1. A diagram').querySelector('a')).toBeNull()
    const started = performance.now()
    expect(imageWith(`${'a'.repeat(5000)}!`).querySelector('a')).toBeNull()
    expect(imageWith(`${'a1-'.repeat(600)}.${'b'.repeat(600)}!`).querySelector('a')).toBeNull()
    expect(performance.now() - started).toBeLessThan(500)
  })
})
