# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript-first monorepo for working with Notion. Fork of React Notion X with added search API, backlink support, and extended property rendering. Uses the unofficial Notion API.

## Common Commands

```bash
pnpm i              # Install dependencies
pnpm build          # Build all packages (turbo + tsup)
pnpm dev            # Watch mode development
pnpm test           # Run all tests (vitest)
pnpm lint           # Lint and fix TS/TSX files
pnpm format         # Format with Prettier
pnpm clean          # Clean build artifacts
```

### Running a Single Test

```bash
pnpm vitest run packages/nutils/src/parse-page-id.test.ts
```

### CLI Usage

```bash
pnpm tsx packages/cli/src/main.ts export -p <PAGE_ID> --raw -r -f
```

## Architecture

### Package Dependency Graph

```
ntypes (types) ─────────┬──────────────────────┐
                        │                      │
                        ▼                      ▼
              nutils (utilities)        ncompat (compat layer)
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      nclient        nreact          cli
      (API)        (React)       (exporter)
```

### Packages

| Package            | Purpose                                       | Build Target         |
| ------------------ | --------------------------------------------- | -------------------- |
| `@texonom/ntypes`  | Shared TypeScript type definitions            | node14/ESM           |
| `@texonom/nutils`  | Isomorphic utility functions (Node & browser) | es2015/browser/ESM   |
| `@texonom/nclient` | Unofficial Notion API client                  | node14/ESM           |
| `@texonom/ncompat` | Bridge to official @notionhq/client           | node14/ESM           |
| `@texonom/nreact`  | React renderer components                     | ESM (React 16+ peer) |
| `@texonom/cli`     | CLI exporter using Clipanion                  | Node binary          |

### Build Order (Turbo)

Turbo respects dependencies defined in `turbo.json`:

1. `ntypes` builds first (no dependencies)
2. `nutils`, `nclient`, `ncompat` build next (depend on ntypes)
3. `nreact` builds (depends on ntypes + nutils)
4. `cli` builds last (depends on nclient)

## Code Style

- ESM-only output (no CommonJS)
- Single quotes, no semicolons (Prettier)
- camelCase for variables, PascalCase for types
- Pre-commit hook runs `pnpm format && pnpm lint`

## Key Files

- `turbo.json` - Build task dependencies
- `tsconfig.base.json` - Shared TypeScript config
- Each package has `tsup.config.ts` for bundling

## Testing

Tests use Vitest. Test files are colocated with source:

- `packages/nutils/src/*.test.ts`
- `packages/nclient/src/notion-api.test.ts`
- `packages/cli/src/notion/export.test.ts`

Environment variable `NOTION_TOKEN` is needed for API tests.
