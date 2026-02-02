// Plugins
import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Fonts from 'unplugin-fonts/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import Layouts from 'vite-plugin-vue-layouts-next'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiTarget = env.VITE_API_URL

  if (!apiTarget) {
    throw new Error('VITE_API_URL is not defined')
  }
  return {
    css: {
      preprocessorOptions: {
        scss: {}
      }
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'masked-icon.svg'
        ],
        manifest: {
          name: 'LD Toypad Emulator',
          short_name: 'LD Toypad',
          description:
            'A tutorial on building a resilient PWA with Vue and Vite',
          theme_color: '#49494b',
          icons: [
            {
              // 2. Updated to match your actual filenames
              src: 'manifest-icon-192.maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'manifest-icon-512.maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        devOptions: {
          enabled: true // Required to test PWA features on localhost
        }
      }),
      VueRouter({
        dts: 'src/typed-router.d.ts'
      }),
      Layouts(),
      AutoImport({
        imports: [
          'vue',
          VueRouterAutoImports,
          {
            pinia: ['defineStore', 'storeToRefs']
          }
        ],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true
        },
        vueTemplate: true
      }),
      Components({
        dts: 'src/components.d.ts'
      }),
      Vue({
        template: { transformAssetUrls }
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
      Vuetify({
        autoImport: true,
        styles: {
          configFile: 'src/styles/settings.scss'
        }
      }),
      Fonts({
        fontsource: {
          families: [
            {
              name: 'Roboto',
              weights: [100, 300, 400, 500, 700, 900],
              styles: ['normal', 'italic']
            }
          ]
        }
      })
    ],
    optimizeDeps: {
      exclude: [
        'vuetify',
        'vue-router',
        'unplugin-vue-router/runtime',
        'unplugin-vue-router/data-loaders',
        'unplugin-vue-router/data-loaders/basic'
      ]
    },
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url))
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
    },
    server: {
      port: 3000,
      // TODO BETTER DEV SETUP? I don't really know how to run backend without the USB gadget
      // I did it by running the backend on the pi and then just using the ip of the pi for the proxy
      proxy: {
        '/socket.io': {
          target: apiTarget,
          ws: true
        },
        '/json': {
          target: apiTarget,
          changeOrigin: true
        },
        '/images': {
          target: apiTarget,
          changeOrigin: true
        },
        '/character': {
          target: apiTarget,
          changeOrigin: true
        },
        '/vehicle': {
          target: apiTarget,
          changeOrigin: true
        },
        '/place': {
          target: apiTarget,
          changeOrigin: true
        },
        '/remove': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  }
})
