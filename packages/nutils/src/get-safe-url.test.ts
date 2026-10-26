import { describe, expect, it } from 'vitest'
import { getSafeUrl } from './get-safe-url'

describe('record-map URL policy', () => {
  it.each([
    'javascript:alert(1)',
    ' JaVaScRiPt:alert(1) ',
    'java\tscript:alert(1)',
    '\njavascript:alert(1)',
    'java\r\nscript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:image/svg+xml,<svg onload="alert(1)"/>',
    'file:///etc/passwd',
    'blob:https://example.com/id',
    '\\evil.test\\path',
    '\u0000https://example.com',
    'https://',
    '',
    null,
    undefined
  ])('rejects an active or invalid URL: %s', value => {
    expect(getSafeUrl(value)).toBeUndefined()
    expect(getSafeUrl(value, 'embed')).toBeUndefined()
  })

  it.each([
    'https://example.com/a?q=1#b',
    'HTTP://example.com',
    '/page',
    '../page',
    '#section',
    '?view=1',
    '//example.com/embed'
  ])('preserves web URLs and relative navigation: %s', value => {
    expect(getSafeUrl(value)).toBe(value)
    expect(getSafeUrl(value, 'embed')).toBe(value)
  })

  it.each(['mailto:person@example.com', 'tel:+821012345678'])('allows contact links only in anchors: %s', value => {
    expect(getSafeUrl(value)).toBe(value)
    expect(getSafeUrl(value, 'embed')).toBeUndefined()
  })
})
