import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Minimal configuration to debug serving issues
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5000,
    fs: {
      // Allow serving files from project root
      allow: ['.']
    }
  }
})
