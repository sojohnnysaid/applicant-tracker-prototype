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
  
  // Sample application data for our app - enhanced structure with status history
  applications: [
    { 
      id: 'APP-001', 
      applicantName: 'Alice Smith', 
      status: 'Eligible', 
      program: 'Computer Science',
      submissionDate: '2025-02-12',
      assignedTo: 'Screener',
      rwr: [],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-12T14:30:45Z', 
          changedBy: 'System', 
          note: 'Application received' 
        },
        { 
          status: 'Eligible', 
          date: '2025-02-25T09:15:22Z', 
          changedBy: 'Screener', 
          note: 'All requirements met' 
        }
      ]
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
      ],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-15T08:45:12Z', 
          changedBy: 'System', 
          note: 'Application received' 
        },
        { 
          status: 'Non-Compliant', 
          date: '2025-03-01T11:23:54Z', 
          changedBy: 'Screener', 
          note: 'Missing required transcript' 
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
      ],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-10T10:22:33Z', 
          changedBy: 'System', 
          note: 'Application received' 
        },
        { 
          status: 'Ineligible', 
          date: '2025-03-02T14:05:17Z', 
          changedBy: 'Manager', 
          note: 'Previous fellowship recipient' 
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
      rwr: [],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-20T16:15:43Z', 
          changedBy: 'System', 
          note: 'Application received' 
        }
      ]
    },
    { 
      id: 'APP-005', 
      applicantName: 'Ethan Wright', 
      status: 'Eligible', 
      program: 'Chemistry',
      submissionDate: '2025-02-17',
      assignedTo: 'Screener',
      rwr: [],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-17T09:30:25Z', 
          changedBy: 'System', 
          note: 'Application received' 
        },
        { 
          status: 'Eligible', 
          date: '2025-02-28T13:45:30Z', 
          changedBy: 'Screener', 
          note: 'All requirements met' 
        }
      ]
    },
    { 
      id: 'APP-006', 
      applicantName: 'Fatima Al-Zahrani', 
      status: 'Pending', 
      program: 'Engineering',
      submissionDate: '2025-02-19',
      assignedTo: 'Screener',
      rwr: [],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-19T11:10:55Z', 
          changedBy: 'System', 
          note: 'Application received' 
        }
      ]
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
      ],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-11T13:20:18Z', 
          changedBy: 'System', 
          note: 'Application received' 
        },
        { 
          status: 'Non-Compliant', 
          date: '2025-03-01T10:05:44Z', 
          changedBy: 'Screener', 
          note: 'Incomplete application' 
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
      rwr: [],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-14T15:40:22Z', 
          changedBy: 'System', 
          note: 'Application received' 
        },
        { 
          status: 'Eligible', 
          date: '2025-02-27T14:35:10Z', 
          changedBy: 'Screener', 
          note: 'All requirements met' 
        }
      ]
    },
    { 
      id: 'APP-009', 
      applicantName: 'Ian Rodriguez', 
      status: 'Pending', 
      program: 'Computer Science',
      submissionDate: '2025-02-21',
      assignedTo: 'Screener',
      rwr: [],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-21T08:30:15Z', 
          changedBy: 'System', 
          note: 'Application received' 
        }
      ]
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
      ],
      statusHistory: [
        { 
          status: 'Pending', 
          date: '2025-02-13T09:25:33Z', 
          changedBy: 'System', 
          note: 'Application received' 
        },
        { 
          status: 'Ineligible', 
          date: '2025-03-03T13:50:20Z', 
          changedBy: 'Manager', 
          note: 'Ineligible field of study' 
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
      const currentApp = mockData.applications[appIndex];
      
      // Check if status is changing and add to history if it is
      if (updates.status && updates.status !== currentApp.status) {
        // Ensure statusHistory exists
        if (!currentApp.statusHistory) {
          currentApp.statusHistory = [];
        }
        
        // Add status change to history with detailed timestamp in UTC
        const statusEntry = {
          status: updates.status,
          date: updates.updateDate || new Date().toISOString(),
          changedBy: updates.updatedBy || 'Unknown',
          note: updates.notes || ''
        };
        
        // Update application with new status history
        updates.statusHistory = [...currentApp.statusHistory, statusEntry];
      }
      
      // Update application data with request body
      mockData.applications[appIndex] = {
        ...currentApp,
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
      const currentApp = mockData.applications[appIndex];
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Prepare RWR details
      const rwrEntry = {
        ...rwrData,
        dateIssued: currentDate
      };
      
      // Check if status is changing from current status to Non-Compliant
      if (currentApp.status !== 'Non-Compliant') {
        // Ensure statusHistory exists
        if (!currentApp.statusHistory) {
          currentApp.statusHistory = [];
        }
        
        // Add RWR issuance to status history with UTC timestamp
        const statusEntry = {
          status: 'Non-Compliant',
          date: new Date().toISOString(),
          changedBy: rwrData.issuedBy || 'System',
          note: `RWR issued: ${rwrData.code} - ${rwrData.reason || ''}`
        };
        
        // Add RWR to application with status history updated
        const updatedApp = {
          ...currentApp,
          status: 'Non-Compliant', // Update status
          rwr: [...currentApp.rwr, rwrEntry],
          statusHistory: [...currentApp.statusHistory, statusEntry]
        };
        
        mockData.applications[appIndex] = updatedApp;
        
        return res(
          ctx.status(201),
          ctx.json(updatedApp)
        );
      } else {
        // Just add the RWR but don't change status history since already Non-Compliant
        const updatedApp = {
          ...currentApp,
          rwr: [...currentApp.rwr, rwrEntry]
        };
        
        mockData.applications[appIndex] = updatedApp;
        
        return res(
          ctx.status(201),
          ctx.json(updatedApp)
        );
      }
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Application not found' })
    );
  })
];
