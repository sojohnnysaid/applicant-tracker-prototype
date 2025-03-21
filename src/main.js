// Step 2: Import MSW and start it with error handling
console.log('Main.js executed - Starting incremental MSW debugging with worker start');

import App from './App.svelte';
import { worker } from './mock/browser';

console.log('MSW worker imported, now trying to start it');

// Create the Svelte app first
const app = new App({
  target: document.getElementById('app')
});

// Start worker with try/catch and detailed error reporting
try {
  // Start the worker
  worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    quiet: false, // Show startup logs
    serviceWorker: {
      url: '/mockServiceWorker.js', // Explicit path
      options: {
        scope: '/' // Root scope
      }
    }
  }).then(() => {
    console.log('MSW worker started successfully');
  }).catch(error => {
    console.error('MSW worker.start() promise rejected:', error);
  });
} catch (error) {
  console.error('Error starting MSW worker:', error);
  // Continue with app anyway
  console.log('App will continue without MSW');
}

export default app;
