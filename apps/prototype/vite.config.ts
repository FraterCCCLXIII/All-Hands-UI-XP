import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import tailwindPostcss from '@tailwindcss/postcss'
import react from '@vitejs/plugin-react'

const isElectronDev = process.env.ELECTRON_DEV === 'true'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindPostcss()],
    },
  },
  plugins: [tailwindcss(), react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: !isElectronDev,
  },
})
