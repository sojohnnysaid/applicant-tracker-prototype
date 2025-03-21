// Minimal main.js without MSW
console.log('Minimal main.js executed');

// Import a minimal Svelte component
import MinimalApp from './MinimalApp.svelte';

const app = new MinimalApp({
  target: document.getElementById('app')
});

export default app;