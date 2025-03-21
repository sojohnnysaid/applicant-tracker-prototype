import { rest } from 'msw';
// Debug log to verify this file is being loaded
console.log('Loading MSW handlers - minimal set for debugging');

// Mock data for testing
const testData = {
  user: { id: 1, name: 'Test User', role: 'Administrator' },
  items: [
    { id: 1, name: 'Item 1', status: 'Active' },
    { id: 2, name: 'Item 2', status: 'Pending' }
  ],
  // Sample application data for our app
  applications: [
    { id: 'APP-001', applicantName: 'Alice Smith', status: 'Eligible', program: 'Computer Science' },
    { id: 'APP-002', applicantName: 'Bob Johnson', status: 'Non-Compliant', program: 'Physics' },
    { id: 'APP-003', applicantName: 'Charlie Garcia', status: 'Ineligible', program: 'Biology' },
  ]
};

// Define MSW request handlers
export const handlers = [
  // GET test endpoint to verify MSW is working
  rest.get('/api/test', (req, res, ctx) => {
    console.log('MSW handled request to /api/test');
    return res(
      ctx.status(200),
      ctx.json({ 
        message: 'MSW is working!',
        timestamp: new Date().toISOString()
      })
    );
  }),
  
  // GET endpoint for current user
  rest.get('/api/user', (req, res, ctx) => {
    console.log('MSW handled request to /api/user');
    return res(
      ctx.status(200),
      ctx.json(testData.user)
    );
  }),
  
  // GET endpoint for items list
  rest.get('/api/items', (req, res, ctx) => {
    console.log('MSW handled request to /api/items');
    return res(
      ctx.status(200),
      ctx.json(testData.items)
    );
  }),
  
  // Application-specific API endpoints
  
  // GET all applications
  rest.get('/api/applications', (req, res, ctx) => {
    console.log('MSW handled request to /api/applications');
    // Optional filtering by query params
    const status = req.url.searchParams.get('status');
    
    let result = [...testData.applications];
    
    // Filter by status if provided
    if (status) {
      result = result.filter(app => app.status === status);
    }
    
    return res(
      ctx.status(200),
      ctx.json(result)
    );
  }),
  
  // GET application by ID
  rest.get('/api/applications/:id', (req, res, ctx) => {
    const { id } = req.params;
    console.log(`MSW handled request to /api/applications/${id}`);
    
    const application = testData.applications.find(app => app.id === id);
    
    if (application) {
      return res(
        ctx.status(200),
        ctx.json(application)
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Application not found' })
    );
  })
];
