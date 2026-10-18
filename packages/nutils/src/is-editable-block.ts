import type { Decoration } from '@texonom/ntypes'

/**
 * Block types whose title an on-page editor replaces as plain text.
 *
 * The renderer that draws the editor and a host that stores the edits read the
 * same list, so an edit can only land on a block the page can show it on.
 */
export const EDITABLE_BLOCK_TYPES: ReadonlySet<string> = new Set([
  'text',
  'header',
  'sub_header',
  'sub_sub_header',
  'bulleted_list',
  'numbered_list'
])

/**
 * A title a plain-text edit can replace without losing anything.
 *
 * Bold, a link, a mention or an inline equation lives in a segment's second
 * element, and replacing a title that carries one would silently drop it.
 */
export const isPlainTitle = (title: unknown): title is Decoration[] =>
  Array.isArray(title) &&
  title.every(
    segment =>
      Array.isArray(segment) &&
      typeof segment[0] === 'string' &&
      (segment[1] === undefined || (Array.isArray(segment[1]) && segment[1].length === 0))
  )

/** Whether a block's title can be edited in place as plain text. */
export const isEditableBlock = (block: { type: string; properties?: Record<string, unknown> }): boolean =>
  EDITABLE_BLOCK_TYPES.has(block.type) && isPlainTitle(block.properties?.title)

/** Formats a rich-text editor reads and writes as they are: on/off styles, and a colour or a link with its value. */
export const TITLE_STYLES: ReadonlySet<string> = new Set(['b', 'i', 's', 'c', '_'])

/** Inline objects carried through an edit untouched and written back by the API: a page mention, a user mention, an equation. */
export const TITLE_INLINES: ReadonlySet<string> = new Set(['p', 'u', 'e'])

/**
 * Whether a title survives being edited and written back to Notion unchanged.
 *
 * Saving a block writes its whole rich text, so anything the write cannot carry
 * would be erased by the first keystroke: a comment highlight, a date mention,
 * a link preview. A block whose title has one stays read-only. An empty title
 * is trivially safe.
 */
export function isRoundTrippableTitle(title: unknown): boolean {
  if (title === undefined) return true
  if (!Array.isArray(title)) return false
  return title.every(segment => {
    if (!Array.isArray(segment) || typeof segment[0] !== 'string' || segment.length > 2) return false
    if (segment[1] === undefined) return true
    if (!Array.isArray(segment[1])) return false
    let inlines = 0
    for (const format of segment[1]) {
      if (!Array.isArray(format) || typeof format[0] !== 'string') return false
      const [code, value] = format
      if (TITLE_STYLES.has(code)) continue
      if ((code === 'h' || code === 'a') && typeof value === 'string') continue
      if (TITLE_INLINES.has(code) && typeof value === 'string') {
        inlines++
        continue
      }
      return false
    }
    return inlines <= 1
  })
}

/**
 * Block types the page lets the owner type into where they stand, formatting
 * and all. Wider than `EDITABLE_BLOCK_TYPES`, which is for replacing a title
 * with plain text from outside the page.
 */
export const IN_PLACE_BLOCK_TYPES: ReadonlySet<string> = new Set([...EDITABLE_BLOCK_TYPES, 'to_do', 'toggle', 'quote'])

/**
 * Whether the page draws a block's title for typing into. The renderer and the
 * host that saves read this one rule, so nothing typed lands where it cannot
 * be written back.
 */
export const isEditableInPlace = (block: { type: string; properties?: Record<string, unknown> }): boolean =>
  IN_PLACE_BLOCK_TYPES.has(block.type) && isRoundTrippableTitle(block.properties?.title)
