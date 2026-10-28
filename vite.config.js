import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        voltexa: resolve(import.meta.dirname, 'work/voltexa/index.html'),
        'aurora-bank': resolve(import.meta.dirname, 'work/aurora-bank/index.html'),
        'lumen-studio': resolve(import.meta.dirname, 'work/lumen-studio/index.html'),
        'orbit-goods': resolve(import.meta.dirname, 'work/orbit-goods/index.html'),
      },
    },
  },
});
