# ntypes

TypeScript types for core Notion data structures.

[![NPM](https://img.shields.io/npm/v/@texonom/ntypes.svg)](https://www.npmjs.com/package/@texonom/ntypes) [![Build Status](https://github.com/texonom/notion-node/actions/workflows/test.yml/badge.svg)](https://github.com/texonom/notion-node/actions/workflows/test.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Features

- Strict typings for blocks, users and search results
- Shared between all packages in this monorepo

## Install

```bash
pnpm i @texonom/ntypes
```

## Usage

```ts
import type { ExtendedRecordMap } from '@texonom/ntypes'

function handle(record: ExtendedRecordMap) {
  console.log(record.block)
}
```

```ts
import type { Block } from '@texonom/ntypes/block'

const block: Block = {
  id: 'id',
  type: 'text'
  // ...
}
```

See the [full docs](https://github.com/texonom/notion-node) for details.

## API

This package re-exports grouped type definitions:

- `core` – shared base types
- `block` – block data
- `user` – user information
- `collection` and `collection-view`
- `formula` and `maps`
- `api` request/response shapes
- `space` workspace info
