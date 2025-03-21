import { worker } from './mock/browser';
import App from './App.svelte';

// Start mock service worker in development mode
if (process.env.NODE_ENV !== 'production') {
  worker.start();
}

const app = new App({
  target: document.getElementById('app')
});

export default app;
