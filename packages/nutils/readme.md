# nutils

> Useful utilities for working with Notion data. Isomorphic.

[![NPM](https://img.shields.io/npm/v/@texonom/nutils.svg)](https://www.npmjs.com/package/@texonom/nutils) [![Build Status](https://github.com/texonom/notion-node/actions/workflows/test.yml/badge.svg)](https://github.com/texonom/notion-node/actions/workflows/test.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Install

```bash
pnpm i @texonom/nutils
```

This package is compatible with both Node.js and client-side web usage.

## Usage

```ts
import { parsePageId } from '@texonom/nutils'

parsePageId('https://www.notion.so/Notion-Tests-067dd719a912471ea9a3ac10710e7fdf')
// '067dd719-a912-471e-a9a3-ac10710e7fdf'

parsePageId('About-d9ae0c6e7cad49a78e21d240cf2e3d04')
// 'd9ae0c6e-7cad-49a7-8e21-d240cf2e3d04'

parsePageId('About-d9ae0c6e7cad49a78e21d240cf2e3d04', { uuid: false })
// 'd9ae0c6e7cad49a78e21d240cf2e3d04'
```

## Docs

See the [full docs](https://github.com/texonom/notion-node).
