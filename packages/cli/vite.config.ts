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
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        'fs',
        'fs/promises',
        'path',
        'stream',
        'util'
      ]
    }
  },
  plugins: [dts({ tsconfigPath: 'tsconfig.json', outDir: 'build/src' })]
})

