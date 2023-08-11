import { Command, Option } from 'clipanion'

export abstract class NotionCommand extends Command {
  // for private page or eoi like github inline block
  token = Option.String('-t,--token', {
    description: 'Notion Access Token'
  })
  async execute() {}
}
