import App from './App.svelte';
import { worker } from './mock/browser';

// Create the Svelte app first
const app = new App({
  target: document.getElementById('app')
});

// Start mock service worker in development mode
// We need to wrap this in async/await to ensure it's properly initialized
async function startMockWorker() {
  console.log('Starting Mock Service Worker...');
  try {
    // Start the worker with warnings for unhandled requests
    await worker.start({
      onUnhandledRequest: 'warn',
      waitUntilReady: true, // Wait until the service worker is ready
    });
    console.log('Mock Service Worker started successfully');
  } catch (error) {
    console.error('Failed to start Mock Service Worker:', error);
  }
}

// Start the worker
startMockWorker();

export default app;
