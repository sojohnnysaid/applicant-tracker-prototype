<script>
  import { onMount } from 'svelte';
  import { userRole, isManager, isProgramOfficer } from '../stores/roleStore';
  
  // State management
  let applications = [];
  let rwrCodes = [];
  let loading = true;
  let error = null;
  
  // Modal state
  let showRwrModal = false;
  let selectedApp = null;
  let selectedRwrCode = '';
  let isClarifiable = true;
  let rwrMessage = '';
  let isSubmitting = false;
  
  // Tab management
  let activeTab = 'pending';
  
  onMount(async () => {
    await loadRwrData();
  });
  
  async function loadRwrData() {
    loading = true;
    error = null;
    
    try {
      // Fetch applications with RWRs
      const appResponse = await fetch('/api/applications?status=Non-Compliant');
      if (appResponse.ok) {
        applications = await appResponse.json();
      } else {
        error = `Error fetching applications: ${appResponse.status}`;
      }
      
      // Fetch RWR codes
      const codesResponse = await fetch('/api/rwr-codes');
      if (codesResponse.ok) {
        rwrCodes = await codesResponse.json();
      } else {
        error = `Error fetching RWR codes: ${codesResponse.status}`;
      }
    } catch (err) {
      error = err.message;
      console.error('Error fetching RWR data:', err);
    } finally {
      loading = false;
    }
  }
  
  // Filter applications based on tab
  $: filteredApplications = applications.filter(app => {
    if (activeTab === 'pending') {
      return !app.rwr.some(rwr => rwr.status === 'Sent');
    } else if (activeTab === 'sent') {
      return app.rwr.some(rwr => rwr.status === 'Sent');
    } else if (activeTab === 'clarifications') {
      return app.rwr.some(rwr => rwr.clarifiable && rwr.status === 'Sent');
    }
    return true;
  });
  
  // Open modal to issue new RWR
  function openRwrModal(app) {
    selectedApp = app;
    selectedRwrCode = rwrCodes[0]?.code || '';
    isClarifiable = rwrCodes[0]?.clarifiable || false;
    rwrMessage = '';
    showRwrModal = true;
  }
  
  // Close modal
  function closeModal() {
    showRwrModal = false;
    selectedApp = null;
  }
  
  // Handle RWR code selection change
  function handleRwrCodeChange() {
    const selectedCode = rwrCodes.find(code => code.code === selectedRwrCode);
    if (selectedCode) {
      isClarifiable = selectedCode.clarifiable;
    }
  }
  
  // Submit RWR
  async function submitRwr() {
    if (!selectedApp || !selectedRwrCode) return;
    
    isSubmitting = true;
    
    try {
      const selectedCodeObj = rwrCodes.find(code => code.code === selectedRwrCode);
      
      const rwrData = {
        code: selectedRwrCode,
        reason: selectedCodeObj?.reason || 'Unknown reason',
        clarifiable: isClarifiable,
        message: rwrMessage,
        status: 'Pending',
        dateIssued: new Date().toISOString().split('T')[0]
      };
      
      // Call API to issue RWR
      const response = await fetch(`/api/applications/${selectedApp.id}/rwr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rwrData)
      });
      
      if (response.ok) {
        // Refresh the applications list
        await loadRwrData();
        closeModal();
      } else {
        throw new Error(`Failed to issue RWR: ${response.status}`);
      }
    } catch (err) {
      console.error('Error issuing RWR:', err);
      error = err.message;
    } finally {
      isSubmitting = false;
    }
  }
  
  // Send RWR notification (simulated)
  async function sendRwrNotification(app) {
    try {
      const response = await fetch(`/api/applications/${app.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rwr: app.rwr.map(rwr => ({
            ...rwr,
            status: 'Sent',
            dateSent: new Date().toISOString().split('T')[0]
          }))
        })
      });
      
      if (response.ok) {
        await loadRwrData();
      } else {
        throw new Error(`Failed to send RWR notification: ${response.status}`);
      }
    } catch (err) {
      console.error('Error sending RWR notification:', err);
      error = err.message;
    }
  }
  
  // Format date in a readable format
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (err) {
      return dateString || 'N/A';
    }
  }
</script>

<div class="rwr-container">
  <h1>RWR Management</h1>
  
  {#if $isManager}
    <p class="role-instructions">As a Manager, you can issue RWRs to applications and manage clarification responses.</p>
  {:else if $isProgramOfficer}
    <p class="role-instructions">As a Program Officer, you can view RWR statuses and review clarification responses.</p>
  {/if}
  
  <!-- Tabs for different RWR categories -->
  <div class="rwr-tabs">
    <button 
      class:active={activeTab === 'pending'} 
      on:click={() => activeTab = 'pending'}
    >
      Pending RWRs
    </button>
    <button 
      class:active={activeTab === 'sent'} 
      on:click={() => activeTab = 'sent'}
    >
      Sent RWRs
    </button>
    <button 
      class:active={activeTab === 'clarifications'} 
      on:click={() => activeTab = 'clarifications'}
    >
      Clarifications
    </button>
  </div>
  
  <div class="actions-toolbar">
    <button on:click={loadRwrData} class="refresh-btn">
      Refresh Data
    </button>
  </div>
  
  <!-- Error and loading states -->
  {#if error}
    <div class="error-message">
      <p>{error}</p>
      <button on:click={loadRwrData}>Try Again</button>
    </div>
  {:else if loading}
    <div class="loading-indicator">
      <p>Loading RWR data...</p>
    </div>
  {:else if filteredApplications.length === 0}
    <div class="empty-state">
      <p>No applications found for the selected category.</p>
    </div>
  {:else}
    <!-- RWR applications table -->
    <div class="table-container">
      <table class="application-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant Name</th>
            <th>RWR Codes</th>
            <th>Date Issued</th>
            <th>Clarifiable</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredApplications as app}
            <tr>
              <td>{app.id}</td>
              <td>{app.applicantName}</td>
              <td>
                {#if app.rwr.length > 0}
                  <ul>
                    {#each app.rwr as rwr}
                      <li>{rwr.code}: {rwr.reason}</li>
                    {/each}
                  </ul>
                {:else}
                  None
                {/if}
              </td>
              <td>
                {#if app.rwr.length > 0}
                  {formatDate(app.rwr[0].dateIssued)}
                {:else}
                  N/A
                {/if}
              </td>
              <td>
                {#if app.rwr.length > 0}
                  {app.rwr.some(r => r.clarifiable) ? 'Yes' : 'No'}
                {:else}
                  N/A
                {/if}
              </td>
              <td>
                {#if app.rwr.length > 0}
                  <span class="status-badge status-{(app.rwr[0].status || 'pending').toLowerCase()}">
                    {app.rwr[0].status || 'Pending'}
                  </span>
                {:else}
                  N/A
                {/if}
              </td>
              <td>
                <!-- Action buttons based on status -->
                {#if $isManager}
                  {#if !app.rwr.some(r => r.status === 'Sent')}
                    <button 
                      class="action-btn send-btn" 
                      on:click={() => sendRwrNotification(app)}
                    >
                      Send RWR
                    </button>
                  {:else if app.rwr.some(r => r.clarifiable && r.status === 'Sent')}
                    <button class="action-btn review-btn">
                      Review Clarification
                    </button>
                  {/if}
                {:else if $isProgramOfficer && app.status === 'Non-Compliant'}
                  <button class="action-btn reinstate-btn">
                    Reinstate
                  </button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <!-- New RWR button for Managers -->
    {#if $isManager}
      <div class="new-rwr-controls">
        <button class="new-rwr-btn" on:click={() => openRwrModal(applications[0])}>
          Issue New RWR
        </button>
      </div>
    {/if}
  {/if}
  
  <!-- RWR Modal -->
  {#if showRwrModal}
    <div class="modal-backdrop">
      <div class="rwr-modal">
        <div class="modal-header">
          <h2>Issue Return Without Review (RWR)</h2>
          <button class="close-btn" on:click={closeModal}>&times;</button>
        </div>
        <div class="modal-body">
          {#if selectedApp}
            <div class="modal-section">
              <h3>Application Details</h3>
              <div class="application-details">
                <p><strong>ID:</strong> {selectedApp.id}</p>
                <p><strong>Applicant:</strong> {selectedApp.applicantName}</p>
                <p><strong>Program:</strong> {selectedApp.program || 'N/A'}</p>
                <p><strong>Current Status:</strong> {selectedApp.status}</p>
              </div>
            </div>
            
            <div class="modal-section">
              <h3>RWR Information</h3>
              <div class="form-group">
                <label for="rwr-code">RWR Code:</label>
                <select 
                  id="rwr-code" 
                  bind:value={selectedRwrCode}
                  on:change={handleRwrCodeChange}
                >
                  {#each rwrCodes as code}
                    <option value={code.code}>
                      {code.code}: {code.reason} ({code.clarifiable ? 'Clarifiable' : 'Non-Clarifiable'})
                    </option>
                  {/each}
                </select>
              </div>
              
              <div class="form-group">
                <label for="rwr-message">Additional Message:</label>
                <textarea 
                  id="rwr-message" 
                  bind:value={rwrMessage} 
                  placeholder="Enter additional details for the RWR..."
                  rows="4"
                ></textarea>
              </div>
              
              <div class="clarifiable-info">
                <span class="clarifiable-badge {isClarifiable ? 'clarifiable' : 'non-clarifiable'}">
                  {isClarifiable ? 'Clarifiable' : 'Non-Clarifiable'}
                </span>
                <p class="clarifiable-desc">
                  {isClarifiable ? 
                    'The applicant will be allowed to provide clarification for this issue.' : 
                    'This issue cannot be clarified and will result in automatic ineligibility.'}
                </p>
              </div>
            </div>
          {/if}
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" on:click={closeModal}>Cancel</button>
          <button 
            class="submit-btn" 
            on:click={submitRwr} 
            disabled={isSubmitting || !selectedRwrCode}
          >
            {isSubmitting ? 'Submitting...' : 'Issue RWR'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .rwr-container {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .role-instructions {
    color: #555;
    margin-bottom: 1.5rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .rwr-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .rwr-tabs button {
    padding: 0.75rem 1.25rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: #495057;
    transition: all 0.2s;
  }
  
  .rwr-tabs button:hover {
    color: #007bff;
    background-color: #f8f9fa;
  }
  
  .rwr-tabs button.active {
    color: #007bff;
    border-bottom-color: #007bff;
    font-weight: 600;
  }
  
  .actions-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
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
  
  .loading-indicator, 
  .error-message,
  .empty-state {
    padding: 2rem;
    text-align: center;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin: 1rem 0;
  }
  
  .error-message {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .status-pending {
    background-color: #e2e3e5;
    color: #383d41;
  }
  
  .status-sent {
    background-color: #d1ecf1;
    color: #0c5460;
  }
  
  .action-btn {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    border: none;
    color: white;
  }
  
  .send-btn {
    background-color: #007bff;
  }
  
  .review-btn {
    background-color: #6c757d;
  }
  
  .reinstate-btn {
    background-color: #28a745;
  }
  
  .new-rwr-controls {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }
  
  .new-rwr-btn {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
  }
  
  .new-rwr-btn:hover {
    background-color: #0069d9;
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
  
  .rwr-modal {
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
  
  .clarifiable-info {
    margin-top: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .clarifiable-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .clarifiable {
    background-color: #d4edda;
    color: #155724;
  }
  
  .non-clarifiable {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .clarifiable-desc {
    margin: 0;
    color: #6c757d;
    font-size: 0.9rem;
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
  
  .submit-btn:hover:not(:disabled) {
    background-color: #0069d9;
  }
  
  .submit-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .rwr-tabs {
      flex-wrap: wrap;
    }
    
    .rwr-tabs button {
      flex: 1 0 auto;
      text-align: center;
    }
  }
</style>
