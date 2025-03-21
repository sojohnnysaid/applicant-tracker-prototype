import { setupWorker } from 'msw';
import { handlers } from './handlers';

console.log('Setting up MSW worker with minimal handlers for debugging');

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// For debugging - make service worker available globally
if (typeof window !== 'undefined') {
  window.mswWorker = worker;
  console.log('MSW worker attached to window for debugging. Access it via window.mswWorker');
}
