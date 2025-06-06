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

run('pnpm build')
run('pnpm test')
run(`pnpm release ${version}`)
run(`pnpm turbo release -- ${version}`)
run('pnpm format')
run(`git commit -am "meta: deployment commit for ${version}"`)
run(`git tag ${version}`)
run('pnpm turbo pu')
run('git push')
run('git push --tags')
