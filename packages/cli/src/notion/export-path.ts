import { isAbsolute, relative, resolve } from 'path'
import { getCanonicalPageId } from '@texonom/nutils'
import type { ExtendedRecordMap } from '@texonom/ntypes'

const pageIdPattern = /^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i
const unsafeFilename = /[<>:"/\\|?*\u0000-\u001f\u007f]/

export function assertExportPageId(id: string): void {
  if (typeof id !== 'string' || !pageIdPattern.test(id)) throw new Error('Invalid export page ID')
}

export function exportPageName(id: string, recordMap: ExtendedRecordMap): string {
  assertExportPageId(id)
  const name = getCanonicalPageId(id, recordMap)
  // Keep friendly names when possible, with a validated UUID as a stable fallback.
  if (!name || unsafeFilename.test(name) || name.startsWith('.') || Buffer.byteLength(name) > 240)
    return id.replace(/-/g, '')
  return name
}

export function exportPath(folder: string, ...segments: string[]): string {
  for (const segment of segments)
    if (!segment || segment === '.' || segment === '..' || unsafeFilename.test(segment))
      throw new Error('Invalid export path segment')

  const root = resolve(folder)
  const target = resolve(root, ...segments)
  const child = relative(root, target)
  if (!child || child === '..' || child.startsWith('../') || isAbsolute(child))
    throw new Error('Export path must stay inside its output directory')
  return target
}
