// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  server: {
    port: 4321,
    host: true
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true
        },
        '/auth': {
          target: 'http://localhost:8001',
          changeOrigin: true
        }
      }
    }
  }
});
