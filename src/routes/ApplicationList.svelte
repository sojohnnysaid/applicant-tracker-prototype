<script>
  import { onMount } from 'svelte';
  import { userRole, isScreener, isManager, isProgramOfficer } from '../stores/roleStore';
  import StatusHistory from '../components/StatusHistory.svelte';
  
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
  
  // Modal state for application actions
  let showActionModal = false;
  let selectedApp = null;
  let selectedStatus = '';
  let actionNotes = '';
  let isSubmitting = false;
  let activeTab = 'details'; // Default active tab
  
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
  
  // Open modal to perform action on an application
  function openActionModal(app) {
    selectedApp = app;
    selectedStatus = app.status;
    actionNotes = '';
    activeTab = 'details'; // Reset to details tab
    showActionModal = true;
  }
  
  // Close modal
  function closeModal() {
    showActionModal = false;
    selectedApp = null;
  }
  
  // Update application status
  async function updateApplicationStatus() {
    if (!selectedApp) return;
    
    isSubmitting = true;
    
    try {
      // Only update if status has changed or notes were added
      if (selectedStatus !== selectedApp.status || actionNotes.trim() !== '') {
        const updates = {
          status: selectedStatus,
          notes: actionNotes.trim() !== '' ? actionNotes : `Status updated to ${selectedStatus}`,
          updatedBy: $userRole,
          updateDate: new Date().toISOString() // Full ISO timestamp with UTC time
        };
        
        // Call API to update application status
        const response = await fetch(`/api/applications/${selectedApp.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
        
        if (response.ok) {
          // Refresh the applications list
          await loadApplications();
          closeModal();
        } else {
          throw new Error(`Failed to update status: ${response.status}`);
        }
      } else {
        // No changes were made, just close the modal
        closeModal();
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      error = err.message;
    } finally {
      isSubmitting = false;
    }
  }
  
  // Reinstate application (Program Officer only)
  async function reinstateApplication() {
    if (!selectedApp || !$isProgramOfficer) return;
    
    isSubmitting = true;
    
    try {
      const currentDate = new Date().toISOString(); // Full ISO timestamp with UTC time
      
      const updates = {
        status: 'Eligible',
        updatedBy: $userRole,
        updateDate: currentDate,
        notes: actionNotes,
        reinstatedBy: $userRole,
        reinstateDate: currentDate,
        reinstateReason: actionNotes
      };
      
      // Call API to reinstate application
      const response = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        // Refresh the applications list
        await loadApplications();
        closeModal();
      } else {
        throw new Error(`Failed to reinstate application: ${response.status}`);
      }
    } catch (err) {
      console.error('Error reinstating application:', err);
      error = err.message;
    } finally {
      isSubmitting = false;
    }
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
              <td>
                <a href="#applications/{app.id}" class="app-id-link">{app.id}</a>
              </td>
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
                <button class="action-btn" on:click={() => openActionModal(app)}>
                  {getActionText(app)}
                </button>
                <a href="#applications/{app.id}" class="detail-link">View Details</a>
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
  
  <!-- Application Action Modal -->
  {#if showActionModal}
    <div class="modal-backdrop">
      <div class="action-modal">
        <div class="modal-header">
          <h2>
            {#if $isScreener}
              Update Application Status
            {:else if $isManager}
              Manage Application
            {:else if $isProgramOfficer && selectedApp?.status === 'Ineligible' || selectedApp?.status === 'Non-Compliant'}
              Reinstate Application
            {:else}
              Application Details
            {/if}
          </h2>
          <button class="close-btn" on:click={closeModal}>&times;</button>
        </div>
        
        <div class="modal-body">
          {#if selectedApp}
            <!-- Modal tabs -->
            <div class="modal-tabs">
              <button 
                class:active={activeTab === 'details'} 
                on:click={() => activeTab = 'details'}
              >
                Details
              </button>
              <button 
                class:active={activeTab === 'history'} 
                on:click={() => activeTab = 'history'}
              >
                Status History
              </button>
              {#if selectedApp.rwr && selectedApp.rwr.length > 0}
                <button 
                  class:active={activeTab === 'rwr'} 
                  on:click={() => activeTab = 'rwr'}
                >
                  RWR Information
                </button>
              {/if}
            </div>
            
            <!-- Details tab -->
            {#if activeTab === 'details'}
              <div class="modal-section">
                <h3>Application Details</h3>
                <div class="application-details">
                  <p><strong>ID:</strong> {selectedApp.id}</p>
                  <p><strong>Applicant:</strong> {selectedApp.applicantName}</p>
                  <p><strong>Program:</strong> {selectedApp.program || 'N/A'}</p>
                  <p><strong>Submission Date:</strong> {selectedApp.submissionDate || 'N/A'}</p>
                  <p><strong>Current Status:</strong> <span class="status-badge status-{selectedApp.status.toLowerCase().replace(' ', '-')}">{selectedApp.status}</span></p>
                  <p><strong>Assigned To:</strong> {selectedApp.assignedTo || 'Unassigned'}</p>
                </div>
              </div>
              
              {#if $isScreener || $isManager}
                <div class="modal-section">
                  <h3>Update Status</h3>
                  <div class="form-group">
                    <label for="status-select">Status:</label>
                    <select id="status-select" bind:value={selectedStatus}>
                      <option value="Pending">Pending Review</option>
                      <option value="Eligible">Eligible</option>
                      <option value="Non-Compliant">Non-Compliant</option>
                      <option value="Ineligible">Ineligible</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label for="action-notes">Notes:</label>
                    <textarea 
                      id="action-notes" 
                      bind:value={actionNotes} 
                      placeholder="Enter any notes about this status change..."
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              {:else if $isProgramOfficer && (selectedApp.status === 'Ineligible' || selectedApp.status === 'Non-Compliant')}
                <div class="modal-section">
                  <h3>Reinstatement Information</h3>
                  <p class="reinstate-info">
                    Reinstating this application will change its status to <strong>Eligible</strong>.
                  </p>
                  
                  <div class="form-group">
                    <label for="reinstate-reason">Reason for Reinstatement:</label>
                    <textarea 
                      id="reinstate-reason" 
                      bind:value={actionNotes} 
                      placeholder="Enter reason for reinstating this application..."
                      rows="3"
                      required
                    ></textarea>
                  </div>
                </div>
              {/if}
            {/if}
            
            <!-- Status History tab -->
            {#if activeTab === 'history'}
              <div class="modal-section">
                <StatusHistory statusHistory={selectedApp.statusHistory || []} />
                
                <div class="history-legend">
                  <h4>Status Types:</h4>
                  <div class="legend-items">
                    <div class="legend-item">
                      <span class="status-badge status-eligible">Eligible</span>
                      <span class="legend-description">Application meets all requirements</span>
                    </div>
                    <div class="legend-item">
                      <span class="status-badge status-ineligible">Ineligible</span>
                      <span class="legend-description">Application does not meet program requirements</span>
                    </div>
                    <div class="legend-item">
                      <span class="status-badge status-non-compliant">Non-Compliant</span>
                      <span class="legend-description">Missing required documents or information</span>
                    </div>
                    <div class="legend-item">
                      <span class="status-badge status-pending">Pending</span>
                      <span class="legend-description">Application awaiting review</span>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- RWR Info tab -->
            {#if activeTab === 'rwr' && selectedApp.rwr && selectedApp.rwr.length > 0}
              <div class="modal-section">
                <h3>Return Without Review Information</h3>
                <ul class="rwr-list">
                  {#each selectedApp.rwr as rwr}
                    <li>
                      <div class="rwr-item">
                        <p><strong>Code:</strong> {rwr.code}</p>
                        <p><strong>Reason:</strong> {rwr.reason}</p>
                        <p><strong>Date Issued:</strong> {rwr.dateIssued || 'N/A'}</p>
                        <p><strong>Clarifiable:</strong> {rwr.clarifiable ? 'Yes' : 'No'}</p>
                      </div>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          {/if}
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" on:click={closeModal}>Cancel</button>
          
          {#if $isScreener || $isManager}
            <button 
              class="submit-btn" 
              on:click={updateApplicationStatus} 
              disabled={isSubmitting || selectedStatus === selectedApp?.status}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
          {:else if $isProgramOfficer && (selectedApp?.status === 'Ineligible' || selectedApp?.status === 'Non-Compliant')}
            <button 
              class="reinstate-btn" 
              on:click={reinstateApplication} 
              disabled={isSubmitting || !actionNotes}
            >
              {isSubmitting ? 'Processing...' : 'Reinstate Application'}
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .applications-container {
    padding: 1rem;
    max-width: 980px;
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
  
  /* Modal styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .action-modal {
    background-color: white;
    border-radius: 6px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-tabs {
    display: flex;
    border-bottom: 1px solid #dee2e6;
    margin-bottom: 1.5rem;
  }
  
  .modal-tabs button {
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6c757d;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.95rem;
  }
  
  .modal-tabs button:hover {
    color: #495057;
    background-color: #f8f9fa;
  }
  
  .modal-tabs button.active {
    color: #007bff;
    border-bottom: 2px solid #007bff;
  }
  
  .history-legend {
    margin-top: 2rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  
  .history-legend h4 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #495057;
  }
  
  .legend-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .legend-description {
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  .modal-section {
    margin-bottom: 1.5rem;
  }
  
  .modal-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #495057;
  }
  
  .application-details {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .application-details p {
    margin: 0.5rem 0;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .rwr-list {
    list-style: none;
    padding: 0;
  }
  
  .rwr-item {
    background-color: #f8f9fa;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }
  
  .rwr-item p {
    margin: 0.25rem 0;
  }
  
  .reinstate-info {
    background-color: #fff3cd;
    color: #856404;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  .cancel-btn {
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    color: #495057;
    font-weight: 500;
    cursor: pointer;
  }

  .cancel-btn:hover {
    background-color: #e9ecef;
  }
  
  .submit-btn {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .reinstate-btn {
    padding: 0.5rem 1rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .submit-btn:hover:not(:disabled),
  .reinstate-btn:hover:not(:disabled) {
    filter: brightness(90%);
  }
  
  .submit-btn:disabled,
  .reinstate-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .app-id-link {
    text-decoration: none;
    color: #007bff;
    font-weight: 500;
  }
  
  .app-id-link:hover {
    text-decoration: underline;
  }
  
  .detail-link {
    display: inline-block;
    margin-left: 0.5rem;
    font-size: 0.85rem;
    color: #6c757d;
    text-decoration: none;
  }
  
  .detail-link:hover {
    color: #007bff;
    text-decoration: underline;
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
