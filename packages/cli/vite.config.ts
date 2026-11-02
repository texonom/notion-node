import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'main.js'
    },
    outDir: 'build/src',
    target: 'node16',
    sourcemap: true,
    minify: true,
    rollupOptions: {
      // Externalize all Node builtins (both bare and `node:`-prefixed) so they aren't
      // shimmed as browser externals — this is a Node CLI/library.
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        /^node:/,
        'child_process',
        'fs',
        'fs/promises',
        'path',
        'stream',
        'util',
        'url'
      ]
    }
  },
  // entryRoot keeps declarations beside main.js, where package.json's `types` points, not under build/src/src.
  plugins: [dts({ tsconfigPath: 'tsconfig.json', outDir: 'build/src', entryRoot: 'src' })]
})
