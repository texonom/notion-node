# ncompat

> A compatibility layer between the official Notion API and the unofficial Notion API

[![NPM](https://img.shields.io/npm/v/@texonom/ncompat.svg)](https://www.npmjs.com/package/@texonom/ncompat) [![Build Status](https://github.com/texonom/notion-node/actions/workflows/test.yml/badge.svg)](https://github.com/texonom/notion-node/actions/workflows/test.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Features

- Uses the official Notion API while keeping the response structure of the unofficial API

- fully compatible with `nreact`
- backwards compatible with `nclient` and the unofficial notion API

## Usage

```ts
import { Client } from '@notionhq/client'
import { NotionCompatAPI } from '@texonom/ncompat'

const notion = new NotionCompatAPI(new Client({ auth: process.env.NOTION_TOKEN }))

const recordMap = await notion.getPage(pageId)
```

```ts
// searching works too
const results = await notion.search({ query: 'Texonom' })
```

The resulting `recordMap` is compatible with notion's unofficial API and nreact.

## API

Exports:

- `NotionCompatAPI` – wrapper around '@notionhq/client'
- `convertPage({ pageId, blockMap })`
- `convertBlock({ block, blockMap })`
- `convertTime(time)`
- `convertColor(color)`
- `convertRichText(rich)`

## Difference from React Notion X

This layer lets you use the official API while retaining the features of the original unofficial client.

## Demo

You can preview `nreact` using the official client and compatibility layer here: https://nreact-official-api-demo.transitivebullsh.it/

## Status

Currently, ~20 blocks have full compatibility and 8 have partial compatibility (sometimes in subtle ways) due Notion's official API not returning enough info for us to faithfully render them in all cases. See the block-by-block compatibility notes below for more info.

I recommend checking out [the ncompat demo](https://nreact-official-api-demo.transitivebullsh.it/) side-by-side with the [normal nreact demo](https://nreact-demo.transitivebullsh.it/) (which uses the unofficial Notion API via `nclient`) and the [equivalent public notion page](https://transitive-bs.notion.site/Notion-Kit-Test-Suite-067dd719a912471ea9a3ac10710e7fdf).

Note that using the official API with `ncompat` is **significantly slower** than using the unofficial API via `nclient` because of [reasons](https://github.com/texonom/notion-node/issues/269#issuecomment-1100648873).

The main feature missing from `ncompat` right now is collection (database) support. PRs welcome 😃

## Block Compatibility

### Summary of Known Issues 🔴

- image, video, and embed blocks are missing `format` for proper sizing and layout
  - 3492bd6dbaf44fe7a5cac62c5d402f06
  - 5d4e290ca4604d8fb809af806a6c1749
- image, video, and embed blocks are missing `caption`
  - 912379b0c54440a286619f76446cd753
- embed blocks don't contain enough info for proper embedding
  - have to write custom embedding logic for iframe urls
  - same with some video blocks
  - 5d4e290ca4604d8fb809af806a6c1749
- `alias` blocks fail for links pointing to other workspaces
  - this happens even if the linked page is publicly readable
  - 034119d20132420abe8e9863bbe91e9d
- rich text mentions fail for links to pages and databases in other workspaces
  - if API integration doesn't have access to the workspace
  - this happens even if the linked page is publicly readable
  - 52353862df0f48ba85648db7d0acd1dd
- format `toggleable` is missing
  - no toggle headers
  - 5995506f2c564d81956aa38711e12337

### Blocks with Full Compatibility 🟢

- paragraph (`text` block)
- heading_1 (`header` block)
- heading_2 (`sub_header` block)
- heading_3 (`sub_sub_header` block)
- bulleted_list_item (`bulleted_list` block)
- numbered_list_item (`numbered_list` block)
- quote
- to_do
- toggle
- code
- callout
- file
- divider
- table_of_contents
- column_list
- column
- equation (block and inline)
- synced_block (`transclusion_container` and `transclusion_reference`)
- audio
- tweet

### Blocks with Partial Compatibility 🟡

- bookmark
  - images and content are missing
  - 0be6efce9daf42688f65c76b89f8eb27
- image
  - missing caption
  - missing format so sizing and layout aren't always handled properly
  - 912379b0c54440a286619f76446cd753
- video
  - missing caption
  - missing format so sizing and layout aren't always handled properly
  - missing embedding logic in some cases (original URL must be transformed for embedding in many cases)
  - 5d4e290ca4604d8fb809af806a6c1749
- embed
  - missing caption
  - missing format so sizing and layout aren't always handled properly
  - missing embedding logic
    - original URL must be transformed for embedding in many cases
    - missing embeding display size hints from embedly
  - 5d4e290ca4604d8fb809af806a6c1749
  - this goes for custom embed blocks as well
    - maps
    - figma
    - typeform
    - codepen
    - excalidraw
    - gist
    - loom
    - drive
    - ...
- child_page (`page` block)
  - page format missing entirely
  - no full width, fonts, font size, etc
    - 72c5d33ca46642feaee06852cc57c588
    - 3702a5d6403d4d58b8a944a77ca26c70
  - page cover missing `page_cover_position`
    - 067dd719a912471ea9a3ac10710e7fdf
- link_to_page (`alias` block)
  - missing for links pointing to other workspaces, even if they're publicly readable
  - 034119d20132420abe8e9863bbe91e9d
- pdf
  - missing format so sizing and layout aren't handled properly
- table and table_row (simple table blocks)
  - missing some formatting info

### Blocks that are WIP 🚧

- child_database (`collection_view` and `collection_view_page` blocks)

### Blocks that are Not Supported 🔴

- external_object_instance

### Blocks that I'm not sure how to handle

- breadcrumb
- template
- unsupported
