import { test, expect } from 'vitest'
import { defaultMapImageUrl } from './map-image-url'
import type { Block } from '@texonom/ntypes'

const mockBlock: Block = {
  id: 'test-block-id',
  parent_table: 'block',
  parent_id: 'test-parent-id',
  type: 'bookmark',
  version: 1,
  alive: true,
  created_time: 0,
  last_edited_time: 0,
  created_by_table: 'user',
  created_by_id: '',
  last_edited_by_table: 'user',
  last_edited_by_id: ''
} as Block

test('returns null for empty url', () => {
  expect(defaultMapImageUrl('', mockBlock)).toBe(null)
})

test('returns data URLs as-is', () => {
  expect(defaultMapImageUrl('data:image/png;base64,abc', mockBlock)).toBe('data:image/png;base64,abc')
})

test('returns unsplash URLs as-is', () => {
  expect(defaultMapImageUrl('https://images.unsplash.com/photo-123', mockBlock)).toBe(
    'https://images.unsplash.com/photo-123'
  )
})

test('proxies notion-static URLs through notion.so', () => {
  const url = 'https://www.notion.so/image/test.jpg'
  const result = defaultMapImageUrl(url, mockBlock)
  expect(result).toContain('notion.so')
})

test('returns external HTTPS URLs as-is (no proxy)', () => {
  const externalUrls = [
    'https://opengraph.githubassets.com/abc/repo',
    'https://cdn.example.com/image.jpg',
    'https://roadmap.sh/og-image.png',
    'https://velog.velcdn.com/images/test.jpg',
    'https://developer.mozilla.org/favicon.ico'
  ]
  for (const url of externalUrls) {
    const result = defaultMapImageUrl(url, mockBlock)
    expect(result).toBe(url)
  }
})

test('still proxies notion.so relative paths', () => {
  const result = defaultMapImageUrl('/images/page-cover/test.jpg', mockBlock)
  expect(result).toContain('notion.so')
})

test('still proxies S3 notion-static URLs without signatures', () => {
  const url = 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/image.jpg'
  const result = defaultMapImageUrl(url, mockBlock)
  expect(result).toContain('notion.so')
})
