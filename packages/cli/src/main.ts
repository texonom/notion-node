import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

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

// Only run the CLI when executed as the `notion` bin — NOT when imported as a library
// (e.g. `import { NotionExporter } from '@texonom/cli'`). Otherwise importing the package
// would trigger runExit and exit the host process.
let isCliEntry = false
try {
  isCliEntry = !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
} catch {
  isCliEntry = false
}
if (isCliEntry) cli.runExit(process.argv.slice(2), Cli.defaultContext)

export * from './notion/export'
export * from './notion/index'
export * from './treemap'
export * from './stats'
