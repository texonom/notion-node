#!/usr/bin/env tsx
/* eslint-disable no-console */
import { execSync } from 'node:child_process'

function run(cmd: string): void {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { stdio: 'inherit', shell: true })
}

const arg = process.argv.find(a => a.startsWith('--version='))
if (!arg) {
  console.error('Usage: release.ts --version=<VERSION>')
  process.exit(1)
}
const version = arg.split('=')[1]
if (!version) {
  console.error('Invalid version.')
  process.exit(1)
}

const commands = [
  'pnpm build',
  'pnpm test',
  `pnpm release ${version}`,
  `pnpm turbo release -- ${version}`,
  'pnpm format',
  `git commit -am "meta: deployment commit for ${version}"`,
  `git tag ${version}`,
  'pnpm turbo pu',
  'git push',
  'git push --tags'
]

for (const cmd of commands) {
  run(cmd)
}
