# Texonom Notion

![downloads](https://img.shields.io/npm/d18m/%40texonom%2Fnclient)

A **TypeScript-first** toolkit for working with Notion. This project began as a fork of [React Notion X](https://github.com/NotionX/react-notion-x) and adds features like a **search API**, **backlink** support and extended property rendering. Everything is bundled as a monorepo containing small focused packages.

## Features

- Search API with backlink support
- Extended property rendering
- CLI exporter and React renderer
- Works in Node.js and the browser

![Property](image/property.png)

## Difference from React Notion X

The original project focuses on rendering Notion pages. Texonom Notion adds a custom client with search and backlink APIs, an exporter CLI and improved property handling.

## Packages

- **`@texonom/ntypes`** – shared TypeScript definitions
- **`@texonom/nclient`** – Node/Deno client for the unofficial Notion API
- **`@texonom/ncompat`** – compatibility layer for the official API
- **`@texonom/nutils`** – utility functions for Notion data
- **`@texonom/nreact`** – React renderer built on top of the above
- **`@texonom/cli`** – CLI for exporting pages and workspaces

## Quick example

```ts
import { NotionAPI } from '@texonom/nclient'
import { NotionRenderer } from '@texonom/nreact'

const api = new NotionAPI()
const recordMap = await api.getPage('PAGE_ID')

<NotionRenderer recordMap={recordMap} fullPage />
```

```ts
import { parsePageId } from '@texonom/nutils'
parsePageId('About-d9ae0c6e7cad49a78e21d240cf2e3d04')
// 'd9ae0c6e7cad49a78e21d240cf2e3d04'
```

See it live at [texonom.com](https://texonom.com).

### Export via CLI

```bash
pnpm tsx packages/cli/src/main.ts export -p 04089c8ae3534bf79512fc495944b321 --raw -r -f
```

## Development

```bash
pnpm i
pnpm build  # tsup
pnpm test   # vitest
```

## Deployment

Version updates are automated via `standard-version`.

### Release

```bash
pnpm build && pnpm test
VERSION=<new version>
pnpm release $VERSION
pnpm turbo release -- $VERSION
pnpm format
git commit -am "meta: deployment commit for $VERSION"
git tag $VERSION
pnpm turbo pu
git push && git push --tags
```

### Prerelease

```bash
pnpm build && pnpm test
VERSION=<alpha|beta|rc>
pnpm prerelease $VERSION
pnpm turbo prerelease -- $VERSION
git commit -am "meta: deployment commit for $VERSION"
pnpm turbo pu
```

## Contributing

1. Fork the repo and create a feature branch.
2. `pnpm i` to install dependencies.
3. Run `pnpm build` and `pnpm test` before opening a pull request.

## Built with

- **Turborepo** for monorepo management
- **TSup** for builds
- **Vitest** for tests
- **ESLint** and **Prettier** for code style
- **Husky** git hooks
- **Standard Version** for releases
