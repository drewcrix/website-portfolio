import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The site is served from the root of www.drewcrix.com (GitHub Pages custom domain),
// so the base path is '/'. scripts/postbuild.mjs adds per-route HTML files for
// GitHub Pages after `vite build`.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    // Libraries change far less often than content, so keep them in their own
    // long-cacheable chunks.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/ },
          ],
        },
      },
    },
  },
})
