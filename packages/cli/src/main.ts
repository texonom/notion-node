import { Cli, Builtins } from 'clipanion'
import { version, name, displayName } from '../package.json'
import { NotionFolderCommand, NotionLabelCommand, NotionBranchProtectionCommand } from './notion'

const cli = new Cli({
  binaryName: name,
  binaryLabel: displayName,
  binaryVersion: version
})

cli.register(NotionFolderCommand)
cli.register(NotionLabelCommand)
cli.register(NotionBranchProtectionCommand)
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.runExit(process.argv.slice(2), Cli.defaultContext)
