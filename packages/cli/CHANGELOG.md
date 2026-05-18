# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 1.5.10 (2026-04-11)

### Features

- add textonly markdown export with prettier format ([80e082e](https://github.com/texonom/notion-node/commit/80e082e277d2e8983e81bb750d80ce151db32247))
- **cli:** `@texonom/cli` added for export from gh-setter ([16ba19d](https://github.com/texonom/notion-node/commit/16ba19dc0b4c3ede421cdb424cda21fa10bee377))
- **cli:** add export collection commend dynamic ([71e1f03](https://github.com/texonom/notion-node/commit/71e1f03e085ed8d27147ff02f65f9a7cd3303a22))
- **cli:** add push option for export ([95d04bb](https://github.com/texonom/notion-node/commit/95d04bbb55c9e7ba349eaf55d5b4831b37a4eb71))
- **cli:** add treemap and stats export ([0d90152](https://github.com/texonom/notion-node/commit/0d90152a9780307579a8d127f1ea13ab2282fb1d))
- **cli:** corrected pagetree data with wait option ([f7b0f90](https://github.com/texonom/notion-node/commit/f7b0f9005dbd5133412644144a1ae24de37a4b7d))
- **cli:** export collection as table & inline math ([b10c845](https://github.com/texonom/notion-node/commit/b10c845ccb7de91587d135a62896b65a2d4f7d10))
- **cli:** fetch and pagecount etc for export ([f6a5bda](https://github.com/texonom/notion-node/commit/f6a5bda47f53c695fa5f75ac2812044e0f33e28a))
- **cli:** get block collection user space with validate ([7ae4e8a](https://github.com/texonom/notion-node/commit/7ae4e8aab1d93c8c4ebd3b0f38e35f7d5ca5a777))
- **cli:** treemap generation with navigable breadcrumbs ([87ce3de](https://github.com/texonom/notion-node/commit/87ce3dec79b288d90af1a8bcd1f1dede503769e6))
- **cli:** treemap successful with korean canonical ([2addcb2](https://github.com/texonom/notion-node/commit/2addcb2290a332307bea8731d9a7e2eb55a2e5b4))
- eoi block fetching using auth token ([889f157](https://github.com/texonom/notion-node/commit/889f1570ceda284e0ca27c2b1e4e1b58d4dd70cc))
- export markdown basic test suite without error ([0c0bd94](https://github.com/texonom/notion-node/commit/0c0bd947070d86a6eeb3219ac840d3708ad9b0d0))
- export raw recursive prefetch load for notion ([0f44a62](https://github.com/texonom/notion-node/commit/0f44a62b6d9bedb0f14d95bb973cf526c4e1dcbb))
- recursive markdown export with bookmark ([61a5b95](https://github.com/texonom/notion-node/commit/61a5b95fd92f53ea6e753e6e082cf472d9a453b9))

### Bug Fixes

- alan jo to seonglae cho ([2a2b0ea](https://github.com/texonom/notion-node/commit/2a2b0ea28c7d8efb58da199a39703da301f256c4))
- **cli:** add comment to empty catch block for ESLint compliance ([0142e6e](https://github.com/texonom/notion-node/commit/0142e6ebc2f391d8a4ce6d3b0e82ff78dd77db1f))
- **cli:** build error by change main build folder ([092faba](https://github.com/texonom/notion-node/commit/092faba8e56fa9e3b1d9a9845cd81e8c950013a2))
- **cli:** intermediate markdown object for export ([b31c0e5](https://github.com/texonom/notion-node/commit/b31c0e5cc3dc7cbb5457334f840946a8b4bdade1))
- **cli:** remove hierarchy folder from export ([1618261](https://github.com/texonom/notion-node/commit/161826175ca84890b386e4d83320fb3788cfce45))
- **cli:** separate markdown and raw folder ([df35915](https://github.com/texonom/notion-node/commit/df359159e0f76da3f8a91fa1c1fc90f95a9beba1))
- **cli:** update pageMap and recordMap of collections ([75be61e](https://github.com/texonom/notion-node/commit/75be61e547ad09225461054328a64b3203b1d99e))
- dependencies FSWatcher with vite5 udpates ([4922f14](https://github.com/texonom/notion-node/commit/4922f14e212805edc9efa35825735d69e3f9cd72))
- **nclient,nreact:** proper typing for normalize, fix bookmark width ([69ab111](https://github.com/texonom/notion-node/commit/69ab111cd40917ac6e656c2bd5097c1092646e6f))
- **nclient:** add normalizeMap to getPage and fetchCollections ([2065b76](https://github.com/texonom/notion-node/commit/2065b761d17317fc1a3274a79a470b196cc3da49))
- **nclient:** normalize all API responses for new Notion format ([be34302](https://github.com/texonom/notion-node/commit/be343027bf0ce0dcc28f4d5b222246a4659af960))
- **nclient:** normalize queryCollection recordMap nested value wrapper ([826ff5a](https://github.com/texonom/notion-node/commit/826ff5a7ea22bd18fe0136ddfcee5f8aff0c14c6))
- **nreact:** fix bookmark overflow and width with min-width: 0 ([40956b3](https://github.com/texonom/notion-node/commit/40956b318f6f1efc2825ff8c117983b9cb89f336))
- **nreact:** restore gallery card titles for schema-less collections, fix bookmark onError ([b99aaa4](https://github.com/texonom/notion-node/commit/b99aaa4b0751efdd0fbcd1a65119d8ebbe042df8))
- **nutils,nreact:** fix bookmark rendering by skipping proxy for external URLs ([751847d](https://github.com/texonom/notion-node/commit/751847d51a3b9c26516af15ee74263f4e02f40b1))
- **nutils:** include http:// URLs in external URL bypass ([2d7e068](https://github.com/texonom/notion-node/commit/2d7e0683a50aa0999147dcc9bbcbcfbeb27484ed))
- **nutils:** stdout stderr only when necessary ([618134e](https://github.com/texonom/notion-node/commit/618134ec09f4d102dd34a66525c2d72b5bbc7ab6))
- remove duplicate exports in cli main.ts ([ad9f34b](https://github.com/texonom/notion-node/commit/ad9f34b9722e4103af98c581ce4abb7d7dd8a78f))
- resolve merge conflicts and update vite configs ([10dd5c2](https://github.com/texonom/notion-node/commit/10dd5c21c8387ccafccd4c6c6c210d11d4df3840))

### 1.5.9 (2026-04-11)

### Features

- add textonly markdown export with prettier format ([80e082e](https://github.com/texonom/notion-node/commit/80e082e277d2e8983e81bb750d80ce151db32247))
- **cli:** `@texonom/cli` added for export from gh-setter ([16ba19d](https://github.com/texonom/notion-node/commit/16ba19dc0b4c3ede421cdb424cda21fa10bee377))
- **cli:** add export collection commend dynamic ([71e1f03](https://github.com/texonom/notion-node/commit/71e1f03e085ed8d27147ff02f65f9a7cd3303a22))
- **cli:** add push option for export ([95d04bb](https://github.com/texonom/notion-node/commit/95d04bbb55c9e7ba349eaf55d5b4831b37a4eb71))
- **cli:** add treemap and stats export ([0d90152](https://github.com/texonom/notion-node/commit/0d90152a9780307579a8d127f1ea13ab2282fb1d))
- **cli:** corrected pagetree data with wait option ([f7b0f90](https://github.com/texonom/notion-node/commit/f7b0f9005dbd5133412644144a1ae24de37a4b7d))
- **cli:** export collection as table & inline math ([b10c845](https://github.com/texonom/notion-node/commit/b10c845ccb7de91587d135a62896b65a2d4f7d10))
- **cli:** fetch and pagecount etc for export ([f6a5bda](https://github.com/texonom/notion-node/commit/f6a5bda47f53c695fa5f75ac2812044e0f33e28a))
- **cli:** get block collection user space with validate ([7ae4e8a](https://github.com/texonom/notion-node/commit/7ae4e8aab1d93c8c4ebd3b0f38e35f7d5ca5a777))
- **cli:** treemap generation with navigable breadcrumbs ([87ce3de](https://github.com/texonom/notion-node/commit/87ce3dec79b288d90af1a8bcd1f1dede503769e6))
- **cli:** treemap successful with korean canonical ([2addcb2](https://github.com/texonom/notion-node/commit/2addcb2290a332307bea8731d9a7e2eb55a2e5b4))
- eoi block fetching using auth token ([889f157](https://github.com/texonom/notion-node/commit/889f1570ceda284e0ca27c2b1e4e1b58d4dd70cc))
- export markdown basic test suite without error ([0c0bd94](https://github.com/texonom/notion-node/commit/0c0bd947070d86a6eeb3219ac840d3708ad9b0d0))
- export raw recursive prefetch load for notion ([0f44a62](https://github.com/texonom/notion-node/commit/0f44a62b6d9bedb0f14d95bb973cf526c4e1dcbb))
- recursive markdown export with bookmark ([61a5b95](https://github.com/texonom/notion-node/commit/61a5b95fd92f53ea6e753e6e082cf472d9a453b9))

### Bug Fixes

- alan jo to seonglae cho ([2a2b0ea](https://github.com/texonom/notion-node/commit/2a2b0ea28c7d8efb58da199a39703da301f256c4))
- **cli:** add comment to empty catch block for ESLint compliance ([0142e6e](https://github.com/texonom/notion-node/commit/0142e6ebc2f391d8a4ce6d3b0e82ff78dd77db1f))
- **cli:** build error by change main build folder ([092faba](https://github.com/texonom/notion-node/commit/092faba8e56fa9e3b1d9a9845cd81e8c950013a2))
- **cli:** intermediate markdown object for export ([b31c0e5](https://github.com/texonom/notion-node/commit/b31c0e5cc3dc7cbb5457334f840946a8b4bdade1))
- **cli:** remove hierarchy folder from export ([1618261](https://github.com/texonom/notion-node/commit/161826175ca84890b386e4d83320fb3788cfce45))
- **cli:** separate markdown and raw folder ([df35915](https://github.com/texonom/notion-node/commit/df359159e0f76da3f8a91fa1c1fc90f95a9beba1))
- **cli:** update pageMap and recordMap of collections ([75be61e](https://github.com/texonom/notion-node/commit/75be61e547ad09225461054328a64b3203b1d99e))
- dependencies FSWatcher with vite5 udpates ([4922f14](https://github.com/texonom/notion-node/commit/4922f14e212805edc9efa35825735d69e3f9cd72))
- **nclient,nreact:** proper typing for normalize, fix bookmark width ([69ab111](https://github.com/texonom/notion-node/commit/69ab111cd40917ac6e656c2bd5097c1092646e6f))
- **nclient:** add normalizeMap to getPage and fetchCollections ([2065b76](https://github.com/texonom/notion-node/commit/2065b761d17317fc1a3274a79a470b196cc3da49))
- **nclient:** normalize queryCollection recordMap nested value wrapper ([826ff5a](https://github.com/texonom/notion-node/commit/826ff5a7ea22bd18fe0136ddfcee5f8aff0c14c6))
- **nreact:** fix bookmark overflow and width with min-width: 0 ([40956b3](https://github.com/texonom/notion-node/commit/40956b318f6f1efc2825ff8c117983b9cb89f336))
- **nreact:** restore gallery card titles for schema-less collections, fix bookmark onError ([b99aaa4](https://github.com/texonom/notion-node/commit/b99aaa4b0751efdd0fbcd1a65119d8ebbe042df8))
- **nutils,nreact:** fix bookmark rendering by skipping proxy for external URLs ([751847d](https://github.com/texonom/notion-node/commit/751847d51a3b9c26516af15ee74263f4e02f40b1))
- **nutils:** include http:// URLs in external URL bypass ([2d7e068](https://github.com/texonom/notion-node/commit/2d7e0683a50aa0999147dcc9bbcbcfbeb27484ed))
- **nutils:** stdout stderr only when necessary ([618134e](https://github.com/texonom/notion-node/commit/618134ec09f4d102dd34a66525c2d72b5bbc7ab6))
- remove duplicate exports in cli main.ts ([ad9f34b](https://github.com/texonom/notion-node/commit/ad9f34b9722e4103af98c581ce4abb7d7dd8a78f))
- resolve merge conflicts and update vite configs ([10dd5c2](https://github.com/texonom/notion-node/commit/10dd5c21c8387ccafccd4c6c6c210d11d4df3840))

### 1.5.1 (2026-02-19)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** add push option for export ([3aa9b19](https://github.com/texonom/notion-node/commit/3aa9b19b841e08dd46761bbfada82cc6672600b7))
- **cli:** add treemap and stats export ([671d266](https://github.com/texonom/notion-node/commit/671d26646e0f73d2832755e8343c816a8b2f3485))
- **cli:** corrected pagetree data with wait option ([d8e7f80](https://github.com/texonom/notion-node/commit/d8e7f801ab631bcfe8ab4efb61d5b4a30cd97ed6))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap generation with navigable breadcrumbs ([d20a4df](https://github.com/texonom/notion-node/commit/d20a4df54d45489524ccbfebfa9a00fccacef472))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** add comment to empty catch block for ESLint compliance ([d2505be](https://github.com/texonom/notion-node/commit/d2505beedbeb8ab35d2ccec3af023af65b31a1cf))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** intermediate markdown object for export ([7511cde](https://github.com/texonom/notion-node/commit/7511cde24a93372459f68952d1eec2459f0da8aa))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- **cli:** update pageMap and recordMap of collections ([e0c8096](https://github.com/texonom/notion-node/commit/e0c8096ef4114e44a002d7725d9b02608ed351a7))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))
- **nutils:** stdout stderr only when necessary ([c7fd89e](https://github.com/texonom/notion-node/commit/c7fd89eb95a90179db8750695d0c8c6187eb6a77))
- remove duplicate exports in cli main.ts ([b273960](https://github.com/texonom/notion-node/commit/b273960297b3771dc8efc373bf3c8c5e4f02a686))
- resolve merge conflicts and update vite configs ([f884800](https://github.com/texonom/notion-node/commit/f884800efe51fa4f743df5b8e1929c3cd05acc3b))

## 1.5.0 (2026-02-19)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** add push option for export ([3aa9b19](https://github.com/texonom/notion-node/commit/3aa9b19b841e08dd46761bbfada82cc6672600b7))
- **cli:** add treemap and stats export ([671d266](https://github.com/texonom/notion-node/commit/671d26646e0f73d2832755e8343c816a8b2f3485))
- **cli:** corrected pagetree data with wait option ([d8e7f80](https://github.com/texonom/notion-node/commit/d8e7f801ab631bcfe8ab4efb61d5b4a30cd97ed6))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap generation with navigable breadcrumbs ([d20a4df](https://github.com/texonom/notion-node/commit/d20a4df54d45489524ccbfebfa9a00fccacef472))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** add comment to empty catch block for ESLint compliance ([d2505be](https://github.com/texonom/notion-node/commit/d2505beedbeb8ab35d2ccec3af023af65b31a1cf))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** intermediate markdown object for export ([7511cde](https://github.com/texonom/notion-node/commit/7511cde24a93372459f68952d1eec2459f0da8aa))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- **cli:** update pageMap and recordMap of collections ([e0c8096](https://github.com/texonom/notion-node/commit/e0c8096ef4114e44a002d7725d9b02608ed351a7))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))
- **nutils:** stdout stderr only when necessary ([c7fd89e](https://github.com/texonom/notion-node/commit/c7fd89eb95a90179db8750695d0c8c6187eb6a77))
- remove duplicate exports in cli main.ts ([b273960](https://github.com/texonom/notion-node/commit/b273960297b3771dc8efc373bf3c8c5e4f02a686))
- resolve merge conflicts and update vite configs ([f884800](https://github.com/texonom/notion-node/commit/f884800efe51fa4f743df5b8e1929c3cd05acc3b))

### 1.4.7 (2025-06-08)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** add treemap and stats export ([671d266](https://github.com/texonom/notion-node/commit/671d26646e0f73d2832755e8343c816a8b2f3485))
- **cli:** corrected pagetree data with wait option ([d8e7f80](https://github.com/texonom/notion-node/commit/d8e7f801ab631bcfe8ab4efb61d5b4a30cd97ed6))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap generation with navigable breadcrumbs ([d20a4df](https://github.com/texonom/notion-node/commit/d20a4df54d45489524ccbfebfa9a00fccacef472))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** intermediate markdown object for export ([7511cde](https://github.com/texonom/notion-node/commit/7511cde24a93372459f68952d1eec2459f0da8aa))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- **cli:** update pageMap and recordMap of collections ([e0c8096](https://github.com/texonom/notion-node/commit/e0c8096ef4114e44a002d7725d9b02608ed351a7))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))
- **nutils:** stdout stderr only when necessary ([c7fd89e](https://github.com/texonom/notion-node/commit/c7fd89eb95a90179db8750695d0c8c6187eb6a77))

### 1.4.6 (2025-06-08)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** add treemap and stats export ([671d266](https://github.com/texonom/notion-node/commit/671d26646e0f73d2832755e8343c816a8b2f3485))
- **cli:** corrected pagetree data with wait option ([d8e7f80](https://github.com/texonom/notion-node/commit/d8e7f801ab631bcfe8ab4efb61d5b4a30cd97ed6))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap generation with navigable breadcrumbs ([d20a4df](https://github.com/texonom/notion-node/commit/d20a4df54d45489524ccbfebfa9a00fccacef472))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** intermediate markdown object for export ([7511cde](https://github.com/texonom/notion-node/commit/7511cde24a93372459f68952d1eec2459f0da8aa))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- **cli:** update pageMap and recordMap of collections ([e0c8096](https://github.com/texonom/notion-node/commit/e0c8096ef4114e44a002d7725d9b02608ed351a7))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))
- **nutils:** stdout stderr only when necessary ([c7fd89e](https://github.com/texonom/notion-node/commit/c7fd89eb95a90179db8750695d0c8c6187eb6a77))

### 1.4.5 (2025-06-08)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** add treemap and stats export ([671d266](https://github.com/texonom/notion-node/commit/671d26646e0f73d2832755e8343c816a8b2f3485))
- **cli:** corrected pagetree data with wait option ([d8e7f80](https://github.com/texonom/notion-node/commit/d8e7f801ab631bcfe8ab4efb61d5b4a30cd97ed6))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap generation with navigable breadcrumbs ([d20a4df](https://github.com/texonom/notion-node/commit/d20a4df54d45489524ccbfebfa9a00fccacef472))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** intermediate markdown object for export ([7511cde](https://github.com/texonom/notion-node/commit/7511cde24a93372459f68952d1eec2459f0da8aa))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- **cli:** update pageMap and recordMap of collections ([e0c8096](https://github.com/texonom/notion-node/commit/e0c8096ef4114e44a002d7725d9b02608ed351a7))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))
- **nutils:** stdout stderr only when necessary ([c7fd89e](https://github.com/texonom/notion-node/commit/c7fd89eb95a90179db8750695d0c8c6187eb6a77))

### 1.4.4 (2025-01-13)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** corrected pagetree data with wait option ([d8e7f80](https://github.com/texonom/notion-node/commit/d8e7f801ab631bcfe8ab4efb61d5b4a30cd97ed6))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap generation with navigable breadcrumbs ([d20a4df](https://github.com/texonom/notion-node/commit/d20a4df54d45489524ccbfebfa9a00fccacef472))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** intermediate markdown object for export ([7511cde](https://github.com/texonom/notion-node/commit/7511cde24a93372459f68952d1eec2459f0da8aa))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- **cli:** update pageMap and recordMap of collections ([e0c8096](https://github.com/texonom/notion-node/commit/e0c8096ef4114e44a002d7725d9b02608ed351a7))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))

### 1.4.3 (2025-01-13)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** corrected pagetree data with wait option ([d8e7f80](https://github.com/texonom/notion-node/commit/d8e7f801ab631bcfe8ab4efb61d5b4a30cd97ed6))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap generation with navigable breadcrumbs ([d20a4df](https://github.com/texonom/notion-node/commit/d20a4df54d45489524ccbfebfa9a00fccacef472))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** intermediate markdown object for export ([7511cde](https://github.com/texonom/notion-node/commit/7511cde24a93372459f68952d1eec2459f0da8aa))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- **cli:** update pageMap and recordMap of collections ([e0c8096](https://github.com/texonom/notion-node/commit/e0c8096ef4114e44a002d7725d9b02608ed351a7))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))

### 1.4.2 (2025-01-12)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** corrected pagetree data with wait option ([d8e7f80](https://github.com/texonom/notion-node/commit/d8e7f801ab631bcfe8ab4efb61d5b4a30cd97ed6))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap generation with navigable breadcrumbs ([d20a4df](https://github.com/texonom/notion-node/commit/d20a4df54d45489524ccbfebfa9a00fccacef472))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- **cli:** update pageMap and recordMap of collections ([e0c8096](https://github.com/texonom/notion-node/commit/e0c8096ef4114e44a002d7725d9b02608ed351a7))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))

### 1.4.1 (2024-11-29)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))

### 1.4.1 (2024-11-29)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))

### 1.4.1 (2024-11-29)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- **cli:** treemap successful with korean canonical ([caab915](https://github.com/texonom/notion-node/commit/caab9155d1546d8054558144a24cac9354f54ca5))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- **cli:** remove hierarchy folder from export ([21cf0af](https://github.com/texonom/notion-node/commit/21cf0af7b377c06d906886326dd1e8c41b7acc95))
- **cli:** separate markdown and raw folder ([7669604](https://github.com/texonom/notion-node/commit/7669604abb28e1a4dbf26bd78e798ef23bb713e8))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))

## 1.4.0 (2024-11-28)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
- dependencies FSWatcher with vite5 udpates ([1e50995](https://github.com/texonom/notion-node/commit/1e509952417bc00166d39ab5ed8310a1bddcc7be))

### 1.3.1 (2024-11-19)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- alan jo to seonglae cho ([16bf81d](https://github.com/texonom/notion-node/commit/16bf81d3b2fe0efee18cae54534c5907e073c490))
- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

## 1.3.0 (2024-03-10)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.12 (2024-02-01)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.11 (2023-10-22)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.10 (2023-10-22)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.9 (2023-10-22)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.8 (2023-10-22)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.7 (2023-10-22)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.6 (2023-10-22)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.5 (2023-10-22)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.4 (2023-10-21)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.3 (2023-10-21)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.2 (2023-10-21)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

### 1.2.1 (2023-08-11)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** fetch and pagecount etc for export ([ac0a9b2](https://github.com/texonom/notion-node/commit/ac0a9b26378069ea76144d0388c26a813b55854e))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))

## 1.2.0 (2023-08-11)

### Features

- add textonly markdown export with prettier format ([98679fe](https://github.com/texonom/notion-node/commit/98679fe8edaf850a0724ffcd6e538553851a8db0))
- **cli:** `@texonom/cli` added for export from gh-setter ([78decc4](https://github.com/texonom/notion-node/commit/78decc45c1cec9e159f6d93b81d2635e3666ac4b))
- **cli:** add export collection commend dynamic ([c7cf1d5](https://github.com/texonom/notion-node/commit/c7cf1d51aa0444508ed54b606074f73003b83e1b))
- **cli:** export collection as table & inline math ([e6201a5](https://github.com/texonom/notion-node/commit/e6201a52034272bb6bb7982e5c9c765264f508f8))
- **cli:** get block collection user space with validate ([bc9a09e](https://github.com/texonom/notion-node/commit/bc9a09e1a510f329df3c918f595fe32ebb8d16d1))
- eoi block fetching using auth token ([5142d41](https://github.com/texonom/notion-node/commit/5142d413e754dbaa0fe2ffc622ab29445a50a620))
- export markdown basic test suite without error ([0ea92bf](https://github.com/texonom/notion-node/commit/0ea92bf10512d56d550f68864da3cf5f4ae261b2))
- export raw recursive prefetch load for notion ([39a1210](https://github.com/texonom/notion-node/commit/39a1210407ff222c70c846cc088990b3bf7d9307))
- recursive markdown export with bookmark ([bad5c2e](https://github.com/texonom/notion-node/commit/bad5c2e467d7dd716129885417de6812e4f04adf))

### Bug Fixes

- **cli:** build error by change main build folder ([393b1c2](https://github.com/texonom/notion-node/commit/393b1c24712f98a3b3befd3a3e3d2ac2f16f4d63))
