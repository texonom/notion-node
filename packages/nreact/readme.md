# React Notion X

Fast and accurate React renderer for Notion.

[![NPM](https://img.shields.io/npm/v/@texonom/nreact.svg)](https://www.npmjs.com/package/@texonom/nreact) [![Build Status](https://github.com/texonom/notion-node/actions/workflows/test.yml/badge.svg)](https://github.com/texonom/notion-node/actions/workflows/test.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Features

- Render pages from `@texonom/nclient` or `@texonom/ncompat` record maps
- Built-in search dialog and Table of Contents
- Lightweight components with sensible defaults

Use the renderer as a drop-in component or import pieces for your own UI.

## Usage

```tsx
import { NotionRenderer } from '@texonom/nreact'
;<NotionRenderer recordMap={recordMap} fullPage />
```

```tsx
// customize links and image urls
<NotionRenderer
  recordMap={recordMap}
  fullPage
  mapPageUrl={id => `/docs/${id}`}
  mapImageUrl={url => `/api/image/${encodeURIComponent(url)}`}
  components={{
    nextLink: ({ href, children }) => <a href={href}>{children}</a>
  }}
/>
```

```tsx
// use a single component
import { Text } from '@texonom/nreact'

function Title({ value }) {
  return <Text value={value} />
}
```

## API

Record-map links allow HTTP(S), relative URLs, `mailto:` and `tel:`. Embeds allow
HTTP(S) and relative URLs. Unsafe links render as text, and unsafe embeds are omitted.
This policy also applies before passing URLs to custom `Link`, `PageLink`, and Next link components.
Search snippets treat all content as text except Notion's highlight markers.

Formula `test`, `replace`, and `replaceAll` use [RE2JS](https://github.com/le0pard/re2js).
Backreferences and lookarounds are unsupported. Evaluation rejects inputs over 16,384
characters, patterns or replacements over 1,024 characters, compiled patterns over
4,096 instructions, and replacement output over 1,048,576 characters. Rejected formulas
use the existing formula error rendering; there is no native-RegExp fallback.

Exports:

- `NotionRenderer`
- block components like `Text`, `Header`, `PageIcon`, `PageAside` and more
- helper hooks and context

## Difference from the original

This fork keeps the renderer from React Notion X but integrates extra features such as backlink rendering and improved property display.

## Source code

- `block.tsx` – block type switch
- `text.tsx` – decoration switch
