import React from 'react'

import { getTextContent } from '@texonom/nutils'

import { useNotionContext } from '../context'

import type { Block, Decoration } from '@texonom/ntypes'

/**
 * A title the plain-text editor can round-trip.
 *
 * Any formatting — bold, a link, a mention, an inline equation — lives in a
 * segment's second element. The editor edits plain text, so saving a formatted
 * title would silently drop everything it does not show; those titles stay
 * read-only in edit mode instead.
 */
export const isPlainTitle = (title: Decoration[] | undefined): boolean =>
  Array.isArray(title) &&
  title.every(segment => {
    const formats = segment.length > 1 ? (segment as unknown as [string, unknown[]])[1] : undefined
    return !formats || formats.length === 0
  })

/**
 * A text block the owner can edit in place.
 *
 * Rendered only in edit mode (`ctx.editable`) and only for plain titles; the
 * public render path keeps using `<Text>`, so a page nobody edits is
 * byte-identical to before. The node is uncontrolled: React never reconciles
 * it, so the caret is never reset while someone is typing. On blur the plain
 * text is handed to `onChangeBlock`, which the host persists — this package
 * stays a renderer and never writes anything itself.
 */
export const EditableText: React.FC<{ block: Block }> = ({ block }) => {
  const { onChangeBlock } = useNotionContext()
  const ref = React.useRef<HTMLSpanElement>(null)
  const text = getTextContent(block.properties?.title ?? [])
  // The last value written into the node or reported to the host, not the value
  // at mount: an edit and a later undo back to the original are both changes.
  const reported = React.useRef<string | null>(null)

  React.useEffect(() => {
    // On mount, and again when the title moves under the editor — the host
    // dropped an edit — but never into a focused node, where it would reset the
    // caret mid-word. innerText, not textContent, so a soft line break survives
    // the round trip as `\n` instead of collapsing the lines together.
    const node = ref.current
    if (!node || text === reported.current || node === document.activeElement) return
    node.innerText = text
    reported.current = text
  }, [text])

  return (
    <span
      ref={ref}
      className='notion-text-editable'
      role='textbox'
      aria-multiline='true'
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={event => {
        // contentEditable leaves a trailing break behind after editing; it is
        // not content, and keeping it would report an edit nobody made.
        const next = event.currentTarget.innerText.replace(/\n+$/, '')
        if (next === reported.current) return
        reported.current = next
        onChangeBlock?.(block.id, next)
      }}
    />
  )
}
