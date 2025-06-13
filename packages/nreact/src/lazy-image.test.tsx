import { test, expect } from 'vitest'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { NotionContextProvider } from './context'
import { LazyImage } from './components/lazy-image'

const render = (jsx: React.ReactElement) =>
  ReactDOMServer.renderToStaticMarkup(<NotionContextProvider>{jsx}</NotionContextProvider>)

test('LazyImage uses eager loading when priority', () => {
  const html = render(<LazyImage src='test.png' alt='t' priority />)
  expect(html).toContain('loading="eager"')
  expect(html).toContain('fetchPriority="high"')
})

test('LazyImage defaults to lazy loading', () => {
  const html = render(<LazyImage src='test.png' alt='t' />)
  expect(html).toContain('loading="lazy"')
  expect(html).not.toContain('fetchPriority="high"')
})
