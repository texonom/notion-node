import { NotionAPI } from '@texonom/nclient'
import {
  getBlockTitle,
  getCanonicalPageId,
  parsePageId,
  formatDate,
  getTextContent,
  getBlockParent,
  defaultMapImageUrl,
  getAllInSpace,
  getPageTitle,
  recursivePageTree,
  getPageSync,
  getBlockCollectionId,
  getRecordMapScope,
  scopeRecordMap
} from '@texonom/nutils'
import { join } from 'path'
import { mkdir, readFile } from 'fs/promises'
import JSONStream from 'JSONStream'
import fs from 'graceful-fs'
import { promisify } from 'util'
import { execSync } from 'child_process'
import stream from 'stream'
import { format } from 'prettier'
import { isCollection, isSpace } from '@texonom/ntypes'
import { assertExportPageId, exportPageName, exportPath } from './export-path'

import type { PageTree } from '@texonom/nutils'
import type { ExtendedRecordMap, PageMap, PageBlock, Block, Decoration, CollectionViewBlock } from '@texonom/ntypes'

const writeFile = promisify(fs.writeFile)

export const getBlockLink = (blockId: string, recordMap: ExtendedRecordMap, domain = 'https://texonom.com') =>
  `${domain}/${getCanonicalPageId(blockId, recordMap)}`

export type Markdown = {
  [attre in string]: string
}

export class NotionExporter {
  notion: NotionAPI
  recordMap: ExtendedRecordMap
  pageTree: PageTree
  pageMap: PageMap
  promises: Promise<unknown>[] = []
  private scopedBlockIds?: Set<string>
  private exportedPageIds = new Set<string>()

  // Options
  folder: string = 'texonom-raw'
  md: string = 'texonom-md'
  domain: string = 'https://texonom.com'
  validation: boolean = true
  update: boolean = false
  page: string
  recursive: boolean = false
  prefetch: boolean = false
  load: boolean = false
  raw: boolean = false
  dataset: boolean = false
  push: boolean = false
  debug: boolean = false
  wait: number = 5
  token: string | undefined

  constructor(options: {
    folder?: string
    validation?: boolean
    update?: boolean
    page: string
    recursive?: boolean
    prefetch?: boolean
    md?: string
    domain?: string
    load?: boolean
    raw?: boolean
    dataset?: boolean
    token?: string
    push?: boolean
  }) {
    this.page = parsePageId(options.page)
    if (options.page) assertExportPageId(this.page)
    this.folder = options.folder ?? this.folder
    this.domain = options.domain ?? this.domain
    this.md = options.md ?? this.md
    this.validation = options.validation ?? this.validation
    this.update = options.update ?? this.update
    this.recursive = options.recursive ?? this.recursive
    this.prefetch = options.prefetch ?? this.prefetch
    this.load = options.load ?? this.load
    this.raw = options.raw ?? this.raw
    this.dataset = options.dataset ?? this.dataset
    this.token = options.token
    this.push = options.push ?? this.push

    this.notion = new NotionAPI({ authToken: this.token })
  }

  async execute() {
    const id = parsePageId(this.page)
    assertExportPageId(id)

    // Load
    if (this.load) {
      console.time('Load raw data')
      await this.loadRaw()
      console.timeEnd('Load raw data')
    }
    if (this.prefetch || (!this.load && this.recursive)) {
      console.time('Fetch raw data')
      await this.fetchRawSpace(id)
      console.timeEnd('Fetch raw data')
    }

    // Save
    if (this.raw) {
      console.time('Export raw files')
      if (this.recursive) await this.saveRawSpace()
      else await this.saveRawPage(id)
      console.timeEnd('Export raw files')
    }
    // Export
    else {
      console.time('Extract markdown')
      await this.exportMd(id)
      console.timeEnd('Extract markdown')
      const pageTree = {
        id: this.page,
        title: getBlockTitle(this.recordMap.block[this.page].value, this.recordMap),
        blocks: 1,
        pages: 1,
        children: [],
        type: 'page'
      }
      recursivePageTree(this.recordMap, pageTree)
      this.pageTree = pageTree
    }
    // Recursive exports may enqueue more work while an earlier batch runs.
    for (let completed = 0; completed < this.promises.length;) {
      const pending = this.promises.slice(completed)
      completed = this.promises.length
      await Promise.all(pending)
    }
    // Update
    if (this.update)
      if (this.recursive) await this.saveRawSpace()
      else await this.saveRawPage(id)
  }

  async loadRaw() {
    const { recordMap } = await loadRaw(this.folder)
    this.recordMap = scopeRecordMap(recordMap, this.page)
    this.scopedBlockIds = new Set(Object.keys(this.recordMap.block))
    this.pageMap = {}
    for (const [id, entry] of Object.entries(this.recordMap.block))
      if (entry.value.type === 'page' || entry.value.type === 'collection_view_page')
        this.pageMap[id] = await getPageSync(id, this.recordMap, this.notion.getBlocks.bind(this.notion), {
          followReferences: false,
          fetchMissing: false
        })
    this.pageTree = recursivePageTree(this.recordMap, {
      id: this.page,
      title: getBlockTitle(this.recordMap.block[this.page].value, this.recordMap),
      type: 'page',
      blocks: 1,
      pages: 1,
      children: []
    })
  }

  async fetchRawSpace(startPage: string) {
    const { recordMap, pageTree, pageMap } = await getAllInSpace(
      startPage,
      (id, options) =>
        this.notion.getPage(id, { ...options, fetchFullInfo: false, fetchCollections: false, signFileUrls: false }),
      this.notion.getBlocks.bind(this.notion),
      this.notion.fetchCollections.bind(this.notion),
      {
        startRecordMap: this.recordMap,
        collectionConcurrency: 100,
        concurrency: 100,
        fetchOption: { timeout: 10000 },
        debug: this.debug
      }
    )
    this.pageMap = pageMap
    this.recordMap = recordMap
    this.scopedBlockIds = new Set(Object.keys(recordMap.block))
    this.pageTree = pageTree
  }

  private async fetchScopedPage(id: string) {
    assertExportPageId(id)
    const recordMap = await this.notion.getPage(id, { fetchFullInfo: false, fetchCollections: false, signFileUrls: false })
    const rootSpaceId = this.recordMap?.block[this.page]?.value.space_id
    const scope = getRecordMapScope(recordMap, id, rootSpaceId)
    const collectionBlocks = [...scope.blocks].filter(blockId => {
      const block = recordMap.block[blockId].value
      return (
        (block.type === 'collection_view' || block.type === 'collection_view_page') &&
        scope.collections.has(getBlockCollectionId(block, recordMap))
      )
    })
    if (collectionBlocks.length) await this.notion.fetchCollections(collectionBlocks, recordMap)
    const scoped = scopeRecordMap(recordMap, id, rootSpaceId)
    this.scopedBlockIds ??= new Set(Object.keys(scoped.block))
    return scoped
  }

  async saveRawSpace() {
    if (this.validation) return
    await mkdir(this.folder, { recursive: true })
    const promises = []
    await mkdir(join(this.folder, 'recordMap'), { recursive: true })
    for (const table in this.recordMap) promises.push(this.saveJson(['recordMap', table], this.recordMap[table]))
    promises.push(this.saveJson(['pageMap'], this.pageMap))
    promises.push(this.saveJson(['pageTree'], this.pageTree))
    await Promise.all(promises)
  }

  async saveJson(segments: string[], object: Record<string, unknown>) {
    if (this.validation) return
    const filename = segments[segments.length - 1]
    const outputStream = fs.createWriteStream(exportPath(this.folder, ...segments.slice(0, -1), `${filename}.json`))
    const transformStream = JSONStream.stringifyObject()
    const completion = promisify(stream.pipeline)(transformStream, outputStream)
    // @ts-ignore
    for (const key in object) transformStream.write([key, object[key]])
    transformStream.end()
    await completion
  }

  async saveRawPage(id: string) {
    assertExportPageId(id)
    if (this.validation) return
    await mkdir(this.folder, { recursive: true })
    const recordMap = this.pageMap?.[id] ?? (await this.fetchScopedPage(id))
    const filename = exportPageName(id, recordMap)
    let target = JSON.stringify(recordMap)
    const ext = 'json'
    target = await format(target, { parser: 'json' })
    await this.writeFile(exportPath(this.folder, `${filename}.${ext}`), target)
  }

  async writeFile(path: string, target: string) {
    if (this.validation || !this.folder) return
    else await writeFile(path, target)
  }

  async exportMd(id: string) {
    assertExportPageId(id)
    if ((this.scopedBlockIds && !this.scopedBlockIds.has(id)) || this.exportedPageIds.has(id)) return
    this.exportedPageIds.add(id)
    await mkdir(this.md, { recursive: true })
    try {
      let recordMap = this.pageMap && this.pageMap[id]
      if (!recordMap) {
        console.warn(`Missing from pageMap ${id}`)
        recordMap = await this.fetchScopedPage(id)
      }
      if (!this.recursive) this.recordMap = recordMap
      try {
        if (!recordMap) recordMap = await this.fetchScopedPage(id)
      } catch {
        return
      }
      if (!['page', 'collection_view_page'].includes(recordMap.block[id].value.type)) throw new Error('Not a page')
      const target = await this.pageToMarkdown(id, recordMap)
      this.pageMap ??= {}
      if (!this.pageMap[id]) this.pageMap[id] = recordMap
      const path = exportPath(this.md, `${exportPageName(id, recordMap)}.md`)
      this.promises.push(this.writeFile(path, target))
    } catch (e) {
      console.error(id, e)
    }
  }

  async pageToMarkdown(id: string, recordMap: ExtendedRecordMap) {
    const markdown = await this.pageToMarkdownObj(id, recordMap)
    let md = `---\nTitle: ${markdown.title}\n`
    md += `Parent: ${markdown.parent}\n`
    const attrs = Object.keys(markdown).filter(key => !['title', 'parent', 'body'].includes(key))
    for (const attr of attrs) md += `${attr}: ${markdown[attr]}\n`
    md += '---\n'
    md += markdown.body
    return md
  }

  async pageToMarkdownObj(id: string, recordMap: ExtendedRecordMap) {
    // An empty root is the existing record-map-only conversion API used by
    // Texonom's embedding pipeline. Each call has its own context, so one
    // converter can render different pages concurrently without sharing scope.
    // Only explicitly supplied records are available; credentials are not used.
    if (!this.page) {
      const converter = new NotionExporter({ page: id })
      converter.recordMap = recordMap
      converter.scopedBlockIds = new Set(Object.keys(recordMap.block))
      return converter.pageToMarkdownObj(id, recordMap)
    }
    if (!this.scopedBlockIds) {
      recordMap = scopeRecordMap(recordMap, this.page)
      this.scopedBlockIds = new Set(Object.keys(recordMap.block))
    }
    if (!this.scopedBlockIds.has(id)) throw new Error('Page is outside the export scope')
    const page = recordMap.block[id].value as PageBlock
    const markdown: Markdown = {}

    // Title
    const title = await this.decorationsToMarkdown(
      page.properties?.title ? page.properties.title : [['Untitled']],
      recordMap
    )
    markdown.title = title

    // Parent
    const parentBlock = getBlockParent(page, recordMap)
    let parent: string
    if (isSpace(parentBlock)) parent = parentBlock.name
    else if (isCollection(parentBlock)) parent = getTextContent(parentBlock.name)
    else if (parentBlock) parent = getBlockTitle(parentBlock, recordMap)

    // Collection Attributes
    if (isCollection(parent)) {
      const properties = parent?.schema ? Object.keys(parent.schema) : []
      properties.splice(properties.indexOf('title'), 1)
      for (const property of properties) {
        const propName = parent.schema[property].name
        const propType = parent.schema[property].type
        let value = String()
        switch (propType) {
          case 'text':
            value = page?.properties?.[property]
              ? await this.decorationsToMarkdown(page.properties[property], recordMap)
              : ''
            break
          case 'created_by': {
            const user = await this.getUser(page.created_by_id, recordMap)
            value = user ? user.name : 'Unknown'
            break
          }
          case 'last_edited_by': {
            const user = await this.getUser(page.last_edited_by_id, recordMap)
            value = user ? user.name : 'Unknown'
            break
          }
          case 'created_time':
            value = formatDate(page.created_time)
            break
          case 'last_edited_time':
            value = formatDate(page.last_edited_time)
            break
          default:
            value = ''
        }
        markdown[propName] = value
      }
    }
    const body = await this.childrenToMd(page, recordMap, '', page)
    markdown.body = body
    return markdown
  }

  async childrenToMd(parentBlock: Block, recordMap: ExtendedRecordMap, prefix: string, page: Block) {
    let md = String()
    let numbering = 1
    for (const child of parentBlock.content ? parentBlock.content : []) {
      const childBlock = await this.getBlock(child, recordMap, `${child} from ${getBlockTitle(page, recordMap)}`)
      if (!childBlock) continue

      const title = childBlock?.properties?.title
      switch (childBlock.type) {
        case 'header':
          md += `${prefix}# ${await this.decorationsToMarkdown(title, recordMap)}`
          break
        case 'sub_header':
          md += `${prefix}## ${await this.decorationsToMarkdown(title, recordMap)}`
          break
        case 'sub_sub_header':
          md += `${prefix}### ${await this.decorationsToMarkdown(title, recordMap)}`
          break
        case 'text':
          md += `${prefix}${await this.decorationsToMarkdown(title, recordMap)}`
          break
        case 'bulleted_list':
          md += `${prefix}- ${await this.decorationsToMarkdown(title, recordMap)}`
          break
        case 'numbered_list':
          md += `${prefix}${numbering++}. ${await this.decorationsToMarkdown(title, recordMap)}`
          break
        case 'to_do':
          md += `${prefix}- [ ] ${await this.decorationsToMarkdown(title, recordMap)}`
          break
        case 'toggle':
          md += `${prefix}<details><summary>${prefix}${prefix}${await this.decorationsToMarkdown(
            title,
            recordMap
          )}</summary>\n`
          break
        case 'quote':
          md += (await this.decorationsToMarkdown(title, recordMap, `\n${prefix.trim()}> `)) + '\n'
          break
        case 'code':
          md += `${prefix}\`\`\`type${await this.decorationsToMarkdown(title, recordMap)}\`\`\``
          break
        case 'equation':
          md += `${prefix}$$${await this.decorationsToMarkdown(title, recordMap)}$$`
          break
        case 'callout': {
          md += (await this.decorationsToMarkdown(title, recordMap, `\n${prefix.trim()}> `)) + '\n'
          break
        }
        case 'bookmark': {
          // A bookmark never given a URL has no properties at all, and threw here.
          if (!childBlock.properties?.link) break
          const nesting = `\n${prefix.trim()}> `
          md += `${nesting}[${getTextContent(
            childBlock.properties.title ? childBlock.properties.title : [['Untitled']]
          )}](${getTextContent(childBlock.properties.link)})\n`
          break
        }
        case 'external_object_instance': {
          try {
            const url = childBlock.format.original_url
            const title = childBlock.format.attributes
              ? childBlock.format.attributes.filter(attr => attr.id === 'title')[0]?.values?.[0]
              : url
            if (!url) break
            md += `${prefix}${prefix}[${title}](${url})${prefix}`
            break
          } catch (e) {
            console.error(e, childBlock.id)
            break
          }
        }

        // Collection
        case 'collection_view_page':
        case 'collection_view': {
          const collection = await this.getCollection(
            childBlock as CollectionViewBlock,
            recordMap,
            `${childBlock.id} from ${getPageTitle(recordMap)}`
          )
          if (!collection) continue

          // Generate Table
          md += `${prefix}### ${await this.decorationsToMarkdown(collection.name, recordMap)}`
          md += `${prefix}|Title|\n|:-:|`
          const views = childBlock.view_ids
            .map(id => {
              if (!recordMap.collection_view[id]) if (this.debug) console.warn(`Missing view ${id} from ${collection.name}`)
              return recordMap.collection_view[id]?.value
            })
            .filter(Boolean)
          const children = []
          for (const view of views) {
            const results = await this.getCollectionView(
              collection.id,
              view.id,
              recordMap,
              `${collection.name} ${view.name}`
            )
            if (results) for (const result of results.blockIds) children.push(result)
            else break
          }
          for (const childPage of children) {
            const childBlock = recordMap.block[childPage]?.value
            if (!childBlock) if (this.debug) console.warn(`no ${childPage} in ${collection.name[0]}`)
            md += `${prefix}|[${getBlockTitle(childBlock, recordMap)}](${getBlockLink(childPage, recordMap)})|`
          }

          // Make children page
          if (this.recursive && children.length)
            for (const childPage of children) this.promises.push(this.exportMd(childPage))

          break
        }
        case 'page': {
          md += `${prefix}${prefix}[${getBlockTitle(childBlock, recordMap)}](${getBlockLink(
            childBlock.id,
            recordMap
          )})${prefix}`
          if (this.recursive) this.promises.push(this.exportMd(childBlock.id))

          break
        }
        case 'alias': {
          const aliasBlock = recordMap.block[childBlock.format?.alias_pointer?.id]?.value
          if (!aliasBlock) {
            if (this.debug)
              console.warn(
                `Missing alias ${childBlock.format?.alias_pointer?.id} from ${getBlockTitle(page, recordMap)} ${page.id}`
              )
            continue
          }
          md += `${prefix}${prefix}[${getBlockTitle(aliasBlock, recordMap)}](${getBlockLink(
            aliasBlock.id,
            recordMap
          )})${prefix}`
          break
        }

        // Media
        case 'image': {
          const caption = childBlock.properties.caption ? getTextContent(childBlock.properties.caption) : ''
          md += `${prefix}![${caption}](${defaultMapImageUrl(childBlock.format?.display_source, childBlock)})`
          break
        }

        case 'video':
          md += `${prefix}<video src="${childBlock.format.display_source} />`
          break

        // Embed
        case 'file':
          md += `${prefix}[File](${childBlock.format?.display_source})`
          break
        case 'pdf':
          md += `${prefix}<iframe src="${childBlock.format?.display_source}"/>`
          break

        // Else
        case 'divider':
          md += `${prefix}---`
          break
        case 'column_list':
          break
        case 'column':
          break
        default:
          md += `${prefix}`
      }

      // Finalize
      if (childBlock.content && childBlock.type !== 'page' && childBlock.type !== 'collection_view_page') {
        const nestedPrefix = ['toggle', `transclusion_container`, `transclusion_reference`, 'column_list'].includes(
          childBlock.type
        )
          ? prefix
          : `\n${prefix.trim()}> `
        md += await this.childrenToMd(childBlock, recordMap, nestedPrefix, page)
        if (childBlock.type === 'column') md += '\n'
      }
      if (childBlock.type === 'toggle') md += `${prefix}</details>${prefix}`
    }
    return md
  }

  async decorationsToMarkdown(decos: Decoration[], recordMap: ExtendedRecordMap, prefix = '') {
    if (!decos) return String()
    let md = String()
    for (const deco of decos) {
      let wrapper = String()
      const [text, subdecos] = deco
      if (!subdecos) {
        md += text
      } else {
        let textonly: string = text
        for (const subdeco of subdecos)
          switch (subdeco[0]) {
            case 'p': {
              const blockId = subdeco[1]
              const linkedBlock = await this.getBlock(blockId, recordMap, `"p" ${getPageTitle(recordMap)}`)
              if (!linkedBlock) break

              const title = getBlockTitle(linkedBlock, recordMap)
              const url = getBlockLink(blockId, recordMap)
              textonly = `[${title}](${url})`
              break
            }
            case 'a': {
              const url = subdeco[1]
              textonly = `[${text}](${url})`
              break
            }
            case 'i':
              wrapper += '*'
              break
            case 'b':
              wrapper += '**'
              break
            case 'h':
              // Disable for now == syntax does not supported well
              wrapper += ''
              break
            case 'c':
              wrapper += '`'
              break
            case 's':
              wrapper += '~~'
              break
            case 'e':
              wrapper += '$'
              textonly = subdeco[1]
              break
            case 'eoi': {
              try {
                const objectid = subdeco[1]
                const object = await this.getBlock(objectid, recordMap, `"eoi" ${getPageTitle(recordMap)}`)
                if (!object?.format) break
                const url = object.format.uri
                const title = object.format.attributes
                  ? object.format.attributes?.filter(attr => attr.id === 'title')[0]?.values?.[0]
                  : url
                if (!url) break
                textonly = `[${title}](${url})`
                break
              } catch (e) {
                console.error(e, deco)
                break
              }
            }
            case 'u': {
              const user = await this.getUser(subdeco[1], recordMap)
              if (!user) break
              textonly = `[@${user.name}](mailto:${user.email})`
              break
            }
          }
        let decorated: string = textonly
        if (subdecos.find(subdeco => subdeco[0] === '_')) decorated = `<u>${textonly}</u>`
        decorated = wrapper + decorated + wrapper.split('').reverse().join('')
        md += decorated
      }
    }
    const lines = md.split('\n')
    const prefixed = lines.map(line => prefix + line)
    return prefixed.join('')
  }

  async getBlock(id: string, recordMap: ExtendedRecordMap, message = '') {
    if (!this.scopedBlockIds?.has(id)) return undefined
    let block = recordMap.block[id]?.value
    if (!block && this.recordMap) block = this.recordMap.block[id]?.value
    if (!block && this.debug) console.warn(`${message} Missing block ${id}`)
    if (block) {
      recordMap.block[id] = { value: block, role: 'reader' }
      if (this.recordMap) this.recordMap.block[id] = { value: block, role: 'reader' }
    }
    return block
  }

  async getUser(id: string, recordMap: ExtendedRecordMap) {
    let user = recordMap.notion_user[id]?.value
    if (!user && this.recordMap) user = this.recordMap.notion_user[id]?.value
    try {
      if (!user && this.token) {
        const notion = new NotionAPI({ authToken: this.token })
        const response = await notion.getUsers([id])
        user = response.recordMapWithRoles?.notion_user?.[id]?.value
      }
    } catch {
      if (!user) if (this.debug) console.warn(`Missing user ${id}`)
    }
    if (user) {
      recordMap.notion_user[id] = { value: user, role: 'reader' }
      if (this.recordMap) this.recordMap.notion_user[id] = { value: user, role: 'reader' }
    }
    return user
  }

  async getCollection(collectionViewBlock: CollectionViewBlock, recordMap: ExtendedRecordMap, message = '') {
    const collectionId = collectionViewBlock.collection_id
    let collection = recordMap.collection[collectionViewBlock.collection_id]?.value
    if (!collection && this.recordMap) {
      collection = this.recordMap.collection[collectionId]?.value
      if (collection) {
        recordMap.collection[collectionId] = this.recordMap.collection?.[collectionId]
        for (const viewId of collectionViewBlock.view_ids)
          recordMap.collection_view[viewId] = this.recordMap.collection_view?.[viewId]
      }
    }
    // All collection data must come from the scoped fetch/cache. A linked view
    // must not trigger a credentialed fallback request to its source database.
    await this.getCollectionView(collectionId, collectionViewBlock.view_ids[0], recordMap, message)
    return collection
  }

  async getCollectionView(collectionId: string, viewId: string, recordMap: ExtendedRecordMap, message = '') {
    let results = recordMap.collection_query?.[collectionId]?.[viewId]?.collection_group_results
    if (!results && this.recordMap) {
      results = this.recordMap.collection_query?.[collectionId]?.[viewId]?.collection_group_results
      if (results) {
        recordMap.collection_query![collectionId] = {
          ...recordMap.collection_query![collectionId],
          [viewId]: this.recordMap.collection_query?.[collectionId]?.[viewId]
        }
        this.recordMap.collection_query![collectionId] = {
          ...this.recordMap.collection_query![collectionId],
          [viewId]: this.recordMap.collection_query?.[collectionId]?.[viewId]
        }
        recordMap.collection![collectionId] = {
          ...recordMap.collection![collectionId],
          [viewId]: this.recordMap.collection?.[collectionId]?.[viewId]
        }
        this.recordMap.collection![collectionId] = {
          ...this.recordMap.collection![collectionId],
          [viewId]: this.recordMap.collection?.[collectionId]?.[viewId]
        }
      }
    }
    if (!results && this.debug) console.warn(`${message} Missing collection view ${viewId}`)
    return results
  }

  async getSpace(id: string, recordMap: ExtendedRecordMap) {
    let space = recordMap.space[id]?.value
    if (!space && this.recordMap) space = this.recordMap.space[id]?.value
    try {
      if (!space && this.token) {
        const notion = new NotionAPI({ authToken: this.token })
        const response = await notion.getSpaces([id])
        space = response.recordMapWithRoles?.space?.[id]?.value
        if (space) {
          recordMap.space[id] = { value: space, role: 'reader' }
          if (this.recordMap) this.recordMap.space[id] = { value: space, role: 'reader' }
        }
      }
    } catch {
      if (!space) if (this.debug) console.warn(`Missing space ${id}`)
    }
    return space
  }

  pushRepos() {
    const run = (cmd: string, cwd: string) => {
      try {
        execSync(cmd, { cwd, stdio: 'ignore' })
      } catch {
        // Ignore errors - some commands may fail (e.g., remote already exists)
      }
    }
    const message = new Date().toString()

    // push raw
    run('git init', this.folder)
    run('git add .', this.folder)
    run(`git commit -m "${message}"`, this.folder)
    run('git branch -M main', this.folder)
    run('git remote add origin https://github.com/texonom/texonom-raw.git', this.folder)
    run('git push -u origin main --force', this.folder)

    // push md
    run('git init', this.md)
    run('git add .', this.md)
    run(`git commit -m "${message}"`, this.md)
    run('git branch -M main', this.md)
    run('git remote add origin https://github.com/texonom/texonom-md.git', this.md)
    run('git push -u origin main --force', this.md)
  }
}

export async function loadRaw(
  folder: string
): Promise<{ recordMap: ExtendedRecordMap; pageTree: PageTree; pageMap: PageMap }> {
  const promises = []
  promises.push(readFile(join(folder, 'recordMap', 'block.json'), 'utf8').then(JSON.parse))
  promises.push(readFile(join(folder, 'recordMap', 'collection.json'), 'utf8').then(JSON.parse))
  promises.push(readFile(join(folder, 'recordMap', 'notion_user.json'), 'utf8').then(JSON.parse))
  promises.push(readFile(join(folder, 'recordMap', 'space.json'), 'utf8').then(JSON.parse))
  promises.push(readFile(join(folder, 'recordMap', 'collection_view.json'), 'utf8').then(JSON.parse))
  promises.push(readFile(join(folder, 'recordMap', 'collection_query.json'), 'utf8').then(JSON.parse))
  promises.push(readFile(join(folder, 'recordMap', 'signed_urls.json'), 'utf8').then(JSON.parse))
  promises.push(readFile(join(folder, 'pageTree.json'), 'utf8').then(JSON.parse))

  const [block, collection, notion_user, space, collection_view, collection_query, signed_urls, pageTree] =
    await Promise.all(promises)

  const pageMap = {}
  const inputStream = fs.createReadStream(join(folder, 'pageMap.json'))
  const parseStream = JSONStream.parse('*')
  inputStream.pipe(parseStream)
  parseStream.on('data', (recordMap: ExtendedRecordMap) => {
    const key = Object.keys(recordMap.block)[0]
    pageMap[key] = recordMap
  })
  await new Promise(res => stream.finished(parseStream, err => res(err)))
  const recordMap: ExtendedRecordMap = {
    block,
    collection,
    notion_user,
    space,
    collection_query,
    collection_view,
    signed_urls
  }
  return { recordMap, pageTree, pageMap }
}

export async function loadJson<C>(folder: string, filename: string): Promise<C> {
  const object = {} as C
  const inputStream = fs.createReadStream(join(folder, `${filename}.json`))
  const parseStream = JSONStream.parse('*')
  inputStream.pipe(parseStream)
  parseStream.on('*', ([key, value]) => {
    object[key] = value
  })
  return new Promise(res =>
    stream.finished(parseStream, err => {
      console.error(err)
      res(object)
    })
  )
}
