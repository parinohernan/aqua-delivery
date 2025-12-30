import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'AquaDelivery - Gestión de Pedidos',
        short_name: 'AquaDelivery',
        description: 'Sistema completo de gestión para delivery de agua con pedidos, clientes y productos',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Nuevo Pedido',
            short_name: 'Pedido',
            description: 'Crear un nuevo pedido',
            url: '/?route=pedidos',
            icons: [{ src: 'favicon.svg', sizes: '96x96' }]
          },
          {
            name: 'Clientes',
            short_name: 'Clientes',
            description: 'Gestionar clientes',
            url: '/?route=clientes',
            icons: [{ src: 'favicon.svg', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutos
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 4321,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8001',
        changeOrigin: true,
        secure: true
      },
      '/auth': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8001',
        changeOrigin: true,
        secure: true
      }
    }
  }
});

