import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5000,
    strictPort: true,
    open: true, // Automatically open the browser
    hmr: {
      overlay: true // Enable HMR overlay for error messages
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') // Add source directory alias
    }
  },
  // Add clear console logging for debugging
  clearScreen: false
})
