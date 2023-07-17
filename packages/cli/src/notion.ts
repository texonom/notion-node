import { Command, Option } from 'clipanion'
import { nestedFiles } from './fs'

export abstract class NotionCommand extends Command {
  token = Option.String('-t,--token', {
    required: true,
    description: 'Notion personal access token(PAT)'
  })
  user = Option.String('-o,--owner', {
    required: true,
    description: 'user or organization'
  })
  repo = Option.String('-r,--repo', {
    description: '(RegEx) If this option passed, only regex passed repository will be affected'
  })
  lang = Option.String('-l,--lang', {
    description: 'filter: Most used language in repo'
  })
  async execute() {}
}

export class NotionFolderCommand extends NotionCommand {
  static paths = [Command.Default]
  async = Option.Boolean('-a,--async')
  folder = Option.String('-f,--folder', '.Notion', {
    description: 'Folder to apply all repo'
  })
  list: string[]
  constructor() {
    super()
  }
  async execute() {
    this.list = await nestedFiles(this.folder)
    await super.execute()
  }
}
export class NotionBranchProtectionCommand extends NotionCommand {
  static paths = [['branch', 'protection']]
  file = Option.String('-f,--file', {
    required: true,
    description: 'Config file for branch'
  })
  branch = Option.String('-d,--default', 'main', {
    description: 'New Default branch name'
  })
  list: string[]
  constructor() {
    super()
  }
}

export class NotionLabelCommand extends NotionCommand {
  static paths = [['labels']]
  file = Option.String('-f,--file', 'config/repo.json', {
    description: 'label config json file'
  })
}
