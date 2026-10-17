import React from 'react'

import { getTextContent } from '@texonom/nutils'

import { useNotionContext } from '../context'

import type { Block } from '@texonom/ntypes'

/**
 * A text block the owner can edit in place.
 *
 * Rendered only in edit mode (`ctx.editable`); the public render path keeps using
 * `<Text>`, so a page nobody is editing is byte-identical to before. The content
 * is written once on mount and then left uncontrolled: React never reconciles the
 * contentEditable node, so the caret is never reset while someone is typing. On
 * blur the plain text is handed to `onChangeBlock`, which the host persists — this
 * package stays a renderer and never writes anything itself.
 */
export const EditableText: React.FC<{ block: Block }> = ({ block }) => {
  const { onChangeBlock } = useNotionContext()
  const ref = React.useRef<HTMLSpanElement>(null)
  const initial = React.useMemo(() => getTextContent(block.properties?.title ?? []), [block.id])

  React.useEffect(() => {
    // Mount only. The host re-renders from the overlay it just saved, and echoing
    // the value back into a contentEditable node would fight the user's caret.
    if (ref.current && ref.current.textContent !== initial) ref.current.textContent = initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        const next = event.currentTarget.textContent ?? ''
        if (next !== initial) onChangeBlock?.(block.id, next)
      }}
    />
  )
}
