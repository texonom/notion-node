import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  outDir: 'build/src',
  target: 'node14',
  platform: 'node',
  format: ['esm'],
  splitting: true,
  dts: true,
  sourcemap: true,
  minify: true,
  shims: false
})
