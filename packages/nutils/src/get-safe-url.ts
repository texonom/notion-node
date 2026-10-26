/** URLs from record maps are untrusted, including mapped and signed URLs. */
export function getSafeUrl(value: unknown, kind: 'link' | 'embed' = 'link'): string | undefined {
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f\\]/.test(value)) return undefined
  const url = value.trim()
  if (!url) return undefined

  try {
    const parsed = new URL(url, 'https://notion.invalid/')
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return url
    if (kind === 'link' && (parsed.protocol === 'mailto:' || parsed.protocol === 'tel:')) return url
  } catch {
    // Invalid URLs have no navigation or embedding behavior.
  }
  return undefined
}
