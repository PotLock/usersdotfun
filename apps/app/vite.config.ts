import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api/ws': {
        target: process.env.GATEWAY_URL || 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@usersdotfun/shared-db', '@usersdotfun/shared-types']
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      customViteReactPlugin: true
    }),
    viteReact(),
    tailwindcss()
  ],
})
