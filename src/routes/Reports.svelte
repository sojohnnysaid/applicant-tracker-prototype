<script>
  import { onMount } from 'svelte';
  import { userRole } from '../stores/roleStore';
  
  let applications = [];
  let ineligibleApps = [];
  let nonCompliantApps = [];
  let pendingApps = [];
  let eligibleApps = [];
  let rwrCodes = [];
  let loading = true;
  let summaryStats = {
    total: 0,
    eligible: 0,
    nonCompliant: 0,
    ineligible: 0,
    pending: 0,
    rwrIssued: 0,
    clarificationPending: 0
  };
  
  // Filter state
  let filterProgram = 'all';
  let filterRwrCode = 'all';
  let searchQuery = '';
  
  // Unique programs from applications
  $: programOptions = ['all', ...new Set(applications.map(app => app.program || 'Unknown'))].filter(Boolean);
  
  // Filtered applications
  $: filteredIneligible = ineligibleApps.filter(app => {
    // Program filter
    if (filterProgram !== 'all' && app.program !== filterProgram) return false;
    
    // RWR code filter
    if (filterRwrCode !== 'all' && !app.rwr.some(r => r.code === filterRwrCode)) return false;
    
    // Search query
    if (searchQuery && !app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !app.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  $: filteredNonCompliant = nonCompliantApps.filter(app => {
    // Program filter
    if (filterProgram !== 'all' && app.program !== filterProgram) return false;
    
    // RWR code filter
    if (filterRwrCode !== 'all' && !app.rwr.some(r => r.code === filterRwrCode)) return false;
    
    // Search query
    if (searchQuery && !app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !app.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  onMount(async () => {
    try {
      // Fetch summary data
      const summaryRes = await fetch('/api/summary');
      if (summaryRes.ok) {
        summaryStats = await summaryRes.json();
      }
      
      // Fetch all applications
      const appsRes = await fetch('/api/applications');
      if (appsRes.ok) {
        applications = await appsRes.json();
        
        // Categorize applications
        ineligibleApps = applications.filter(app => app.status === 'Ineligible');
        nonCompliantApps = applications.filter(app => app.status === 'Non-Compliant');
        pendingApps = applications.filter(app => app.status === 'Pending');
        eligibleApps = applications.filter(app => app.status === 'Eligible');
      }
      
      // Fetch RWR codes
      const codesRes = await fetch('/api/rwr-codes');
      if (codesRes.ok) {
        rwrCodes = await codesRes.json();
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      loading = false;
    }
  });
  
  function downloadCsv() {
    // Enhanced CSV export function
    const headers = ['ID', 'Applicant Name', 'Status', 'RWR Codes', 'RWR Reasons', 'Clarifiable', 'Program', 'Submission Date', 'Assigned To'];
    
    // Combine ineligible and non-compliant, filtered if filters are active
    const allApps = [...filteredIneligible, ...filteredNonCompliant];
    
    // Generate CSV content
    let csvContent = headers.join(',') + '\n';
    
    allApps.forEach(app => {
      const rwrCodes = app.rwr.map(r => r.code).join(';');
      const rwrReasons = app.rwr.map(r => r.reason || '').join(';');
      const clarifiable = app.rwr.some(r => r.clarifiable) ? 'Yes' : 'No';
      
      const row = [
        app.id,
        `"${app.applicantName}"`,
        app.status,
        `"${rwrCodes}"`,
        `"${rwrReasons}"`,
        clarifiable,
        `"${app.program || app.programType || ''}"`,
        app.submissionDate || '',
        `"${app.assignedTo || ''}"`,
      ];
      csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    const timestamp = new Date().toISOString().split('T')[0];
    a.setAttribute('download', `collated_report_${timestamp}.csv`);
    a.click();
  }
  
  function resetFilters() {
    filterProgram = 'all';
    filterRwrCode = 'all';
    searchQuery = '';
  }
  
  // Navigate to application detail view
  function viewApplicationDetail(appId) {
    window.location.href = `#/applications/${appId}`;
  }
</script>

<div class="reports-container">
  <h1>Ineligibility Summary Report</h1>
  
  <div class="dashboard">
    <div class="stat-card">
      <h3>Total Applications</h3>
      <p class="stat-number">{summaryStats.total}</p>
    </div>
    <div class="stat-card">
      <h3>Eligible</h3>
      <p class="stat-number">{summaryStats.eligible}</p>
    </div>
    <div class="stat-card alert">
      <h3>Ineligible</h3>
      <p class="stat-number">{summaryStats.ineligible}</p>
    </div>
    <div class="stat-card warning">
      <h3>Non-Compliant</h3>
      <p class="stat-number">{summaryStats.nonCompliant}</p>
    </div>
    <div class="stat-card info">
      <h3>Pending Review</h3>
      <p class="stat-number">{summaryStats.pending}</p>
    </div>
    <div class="stat-card">
      <h3>RWRs Issued</h3>
      <p class="stat-number">{summaryStats.rwrIssued}</p>
    </div>
    <div class="stat-card">
      <h3>Clarifications Pending</h3>
      <p class="stat-number">{summaryStats.clarificationPending}</p>
    </div>
  </div>
  
  <div class="filters-section">
    <h2>Filters</h2>
    <div class="filters-container">
      <div class="filter-group">
        <label for="search">Search by ID or Name:</label>
        <input type="text" id="search" bind:value={searchQuery} placeholder="Enter applicant name or ID...">
      </div>
      
      <div class="filter-group">
        <label for="program">Program:</label>
        <select id="program" bind:value={filterProgram}>
          <option value="all">All Programs</option>
          {#each programOptions.filter(p => p !== 'all') as program}
            <option value={program}>{program}</option>
          {/each}
        </select>
      </div>
      
      <div class="filter-group">
        <label for="rwrCode">RWR Code:</label>
        <select id="rwrCode" bind:value={filterRwrCode}>
          <option value="all">All RWR Codes</option>
          {#each rwrCodes as code}
            <option value={code.code}>{code.code} - {code.reason}</option>
          {/each}
        </select>
      </div>
      
      <button class="clear-btn" on:click={resetFilters}>Clear Filters</button>
    </div>
  </div>
  
  <div class="report-actions">
    <button class="download-btn" on:click={downloadCsv}>Download Collated Report (CSV)</button>
  </div>
  
  {#if loading}
    <div class="loading">
      <p>Loading report data...</p>
    </div>
  {:else}
    <h2>Ineligible Applications ({filteredIneligible.length} of {ineligibleApps.length})</h2>
    {#if filteredIneligible.length === 0}
      <p class="empty-state">No ineligible applications found matching your filters.</p>
    {:else}
      <table class="application-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant Name</th>
            <th>RWR Reasons</th>
            <th>Submission Date</th>
            <th>Program</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredIneligible as app}
            <tr>
              <td>{app.id}</td>
              <td>{app.applicantName}</td>
              <td>
                {#if app.rwr.length > 0}
                  <ul>
                    {#each app.rwr as rwr}
                      <li>{rwr.code} - {rwr.reason || ''}</li>
                    {/each}
                  </ul>
                {:else}
                  None
                {/if}
              </td>
              <td>{app.submissionDate || 'N/A'}</td>
              <td>{app.program || app.programType || 'N/A'}</td>
              <td>
                <button class="view-btn" on:click={() => viewApplicationDetail(app.id)}>View Details</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
    
    <h2>Non-Compliant Applications ({filteredNonCompliant.length} of {nonCompliantApps.length})</h2>
    {#if filteredNonCompliant.length === 0}
      <p class="empty-state">No non-compliant applications found matching your filters.</p>
    {:else}
      <table class="application-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant Name</th>
            <th>RWR Reasons</th>
            <th>Clarifiable</th>
            <th>Submission Date</th>
            <th>Program</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredNonCompliant as app}
            <tr>
              <td>{app.id}</td>
              <td>{app.applicantName}</td>
              <td>
                {#if app.rwr.length > 0}
                  <ul>
                    {#each app.rwr as rwr}
                      <li>{rwr.code} - {rwr.reason || ''}</li>
                    {/each}
                  </ul>
                {:else}
                  None
                {/if}
              </td>
              <td>
                {#if app.rwr.length > 0}
                  {app.rwr.some(r => r.clarifiable) ? 'Yes' : 'No'}
                {:else}
                  N/A
                {/if}
              </td>
              <td>{app.submissionDate || 'N/A'}</td>
              <td>{app.program || app.programType || 'N/A'}</td>
              <td>
                <button class="view-btn" on:click={() => viewApplicationDetail(app.id)}>View Details</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/if}
</div>

<style>
  .reports-container {
    padding: 1rem;
  }
  
  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border-top: 3px solid #6c757d;
  }
  
  .stat-card.alert {
    border-top-color: #dc3545;
  }
  
  .stat-card.warning {
    border-top-color: #ffc107;
  }
  
  .stat-card.info {
    border-top-color: #17a2b8;
  }
  
  .stat-card h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: #212529;
  }
  
  .filters-section {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .filters-section h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  .filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
  }
  
  .filter-group {
    flex: 1;
    min-width: 200px;
  }
  
  .filter-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #495057;
    font-size: 0.9rem;
  }
  
  .filter-group input,
  .filter-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .clear-btn {
    background-color: #e9ecef;
    color: #495057;
    border: 1px solid #ced4da;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .clear-btn:hover {
    background-color: #dee2e6;
  }
  
  .report-actions {
    margin-bottom: 2rem;
  }
  
  .download-btn {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
  
  .download-btn:hover {
    background-color: #218838;
  }
  
  h2 {
    margin-top: 2rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
  }
  
  .application-list {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  
  .application-list th,
  .application-list td {
    padding: 0.75rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .application-list th {
    text-align: left;
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
  }
  
  .application-list tr:hover {
    background-color: #f8f9fa;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .loading,
  .empty-state {
    padding: 2rem;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 8px;
    color: #6c757d;
  }
  
  .view-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .view-btn:hover {
    background-color: #0069d9;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dashboard {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .filter-group {
      flex: 100%;
    }
    
    .application-list {
      display: block;
      overflow-x: auto;
    }
  }
</style>