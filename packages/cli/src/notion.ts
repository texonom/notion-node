import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'

import prettier from 'prettier'

import { Command, Option } from 'clipanion'
import { NotionAPI } from '@texonom/nclient'
import { getBlockTitle, getCanonicalPageId, parsePageId } from '@texonom/nutils'

import type { ExtendedRecordMap, Decoration, PageBlock } from '@texonom/ntypes'

export abstract class NotionCommand extends Command {
  token = Option.String('-t,--token', {
    description: 'Notion Access Token'
  })
  async execute() {}
}

export class NotionExportCommand extends NotionCommand {
  static paths = [['export']]

  // Options
  folder = Option.String('-o,--output', 'data', {
    description: 'Export folder'
  })
  page = Option.String('-p,--page', {
    required: true,
    description: 'Target page'
  })
  domain = Option.String('-d,--domain', 'https://texonom.com', {
    description: 'Export domain for url'
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
    const notion = new NotionAPI({ authToken: this.token })
    const recordMap = await notion.getPage(id)
    const root = recordMap.block[id].value
    const path = `/${getCanonicalPageId(id, recordMap)}`
    if (this.recursive) return

    // Save
    await mkdir(this.folder, { recursive: true })
    let target = this.raw ? JSON.stringify(root) : recordMaptoMarkdown(id, recordMap, this.domain)
    const ext = this.raw ? 'json' : 'md'
    if (this.raw) target = await prettier.format(target, { parser: 'json' })

    await writeFile(`${join(this.folder, path)}.${ext}`, target)
  }
}

export function exportRecordMap() {}

export function recordMaptoMarkdown(id: string, recordMap: ExtendedRecordMap, domain: string) {
  const page = recordMap.block[id].value as PageBlock

  // Title
  let md = `---\n`

  // Property
  const parent = recordMap.collection[page.parent_id].value
  const properties = Object.keys(parent.schema)

  for (const property of properties) {
    const propName = parent.schema[property].name
    const propType = parent.schema[property].type
    let value = String()
    switch (propType) {
      case 'text':
        value = decorationsToMarkdown(page.properties[property], recordMap, domain)
        break
      default:
        value = ''
    }
    md += `${propName}: ${value}\n`
  }
  md += '---\n'

  // Content
  for (const child of page.content) {
    const childBlock = recordMap.block[child].value
    const title = childBlock?.properties?.title
    switch (childBlock.type) {
      case 'header':
        md += `\n# ${decorationsToMarkdown(title, recordMap, domain)}`
        break
      case 'sub_header':
        md += `\n## ${decorationsToMarkdown(title, recordMap, domain)}`
        break
      case 'sub_sub_header':
        md += `\n### ${decorationsToMarkdown(title, recordMap, domain)}`
        break
      case 'text':
        md += `\n${decorationsToMarkdown(title, recordMap, domain)}`
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
        md += `\n\`\`\`type${decorationsToMarkdown(title, recordMap, domain)}\`\`\``
        break
      case 'equation':
        md += '\n$$'
        break
      case 'callout':
        md += '\n:::note'
        break

      // Collection
      case 'collection_view': {
        const collection = recordMap.collection[childBlock.collection_id].value
        md += `\n${decorationsToMarkdown(collection.name, recordMap, domain)}`
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
        md += '\n[Bookmark]('
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

export function decorationsToMarkdown(decos: Decoration[], recordMap: ExtendedRecordMap, domain) {
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
              const url = `${domain}/${getCanonicalPageId(blockId, recordMap)}`
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
