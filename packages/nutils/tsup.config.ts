import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'build',
  target: 'es2015',
  platform: 'browser',
  format: ['esm'],
  splitting: true,
  dts: true,
  sourcemap: true,
  minify: true,
  shims: false
})
