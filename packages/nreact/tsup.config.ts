import { Options, defineConfig } from 'tsup'

const baseConfig: Options = {
  entry: [
    'src/index.tsx',
    'src/third-party/code.tsx',
    'src/third-party/collection.tsx',
    'src/third-party/equation.tsx',
    'src/third-party/modal.tsx',
    'src/third-party/pdf.tsx'
  ],
  outDir: 'build',
  target: 'es2020',
  platform: 'browser',
  format: ['esm'],
  splitting: true,
  minify: true,
  shims: false
}

export default defineConfig([
  {
    ...baseConfig,
    outDir: 'build/dev',
    minify: false,
    sourcemap: true
  },
  {
    ...baseConfig,
    outDir: 'build',
    minify: true,
    sourcemap: false
  }
])
