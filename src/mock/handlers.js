import { rest } from 'msw';
// Debug log to verify this file is being loaded
console.log('Loading MSW handlers - GRFP application tracker');

// Mock data for testing
const mockData = {
  user: { id: 1, name: 'Test User', role: 'Administrator' },
  items: [
    { id: 1, name: 'Item 1', status: 'Active' },
    { id: 2, name: 'Item 2', status: 'Pending' }
  ],
  
  // Mock summary data for dashboard
  summary: {
    total: 120,
    eligible: 85,
    nonCompliant: 15,
    ineligible: 20,
    pending: 35,
    rwrIssued: 28,
    clarificationPending: 8
  },
  
  // Sample application data for our app - enhanced structure
  applications: [
    { 
      id: 'APP-001', 
      applicantName: 'Alice Smith', 
      status: 'Eligible', 
      program: 'Computer Science',
      submissionDate: '2025-02-12',
      assignedTo: 'Screener',
      rwr: []
    },
    { 
      id: 'APP-002', 
      applicantName: 'Bob Johnson', 
      status: 'Non-Compliant', 
      program: 'Physics',
      submissionDate: '2025-02-15',
      assignedTo: 'Manager',
      rwr: [
        { 
          code: 'NC-001', 
          reason: 'Missing Transcript', 
          dateIssued: '2025-03-01',
          clarifiable: true
        }
      ]
    },
    { 
      id: 'APP-003', 
      applicantName: 'Charlie Garcia', 
      status: 'Ineligible', 
      program: 'Biology',
      submissionDate: '2025-02-10',
      assignedTo: 'Manager',
      rwr: [
        { 
          code: 'IE-002', 
          reason: 'Previous Fellowship', 
          dateIssued: '2025-03-02',
          clarifiable: false
        }
      ]
    },
    { 
      id: 'APP-004', 
      applicantName: 'Dana Chen', 
      status: 'Pending', 
      program: 'Mathematics',
      submissionDate: '2025-02-20',
      assignedTo: 'Screener',
      rwr: []
    },
    { 
      id: 'APP-005', 
      applicantName: 'Ethan Wright', 
      status: 'Eligible', 
      program: 'Chemistry',
      submissionDate: '2025-02-17',
      assignedTo: 'Screener',
      rwr: []
    },
    { 
      id: 'APP-006', 
      applicantName: 'Fatima Al-Zahrani', 
      status: 'Pending', 
      program: 'Engineering',
      submissionDate: '2025-02-19',
      assignedTo: 'Screener',
      rwr: []
    },
    { 
      id: 'APP-007', 
      applicantName: 'George Kim', 
      status: 'Non-Compliant', 
      program: 'Engineering',
      submissionDate: '2025-02-11',
      assignedTo: 'Manager',
      rwr: [
        { 
          code: 'NC-003', 
          reason: 'Incomplete Application', 
          dateIssued: '2025-03-01',
          clarifiable: true
        }
      ]
    },
    { 
      id: 'APP-008', 
      applicantName: 'Hannah Patel', 
      status: 'Eligible', 
      program: 'Physics',
      submissionDate: '2025-02-14',
      assignedTo: 'Screener',
      rwr: []
    },
    { 
      id: 'APP-009', 
      applicantName: 'Ian Rodriguez', 
      status: 'Pending', 
      program: 'Computer Science',
      submissionDate: '2025-02-21',
      assignedTo: 'Screener',
      rwr: []
    },
    { 
      id: 'APP-010', 
      applicantName: 'Julia Thompson', 
      status: 'Ineligible', 
      program: 'Mathematics',
      submissionDate: '2025-02-13',
      assignedTo: 'Manager',
      rwr: [
        { 
          code: 'IE-001', 
          reason: 'Ineligible Field of Study', 
          dateIssued: '2025-03-03',
          clarifiable: false
        }
      ]
    }
  ],
  
  // RWR code options
  rwrCodes: [
    { code: 'NC-001', reason: 'Missing Transcript', clarifiable: true },
    { code: 'NC-002', reason: 'Incomplete Reference', clarifiable: true },
    { code: 'NC-003', reason: 'Incomplete Application', clarifiable: true },
    { code: 'IE-001', reason: 'Ineligible Field of Study', clarifiable: false },
    { code: 'IE-002', reason: 'Previous Fellowship', clarifiable: false }
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
      ctx.json(mockData.user)
    );
  }),
  
  // GET endpoint for items list
  rest.get('/api/items', (req, res, ctx) => {
    console.log('MSW handled request to /api/items');
    return res(
      ctx.status(200),
      ctx.json(mockData.items)
    );
  }),
  
  // GET summary statistics for dashboard
  rest.get('/api/summary', (req, res, ctx) => {
    console.log('MSW handled request to /api/summary');
    return res(
      ctx.status(200),
      ctx.json(mockData.summary)
    );
  }),
  
  // Application-specific API endpoints
  
  // GET all applications
  rest.get('/api/applications', (req, res, ctx) => {
    console.log('MSW handled request to /api/applications');
    // Optional filtering by query params
    const status = req.url.searchParams.get('status');
    const role = req.url.searchParams.get('role');
    
    let result = [...mockData.applications];
    
    // Filter by status if provided
    if (status) {
      result = result.filter(app => app.status === status);
    }
    
    // Role-based filtering
    if (role) {
      if (role === 'Screener') {
        // Screeners only see applications assigned to them
        result = result.filter(app => app.assignedTo === 'Screener');
      } else if (role === 'Manager') {
        // Managers see all applications but prioritize those requiring action
        // Just returning all for now, but would filter or sort in a real implementation
      }
      // Program Officers see all applications
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
    
    const application = mockData.applications.find(app => app.id === id);
    
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
  }),
  
  // PATCH update application status
  rest.patch('/api/applications/:id', (req, res, ctx) => {
    const { id } = req.params;
    const updates = req.body;
    console.log(`MSW handled PATCH request to /api/applications/${id}`, updates);
    
    const appIndex = mockData.applications.findIndex(app => app.id === id);
    
    if (appIndex !== -1) {
      // Update application data with request body
      mockData.applications[appIndex] = {
        ...mockData.applications[appIndex],
        ...updates
      };
      
      return res(
        ctx.status(200),
        ctx.json(mockData.applications[appIndex])
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Application not found' })
    );
  }),
  
  // GET RWR code options
  rest.get('/api/rwr-codes', (req, res, ctx) => {
    console.log('MSW handled request to /api/rwr-codes');
    return res(
      ctx.status(200),
      ctx.json(mockData.rwrCodes)
    );
  }),
  
  // POST issue RWR
  rest.post('/api/applications/:id/rwr', (req, res, ctx) => {
    const { id } = req.params;
    const rwrData = req.body;
    console.log(`MSW handled POST request to /api/applications/${id}/rwr`, rwrData);
    
    const appIndex = mockData.applications.findIndex(app => app.id === id);
    
    if (appIndex !== -1) {
      // Add RWR to application
      const updatedApp = {
        ...mockData.applications[appIndex],
        status: 'Non-Compliant', // Update status
        rwr: [
          ...mockData.applications[appIndex].rwr,
          {
            ...rwrData,
            dateIssued: new Date().toISOString().split('T')[0]
          }
        ]
      };
      
      mockData.applications[appIndex] = updatedApp;
      
      return res(
        ctx.status(201),
        ctx.json(updatedApp)
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Application not found' })
    );
  })
];
