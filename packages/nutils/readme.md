# nutils

Useful utilities for working with Notion data. Runs in Node.js and the browser.

[![NPM](https://img.shields.io/npm/v/@texonom/nutils.svg)](https://www.npmjs.com/package/@texonom/nutils) [![Build Status](https://github.com/texonom/notion-node/actions/workflows/test.yml/badge.svg)](https://github.com/texonom/notion-node/actions/workflows/test.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Features

- Convert between page IDs and UUIDs
- Map and normalize Notion URLs
- Helpers for reading page metadata

## Install

```bash
pnpm i @texonom/nutils
```

## Usage

```ts
import { parsePageId } from '@texonom/nutils'

parsePageId('https://www.notion.so/Notion-Tests-067dd719a912471ea9a3ac10710e7fdf')
// '067dd719-a912-471e-a9a3-ac10710e7fdf'

parsePageId('About-d9ae0c6e7cad49a78e21d240cf2e3d04', { uuid: false })
// 'd9ae0c6e7cad49a78e21d240cf2e3d04'

import { normalizeUrl } from '@texonom/nutils'
normalizeUrl('https://test.com/foo/bar?foo=bar')

import { defaultMapPageUrl, defaultMapImageUrl } from '@texonom/nutils'
const mapPage = defaultMapPageUrl('root')('067dd719a912471ea9a3ac10710e7fdf')
const mapImage = defaultMapImageUrl('/image.png', { id: 'id', parent_table: 'block' } as any)

import { getCanonicalPageId } from '@texonom/nutils'
getCanonicalPageId('067dd719-a912-471e-a9a3-ac10710e7fdf', recordMap)
```

See the [full docs](https://github.com/texonom/notion-node) for more helpers.

## API

The library exports many helpers. Each function works both in Node.js and the browser.

- `getTextContent(value)` – extract plain text from rich text values
- `getBlockTitle(block, recordMap)` – title of a block
- `getBlockIcon(block, recordMap)` – icon for a block
- `getBlockCollectionId(block, recordMap)` – collection id for collection view blocks
- `getPageTitle(recordMap)` – page title from a record map
- `getPageProperty(name, block, recordMap)` – any page property
- `getDateValue(value)` – normalize Notion date values
- `getBlockParentPage(block, recordMap)` – parent page block
- `getPageTableOfContents(recordMap)` – extract headers and links
- `getPageContentBlockIds(recordMap)` – list of block ids contained in a page
- `parsePageId(id, opts?)` – convert Notion URLs and ids
- `idToUuid(id)` – add dashes to a notion id
- `uuidToId(uuid)` – remove dashes from a uuid
- `getAllInSpace(api, spaceId)` – fetch every page in a workspace
- `getCanonicalPageId(pageId, recordMap)` – canonical slug for a page
- `getPageBreadcrumbs(block, recordMap)` – breadcrumb labels
- `getPageImageUrls(recordMap)` – all images used on a page
- `isUrl(value)` – check if a string is a URL
- `normalizeUrl(url)` – remove tracking params
- `normalizeTitle(title)` – cleanup page titles
- `mergeRecordMaps(a, b)` – combine multiple record maps
- `formatDate(value)` – format ISO date string
- `formatNotionDateTime(value)` – format Notion timestamps
- `findAncestors(blockId, recordMap)` – walk up the block tree
- `estimatePageReadTime(recordMap)` – count words for read time
- `mapImageUrl(url, block)` – default image URL mapper
- `mapPageUrl(id)` – default page URL mapper
