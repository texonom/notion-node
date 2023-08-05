import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'

import prettier from 'prettier'

import { Command, Option } from 'clipanion'
import { NotionAPI } from '@texonom/nclient'
import { getBlockTitle, getCanonicalPageId, parsePageId, formatDate, getTextContent } from '@texonom/nutils'

import type { ExtendedRecordMap, Decoration, PageBlock } from '@texonom/ntypes'

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

  async exportMd(id: string, folder: string) {
    const recordMap = await this.notion.getPage(id)
    const target = await this.pageToMarkdown(id, recordMap, folder)
    const path = join(folder, `${getCanonicalPageId(id, recordMap)}`)
    return writeFile(`${path}.md`, target)
  }

  async pageToMarkdown(id: string, recordMap: ExtendedRecordMap, folder) {
    const page = recordMap.block[id].value as PageBlock

    // Title
    let md = `---\n`

    // Property
    const parent =
      recordMap.collection[page.parent_id].value ??
      recordMap.block[page.parent_id].value ??
      recordMap.space[page.parent_id].value
    const properties = Object.keys(parent.schema)

    for (const property of properties) {
      const propName = parent.schema[property].name
      const propType = parent.schema[property].type
      let value = String()
      switch (propType) {
        case 'text':
          value = decorationsToMarkdown(page.properties[property], recordMap)
          break
        case 'title':
          value = decorationsToMarkdown(page.properties[property], recordMap)
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
    md += `Parent: ${page.parent_table === 'collection' ? getTextContent(parent.name) : getBlockTitle(parent, recordMap)}\n`
    md += '---\n'

    // Content
    for (const child of page.content) {
      const childBlock = recordMap.block[child].value
      const title = childBlock?.properties?.title
      switch (childBlock.type) {
        case 'header':
          md += `\n# ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'sub_header':
          md += `\n## ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'sub_sub_header':
          md += `\n### ${decorationsToMarkdown(title, recordMap)}`
          break
        case 'text':
          md += `\n${decorationsToMarkdown(title, recordMap)}`
          break
        case 'bulleted_list':
          md += '\n- '
          break
        case 'numbered_list':
          md += '\n1. '
          break
        case 'to_do':
          md += '\n- [ ] '
          break
        case 'toggle':
          md += '\n<details><summary>'
          break
        case 'quote':
          md += '\n> '
          break
        case 'code':
          md += `\n\`\`\`type${decorationsToMarkdown(title, recordMap)}\`\`\``
          break
        case 'equation':
          md += '\n$$'
          break
        case 'callout':
          md += '\n:::note'
          break
        case 'external_object_instance':
          md += `\n`
          break

        // Collection
        case 'collection_view': {
          const collection = recordMap.collection[childBlock.collection_id].value
          md += `\n${decorationsToMarkdown(collection.name, recordMap)}`

          if (this.recursive) {
            const views = childBlock.view_ids.map(id => recordMap.collection_view[id].value)
            const children = Object.keys(
              views.reduce((page, view) => {
                const results = recordMap.collection_query[collection.id][view.id].collection_group_results.blockIds
                for (const result of results) page[result] = true
                return page
              }, {})
            )
            const parentFolder = join(folder, `${getCanonicalPageId(childBlock.id, recordMap)}`)
            await mkdir(parentFolder, { recursive: true })
            for (const childPage of children) this.exportMd(childPage, parentFolder)
          }
          break
        }
        // Media
        case 'image':
          md += '\n![]('
          break
        case 'video':
          md += '\n<video src="'
          break
        case 'bookmark':
          md += `\n[${getTextContent(childBlock.properties.title)}](${getTextContent(childBlock.properties.link)})`
          break

        // Embed
        case 'file':
          md += '\n[File]('
          break
        case 'pdf':
          md += '\n[PDF]('
          break

        // Else
        case 'divider':
          md += '\n---'
          break
        default:
          md += '\n'
      }
    }
    return md
  }
}

export function decorationsToMarkdown(decos: Decoration[], recordMap: ExtendedRecordMap) {
  if (!decos) return String()
  return decos.reduce((md, deco) => {
    const [text, subdecos] = deco
    if (!subdecos) return md + text
    else
      return (
        md +
        subdecos.reduce((md, subdeco) => {
          switch (subdeco[0]) {
            case 'p': {
              const blockId = subdeco[1]
              const linkedBlock = recordMap.block[blockId]?.value
              if (!linkedBlock) {
                console.debug('"p" missing block', blockId)
                return md
              }
              const title = getBlockTitle(linkedBlock, recordMap)
              const url = getBlockLink(blockId, recordMap)
              return md + `[${title}](${url})`
            }
            case 'a': {
              const url = subdeco[1]
              return md + `[${text}](${url})`
            }
            default:
              return md
          }
        }, String())
      )
  }, String())
}

const getBlockLink = (blockId: string, recordMap: ExtendedRecordMap, domain = 'https://texonom.com') =>
  `${domain}/${getCanonicalPageId(blockId, recordMap)}`
