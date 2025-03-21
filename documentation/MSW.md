# Mock Service Worker Integration Guide

This document explains how Mock Service Worker (MSW) is set up and used in the GRFP Application Tracker prototype.

## Overview

Mock Service Worker is a library that intercepts actual HTTP requests at the network level and provides mock responses. This allows us to develop and test our application without a real backend server.

In this application, MSW is used to simulate API endpoints for:
- User information
- Application data
- RWR (Return Without Review) functionality
- Basic test endpoints

## Setup and Configuration

### 1. Installation

MSW is installed as a development dependency:

```bash
npm install msw --save-dev
```

### 2. Service Worker File

The MSW service worker file is generated and placed in the public directory:

```bash
npx msw init public/ --save
```

This creates `public/mockServiceWorker.js` which handles the actual request interception.

### 3. Project Structure

Our MSW setup is organized into these files:

- `src/mock/handlers.js` - Contains API endpoint definitions and mock data
- `src/mock/browser.js` - Configures the MSW worker for the browser environment
- `src/main.js` - Initializes MSW during application startup

## How It Works

### 1. Handler Definitions (src/mock/handlers.js)

Handlers define which API endpoints to mock and what responses to return. Each handler specifies:
- HTTP method (GET, POST, etc.)
- URL pattern to match
- Response resolver function

Example:

```javascript
rest.get('/api/applications', (req, res, ctx) => {
  // Get query parameters
  const status = req.url.searchParams.get('status');
  
  // Filter mock data if needed
  let result = [...mockData.applications];
  if (status) {
    result = result.filter(app => app.status === status);
  }
  
  // Return the response
  return res(ctx.status(200), ctx.json(result));
})
```

### 2. Worker Setup (src/mock/browser.js)

This file creates and exports the MSW worker with all defined handlers:

```javascript
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

### 3. Worker Initialization (src/main.js)

MSW is initialized in the main entry point:

```javascript
async function init() {
  try {
    // Import MSW browser worker
    const { worker } = await import('./mock/browser');
    
    // Start the worker with configuration options
    await worker.start({
      // Configure unhandled request behavior
      onUnhandledRequest: (request, print) => {
        // Ignore app resources, only show warnings for API requests
        const isAppResource = request.url.pathname.startsWith('/src/') || 
                            request.url.pathname.includes('.js');
        
        if (!isAppResource && request.url.pathname.startsWith('/api/')) {
          print.warning();
        }
      },
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    
    console.log('MSW initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MSW:', error);
  }
  
  // Continue with app initialization...
}
```

## Mock Data

Our application uses a basic mock data set defined in `handlers.js`:

```javascript
const mockData = {
  // User information
  user: { id: 1, name: 'Test User', role: 'Administrator' },
  
  // Sample applications
  applications: [
    { 
      id: 'APP-001', 
      applicantName: 'Alice Smith', 
      status: 'Eligible', 
      program: 'Computer Science' 
    },
    // More application entries...
  ]
};
```

## Testing Endpoints

The application includes a testing page to verify MSW functionality. Access it via the "MSW Test" navigation option. The page demonstrates:

1. Making API requests to mock endpoints
2. Displaying the responses
3. Handling errors gracefully

## Debugging

When debugging MSW issues:

1. **Check Browser Console**: Look for the "[MSW] Mocking enabled" message on startup.
2. **Unhandled Requests**: MSW will show warnings for API requests without handlers.
3. **Request Examination**: Use the Network tab in browser DevTools to see which requests are intercepted by the service worker.

## Best Practices

1. **Group Related Handlers**: Organize handlers logically by feature or entity.
2. **Match API Structure**: Ensure mock responses match the structure of your real API.
3. **Handle Errors**: Include error cases to test application resilience.
4. **Filter Warnings**: Configure MSW to only warn about relevant unhandled requests.

## Extending

To add new mock endpoints:

1. Add new mock data to the mockData object in `handlers.js`
2. Define a new request handler in the handlers array
3. Implement the appropriate response logic

Example for adding a new endpoint:

```javascript
rest.get('/api/new-endpoint', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({ message: 'New endpoint response' })
  );
})
```

## Resources

- [MSW Documentation](https://mswjs.io/docs/)
- [Request Handlers API](https://mswjs.io/docs/basics/request-handler)
- [Response Composition](https://mswjs.io/docs/basics/response-resolver)