import { join } from 'path'
import { mkdir, readFile } from 'fs/promises'
import JSONStream from 'JSONStream'
import fs from 'graceful-fs'
import { promisify } from 'util'
import stream from 'stream'

import prettier from 'prettier'

import { Option } from 'clipanion'
import { NotionAPI } from '@texonom/nclient'
import {
  getBlockTitle,
  getPageTitle,
  getCanonicalPageId,
  parsePageId,
  formatDate,
  getTextContent,
  getBlockParent,
  defaultMapImageUrl,
  getAllInSpace
} from '@texonom/nutils'
import { isCollection, isSpace } from '@texonom/ntypes'

import { NotionCommand } from '.'

import type { PageTree } from '@texonom/nutils'
import type { ExtendedRecordMap, Decoration, PageBlock, Block, PageMap } from '@texonom/ntypes'

const writeFile = promisify(fs.writeFile)

export class NotionExportCommand extends NotionCommand {
  static paths = [['export']]
  notion: NotionAPI
  recordMap: ExtendedRecordMap
  pageTree: PageTree
  pageMap: PageMap
  promises: Promise<unknown>[] = []

  folder = Option.String('-o,--output', 'data', {
    description: 'Export folder'
  })
  page = Option.String('-p,--page', {
    required: true,
    description: 'Target page'
  })
  recursive = Option.Boolean('-r,--recursive', {
    description: 'Recursively export children'
  })
  prefetch = Option.Boolean('-f, --prefetch', {
    description: 'Prefetch all space for faster export (recommended for exporting all pages in a space)'
  })
  load = Option.Boolean('-l, --load', {
    description: 'Load datas from exported folder --folder'
  })
  raw = Option.Boolean('--raw', {
    description: 'Export raw recordMap JSON data \n Markdown format do not preserve all information'
  })
  dataset = Option.Boolean('-d, --dataset', {
    description: 'Export as dataset for LLM learning'
  })
  list: string[]
  constructor() {
    super()
  }

  // Execute
  async execute() {
    await super.execute()
    const id = parsePageId(this.page)
    this.notion = new NotionAPI()

    // Prefetch
    if (this.prefetch)
      if (this.load) {
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
        this.recordMap = { block, collection, notion_user, space, collection_query, collection_view, signed_urls }
        console.timeEnd('load prefetch file')
      } else {
        const { recordMap, pageTree, pageMap } = await getAllInSpace(
          id,
          this.notion.getPage.bind(this.notion),
          this.notion.getBlocks.bind(this.notion),
          this.notion.fetchCollections.bind(this.notion)
        )
        this.pageMap = pageMap
        this.recordMap = recordMap
        this.pageTree = pageTree
      }

    // Save
    await mkdir(this.folder, { recursive: true })
    if (this.raw)
      if (this.recursive) {
        if (!this.prefetch) throw new Error('Recursive Raw export requires prefetch option')
        const ext = 'json'
        console.time('write file')
        const promises = []
        await mkdir(join(this.folder, 'recordMap'), { recursive: true })
        for (const table in this.recordMap)
          promises.push(writeFile(`${join(this.folder, 'recordMap', table)}.${ext}`, JSON.stringify(this.recordMap[table])))

        const outputStream = fs.createWriteStream(`${join(this.folder, 'pageMap')}.${ext}`)
        const transformStream = JSONStream.stringifyObject()
        transformStream.pipe(outputStream)
        // @ts-ignore
        for (const key in this.pageMap) transformStream.write([key, this.pageMap[key]])
        transformStream.end()

        promises.push(writeFile(`${join(this.folder, 'pageTree')}.${ext}`, JSON.stringify(this.pageTree)))

        await Promise.all(promises)
        console.timeEnd('write file')
      } else {
        const recordMap = await this.notion.getPage(id)
        const filename = `${getCanonicalPageId(id, recordMap)}`
        let target = JSON.stringify(recordMap)
        const ext = 'json'
        target = await prettier.format(target, { parser: 'json' })
        await writeFile(`${join(this.folder, filename)}.${ext}`, target)
      }
    else this.exportMd(id, this.folder)
    await Promise.all(this.promises)
  }

  async exportMd(id: string, folder: string) {
    try {
      let recordMap = this.prefetch ? this.pageMap[id] : await this.notion.getPage(id)
      if (!recordMap) recordMap = await this.notion.getPage(id)
      if (!['page', 'collection_view_page'].includes(recordMap.block[id].value.type)) throw new Error('Not a page')
      const target = await this.pageToMarkdown(id, recordMap, folder)
      const path = join(folder, `${getCanonicalPageId(id, recordMap)}`)
      this.promises.push(writeFile(`${path}.md`, target))
    } catch (e) {
      console.error(id, e)
    }
  }

  async pageToMarkdown(id: string, recordMap: ExtendedRecordMap, folder: string) {
    const page = recordMap.block[id].value as PageBlock

    // Metadata
    let md = `---\n`
    md += `Title: ${decorationsToMarkdown(page.properties?.title ? page.properties.title : [['Untitled']], recordMap)}\n`
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
            value = page?.properties?.[property] ? decorationsToMarkdown(page.properties[property], recordMap) : ''
            break
          case 'created_by':
            value = recordMap[page.created_by_id] ? recordMap[page.created_by_id].value.name : 'Unknown'
            break
          case 'last_edited_by':
            value = recordMap[page.last_edited_by_id] ? recordMap[page.last_edited_by_id].value.name : 'Unknown'
            break
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

    return md + (await this.childrenToMd(page, recordMap, '\n', folder, page))
  }

  async childrenToMd(parentBlock: Block, recordMap: ExtendedRecordMap, prefix: string, folder: string, page: Block) {
    let md = String()
    let numbering = 1
    for (const child of parentBlock.content ? parentBlock.content : []) {
      let childBlock = recordMap.block[child]?.value
      if (!childBlock && this.prefetch) {
        const newMap = await this.notion.getPage(Object.keys(recordMap.block)[0])
        for (const table in newMap) recordMap[table] = newMap[table]
        childBlock = recordMap.block[child]?.value
      }
      if (!childBlock) {
        console.debug(`Missing block ${child} from ${getBlockTitle(page, recordMap)}`)
        continue
      }

      const title = childBlock?.properties?.title
      switch (childBlock.type) {
        case 'header':
          md += `${prefix}# ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'sub_header':
          md += `${prefix}## ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'sub_sub_header':
          md += `${prefix}### ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'text':
          md += `${prefix}${decorationsToMarkdown(title, recordMap)}`
          break
        case 'bulleted_list':
          md += `${prefix}- ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'numbered_list':
          md += `${prefix}${numbering++}. ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'to_do':
          md += `${prefix}- [ ] ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'toggle':
          md += `${prefix}<details><summary>${prefix}${prefix}${decorationsToMarkdown(title, recordMap)}</summary>\n`
          break
        case 'quote':
          md += decorationsToMarkdown(title, recordMap, `\n${prefix.trim()}> `) + '\n'
          break
        case 'code':
          md += `${prefix}\`\`\`type${decorationsToMarkdown(title, recordMap)}\`\`\``
          break
        case 'equation':
          md += `${prefix}$$${decorationsToMarkdown(title, recordMap)}$$`
          break
        case 'callout': {
          md += decorationsToMarkdown(title, recordMap, `\n${prefix.trim()}> `) + '\n'
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
              ? childBlock.format.attributes.filter(attr => attr.id === 'title')[0].values[0]
              : ''
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
          const collection = recordMap.collection[childBlock.collection_id]?.value
          if (!collection) {
            console.debug(`Missing collection ${child} from ${getBlockTitle(page, recordMap)}`)
            continue
          }

          // Generate Table
          md += `${prefix}### ${decorationsToMarkdown(collection.name, recordMap)}`
          md += `${prefix} |Title|\n|:-:|`
          const views = childBlock.view_ids
            .map(id => {
              if (!recordMap.collection_view[id]) console.debug(`Missing view ${id} from ${collection.name}`)
              return recordMap.collection_view[id]?.value
            })
            .filter(Boolean)
          const children = Object.keys(
            views.reduce((blockMap, view) => {
              const results = recordMap.collection_query[collection.id][view.id].collection_group_results?.blockIds
              if (results) for (const result of results) blockMap[result] = true
              else console.debug(`Missing results from ${collection.name} ${view.name}`)
              return blockMap
            }, {})
          )
          for (const childPage of children) {
            const childBlock = recordMap.block[childPage]?.value
            if (!childBlock) console.debug(`no ${childPage} in ${collection.name[0]}`)
            md += `${prefix}|[${getBlockTitle(childBlock, recordMap)}](${getBlockLink(childPage, recordMap)})|`
          }

          // Make children page
          if (this.recursive && children.length) {
            const parentFolder = join(
              folder,
              `${getCanonicalPageId(page.id, recordMap)}`,
              `${getCanonicalPageId(collection.id, recordMap)}`
            )
            await mkdir(parentFolder, { recursive: true })
            for (const childPage of children) this.promises.push(this.exportMd(childPage, parentFolder))
          }
          break
        }
        case 'page': {
          md += `${prefix}${prefix}[${getBlockTitle(childBlock, recordMap)}](${getBlockLink(
            childBlock.id,
            recordMap
          )})${prefix}`
          if (this.recursive) {
            const parentFolder = join(folder, `${getCanonicalPageId(page.id, recordMap)}`)
            await mkdir(parentFolder, { recursive: true })
            this.promises.push(this.exportMd(childBlock.id, parentFolder))
          }
          break
        }
        case 'alias': {
          const aliasBlock = recordMap.block[childBlock.format.alias_pointer.id]?.value
          if (!aliasBlock) {
            console.debug(
              `Missing alias ${childBlock.format.alias_pointer.id} from ${getBlockTitle(page, recordMap)} ${page.id}`
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
        md += await this.childrenToMd(childBlock, recordMap, nestedPrefix, folder, page)
        if (childBlock.type === 'column') md += '\n'
      }
      if (childBlock.type === 'toggle') md += `${prefix}</details>`
    }
    return md
  }
}

export function decorationsToMarkdown(decos: Decoration[], recordMap: ExtendedRecordMap, prefix = '') {
  if (!decos) return String()
  const text = decos.reduce((md, deco) => {
    let wrapper = String()
    const [text, subdecos] = deco
    if (!subdecos) {
      return md + text
    } else {
      const textonly = subdecos.reduce((textonly, subdeco) => {
        switch (subdeco[0]) {
          case 'p': {
            const blockId = subdeco[1]
            const linkedBlock = recordMap.block[blockId]?.value
            if (!linkedBlock) {
              console.debug('"p" missing block', blockId, getPageTitle(recordMap))
              break
            }
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
              const object = recordMap.block[objectid]?.value
              if (!object) {
                console.debug('"eoi" missing block', objectid)
                break
              }
              const url = object.format.uri
              const title = object.format.attributes
                ? object.format.attributes?.filter(attr => attr.id === 'title')[0].values[0]
                : ''
              textonly = `[${title}](${url})`
              break
            } catch (e) {
              console.error(e, deco)
              break
            }
          }
          case 'u': {
            const user = recordMap.notion_user[subdeco[1]]?.value
            if (!user) break
            textonly = `[@${user.name}](mailto:${user.email})`
            break
          }
        }
        return textonly
      }, text)
      let decorated: string = textonly
      if (subdecos.find(subdeco => subdeco[0] === '_')) decorated = `<u>${textonly}</u>`
      decorated = wrapper + decorated + wrapper.split('').reverse().join('')
      return md + decorated
    }
  }, String())
  const lines = text.split('\n')
  const prefixed = lines.map(line => prefix + line)
  return prefixed.join('')
}

const getBlockLink = (blockId: string, recordMap: ExtendedRecordMap, domain = 'https://texonom.com') =>
  `${domain}/${getCanonicalPageId(blockId, recordMap)}`
