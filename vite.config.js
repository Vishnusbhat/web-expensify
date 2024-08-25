import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Expensify',
        short_name: 'Expensify',
        description: 'TPO Management App.',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/public/icons/ExpLogo.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/public/icons/ExpLogo.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: '/public/icons/ExpLogo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
