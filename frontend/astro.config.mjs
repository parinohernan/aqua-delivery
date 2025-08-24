// @ts-check
import { defineConfig } from 'astro/config';
import { config } from './config.js';

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
          target: config.API_BASE_URL,
          changeOrigin: true,
          secure: true
        },
        '/auth': {
          target: config.API_BASE_URL,
          changeOrigin: true,
          secure: true
        }
      }
    }
  }
});
