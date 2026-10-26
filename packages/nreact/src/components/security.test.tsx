// @vitest-environment happy-dom
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { NotionContextProvider, useNotionContext } from '../context'
import { SearchHighlight } from './search-highlight'
import { SearchDialog } from './search-dialog'
import { Asset } from './asset'
import { Text } from './text'
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
