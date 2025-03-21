<script>
  import { onMount } from 'svelte';
  import { userRole, isScreener, isManager, isProgramOfficer } from '../stores/roleStore';
  
  // State variables
  let applications = [];
  let filteredApplications = [];
  let loading = true;
  let error = null;
  
  // Filter controls
  let statusFilter = 'all';
  let searchQuery = '';
  let sortField = 'id';
  let sortDirection = 'asc';
  
  // Define available statuses for filtering
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Eligible', label: 'Eligible' },
    { value: 'Ineligible', label: 'Ineligible' },
    { value: 'Non-Compliant', label: 'Non-Compliant' },
    { value: 'Pending', label: 'Pending Review' }
  ];
  
  // Load applications on component mount
  onMount(async () => {
    await loadApplications();
  });
  
  // Function to load applications with role-based filtering
  async function loadApplications() {
    loading = true;
    error = null;
    
    try {
      // Fetch applications with role-based filtering
      const response = await fetch(`/api/applications?role=${$userRole}`);
      if (response.ok) {
        applications = await response.json();
        
        // Enhance applications with mock data if certain fields are missing
        applications = applications.map(app => ({
          // Default structure
          id: 'APP-000',
          applicantName: 'Unknown',
          status: 'Pending',
          program: 'Unknown',
          rwr: [],
          submissionDate: '2025-01-01',
          assignedTo: '',
          ...app, // Overlay with actual data from API
        }));
        
        // Apply initial filtering
        applyFilters();
      } else {
        error = `Error: ${response.status}`;
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  // Apply filters and sorting to applications
  function applyFilters() {
    // Start with all applications
    let result = [...applications];
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    // Apply search query filter (case insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(app => 
        app.id.toLowerCase().includes(query) ||
        app.applicantName.toLowerCase().includes(query) ||
        (app.program && app.program.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      // Handle string comparison
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      
      // Compare based on sort direction
      if (sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    filteredApplications = result;
  }
  
  // Handle sort header click
  function handleSort(field) {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field and default to ascending
      sortField = field;
      sortDirection = 'asc';
    }
    applyFilters();
  }
  
  // Reactively update filtered applications when filters change
  $: {
    if (applications.length > 0) {
      applyFilters();
    }
  }
  
  // Helper function to get appropriate action button text based on role and status
  function getActionText(app) {
    if ($isScreener) {
      return app.status === 'Pending' ? 'Review' : 'Update';
    } else if ($isManager) {
      return app.status === 'Pending' ? 'Review' : 'Manage RWR';
    } else if ($isProgramOfficer) {
      return app.status === 'Ineligible' || app.status === 'Non-Compliant' 
        ? 'Reinstate' : 'View';
    }
    return 'View';
  }
</script>

<div class="applications-container">
  <div class="applications-header">
    <h1>Applications</h1>
    
    <!-- Role-specific header text -->
    {#if $isScreener}
      <p>Review applications and determine eligibility status.</p>
    {:else if $isManager}
      <p>Manage applications, review RWRs, and make final eligibility decisions.</p>
    {:else if $isProgramOfficer}
      <p>Monitor application status and handle reinstatement requests.</p>
    {/if}
  </div>
  
  <!-- Filters and controls -->
  <div class="filter-controls">
    <div class="search-box">
      <input 
        type="text" 
        placeholder="Search by ID or name..." 
        bind:value={searchQuery}
        on:input={applyFilters}
      />
    </div>
    
    <div class="status-filter">
      <label for="status-select">Status:</label>
      <select id="status-select" bind:value={statusFilter} on:change={applyFilters}>
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
    
    <button class="refresh-btn" on:click={loadApplications}>
      Refresh
    </button>
  </div>
  
  <!-- Loading and error states -->
  {#if loading}
    <div class="loading-indicator">
      <p>Loading applications...</p>
    </div>
  {:else if error}
    <div class="error-message">
      <p>{error}</p>
      <button on:click={loadApplications}>Try Again</button>
    </div>
  {:else if filteredApplications.length === 0}
    <div class="empty-state">
      {#if applications.length === 0}
        <p>No applications found.</p>
      {:else}
        <p>No applications match your filters.</p>
        <button on:click={() => {
          statusFilter = 'all';
          searchQuery = '';
          applyFilters();
        }}>Clear Filters</button>
      {/if}
    </div>
  {:else}
    <!-- Applications table -->
    <div class="table-container">
      <table class="application-list">
        <thead>
          <tr>
            <th class="sortable" on:click={() => handleSort('id')}>
              ID
              {#if sortField === 'id'}
                <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th class="sortable" on:click={() => handleSort('applicantName')}>
              Applicant Name
              {#if sortField === 'applicantName'}
                <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th class="sortable" on:click={() => handleSort('status')}>
              Status
              {#if sortField === 'status'}
                <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th>Program</th>
            <th>RWR</th>
            <th>Submission Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredApplications as app}
            <tr>
              <td>{app.id}</td>
              <td>{app.applicantName}</td>
              <td>
                <span class="status-badge status-{app.status.toLowerCase().replace(' ', '-')}">
                  {app.status}
                </span>
              </td>
              <td>{app.program || 'N/A'}</td>
              <td>{app.rwr && app.rwr.length > 0 ? 'Yes' : 'No'}</td>
              <td>{app.submissionDate || 'N/A'}</td>
              <td>
                <button class="action-btn">
                  {getActionText(app)}
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <div class="applications-footer">
      <p>Showing {filteredApplications.length} of {applications.length} applications</p>
    </div>
  {/if}
</div>

<style>
  .applications-container {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .applications-header {
    margin-bottom: 1.5rem;
  }
  
  .applications-header h1 {
    margin-bottom: 0.5rem;
  }
  
  .applications-header p {
    color: #666;
  }
  
  .filter-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .search-box {
    flex: 1;
    min-width: 250px;
  }
  
  .search-box input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .status-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .status-filter select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
  }
  
  .refresh-btn {
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .refresh-btn:hover {
    background-color: #e9ecef;
  }
  
  .table-container {
    overflow-x: auto;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .application-list {
    width: 100%;
    border-collapse: collapse;
  }
  
  .application-list th, 
  .application-list td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  
  .application-list th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  
  .application-list tbody tr:hover {
    background-color: #f8f9fa;
  }
  
  .sortable {
    cursor: pointer;
    user-select: none;
  }
  
  .sortable:hover {
    background-color: #e9ecef;
  }
  
  .sort-indicator {
    margin-left: 0.25rem;
    color: #007bff;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .status-eligible {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status-ineligible {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .status-non-compliant {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .status-pending {
    background-color: #e2e3e5;
    color: #383d41;
  }
  
  .action-btn {
    padding: 0.25rem 0.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  
  .action-btn:hover {
    background-color: #0069d9;
  }
  
  .loading-indicator, 
  .error-message,
  .empty-state {
    padding: 2rem;
    text-align: center;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
  
  .error-message {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }
  
  .applications-footer {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #6c757d;
    text-align: right;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .filter-controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-box, .status-filter {
      width: 100%;
    }
  }
</style>
