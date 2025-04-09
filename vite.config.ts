/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import checker from 'vite-plugin-checker';

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
  plugins: [
    dts({
      include: ['./lib/**/*.ts'],
      exclude: ['./lib/markdownTableToCsv.ts'],
    }),
    checker({ typescript: true })]
})
