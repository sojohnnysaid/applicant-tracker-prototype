<script>
  import { onMount } from 'svelte';
  import { userRole, isScreener, isManager, isProgramOfficer } from '../stores/roleStore';
  
  export let navigateTo;
  
  // Get user name from localStorage
  $: userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'User' : 'User';
  
  // Summary data for application statistics
  let summaryData = {
    total: 120,
    eligible: 85,
    nonCompliant: 15,
    ineligible: 20,
    pending: 35,
    rwrIssued: 28,
    clarificationPending: 8
  };
  
  // Dashboard statistics based on role
  const dashboardStats = {
    Screener: {
      assignedApplications: 24,
      reviewedToday: 8,
      pendingReview: 16,
      completionRate: '33%'
    },
    Manager: {
      totalApplications: summaryData.total,
      pendingDecisions: 15,
      rwrIssued: summaryData.rwrIssued,
      clarificationsReceived: summaryData.clarificationPending
    },
    ProgramOfficer: {
      eligibleApplications: summaryData.eligible,
      ineligibleApplications: summaryData.ineligible + summaryData.nonCompliant,
      rwrTotal: summaryData.rwrIssued,
      pendingClarifications: summaryData.clarificationPending
    }
  };
  
  // Get stats based on user role
  $: stats = dashboardStats[$userRole] || {};
  
  onMount(async () => {
    try {
      const response = await fetch('/api/summary');
      if (response.ok) {
        const data = await response.json();
        summaryData = {
          ...summaryData,
          ...data
        };
        
        // Update role-specific dashboard stats with new summary data
        dashboardStats.Manager.totalApplications = summaryData.total;
        dashboardStats.Manager.rwrIssued = summaryData.rwrIssued;
        dashboardStats.Manager.clarificationsReceived = summaryData.clarificationPending;
        
        dashboardStats.ProgramOfficer.eligibleApplications = summaryData.eligible;
        dashboardStats.ProgramOfficer.ineligibleApplications = summaryData.ineligible + summaryData.nonCompliant;
        dashboardStats.ProgramOfficer.rwrTotal = summaryData.rwrIssued;
        dashboardStats.ProgramOfficer.pendingClarifications = summaryData.clarificationPending;
      }
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  });
</script>

<div class="home-container">
  <div class="welcome-header">
    <h1>Welcome, {userName}</h1>
    <p class="role-display">You are logged in as: <strong>{$userRole}</strong></p>
  </div>
  
  <div class="dashboard">
    <div class="summary-grid">
      <div class="summary-card">
        <h2>Applications Overview</h2>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">Total Applications</span>
            <span class="stat-value">{summaryData.total}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Eligible</span>
            <span class="stat-value stat-eligible">{summaryData.eligible}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Non-Compliant</span>
            <span class="stat-value stat-non-compliant">{summaryData.nonCompliant}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Ineligible</span>
            <span class="stat-value stat-ineligible">{summaryData.ineligible}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Pending Review</span>
            <span class="stat-value stat-pending">{summaryData.pending}</span>
          </div>
        </div>
      </div>
      
      <!-- Role-specific dashboard content -->
      {#if $isScreener}
        <div class="role-card">
          <h2>Screener Dashboard</h2>
          <div class="role-stats">
            <div class="stat-row">
              <div class="stat-item">
                <span class="stat-label">Assigned to You</span>
                <span class="stat-value">{stats.assignedApplications}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Reviewed Today</span>
                <span class="stat-value">{stats.reviewedToday}</span>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat-item">
                <span class="stat-label">Pending Review</span>
                <span class="stat-value">{stats.pendingReview}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Completion Rate</span>
                <span class="stat-value">{stats.completionRate}</span>
              </div>
            </div>
          </div>
          
          <div class="actions-card">
            <h3>Quick Actions</h3>
            <button on:click={() => navigateTo('applications')} class="primary-btn">
              View Assigned Applications
            </button>
          </div>
        </div>
      
      {:else if $isManager}
        <div class="role-card">
          <h2>Manager Dashboard</h2>
          <div class="role-stats">
            <div class="stat-row">
              <div class="stat-item">
                <span class="stat-label">Pending Decisions</span>
                <span class="stat-value">{stats.pendingDecisions}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">RWR Issued</span>
                <span class="stat-value">{stats.rwrIssued}</span>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat-item">
                <span class="stat-label">Clarifications</span>
                <span class="stat-value">{stats.clarificationsReceived}</span>
              </div>
            </div>
          </div>
          
          <div class="actions-card">
            <h3>Quick Actions</h3>
            <div class="action-buttons">
              <button on:click={() => navigateTo('applications')} class="primary-btn">
                Review Applications
              </button>
              <button on:click={() => navigateTo('rwr')} class="secondary-btn">
                Manage RWRs
              </button>
            </div>
          </div>
        </div>
      
      {:else if $isProgramOfficer}
        <div class="role-card">
          <h2>Program Officer Dashboard</h2>
          <div class="role-stats">
            <div class="stat-row">
              <div class="stat-item">
                <span class="stat-label">Eligible</span>
                <span class="stat-value stat-eligible">{stats.eligibleApplications}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Ineligible/Non-Compliant</span>
                <span class="stat-value stat-ineligible">{stats.ineligibleApplications}</span>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat-item">
                <span class="stat-label">Total RWR</span>
                <span class="stat-value">{stats.rwrTotal}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Pending Clarifications</span>
                <span class="stat-value">{stats.pendingClarifications}</span>
              </div>
            </div>
          </div>
          
          <div class="actions-card">
            <h3>Quick Actions</h3>
            <div class="action-buttons">
              <button on:click={() => navigateTo('applications')} class="primary-btn">
                View All Applications
              </button>
              <button on:click={() => navigateTo('reports')} class="secondary-btn">
                Ineligibility Reports
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- System information section -->
    <div class="system-info">
      <p>GRFP Application Master Tracker - Prototype Version 0.1.0</p>
      <p class="msw-link">
        <a href="#" on:click|preventDefault={() => navigateTo('msw-test')}>
          MSW API Test Page
        </a>
      </p>
    </div>
  </div>
</div>

<style>
  .home-container {
    padding: 1rem;
    max-width: 980px;
    margin: 0 auto;
  }
  
  .welcome-header {
    margin-bottom: 2rem;
  }
  
  .welcome-header h1 {
    margin-bottom: 0.25rem;
  }
  
  .role-display {
    color: #666;
    font-style: italic;
  }
  
  .dashboard {
    margin-bottom: 2rem;
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .summary-card, .role-card {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
  }
  
  .summary-card h2, .role-card h2 {
    margin-bottom: 1rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
  }
  
  .summary-stats, .role-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat-row {
    display: flex;
    gap: 1rem;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    flex: 1;
  }
  
  .stat-label {
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .stat-value {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .stat-eligible {
    color: #28a745;
  }
  
  .stat-ineligible {
    color: #dc3545;
  }
  
  .stat-non-compliant {
    color: #fd7e14;
  }
  
  .stat-pending {
    color: #6c757d;
  }
  
  .actions-card {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }
  
  .actions-card h3 {
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #495057;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
  }
  
  button {
    padding: 0.75rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    width: 100%;
  }
  
  .primary-btn {
    background-color: #007bff;
    color: white;
  }
  
  .primary-btn:hover {
    background-color: #0069d9;
  }
  
  .secondary-btn {
    background-color: #6c757d;
    color: white;
  }
  
  .secondary-btn:hover {
    background-color: #5a6268;
  }
  
  .system-info {
    font-size: 0.85rem;
    color: #6c757d;
    text-align: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }
  
  .msw-link a {
    color: #007bff;
    text-decoration: none;
  }
  
  .msw-link a:hover {
    text-decoration: underline;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .stat-row {
      flex-direction: column;
    }
    
    .action-buttons {
      flex-direction: column;
    }
  }
</style>
