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
      external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]
    }
  },
  plugins: [dts({ tsconfigPath: 'tsconfig.json', outDir: 'build' })]
})
