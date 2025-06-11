# Texonom Notion

![downloads](https://img.shields.io/npm/d18m/%40texonom%2Fnclient)

This repository is fork of [React Notion X](https://github.com/NotionX/react-notion-x).
Refactored with [Turboplate](https://github.com/seonglae/turboplate). Search API, Backlinks and Property rendering are maintained in this project.

![Property](image/property.png)

# Modules

- `@texonom/ntypes`
- `@texonom/nclient`
- `@texonom/ncompat`
- `@texonom/nutils`
- `@ntexonom/nreact`

# Development

```zsh
pnpm i
pnpm build # Vite
pnpm test # Vitest
```

# Deployment

Version update in `package.json` is automated by `standard-version`

## Release

```zsh
# check terminal pwd project root
pnpm build && pnpm test
VERSION=
pnpm release $VERSION # Apply workspace
pnpm turbo release -- $VERSION
pnpm format
git commit -am "meta: deployment commit for $VERSION"
git tag $VERSION
pnpm turbo pu
git push && git push --tags
```

## Prerelease

```zsh
pnpm build && pnpm test
VERSION=alpha or beta or rc
pnpm prerelease $VERSION # Apply workspace
pnpm turbo prerelease -- $VERSION
git commit -am "meta: deployment commit for $VERSION"
pnpm turbo pu
```

# Built with

[Turboplate](https://github.com/seonglae/turboplate) stacks

- `Turborepo` monorepo
- `Vite` build
- `Vitest` test
- `ESLint` lint
- `Prettier` format
- `Husky` git hook
- `Standard Version` release
