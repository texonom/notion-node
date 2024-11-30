import { Option, Command } from 'clipanion'
import { NotionExporter } from './index'

export class NotionExportCommand extends Command {
  static paths = [['export']]

  folder = Option.String('-o,--output', 'texonom-raw', {
    description: 'Target root folder to export folder'
  })
  md = Option.String('-m,--md', 'texonom-md', {
    description: 'Target folder to export markdown'
  })
  domain = Option.String('-d,--domain', 'https://texonom.com', {
    description: 'Domain to fill in the link'
  })
  validation = Option.Boolean('-v,--validation', {
    description: 'Validation exported data only'
  })
  update = Option.Boolean('-u,--update', {
    description: 'Update exported data and resave to the --root'
  })
  page = Option.String('-p,--page', {
    required: true,
    description: 'Target page to export'
  })
  recursive = Option.Boolean('-r,--recursive', {
    description: 'Recursively export children'
  })
  prefetch = Option.Boolean('-f, --prefetch', {
    description: 'Prefetch all space for faster export (recommended for exporting all pages in a space)'
  })
  load = Option.Boolean('-l, --load', {
    description: 'Load data from exported cache folder --root'
  })
  raw = Option.Boolean('--raw', {
    description: 'Export raw recordMap JSON data \n Markdown format do not preserve all information'
  })
  dataset = Option.Boolean('-d, --dataset', {
    description: 'Export as dataset for LLM learning'
  })
  token = Option.String('-t,--token', {
    description: 'Notion Access Token'
  })
  wait = Option.Counter('-w,--wait', {
    description: 'Wait couter for missed collection view'
  })

  async execute() {
    const exporter = new NotionExporter({
      folder: this.folder,
      validation: this.validation,
      update: this.update,
      page: this.page,
      recursive: this.recursive,
      prefetch: this.prefetch,
      load: this.load,
      raw: this.raw,
      dataset: this.dataset,
      token: this.token
    })
    await exporter.execute()
  }
}
