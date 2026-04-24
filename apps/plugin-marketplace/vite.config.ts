import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import tailwindPostcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindPostcss()],
    },
  },
  plugins: [tailwindcss(), react()],
  server: {
    /** Bind on all interfaces so localhost / 127.0.0.1 / remote port forwarding behave consistently. */
    host: true,
    port: 3002,
    /** Fail fast if another process is using 3002 (avoids silently moving to another port). */
    strictPort: true,
    open: true,
  },
});
