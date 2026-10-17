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
