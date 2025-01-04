/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-router', 'taomu-toolkit'],
    },
    lib: {
      name: 'taomu-routes',
      entry: './lib/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
  },
})
