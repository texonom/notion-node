import React from 'react'

import { parsePageId } from '@texonom/nutils'

import { useNotionContext } from '../context'
import { Text } from './text'

import type { Block, Decoration } from '@texonom/ntypes'

type Format = NonNullable<Decoration[1]>[number]

/** Formats `Text` draws as elements the editor reads straight back: on/off styles and a colour. */
const READABLE: ReadonlySet<string> = new Set(['b', 'i', 's', 'c', '_', 'h'])

/** A link `Text` draws under a rewritten href; reading that href back would make it a different link. */
const isWorkspaceLink = (value: string, rootDomain?: string) =>
  (value[0] === '/' || (!!rootDomain && value.includes(rootDomain))) && !!parsePageId(value.substring(1), { uuid: true })

/**
 * Whether a piece of a title is kept whole while the owner types: a mention, an
 * equation, a link into the workspace, the lone comma `Text` draws as a gap.
 * It is drawn by `Text` like the rest, inside an element the caret cannot
 * enter, and read back exactly as it was.
 */
export function isTitleIsland(segment: Decoration, rootDomain?: string): boolean {
  const [text, formats] = segment
  if (!formats || formats.length === 0) return text === ','
  return !formats.every(
    format =>
      READABLE.has(format[0]) ||
      (format[0] === 'a' && typeof format[1] === 'string' && !isWorkspaceLink(format[1], rootDomain))
  )
}

const Segments: React.FC<{ title: Decoration[]; block: Block; holdsLine: boolean }> = ({ title, block, holdsLine }) => {
  const { rootDomain } = useNotionContext()
  if (holdsLine) return <br />
  return (
    <>
      {title.map((segment, index) =>
        isTitleIsland(segment, rootDomain) ? (
          <span key={index} contentEditable={false} data-segment={JSON.stringify(segment)}>
            <Text value={[segment]} block={block} />
          </span>
        ) : (
          <Text key={index} value={[segment]} block={block} />
        )
      )}
    </>
  )
}

/**
 * A block title the owner types into where it stands.
 *
 * Drawn by `Text`, segment by segment, so the page looks the same with editing
 * on as off: the only additions are this span and the wrappers around kept
 * pieces, and neither draws anything. React never reconciles the inside, so
 * while the owner types the browser owns the DOM, and neither the caret nor an
 * IME composition is ever reset. The host reads the text back with
 * `readTitle`, writes what it read into `data-title` and hands that title back;
 * a title equal to `data-title` is already on screen and nothing is redrawn.
 * Any other title, an undo or a change made in Notion, redraws it from scratch.
 */
export const EditableText: React.FC<{ block: Block }> = ({ block }) => {
  const title = (block.properties?.title ?? []) as Decoration[]
  // An empty title draws nothing, as it does read-only, unless its line is held
  // open anyway: an empty text block's &nbsp;, or a block the host has just made
  // with an empty title for the caret to stand in.
  const holdsLine =
    title.length === 0 &&
    ((block.type === 'text' && !block.properties && !block.content?.length) || Array.isArray(block.properties?.title))
  const json = JSON.stringify(title)
  const ref = React.useRef<HTMLSpanElement>(null)
  const drawn = React.useRef({ json, version: 0 })
  if (drawn.current.json !== json) {
    const onScreen = ref.current?.getAttribute('data-title') === json
    drawn.current = { json, version: onScreen ? drawn.current.version : drawn.current.version + 1 }
  }
  const { version } = drawn.current
  // Keyed on the version alone: the same element back means React leaves the typed DOM alone.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const content = React.useMemo(() => <Segments title={title} block={block} holdsLine={holdsLine} />, [version])

  return (
    <span
      key={version}
      ref={ref}
      className='notion-text-editable'
      data-block-id={block.id}
      data-title={json}
      contentEditable
      suppressContentEditableWarning
      spellCheck>
      {content}
    </span>
  )
}

/** Notion's colour names, as `Text` puts them in a class: `notion-red`, `notion-red_background`. */
const COLORS: ReadonlySet<string> = new Set([
  'default',
  'gray',
  'brown',
  'orange',
  'yellow',
  'teal',
  'green',
  'blue',
  'purple',
  'pink',
  'red'
])

const colorOf = (className: string): string | undefined => {
  if (!className.startsWith('notion-')) return undefined
  const value = className.slice('notion-'.length)
  return COLORS.has(value.replace(/_background$/, '')) ? value : undefined
}

/** The format an element stands for, as `Text` draws them. */
function formatOf(element: HTMLElement): Format | undefined {
  switch (element.tagName) {
    case 'B':
    case 'STRONG':
      return ['b']
    case 'EM':
    case 'I':
      return ['i']
    case 'S':
    case 'STRIKE':
    case 'DEL':
      return ['s']
    case 'CODE':
      return ['c']
    case 'U':
      return ['_']
    case 'A': {
      const href = element.getAttribute('href')
      return href ? ['a', href] : undefined
    }
    case 'SPAN': {
      if (element.classList.contains('notion-inline-underscore')) return ['_']
      for (const name of Array.from(element.classList)) {
        const color = colorOf(name)
        if (color) return ['h', color] as Format
      }
      return undefined
    }
    default:
      return undefined
  }
}

const islandOf = (node: Node): HTMLElement | undefined =>
  node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).dataset.segment !== undefined
    ? (node as HTMLElement)
    : undefined

/** The last leaf in a title. A line break there only holds the line open for the caret: it is not text. */
function placeholderOf(root: HTMLElement): Node | undefined {
  let leaf: Node = root
  while (leaf.lastChild && !islandOf(leaf)) leaf = leaf.lastChild
  return leaf !== root && leaf.nodeName === 'BR' ? leaf : undefined
}

type Run = { text: string; formats: Format[] } | { island: Decoration }

/**
 * A title read back out of an `EditableText`, in Notion's shape: runs of text
 * with the formats around them, and kept pieces exactly as they were drawn.
 */
export function readTitle(root: HTMLElement): Decoration[] {
  const runs: Run[] = []
  const placeholder = placeholderOf(root)
  const push = (text: string, formats: Format[]) => {
    if (!text) return
    const previous = runs[runs.length - 1]
    if (previous && 'text' in previous && JSON.stringify(previous.formats) === JSON.stringify(formats)) previous.text += text
    else runs.push({ text, formats })
  }
  const walk = (node: Node, formats: Format[]) => {
    if (node.nodeType === Node.TEXT_NODE) {
      push((node as Text).data.replace(/ /g, ' '), formats)
      return
    }
    const island = islandOf(node)
    if (island) {
      runs.push({ island: JSON.parse(island.dataset.segment!) as Decoration })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const element = node as HTMLElement
    if (element.tagName === 'BR') {
      if (element !== placeholder) push('\n', formats)
      return
    }
    // A line the browser wrapped in a block of its own starts with a line break.
    if ((element.tagName === 'DIV' || element.tagName === 'P') && element.previousSibling) push('\n', formats)
    const own = formatOf(element)
    const inner = own ? [...formats, own] : formats
    for (const child of Array.from(element.childNodes)) walk(child, inner)
  }
  for (const child of Array.from(root.childNodes)) walk(child, [])
  // Notion stores a segment's formats innermost first; the walk met them outermost first.
  return runs.map(run =>
    'island' in run
      ? run.island
      : run.formats.length > 0
        ? ([run.text, [...run.formats].reverse()] as Decoration)
        : ([run.text] as Decoration)
  )
}

/** Text nodes, islands and line breaks, in order: the pieces a title's characters live in. */
function unitsOf(root: HTMLElement): Node[] {
  const units: Node[] = []
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE || islandOf(node) || node.nodeName === 'BR') units.push(node)
    else if (node.nodeType === Node.ELEMENT_NODE) for (const child of Array.from(node.childNodes)) walk(child)
  }
  for (const child of Array.from(root.childNodes)) walk(child)
  return units
}

/** How many of the title's characters a piece holds: an island its text, a line break one, the placeholder none. */
function lengthOf(unit: Node, placeholder: Node | undefined): number {
  if (unit.nodeType === Node.TEXT_NODE) return (unit as Text).data.length
  const island = islandOf(unit)
  if (island) return (JSON.parse(island.dataset.segment!) as Decoration)[0].length
  return unit === placeholder ? 0 : 1
}

const indexIn = (node: Node) => Array.prototype.indexOf.call(node.parentNode!.childNodes, node) as number

/**
 * Where a DOM position falls in a title, counted in the title's characters.
 * A position inside an island counts as just past it: the caret cannot stand in one.
 */
export function titleOffset(root: HTMLElement, node: Node, offset: number): number {
  const island = (node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement)?.closest(
    '[data-segment]'
  )
  if (island && island !== root && root.contains(island)) {
    node = island.parentNode!
    offset = indexIn(island) + 1
  }
  const placeholder = placeholderOf(root)
  let total = 0
  for (const unit of unitsOf(root)) {
    if (unit === node) return total + Math.min(offset, lengthOf(unit, placeholder))
    const range = root.ownerDocument.createRange()
    range.selectNode(unit)
    const past = range.comparePoint(node, offset) > 0 || (node === range.endContainer && offset === range.endOffset)
    if (!past) return total
    total += lengthOf(unit, placeholder)
  }
  return total
}

/** The DOM position for a character offset in a title; just past an island when the offset meets one. */
export function titlePosition(root: HTMLElement, offset: number): { node: Node; offset: number } {
  const placeholder = placeholderOf(root)
  let remaining = Math.max(0, offset)
  let last: Node | undefined
  for (const unit of unitsOf(root)) {
    const length = lengthOf(unit, placeholder)
    if (unit.nodeType === Node.TEXT_NODE) {
      if (remaining <= length) return { node: unit, offset: remaining }
    } else if (remaining === 0) return { node: unit.parentNode!, offset: indexIn(unit) }
    remaining -= length
    if (unit !== placeholder) last = unit
  }
  if (last) return { node: last.parentNode!, offset: indexIn(last) + 1 }
  return { node: root, offset: 0 }
}

/** Select a range of a title's characters; with no end, place the caret. */
export function selectTitle(root: HTMLElement, start: number, end = start) {
  const selection = root.ownerDocument.getSelection()
  if (!selection) return
  const from = titlePosition(root, start)
  const to = end === start ? from : titlePosition(root, end)
  const range = root.ownerDocument.createRange()
  range.setStart(from.node, from.offset)
  range.setEnd(to.node, to.offset)
  selection.removeAllRanges()
  selection.addRange(range)
}
