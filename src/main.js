// Updated main.js with proper MSW initialization
console.log('Main.js executed - With improved MSW setup');

// Import our CSS
import './app.css';

// First import the app
import App from './App.svelte';

// Create a variable to hold the app instance
let app;

// Initialize MSW and then create the app
async function init() {
  // Start MSW with proper error handling
  try {
    console.log('Importing MSW worker');
    const { worker } = await import('./mock/browser');
    
    console.log('Starting MSW worker');
    await worker.start({
      // Only show warnings for API requests, not for app resources
      onUnhandledRequest: (request, print) => {
        // Ignore requests for app resources (Svelte files, JS, CSS, etc.)
        const isSvelteFile = request.url.pathname.includes('.svelte');
        const isAppResource = request.url.pathname.startsWith('/src/') || 
                              request.url.pathname.startsWith('/node_modules/') ||
                              request.url.pathname.includes('.js') ||
                              request.url.pathname.includes('.css');
                              
        // Only warn for API requests that aren't handled
        if (!isAppResource && request.url.pathname.startsWith('/api/')) {
          print.warning();
        } else if (isSvelteFile) {
          console.log('App resource request (not intercepted by MSW):', request.url.pathname);
        }
      },
      serviceWorker: {
        url: '/mockServiceWorker.js', // Explicit path
        options: {
          scope: '/' // Root scope
        }
      }
    });
    
    console.log('MSW worker started successfully');
    
    // Test MSW with a fetch request
    console.log('Testing MSW with a fetch to /api/test');
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      console.log('MSW test response:', data);
    } catch (fetchError) {
      console.error('Error testing MSW:', fetchError);
    }
    
  } catch (mswError) {
    console.error('Failed to initialize MSW:', mswError);
    // Continue without MSW - app will use real API calls
    console.warn('App will continue without MSW mock interceptors');
  }
  
  // Now create the Svelte app
  try {
    console.log('Creating Svelte app instance');
    app = new App({
      target: document.getElementById('app')
    });
    console.log('Svelte app created successfully');
    window.app = app; // For debugging
  } catch (appError) {
    console.error('Failed to create Svelte app:', appError);
    document.getElementById('app').innerHTML = `
      <div style="color: red; padding: 20px; border: 1px solid #ffaaaa; background: #ffeeee;">
        <h2>Error Creating App</h2>
        <p>${appError.message}</p>
        <p>Check console for details.</p>
      </div>
    `;
  }
}

// Start the initialization
init().catch(error => {
  console.error('Unexpected error during initialization:', error);
});

// Export the app
export default app;
