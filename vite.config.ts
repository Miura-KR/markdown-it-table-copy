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
  },
  plugins: [dts()]
})
