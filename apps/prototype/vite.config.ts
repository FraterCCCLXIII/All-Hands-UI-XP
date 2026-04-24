import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import tailwindPostcss from '@tailwindcss/postcss'
import react from '@vitejs/plugin-react'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindPostcss()],
    },
  },
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    open: true
  }
}) 