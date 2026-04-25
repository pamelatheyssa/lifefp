import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Life Planner',
        short_name: 'Life Planner',
        description: 'Organize sua vida e família',
        theme_color: '#534AB7',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        shortcuts: [
          { name: 'Calendário', url: '/?tab=calendar', description: 'Abrir calendário' },
          { name: 'Tarefas',    url: '/?tab=tasks',    description: 'Abrir tarefas' },
          { name: 'Hábitos',   url: '/?tab=habits',   description: 'Abrir hábitos' }
        ],
        widgets: [
          {
            name: 'Calendário Hoje',
            description: 'Veja seus eventos de hoje',
            tag: 'calendar-today',
            template: 'calendar-today-template',
            ms_ac_template: 'widgets/calendar.json',
            data: '/api/widget/calendar',
            type: 'application/json',
            screenshots: [{ src: 'icon-512.png', sizes: '512x512', label: 'Widget calendário' }],
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
            auth: false,
            update: 3600
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-cache' }
          }
        ]
      }
    })
  ]
})
