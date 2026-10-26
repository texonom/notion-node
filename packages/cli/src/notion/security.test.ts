import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotionExporter } from './index'
import { exportPageName, exportPath } from './export-path'
import type { ExtendedRecordMap } from '@texonom/ntypes'

const root = '11111111-1111-4111-8111-111111111111'
const child = '22222222-2222-4222-8222-222222222222'
const foreign = '33333333-3333-4333-8333-333333333333'
const folders: string[] = []
const temp = async () => {
  const folder = await mkdtemp(join(tmpdir(), 'notion-export-security-'))
  folders.push(folder)
  return folder
}
afterEach(async () => {
  await Promise.all(folders.splice(0).map(folder => rm(folder, { recursive: true, force: true })))
})

const fixture = (slug = 'friendly') =>
  ({
    block: {
      [root]: {
        value: {
          id: root,
          type: 'page',
          space_id: 'workspace',
          parent_id: 'collection',
          parent_table: 'collection',
          properties: { title: [['Root']], slug: [[slug]] },
          content: [child]
        }
      },
      [child]: {
        value: {
          id: child,
          type: 'text',
          space_id: 'workspace',
          parent_id: root,
          parent_table: 'block',
          properties: { title: [['reference', [['p', foreign]]]] }
        }
      },
      [foreign]: {
        value: {
          id: foreign,
          type: 'page',
          space_id: 'elsewhere',
          parent_id: 'outside',
          properties: { title: [['SECRET PAGE TITLE']] }
        }
      }
    },
    collection: {
      collection: {
        value: {
          id: 'collection',
          parent_id: 'outside',
          parent_table: 'block',
          schema: { slug: { name: 'slug', type: 'text' } }
        }
      }
    },
    collection_view: {},
    collection_query: {},
    notion_user: {},
    signed_urls: {}
  }) as unknown as ExtendedRecordMap

describe('export paths', () => {
  it.each(['../../escape', '/tmp/escape', '..\\..\\escape', 'C:\\escape', 'bad\u0000name', '../.github/workflows/pwn'])(
    'confines slug %s to a safe filename',
    slug => {
      const filename = exportPageName(root, fixture(slug))
      expect(filename).toBe(root.replace(/-/g, ''))
      expect(exportPath('/tmp/output', `${filename}.md`)).toBe(`/tmp/output/${filename}.md`)
    }
  )
  it('preserves safe slugs and rejects cache IDs and table paths', () => {
    expect(exportPageName(root, fixture('friendly'))).toBe(`friendly-${root.replace(/-/g, '')}`)
    expect(() => exportPageName('../../outside', fixture())).toThrow(/page ID/)
    expect(() => exportPath('/tmp/output', 'recordMap', '../../outside.json')).toThrow(/path/)
    expect(() => exportPath('/tmp/output', '..')).toThrow(/path/)
  })
  it('writes raw pages inside the output and keeps validation instance-local', async () => {
    const folder = await temp()
    const exporter = new NotionExporter({ page: root, folder, validation: false })
    exporter.pageMap = { [root]: fixture('../../escape') }
    new NotionExporter({ page: root, validation: true })
    await exporter.saveRawPage(root)
    const filename = `${root.replace(/-/g, '')}.json`
    expect(await readdir(folder)).toEqual([filename])
    expect(JSON.parse(await readFile(join(folder, filename), 'utf8')).block[root].value.id).toBe(root)
    await expect(exporter.exportMd(`../../${root}`)).rejects.toThrow(/page ID/)
    await expect(exporter.saveJson(['recordMap', '../../outside'], {})).rejects.toThrow(/path/)
  })
})

describe('scoped exporter output', () => {
  it('preserves reusable, concurrent record-map-only conversion for Texonom embeddings', async () => {
    const exporter = new NotionExporter({ page: '', token: 'must-not-be-used' })
    const input = fixture()
    input.block[foreign].value.content = []
    const getPage = vi.spyOn(exporter.notion, 'getPage').mockRejectedValue(new Error('Unexpected network request'))
    const getBlocks = vi.spyOn(exporter.notion, 'getBlocks').mockRejectedValue(new Error('Unexpected network request'))
    const [first, second, repeated] = await Promise.all([
      exporter.pageToMarkdown(root, input),
      exporter.pageToMarkdown(foreign, input),
      exporter.pageToMarkdown(root, input)
    ])
    expect(first).toContain('Title: Root')
    expect(first).toContain('SECRET PAGE TITLE') // explicitly supplied mention metadata remains usable
    expect(second).toContain('Title: SECRET PAGE TITLE')
    expect(repeated).toBe(first)
    expect(getPage).not.toHaveBeenCalled()
    expect(getBlocks).not.toHaveBeenCalled()
    await expect(exporter.execute()).rejects.toThrow(/page ID/)
  })

  it('exports every contained page and waits for recursive Markdown writes', async () => {
    const folder = await temp()
    const input = fixture()
    input.block[child].value = {
      ...input.block[child].value,
      type: 'page',
      properties: { title: [['Child']] }
    } as (typeof input.block)[string]['value']
    const exporter = new NotionExporter({ page: root, folder, md: folder, validation: false, recursive: true })
    vi.spyOn(exporter.notion, 'getPage').mockResolvedValue(input)
    vi.spyOn(exporter.notion, 'getBlocks').mockRejectedValue(new Error('No missing contained blocks'))
    await exporter.execute()
    const files = await readdir(folder)
    expect(files.sort()).toEqual([`child-${child.replace(/-/g, '')}.md`, `root-${root.replace(/-/g, '')}.md`])
    expect(await readFile(join(folder, files[0]), 'utf8')).toContain('Title: Child')
  })

  it('does not hydrate referenced pages with its token or include them in Markdown', async () => {
    const folder = await temp()
    const exporter = new NotionExporter({ page: root, folder, md: folder, token: 'test-token', validation: false })
    const getPage = vi.spyOn(exporter.notion, 'getPage').mockResolvedValue(fixture())
    const getBlocks = vi.spyOn(exporter.notion, 'getBlocks').mockRejectedValue(new Error('Unexpected reference fetch'))
    await exporter.execute()
    expect(getPage).toHaveBeenCalledWith(root, { fetchFullInfo: false, fetchCollections: false, signFileUrls: false })
    expect(getBlocks).not.toHaveBeenCalled()
    const files = await readdir(folder)
    expect(files).toHaveLength(1)
    const markdown = await readFile(join(folder, files[0]), 'utf8')
    expect(markdown).toContain('reference')
    expect(markdown).not.toContain('SECRET PAGE TITLE')
    expect(exporter.recordMap.block[foreign]).toBeUndefined()
  })

  it('filters cached records before writing raw output', async () => {
    const folder = await temp()
    const writer = new NotionExporter({ page: root, folder, validation: false })
    writer.recordMap = { ...fixture(), space: {} }
    writer.pageMap = { [root]: fixture(), [foreign]: fixture() }
    writer.pageTree = { id: foreign, title: 'SECRET PAGE TITLE', type: 'page', pages: 1, blocks: 1, children: [] }
    await writer.saveRawSpace()
    const reader = new NotionExporter({ page: root, folder, validation: false, load: true, raw: true, recursive: true })
    vi.spyOn(reader.notion, 'getPage').mockRejectedValue(new Error('Offline cache should not fetch'))
    await reader.execute()
    expect(reader.recordMap.block[foreign]).toBeUndefined()
    expect(Object.keys(reader.pageMap)).toEqual([root])
    expect(reader.pageTree.id).toBe(root)
    expect(await readFile(join(folder, 'recordMap', 'block.json'), 'utf8')).not.toContain('SECRET PAGE TITLE')
    expect(await readFile(join(folder, 'pageMap.json'), 'utf8')).not.toContain('SECRET PAGE TITLE')
  })
})
