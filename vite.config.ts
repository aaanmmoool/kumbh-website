/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssMinify: true,
    // three.js is lazy-loaded with the hero centrepiece and is legitimately large
    chunkSizeWarningLimit: 800,
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
