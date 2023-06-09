# Texonom Notion

This repository is fork of [React Notion X](https://github.com/NotionX/react-notion-x).
Refactored with [Turboplate](https://github.com/seonglae/turboplate). This monorepo workspace is for [Texonom](https://texonom.com) Project

# Modules

- `@texonom/ntypes`
- `@texonom/nclient`
- `@texonom/ncompat`
- `@texonom/nutils`
- `@ntexonom/nreact`

# Development

```zsh
pnpm i
pnpm build # TSUp
pnpm test # Vitest
```

# Deployment

Version update in `package.json` is automated by `standard-version`

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
```

# Built with

[Turboplate](https://github.com/seonglae/turboplate) stacks

- `Turborepo` monorepo
- `TSup` build
- `Vitest` test
- `ESLint` lint
- `Prettier` format
- `Husky` git hook
- `Standard Version` release
