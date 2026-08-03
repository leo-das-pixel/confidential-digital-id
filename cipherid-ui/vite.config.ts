import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'assert', 'crypto', 'events', 'stream', 'util'],
      globals: { Buffer: true, global: true, process: true },
    }),
    (wasm as unknown as () => PluginOption)(),
    (topLevelAwait as unknown as () => PluginOption)(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'cross-fetch': path.resolve(__dirname, 'src/shims/cross-fetch-offset-fix.ts'),
    },
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/proof-server': {
        target: 'https://proof-server.preview.midnight.network',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/proof-server/, ''),
      },
    },
  },
});
