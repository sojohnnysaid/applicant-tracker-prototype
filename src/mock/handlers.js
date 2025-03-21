import { rest } from 'msw';
// Debug log to verify this file is being loaded
console.log('Loading MSW handlers with empty array for debugging');

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

// Empty array of handlers for debugging
export const handlers = [];
