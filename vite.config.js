import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // لتحديث التطبيق تلقائياً عند رفع كود جديد
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'], // الأصول الأساسية
      manifest: {
        name: 'دكاني - نظام إدارة المبيعات', // الاسم الكامل
        short_name: 'دكاني', // الاسم القصير الذي سيظهر تحت الأيقونة في الموبايل
        description: 'أدر مبيعاتك ومخزونك بذكاء وسهولة',
        theme_color: '#4f46e5', // لون الشريط العلوي للموبايل (Indigo-600)
        background_color: '#ffffff', // لون شاشة التحميل (Splash Screen)
        display: 'standalone', // هذه الكلمة السحرية التي تخفي شريط المتصفح!
        dir: 'rtl', // لدعم اللغة العربية بشكل كامل
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // مهم جداً لأندرويد لتكييف شكل الأيقونة
          }
        ]
      }
    })
  ]
});