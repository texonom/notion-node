# Texonom Notion CLI

Command line interface for exporting Notion data. It wraps the `@texonom/nclient` library and converts pages or entire workspaces to Markdown.

[![NPM](https://img.shields.io/npm/v/@texonom/cli.svg)](https://www.npmjs.com/package/@texonom/cli) [![Build Status](https://github.com/texonom/notion-node/actions/workflows/test.yml/badge.svg)](https://github.com/texonom/notion-node/actions/workflows/test.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Features

- Export a single page or an entire workspace
- Output raw Notion data or rendered Markdown
- Handles rate limits and supports auth tokens

## Install

```bash
pnpm i @texonom/cli
```

## Usage

### Export

```bash
# export block, collection, collection_view and notion_user for each folder
pnpm tsx src/main.ts export --raw
```

### Programmatic use

```ts
import { NotionExporter } from '@texonom/cli'

const exporter = new NotionExporter({ page: pageId })
const recordMap = await exporter.notion.getPage(pageId)
const md = await exporter.pageToMarkdown(parsePageId(pageId), recordMap)
```

```ts
// also works with page URLs thanks to nutils
import { parsePageId } from '@texonom/nutils'

const exporter = new NotionExporter({ page })
const recordMap = await exporter.notion.getPage(page)
const md = await exporter.pageToMarkdown(parsePageId(page), recordMap)
```

### Example workflow

```bash
# 1. Fetch raw data from Notion
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321 --raw -r -f

# 2. Transform raw data to markdown (requires token if data is private)
export NOTION_TOKEN=
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321 -r -l -t $NOTION_TOKEN -u

# 3. Retry without token if you hit rate limits
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321 -r -l -u
```

If you encounter memory errors:

```bash
NODE_OPTIONS="--max-old-space-size=16384" tsx ...
```

### Export a single page

```bash
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321
```

## API

Exports are scoped to the selected root's contained descendants and owned database
rows in the root's workspace. Mentions, aliases, synced-block references, linked
databases, and ancestors do not expand that scope. Cached exports are filtered by
the same rules before reuse. Recursive exports build this scope before writing;
missing or out-of-scope references are not hydrated using the export token.

For in-memory conversion, `new NotionExporter({ page: '' })` supports repeated or
concurrent `pageToMarkdown(id, recordMap)` calls. This mode renders only the records
explicitly supplied by the caller, including supplied mention metadata, and never
fetches missing references or uses an authentication token. It cannot execute a
file export without a selected root.

Page IDs used for output must be UUIDs. Safe page slugs retain their friendly
filenames; unsafe or oversized slugs fall back to the page UUID. Output filenames
and raw-table paths are checked against their export directory.

Exports:

- `NotionExportCommand` CLI entry
- `NotionExporter` class
- `getBlockLink(blockId, recordMap)`
- `loadRaw(folder)`
- `loadJson(folder, file)`
- `generateTreemaps(folder, pageTree)`
- `computeStats(pageTree)`
- `writeStats(file, stats)`

## Difference from React Notion X

The original project focuses on rendering. This CLI adds a straightforward way to download and convert Notion content from the terminal.
