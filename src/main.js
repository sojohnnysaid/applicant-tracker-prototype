// Simplified main.js - MSW initialization removed for now
console.log('Main.js executed - MSW disabled for debugging');

import App from './App.svelte';

// Create the Svelte app
const app = new App({
  target: document.getElementById('app')
});

export default app;
