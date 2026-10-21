import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.tsx',
        'third-party/modal': 'src/third-party/modal.tsx',
        'third-party/code': 'src/third-party/code.tsx',
        'third-party/collection': 'src/third-party/collection.tsx',
        'third-party/equation': 'src/third-party/equation.tsx'
      },
      formats: ['es']
    },
    outDir: 'build',
    target: 'es2015',
    sourcemap: true,
    minify: true,
    rollupOptions: {
      // CJS deps that break Vite/Astro consumers via bare named imports get bundled into
      // nreact's ESM output. react-fast-compare is CJS-only; react-use/react-image ship an
      // ESM build but only via the legacy `module` field, which Node-externalization (e.g.
      // SSR) can't read for named imports — so inline them too. Pure-ESM deps stay external.
      // react-modal stays external: it is only ever default-imported, which every bundler
      // reads from CJS, and inlined its require('react') cannot load in a browser bundle.
      external: [
        ...Object.keys(pkg.dependencies || {}).filter(d => !['react-fast-compare', 'react-use', 'react-image'].includes(d)),
        ...Object.keys(pkg.peerDependencies || {})
      ]
    }
  },
  plugins: [dts({ tsconfigPath: 'tsconfig.json', outDir: 'build' })]
})
