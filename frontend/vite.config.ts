import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/`
export default defineConfig({

   server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,

    hmr: {
      host: 'localhost',
      protocol: 'ws'
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),

    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dirs: ['src/core/api', 'src/core/store', 'src/core/composables'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
