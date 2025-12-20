# nclient

Robust TypeScript client for the unofficial Notion API, featuring a **search API** and **backlink** helpers.

[![NPM](https://img.shields.io/npm/v/@texonom/nclient.svg)](https://www.npmjs.com/package/@texonom/nclient) [![Build Status](https://github.com/texonom/notion-node/actions/workflows/test.yml/badge.svg)](https://github.com/texonom/notion-node/actions/workflows/test.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Features

- Works in Node.js, Deno and Cloudflare Workers
- Fetch pages, collections and search results
- Backlink API for discovering references
- Supports signed URLs for hosted assets

## Install

```bash
pnpm i @texonom/nclient
```

This package is compatible with server-side V8 contexts such as Node.js, Deno and Cloudflare Workers.

## Usage

```ts
import { NotionAPI } from '@texonom/nclient'

// you can optionally pass an authToken to access private pages
const api = new NotionAPI({ authToken: process.env.NOTION_TOKEN })

// fetch a page's content, including collection data and signed urls
const page = await api.getPage('067dd719-a912-471e-a9a3-ac10710e7fdf')
```

```ts
// fetch user and workspace info
const users = await api.getUsers(['user-id'])
const spaces = await api.getSpaces(['space-id'])
```

### Backlinks

```ts
const backlinks = await api.getBacklinks({ block: { id: 'page-id', spaceId: 'space-id' } })
```

### Fetch collection data

```ts
const data = await api.getCollectionData('collection-id', 'collection-view-id')
```

### Search

```ts
const results = await api.search({
  query: 'Texonom',
  spaceId: '0bf522c6-2468-4c71-99e3-68f5a25d4225',
  filters: {
    ancestors: ['04089c8ae3534bf79512fc495944b321'],
    isDeletedOnly: false,
    excludeTemplates: true,
    navigableBlockContentOnly: true,
    requireEditPermissions: false
  }
})
```

### Get blocks

```ts
const res = await api.getBlocks(['3f9e0d86-c643-4672-aa0c-78d63fa80598'])
```

### Signed file URLs

```ts
const signed = await api.getSignedFileUrls(['https://prod-files.example/notion.png'])
```

See the [full docs](https://github.com/texonom/notion-node) for more examples.

## API

The `NotionAPI` class exposes the following methods:

- `getPage(id, opts?)`
- `fetchCollections(blockIds, recordMap, pageId?, opts?)`
- `addSignedUrls({ recordMap, contentBlockIds })`
- `getPageRaw(id, opts?)`
- `getCollectionData(collectionId, viewId, opts?)`
- `getUsers(ids)`
- `getSpaces(ids)`
- `getBlocks(ids)`
- `syncRecords(records)`
- `getSignedFileUrls(urls)`
- `search(params)`
- `getBacklinks(params)`

Types such as `SignedUrlRequest` and `FetchOption` are also exported.
\n## Difference from the official API\n\nThis client mirrors the format of the unofficial API and exposes additional helpers like `search` and `getBacklinks`.
