/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/** GitHub Pages: https://katsu996.github.io/JanCame/ */
const GITHUB_PAGES_BASE = '/JanCame/';

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? GITHUB_PAGES_BASE : '/';

  return {
    base,
    build: {
      target: 'es2022',
      outDir: 'dist',
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', '.nojekyll'],
        manifest: {
          name: 'JanCame',
          short_name: 'JanCame',
          description: 'カメラ映像から麻雀手牌を認識し、牌効率を表示する Web アプリ',
          theme_color: '#1a1a2e',
          background_color: '#1a1a2e',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,svg,wasm,png}'],
          navigateFallback: `${base}index.html`,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*opencv\.js/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'opencv-js',
                expiration: {
                  maxEntries: 1,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    test: {
      environment: 'happy-dom',
      include: ['tests/**/*.test.ts'],
      environmentMatchGlobs: [
        ['tests/efficiency/**', 'node'],
        ['tests/recognition/**', 'node'],
        ['tests/helpers/**', 'node'],
      ],
    },
    server: {
      fs: {
        allow: ['.', './pkg'],
      },
    },
  };
});
