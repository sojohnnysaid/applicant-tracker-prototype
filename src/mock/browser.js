import { setupWorker } from 'msw';
import { handlers } from './handlers';

console.log('Setting up MSW worker with empty handlers array');

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// For debugging - make service worker available globally
if (typeof window !== 'undefined') {
  window.mswWorker = worker;
}
