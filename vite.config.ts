/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
  },

  build: {
    rollupOptions: {
      external: ['react', 'react-router-dom'],
    },
    lib: {
      name: 'taomu-routes',
      entry: './lib/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
  },
})
