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
notion export --raw
```

### Example

```
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321 --raw -r -f
pnpm tsx src/main.ts export -p 04089c8ae3534bf79512fc495944b321 -r -l -t -u
```
