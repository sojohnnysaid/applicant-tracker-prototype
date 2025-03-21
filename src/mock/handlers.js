import { rest } from 'msw';

// Example fake application data
const applications = [
  {
    id: 'A-001',
    applicantName: 'Alice Example',
    status: 'Eligible',
    rwr: [],
    assignedTo: 'Screener1',
    submissionDate: '2025-01-15',
    programType: 'Computer Science',
    transcriptStatus: 'Complete',
    clarificationStatus: null
  },
  {
    id: 'A-002',
    applicantName: 'Bob Graduate',
    status: 'Non-Compliant',
    rwr: [
      { 
        code: 'MissingTranscript', 
        clarifiable: true,
        dateSent: '2025-02-01',
        dateResponded: null,
        status: 'Pending'
      }
    ],
    assignedTo: 'Manager1',
    submissionDate: '2025-01-17',
    programType: 'Physics',
    transcriptStatus: 'Incomplete',
    clarificationStatus: 'Pending'
  },
  {
    id: 'A-003',
    applicantName: 'Charlie Scholar',
    status: 'Ineligible',
    rwr: [
      { 
        code: 'PriorAward', 
        clarifiable: false,
        dateSent: '2025-02-05',
        dateResponded: null,
        status: 'Final'
      }
    ],
    assignedTo: 'Screener2',
    submissionDate: '2025-01-10',
    programType: 'Chemistry',
    transcriptStatus: 'Complete',
    clarificationStatus: null
  },
  {
    id: 'A-004',
    applicantName: 'Dana Researcher',
    status: 'Eligible',
    rwr: [],
    assignedTo: 'Screener1',
    submissionDate: '2025-01-20',
    programType: 'Engineering',
    transcriptStatus: 'Complete',
    clarificationStatus: null
  },
  {
    id: 'A-005',
    applicantName: 'Elijah Professor',
    status: 'Pending',
    rwr: [],
    assignedTo: 'Screener2',
    submissionDate: '2025-01-22',
    programType: 'Mathematics',
    transcriptStatus: 'Under Review',
    clarificationStatus: null
  }
];

// RWR reason codes
const rwrCodes = [
  { code: 'MissingTranscript', description: 'Missing official transcript', clarifiable: true },
  { code: 'IncompleteApplication', description: 'Incomplete application form', clarifiable: true },
  { code: 'PriorAward', description: 'Prior NSF GRFP award', clarifiable: false },
  { code: 'NonUSCitizen', description: 'Not a US citizen or permanent resident', clarifiable: false },
  { code: 'InvalidDegree', description: 'Invalid degree type for eligibility', clarifiable: false },
  { code: 'PastDegreeLimit', description: 'Exceeds allowed time since degree conferral', clarifiable: false }
];

export const handlers = [
  // GET the list of applications
  rest.get('/api/applications', (req, res, ctx) => {
    // Get role from query params for filtering
    const role = req.url.searchParams.get('role');
    const status = req.url.searchParams.get('status');
    
    let filteredApps = [...applications];
    
    // Filter by role if specified
    if (role === 'Screener') {
      filteredApps = filteredApps.filter(app => app.assignedTo.startsWith('Screener'));
    } else if (role === 'Manager') {
      // Managers see apps with RWRs or assigned to managers
      filteredApps = filteredApps.filter(app => 
        app.assignedTo.startsWith('Manager') || 
        app.rwr.length > 0 || 
        app.status === 'Non-Compliant'
      );
    }
    
    // Filter by status if specified
    if (status) {
      filteredApps = filteredApps.filter(app => app.status === status);
    }
    
    return res(ctx.status(200), ctx.json(filteredApps));
  }),
  
  // GET a single application by ID
  rest.get('/api/applications/:id', (req, res, ctx) => {
    const { id } = req.params;
    const application = applications.find(app => app.id === id);
    
    if (application) {
      return res(ctx.status(200), ctx.json(application));
    }
    
    return res(ctx.status(404), ctx.json({ message: 'Application not found' }));
  }),
  
  // PATCH update an application
  rest.patch('/api/applications/:id', (req, res, ctx) => {
    const { id } = req.params;
    const update = req.body;
    const index = applications.findIndex(app => app.id === id);
    
    if (index !== -1) {
      applications[index] = {
        ...applications[index],
        ...update,
      };
      return res(ctx.status(200), ctx.json(applications[index]));
    }
    
    return res(ctx.status(404), ctx.json({ message: 'Application not found' }));
  }),
  
  // GET RWR codes
  rest.get('/api/rwr-codes', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(rwrCodes));
  }),
  
  // POST issue RWR
  rest.post('/api/applications/:id/rwr', (req, res, ctx) => {
    const { id } = req.params;
    const { rwrCodes, issuedBy } = req.body;
    const index = applications.findIndex(app => app.id === id);
    
    if (index !== -1) {
      // Add the RWR codes to the application
      const newRwrs = rwrCodes.map(code => ({
        code,
        clarifiable: rwrCodes.find(c => c.code === code)?.clarifiable || false,
        dateSent: new Date().toISOString().split('T')[0],
        dateResponded: null,
        status: 'Pending',
        issuedBy
      }));
      
      applications[index].rwr = [...applications[index].rwr, ...newRwrs];
      applications[index].status = 'Non-Compliant';
      
      return res(ctx.status(200), ctx.json(applications[index]));
    }
    
    return res(ctx.status(404), ctx.json({ message: 'Application not found' }));
  }),
  
  // GET summary statistics
  rest.get('/api/summary', (req, res, ctx) => {
    const counts = {
      total: applications.length,
      eligible: applications.filter(app => app.status === 'Eligible').length,
      nonCompliant: applications.filter(app => app.status === 'Non-Compliant').length,
      ineligible: applications.filter(app => app.status === 'Ineligible').length,
      pending: applications.filter(app => app.status === 'Pending').length,
      rwrIssued: applications.filter(app => app.rwr.length > 0).length,
      clarificationPending: applications.filter(app => app.clarificationStatus === 'Pending').length
    };
    
    return res(ctx.status(200), ctx.json(counts));
  })
];
