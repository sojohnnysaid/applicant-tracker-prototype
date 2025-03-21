import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5000,
    strictPort: true,
    open: '/index.html', // Explicitly open index.html
    hmr: {
      overlay: true // Enable HMR overlay for error messages
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') // Add source directory alias
    }
  },
  // Explicitly configure root directory and build options
  root: process.cwd(),
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  // Add clear console logging for debugging
  clearScreen: false
})
