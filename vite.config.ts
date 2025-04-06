/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  build: {
    lib: {
      entry: ['./lib/index.ts'],
      name: 'markdown-it-table-copy',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['markdown-it', '@mdi/font'],
      output: {
        globals: {
          'markdown-it': 'markdownit',
        },
      },
    },
  },
  plugins: [dts({
    include: ['lib/**/*.ts'],
    exclude: ['lib/markdownTableToCsv.ts'],
  })]
})
