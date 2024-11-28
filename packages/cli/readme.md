# Texonom Notion CLI

> Robust TypeScript client for the unofficial Notion API.

[![NPM](https://img.shields.io/npm/v/@texonom/cli.svg)](https://www.npmjs.com/package/@texonom/cli) [![Build Status](https://github.com/texonom/notion-node/actions/workflows/test.yml/badge.svg)](https://github.com/texonom/notion-node/actions/workflows/test.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Install

```bash
pnpm i @texonom/cli
```

# Usages

## Export

```zsh
## export block, collection, collection_view and notion_user for each folder
pnpm tsx src/main.ts export --raw
```

# Develop
```ts
import { NotionExporter } from '@texonom/cli'

const exporter = new NotionExporter({ page: pageId })
const recordMap = await exporter.notion.getPage(pageId)
const md = await exporter.pageToMarkdown(parsePageId(pageId), recordMap)
```

### Example
Export whole workspace
```sh
# 1. First get all raw data from the Notion API
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321 --raw -r -f

# 2. After that transform all raw data to markdown
# it requres Notion token if there are missed blocks & spaces & users & collections (No ~ query)
export NOTION_TOKEN=
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321 -r -l -t $NOTION_TOKEN -u
# Iterate the second command until collection error is gone (due to the rate limit)
```
if there is memory error
```
NODE_OPTIONS="--max-old-space-size=8192" tsx ...
```

Export a single page
```sh
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321
```
