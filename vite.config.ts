import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { promises as fs } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    {
      name: 'copy-static',
      closeBundle: async () => {
        await fs.cp(resolve(__dirname, 'public/icons'), resolve(__dirname, 'dist/icons'), { recursive: true });
        await fs.cp(resolve(__dirname, 'src/wasm'), resolve(__dirname, 'dist/wasm'), { recursive: true });
      },
    },
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
