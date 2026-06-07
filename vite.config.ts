/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

/** GitHub Pages: https://katsu996.github.io/JanCame/ */
const GITHUB_PAGES_BASE = '/JanCame/';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? GITHUB_PAGES_BASE : '/',
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
}));
