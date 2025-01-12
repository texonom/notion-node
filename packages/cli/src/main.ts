import { Cli, Builtins } from 'clipanion'

import { version, displayName } from '../package.json'
import { NotionExportCommand } from './notion/export'

const cli = new Cli({
  binaryName: 'notion',
  binaryLabel: displayName,
  binaryVersion: version
})

cli.register(NotionExportCommand)
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.runExit(process.argv.slice(2), Cli.defaultContext)

export * from './notion/export'
export * from './notion/index'
