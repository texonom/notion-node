import { Command, Option } from 'clipanion'

export abstract class NotionCommand extends Command {
  token = Option.String('-t,--token', {
    description: 'Notion Access Token'
  })
  async execute() {}
}

export class NotionExportCommand extends NotionCommand {
  static paths = [['export']]
  folder = Option.String('-o,--output', {
    description: 'Export folder'
  })
  page = Option.String('-p,--page', {
    required: true,
    description: 'Target page'
  })
  list: string[]
  constructor() {
    super()
  }
  async execute() {
    await super.execute()
  }
}
