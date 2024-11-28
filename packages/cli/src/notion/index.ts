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
  getPageTitle
} from '@texonom/nutils'
import { join } from 'path'
import { mkdir, readFile } from 'fs/promises'
import JSONStream from 'JSONStream'
import fs from 'graceful-fs'
import { promisify } from 'util'
import stream from 'stream'
import { format } from 'prettier'
import { isCollection, isSpace } from '@texonom/ntypes'

import type { PageTree } from '@texonom/nutils'
import type { ExtendedRecordMap, PageMap, PageBlock, Block, Decoration, CollectionViewBlock } from '@texonom/ntypes'

let writeFile = promisify(fs.writeFile)

const getBlockLink = (blockId: string, recordMap: ExtendedRecordMap, domain = 'https://texonom.com') =>
  `${domain}/${getCanonicalPageId(blockId, recordMap)}`

export class NotionExporter {
  notion: NotionAPI
  recordMap: ExtendedRecordMap
  pageTree: PageTree
  pageMap: PageMap
  promises: Promise<unknown>[] = []

  // Options
  folder: string = 'data'
  validation: boolean = false
  update: boolean = false
  page: string
  recursive: boolean = false
  prefetch: boolean = false
  load: boolean = false
  raw: boolean = false
  dataset: boolean = false
  token: string | undefined

  constructor(options: {
    folder?: string
    validation?: boolean
    update?: boolean
    page: string
    recursive?: boolean
    prefetch?: boolean
    load?: boolean
    raw?: boolean
    dataset?: boolean
    token?: string
  }) {
    this.page = parsePageId(options.page, { uuid: false })
    this.folder = options.folder ?? this.folder
    this.validation = options.validation ?? this.validation
    this.update = options.update ?? this.update
    this.recursive = options.recursive ?? this.recursive
    this.prefetch = options.prefetch ?? this.prefetch
    this.load = options.load ?? this.load
    this.raw = options.raw ?? this.raw
    this.dataset = options.dataset ?? this.dataset
    this.token = options.token

    this.notion = new NotionAPI({ authToken: this.token })
    if (this.validation) writeFile = async () => {}
  }

  async execute() {
    const id = parsePageId(this.page)

    // Load
    if (this.load) {
      console.time('Load raw data')
      await this.loadRaw()
      console.timeEnd('Load raw data')
    }
    if (this.prefetch) {
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
    }
    await Promise.all(this.promises)
    // Update
    if (this.update)
      if (this.recursive) await this.saveRawSpace()
      else await this.saveRawPage(id)
  }

  async loadRaw() {
    console.time('load prefetch file')
    const promises = []
    promises.push(readFile(join(this.folder, 'recordMap', 'block.json'), 'utf8').then(JSON.parse))
    promises.push(readFile(join(this.folder, 'recordMap', 'collection.json'), 'utf8').then(JSON.parse))
    promises.push(readFile(join(this.folder, 'recordMap', 'notion_user.json'), 'utf8').then(JSON.parse))
    promises.push(readFile(join(this.folder, 'recordMap', 'space.json'), 'utf8').then(JSON.parse))
    promises.push(readFile(join(this.folder, 'recordMap', 'collection_view.json'), 'utf8').then(JSON.parse))
    promises.push(readFile(join(this.folder, 'recordMap', 'collection_query.json'), 'utf8').then(JSON.parse))
    promises.push(readFile(join(this.folder, 'recordMap', 'signed_urls.json'), 'utf8').then(JSON.parse))
    promises.push(readFile(join(this.folder, 'pageTree.json'), 'utf8').then(JSON.parse))

    const [block, collection, notion_user, space, collection_view, collection_query, signed_urls, pageTree] =
      await Promise.all(promises)

    const pageMap = {}
    const inputStream = fs.createReadStream(join(this.folder, 'pageMap.json'))
    const parseStream = JSONStream.parse('*')
    inputStream.pipe(parseStream)
    parseStream.on('data', (recordMap: ExtendedRecordMap) => {
      const key = Object.keys(recordMap.block)[0]
      pageMap[key] = recordMap
    })
    await new Promise(res => stream.finished(parseStream, err => res(err)))
    this.pageMap = pageMap
    this.pageTree = pageTree
    this.recordMap = {
      block,
      collection,
      notion_user,
      space,
      collection_query,
      collection_view,
      signed_urls
    }
    console.timeEnd('load prefetch file')
  }

  async fetchRawSpace(startPage: string) {
    const { recordMap, pageTree, pageMap } = await getAllInSpace(
      startPage,
      this.notion.getPage.bind(this.notion),
      this.notion.getBlocks.bind(this.notion),
      this.notion.fetchCollections.bind(this.notion),
      {
        startRecordMap: this.recordMap,
        collectionConcurrency: 100,
        concurrency: 100,
        fetchOption: { timeout: 10000 }
      }
    )
    this.pageMap = pageMap
    this.recordMap = recordMap
    this.pageTree = pageTree
  }

  async saveRawSpace() {
    if (this.validation) return
    await mkdir(this.folder, { recursive: true })
    const ext = 'json'
    const promises = []
    await mkdir(join(this.folder, 'recordMap'), { recursive: true })
    for (const table in this.recordMap)
      promises.push(this.writeFile(`${join(this.folder, 'recordMap', table)}.${ext}`, JSON.stringify(this.recordMap[table])))

    const outputStream = fs.createWriteStream(`${join(this.folder, 'pageMap')}.${ext}`)
    const transformStream = JSONStream.stringifyObject()
    transformStream.pipe(outputStream)
    // @ts-ignore
    for (const key in this.pageMap) transformStream.write([key, this.pageMap[key]])
    transformStream.end()

    promises.push(this.writeFile(`${join(this.folder, 'pageTree')}.${ext}`, JSON.stringify(this.pageTree)))
    await Promise.all(promises)
  }

  async saveRawPage(id: string) {
    if (this.validation) return
    await mkdir(this.folder, { recursive: true })
    const recordMap = await this.notion.getPage(id)
    const filename = `${getCanonicalPageId(id, recordMap)}`
    let target = JSON.stringify(recordMap)
    const ext = 'json'
    target = await format(target, { parser: 'json' })
    await this.writeFile(`${join(this.folder, filename)}.${ext}`, target)
  }

  async writeFile(path: string, target: string) {
    if (!this.folder) return
    else await writeFile(path, target)
  }

  async exportMd(id: string) {
    try {
      let recordMap = this.pageMap ? this.pageMap[id] : await this.notion.getPage(id)
      if (!this.recursive) this.recordMap = recordMap
      try {
        if (!recordMap) recordMap = await this.notion.getPage(id)
      } catch {
        return
      }
      if (!['page', 'collection_view_page'].includes(recordMap.block[id].value.type)) throw new Error('Not a page')
      const target = await this.pageToMarkdown(id, recordMap)
      const path = join(this.folder, `${getCanonicalPageId(id, recordMap)}`)
      this.promises.push(this.writeFile(`${path}.md`, target))
    } catch (e) {
      console.error(id, e)
    }
  }

  async pageToMarkdown(id: string, recordMap: ExtendedRecordMap) {
    const page = recordMap.block[id].value as PageBlock

    // Metadata
    let md = `---\n`
    md += `Title: ${await this.decorationsToMarkdown(
      page.properties?.title ? page.properties.title : [['Untitled']],
      recordMap
    )}\n`
    const parent = getBlockParent(page, recordMap)
    if (isSpace(parent)) md += `Parent: ${parent.name}\n`
    else if (isCollection(parent)) md += `Parent: ${getTextContent(parent.name)}\n`
    else if (parent) md += `Parent: ${getBlockTitle(parent, recordMap)}\n`

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
        md += `${propName}: ${value}\n`
      }
    }
    md += '---\n'

    return md + (await this.childrenToMd(page, recordMap, '\n', page))
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
          const nesting = `\n${prefix.trim()}> `
          md += `${nesting}[${getTextContent(
            childBlock.properties?.title ? childBlock.properties.title : [['Untitled']]
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
              if (!recordMap.collection_view[id]) console.debug(`Missing view ${id} from ${collection.name}`)
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
            if (!childBlock) console.debug(`no ${childPage} in ${collection.name[0]}`)
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
            console.debug(
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
                if (!object) break
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
    let block = recordMap.block[id]?.value
    if (!block && this.recordMap) block = this.recordMap.block[id]?.value
    try {
      if (!block && this.token) {
        const notion = new NotionAPI({ authToken: this.token })
        const response = await notion.getBlocks([id])
        block = response.recordMap?.block?.[id]?.value
      }
    } catch {
      if (!block) console.debug(`${message} Missing block ${id}`)
    }
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
      if (!user) console.debug(`Missing user ${id}`)
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
    try {
      if (!collection && this.token) {
        const notion = new NotionAPI({ authToken: this.token })
        const response = await notion.getPageRaw(collectionViewBlock.id)
        collection = response.recordMap.collection[collectionId]?.value
        if (collection) {
          recordMap.collection_view = { ...recordMap.collection_view, ...response.recordMap.collection_view }
          recordMap.collection = { ...recordMap.collection, ...response.recordMap.collection }
          recordMap.block = { ...recordMap.block, ...response.recordMap.block }
          this.recordMap.collection_view = { ...this.recordMap.collection_view, ...response.recordMap.collection_view }
          this.recordMap.collection = { ...this.recordMap.collection, ...response.recordMap.collection }
          this.recordMap.block = { ...this.recordMap.block, ...response.recordMap.block }
        }
      }
    } catch {
      if (!collection) console.debug(`${message} Missing collection block ${collectionViewBlock.id}`)
    }
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
        recordMap.collection![collectionId] = {
          ...recordMap.collection![collectionId],
          [viewId]: this.recordMap.collection?.[collectionId]?.[viewId]
        }
      }
    }
    try {
      if (!results && this.token) {
        const notion = new NotionAPI({ authToken: this.token })
        const response = await notion.getCollectionData(collectionId, viewId, recordMap.collection_view[viewId]?.value)
        results = response.result?.reducerResults?.collection_group_results
        if (results) {
          recordMap.collection_query![collectionId] = {
            ...recordMap.collection_query![collectionId],
            [viewId]: response.result?.reducerResults
          }
          if (this.recordMap)
            this.recordMap.collection_query![collectionId] = {
              ...this.recordMap.collection_query![collectionId],
              [viewId]: response.result?.reducerResults
            }
          for (const blockId in response.recordMap.block) {
            const block = response.recordMap.block[blockId].value
            if (block) {
              recordMap.block[blockId] = { value: block, role: 'reader' }
              if (this.recordMap) this.recordMap.block[blockId] = { value: block, role: 'reader' }
            }
          }
          for (const collection in response.recordMap.collection) {
            const collectionValue = response.recordMap.collection[collection].value
            if (collectionValue) {
              recordMap.collection[collection] = { value: collectionValue, role: 'reader' }
              if (this.recordMap) this.recordMap.collection[collection] = { value: collectionValue, role: 'reader' }
            }
          }
          for (const collectionView in response.recordMap.collection_view) {
            const collectionViewValue = response.recordMap.collection_view[collectionView].value
            if (collectionViewValue) {
              recordMap.collection_view[collectionView] = { value: collectionViewValue, role: 'reader' }
              if (this.recordMap)
                this.recordMap.collection_view[collectionView] = { value: collectionViewValue, role: 'reader' }
            }
          }
        }
      }
    } catch {
      if (!results) console.debug(`${message} Missing collection view ${viewId}`)
    }
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
      if (!space) console.debug(`Missing space ${id}`)
    }
    return space
  }
}
