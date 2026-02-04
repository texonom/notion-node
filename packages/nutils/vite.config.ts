import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js'
    },
    outDir: 'build',
    target: 'es2015',
    sourcemap: true,
    minify: true,
    rollupOptions: {
      external: ['is-url-superb', 'mem', 'normalize-url', '@texonom/ntypes', 'p-queue']
    }
  },
  plugins: [dts({ tsconfigPath: 'tsconfig.json', outDir: 'build' })]
})
