import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'markdown-it-table-copy',
      fileName: 'markdown-it-table-copy',
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
})
