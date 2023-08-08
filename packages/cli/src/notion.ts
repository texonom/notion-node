import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'

import prettier from 'prettier'

import { Command, Option } from 'clipanion'
import { NotionAPI } from '@texonom/nclient'
import {
  getBlockTitle,
  getCanonicalPageId,
  parsePageId,
  formatDate,
  getTextContent,
  getBlockParent,
  defaultMapImageUrl
} from '@texonom/nutils'
import { isCollection, isSpace } from '@texonom/ntypes'

import type { ExtendedRecordMap, Decoration, PageBlock, Block } from '@texonom/ntypes'

export abstract class NotionCommand extends Command {
  // for private page or eoi like github inline block
  token = Option.String('-t,--token', {
    description: 'Notion Access Token'
  })
  async execute() {}
}

export class NotionExportCommand extends NotionCommand {
  static paths = [['export']]
  notion: NotionAPI

  // Options
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
  raw = Option.Boolean('--raw', {
    description: 'Export raw recordMap JSON data \n Markdown format do not preserve all information'
  })
  list: string[]
  constructor() {
    super()
  }

  // Execute
  async execute() {
    await super.execute()
    const id = parsePageId(this.page)
    this.notion = new NotionAPI({ authToken: this.token })

    // Save
    await mkdir(this.folder, { recursive: true })
    if (this.raw) {
      const recordMap = await this.notion.getPage(id)
      const root = recordMap.block[id].value
      const filename = `${getCanonicalPageId(id, recordMap)}`
      let target = JSON.stringify(this.recursive ? root : recordMap)
      const ext = 'json'
      if (this.raw) target = await prettier.format(target, { parser: 'json' })
      await writeFile(`${join(this.folder, filename)}.${ext}`, target)
    } else {
      this.exportMd(id, this.folder)
    }
  }

  async fetchRecordmap(id: string) {
    const recordMap = await this.notion.getPage(id)
    return recordMap
  }

  async loadRecordmap(folder: string): Promise<ExtendedRecordMap> {
    return folder as unknown as ExtendedRecordMap
  }

  async exportMd(id: string, folder: string) {
    try {
      const recordMap = await this.notion.getPage(id)
      if (!['page', 'collection_view_page'].includes(recordMap.block[id].value.type)) throw new Error('Not a page')
      const target = await this.pageToMarkdown(id, recordMap, folder)
      const path = join(folder, `${getCanonicalPageId(id, recordMap)}`)
      return writeFile(`${path}.md`, target)
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
          md += `${prefix}<details><summary>${decorationsToMarkdown(title, recordMap)}</summary>\n`
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
        case 'external_object_instance':
          md += `${prefix}`
          break

        // Collection
        case 'collection_view_page':
        case 'collection_view': {
          const collection = recordMap.collection[childBlock.collection_id]?.value
          if (!collection) {
            console.debug(`Missing collection ${child} from ${getBlockTitle(page, recordMap)}`)
            continue
          }
          md += `${prefix}${decorationsToMarkdown(collection.name, recordMap)}`

          if (this.recursive) {
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
            const parentFolder = join(
              folder,
              `${getCanonicalPageId(page.id, recordMap)}`,
              `${getCanonicalPageId(childBlock.id, recordMap)}`
            )
            await mkdir(parentFolder, { recursive: true })
            for (const childPage of children) await this.exportMd(childPage, parentFolder)
          }
          break
        }

        // Media
        case 'image': {
          const caption = childBlock.properties.caption ? getTextContent(childBlock.properties.caption) : ''
          md += `${prefix}![${caption}](${defaultMapImageUrl(childBlock.format.display_source, childBlock)})`
          break
        }

        case 'alias': {
          childBlock = recordMap.block[childBlock.format.alias_pointer.id]?.value
          if (!childBlock) {
            console.debug(`Missing alias ${child} from ${getBlockTitle(page, recordMap)}`)
            continue
          }
          md += `${prefix}[${getBlockTitle(childBlock, recordMap)}](${getBlockLink(childBlock.id, recordMap)})${prefix}`
          break
        }

        case 'page': {
          md += `${prefix}[${getBlockTitle(childBlock, recordMap)}](${getBlockLink(childBlock.id, recordMap)})${prefix}`
          if (this.recursive) {
            const parentFolder = join(folder, `${getCanonicalPageId(page.id, recordMap)}`)
            await mkdir(parentFolder, { recursive: true })
            await this.exportMd(childBlock.id, parentFolder)
          }
          break
        }
        case 'video':
          md += `${prefix}<video src="${childBlock.format.display_source} />`
          break

        // Embed
        case 'file':
          md += `${prefix}[File](${childBlock.format.display_source})`
          break
        case 'pdf':
          md += `${prefix}<iframe src="${childBlock.format.display_source}"/>`
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
              console.debug('"p" missing block', blockId)
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
          case 'eoi': {
            try {
              const objectid = subdeco[1]
              const object = recordMap.block[objectid]?.value
              const url = object.format.uri
              const title = object.format.attributes.filter(attr => attr.id === 'title')[0].values[0]
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
      let decorated: string
      if (subdecos.find(subdeco => subdeco[0] === '_')) decorated = `<u>${textonly}</u>`
      decorated = wrapper + textonly + wrapper.split('').reverse().join('')
      return md + decorated
    }
  }, String())
  const lines = text.split('\n')
  const prefixed = lines.map(line => prefix + line)
  return prefixed.join('')
}

const getBlockLink = (blockId: string, recordMap: ExtendedRecordMap, domain = 'https://texonom.com') =>
  `${domain}/${getCanonicalPageId(blockId, recordMap)}`
