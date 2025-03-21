<script>
  import { onMount } from 'svelte';
  import { userRole, isScreener, isManager, isProgramOfficer } from '../stores/roleStore';
  import StatusHistory from '../components/StatusHistory.svelte';
  
  // Get the application ID from the URL
  export let id = null;
  
  // Component state
  let application = null;
  let loading = true;
  let error = null;
  let activeTab = 'details';
  
  // Status update form
  let selectedStatus = '';
  let actionNotes = '';
  let isSubmitting = false;
  let rwrCodes = [];
  
  onMount(async () => {
    if (!id) {
      const hashParts = window.location.hash.split('/');
      if (hashParts.length >= 3) {
        id = hashParts[2];
      }
    }
    
    if (id) {
      await loadApplication();
      await loadRwrCodes();
    } else {
      error = 'No application ID provided';
      loading = false;
    }
  });
  
  // Load application data
  async function loadApplication() {
    loading = true;
    error = null;
    
    try {
      const response = await fetch(`/api/applications/${id}`);
      if (response.ok) {
        application = await response.json();
        selectedStatus = application.status;
      } else {
        error = `Failed to load application: ${response.status}`;
      }
    } catch (err) {
      console.error('Error loading application:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  // Load RWR codes
  async function loadRwrCodes() {
    try {
      const response = await fetch('/api/rwr-codes');
      if (response.ok) {
        rwrCodes = await response.json();
      }
    } catch (err) {
      console.error('Error loading RWR codes:', err);
    }
  }
  
  // Update application status
  async function updateApplicationStatus() {
    if (!application) return;
    
    isSubmitting = true;
    
    try {
      // Only update if status has changed or notes were added
      if (selectedStatus !== application.status || actionNotes.trim() !== '') {
        const updates = {
          status: selectedStatus,
          notes: actionNotes.trim() !== '' ? actionNotes : `Status updated to ${selectedStatus}`,
          updatedBy: $userRole,
          updateDate: new Date().toISOString()
        };
        
        // Call API to update application status
        const response = await fetch(`/api/applications/${application.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
        
        if (response.ok) {
          // Refresh the application data
          await loadApplication();
          actionNotes = '';
        } else {
          throw new Error(`Failed to update status: ${response.status}`);
        }
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
    if (!application || !$isProgramOfficer) return;
    
    isSubmitting = true;
    
    try {
      const currentDate = new Date().toISOString();
      
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
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        // Refresh the application data
        await loadApplication();
        actionNotes = '';
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
  
  // Go back to previous page
  function goBack() {
    window.history.back();
  }
</script>

<div class="application-detail">
  <div class="detail-header">
    <button class="back-btn" on:click={goBack}>← Back</button>
    <h1>Application Details</h1>
  </div>
  
  {#if loading}
    <div class="loading">
      <p>Loading application details...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={loadApplication} class="retry-btn">Try Again</button>
    </div>
  {:else if !application}
    <div class="error">
      <p>Application not found</p>
      <button on:click={goBack} class="back-btn">Return to Applications</button>
    </div>
  {:else}
    <div class="application-header">
      <div class="application-id">
        <h2>{application.id}</h2>
        <span class="status-badge status-{application.status.toLowerCase().replace(' ', '-')}">
          {application.status}
        </span>
      </div>
      <div class="applicant-name">
        <h3>{application.applicantName}</h3>
        <p>Program: {application.program || 'N/A'}</p>
      </div>
    </div>
    
    <!-- Tab Navigation -->
    <div class="detail-tabs">
      <button 
        class:active={activeTab === 'details'} 
        on:click={() => activeTab = 'details'}
      >
        Application Details
      </button>
      <button 
        class:active={activeTab === 'history'} 
        on:click={() => activeTab = 'history'}
      >
        Status History
      </button>
      {#if application.documents && application.documents.length > 0}
        <button 
          class:active={activeTab === 'documents'} 
          on:click={() => activeTab = 'documents'}
        >
          Documents
        </button>
      {/if}
      {#if application.rwr && application.rwr.length > 0}
        <button 
          class:active={activeTab === 'rwr'} 
          on:click={() => activeTab = 'rwr'}
        >
          RWR Information
        </button>
      {/if}
      {#if $isScreener || $isManager}
        <button 
          class:active={activeTab === 'actions'} 
          on:click={() => activeTab = 'actions'}
        >
          Update Status
        </button>
      {/if}
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Details Tab -->
      {#if activeTab === 'details'}
        <div class="detail-section">
          <h4>Application Information</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Application ID:</span>
              <span class="detail-value">{application.id}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Applicant Name:</span>
              <span class="detail-value">{application.applicantName}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value">
                <span class="status-badge status-{application.status.toLowerCase().replace(' ', '-')}">
                  {application.status}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Program:</span>
              <span class="detail-value">{application.program || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Submission Date:</span>
              <span class="detail-value">{application.submissionDate || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Assigned To:</span>
              <span class="detail-value">{application.assignedTo || 'Unassigned'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">RWR Status:</span>
              <span class="detail-value">
                {#if application.rwr && application.rwr.length > 0}
                  <span class="rwr-badge">RWR Issued ({application.rwr.length})</span>
                {:else}
                  <span class="no-rwr">No RWR</span>
                {/if}
              </span>
            </div>
            {#if application.rwr && application.rwr.some(r => r.clarifiable)}
              <div class="detail-item">
                <span class="detail-label">Clarifiable:</span>
                <span class="detail-value">Yes</span>
              </div>
            {/if}
          </div>
          
          {#if application.academicInfo}
            <h4 class="section-subheader">Academic Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">University:</span>
                <span class="detail-value">{application.academicInfo.university || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department:</span>
                <span class="detail-value">{application.academicInfo.department || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Degree:</span>
                <span class="detail-value">{application.academicInfo.degree || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">GPA:</span>
                <span class="detail-value">{application.academicInfo.gpa || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Expected Graduation:</span>
                <span class="detail-value">{application.academicInfo.graduationDate || 'N/A'}</span>
              </div>
            </div>
          {/if}
          
          {#if application.documents && application.documents.length > 0}
            <h4 class="section-subheader">Application Documents</h4>
            <div class="documents-list">
              {#each application.documents as doc}
                <div class="document-item {doc.verified ? 'verified' : 'unverified'}">
                  <div class="document-header">
                    <span class="document-type">{doc.type}</span>
                    <span class="document-status">
                      {#if doc.submitted}
                        {#if doc.verified}
                          <span class="status-badge status-eligible">Verified</span>
                        {:else}
                          <span class="status-badge status-pending">Submitted</span>
                        {/if}
                      {:else}
                        <span class="status-badge status-non-compliant">Missing</span>
                      {/if}
                    </span>
                  </div>
                  {#if doc.type === 'Reference Letters' && doc.count}
                    <div class="document-detail">
                      <span class="count-label">References received:</span>
                      <span class="count-value">{doc.count}/3</span>
                    </div>
                  {/if}
                  {#if doc.notes}
                    <div class="document-notes">{doc.notes}</div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
        
        <!-- Program Officer-specific reinstatement section -->
        {#if $isProgramOfficer && (application.status === 'Ineligible' || application.status === 'Non-Compliant')}
          <div class="detail-section reinstate-section">
            <h4>Reinstatement</h4>
            <p class="reinstate-info">
              As a Program Officer, you can reinstate this application if necessary.
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
            
            <button 
              class="reinstate-btn" 
              on:click={reinstateApplication} 
              disabled={isSubmitting || !actionNotes || actionNotes.trim() === ''}
            >
              {isSubmitting ? 'Processing...' : 'Reinstate Application'}
            </button>
          </div>
        {/if}
      {/if}
      
      <!-- Status History Tab -->
      {#if activeTab === 'history'}
        <div class="detail-section">
          <h4>Status History</h4>
          <StatusHistory statusHistory={application.statusHistory || []} />
          
          <div class="history-legend">
            <h5>Status Types:</h5>
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
      
      <!-- Documents Tab -->
      {#if activeTab === 'documents' && application.documents && application.documents.length > 0}
        <div class="detail-section">
          <h4>Application Documents</h4>
          <p class="doc-description">This tab shows all documents associated with this application and their verification status.</p>
          
          <div class="document-grid">
            {#each application.documents as doc}
              <div class="document-card {doc.verified ? 'verified' : doc.submitted ? 'submitted' : 'missing'}">
                <div class="document-icon">
                  <span class="material-icon">
                    {#if doc.verified}
                      ✓
                    {:else if doc.submitted}
                      ⌛
                    {:else}
                      ✗
                    {/if}
                  </span>
                </div>
                <div class="document-info">
                  <h5 class="document-title">{doc.type}</h5>
                  <div class="document-status-info">
                    <span class="document-status-badge 
                      {doc.verified ? 'status-eligible' : doc.submitted ? 'status-pending' : 'status-non-compliant'}">
                      {doc.verified ? 'Verified' : doc.submitted ? 'Submitted' : 'Missing'}
                    </span>
                    {#if doc.type === 'Reference Letters' && doc.count !== undefined}
                      <span class="ref-count">{doc.count}/3 received</span>
                    {/if}
                  </div>
                  {#if doc.notes}
                    <p class="document-note">{doc.notes}</p>
                  {/if}
                  {#if $isScreener || $isManager}
                    <div class="document-actions">
                      <a href="#" class="document-action-link">Mark as verified</a>
                      {#if !doc.submitted}
                        <a href="#" class="document-action-link">Request document</a>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
          
          <div class="document-legend">
            <h5>Document Status Legend:</h5>
            <div class="legend-items">
              <div class="legend-item">
                <span class="status-badge status-eligible">Verified</span>
                <span class="legend-description">Document has been received and validated</span>
              </div>
              <div class="legend-item">
                <span class="status-badge status-pending">Submitted</span>
                <span class="legend-description">Document received but pending verification</span>
              </div>
              <div class="legend-item">
                <span class="status-badge status-non-compliant">Missing</span>
                <span class="legend-description">Required document has not been submitted</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- RWR Tab -->
      {#if activeTab === 'rwr' && application.rwr && application.rwr.length > 0}
        <div class="detail-section">
          <h4>Return Without Review Information</h4>
          <div class="rwr-list">
            {#each application.rwr as rwr, index}
              <div class="rwr-item">
                <h5>RWR #{index + 1}</h5>
                <div class="rwr-details">
                  <div class="rwr-detail">
                    <span class="rwr-label">Code:</span>
                    <span class="rwr-value">{rwr.code}</span>
                  </div>
                  <div class="rwr-detail">
                    <span class="rwr-label">Reason:</span>
                    <span class="rwr-value">{rwr.reason}</span>
                  </div>
                  <div class="rwr-detail">
                    <span class="rwr-label">Date Issued:</span>
                    <span class="rwr-value">{rwr.dateIssued || 'N/A'}</span>
                  </div>
                  <div class="rwr-detail">
                    <span class="rwr-label">Clarifiable:</span>
                    <span class="rwr-value">{rwr.clarifiable ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
          
          <div class="rwr-info-box">
            <h5>About RWR Codes</h5>
            <p>Return Without Review (RWR) codes indicate reasons why an application may be ineligible or non-compliant with program requirements.</p>
            <ul class="rwr-code-list">
              {#each rwrCodes as code}
                <li>
                  <strong>{code.code}</strong> - {code.reason} 
                  <span class="clarifiable-tag">({code.clarifiable ? 'Clarifiable' : 'Non-clarifiable'})</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      {/if}
      
      <!-- Status Update Tab (Screeners and Managers) -->
      {#if activeTab === 'actions' && ($isScreener || $isManager)}
        <div class="detail-section">
          <h4>Update Application Status</h4>
          <div class="form-section">
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
            
            <div class="form-actions">
              <button 
                class="submit-btn" 
                on:click={updateApplicationStatus} 
                disabled={isSubmitting || (selectedStatus === application.status && actionNotes.trim() === '')}
              >
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
            
            {#if selectedStatus === 'Non-Compliant'}
              <div class="rwr-info-alert">
                <p>
                  <strong>Note:</strong> Changing status to Non-Compliant should be accompanied by issuing a Return Without Review (RWR) notice.
                </p>
                {#if $isManager}
                  <p>As a Manager, you can issue RWR notices from the main Applications list.</p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .application-detail {
    max-width: 980px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .detail-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .back-btn {
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    color: #495057;
    cursor: pointer;
    font-weight: 500;
  }
  
  .back-btn:hover {
    background-color: #e9ecef;
  }
  
  .application-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .application-id {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .application-id h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .applicant-name h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }
  
  .applicant-name p {
    margin: 0;
    color: #6c757d;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
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
  
  .detail-tabs {
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid #dee2e6;
    margin-bottom: 1.5rem;
    overflow-x: auto;
  }
  
  .detail-tabs button {
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6c757d;
    cursor: pointer;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .detail-tabs button:hover {
    color: #495057;
    background-color: #f8f9fa;
  }
  
  .detail-tabs button.active {
    color: #007bff;
    border-bottom: 2px solid #007bff;
  }
  
  .tab-content {
    padding: 1rem 0;
  }
  
  .detail-section {
    margin-bottom: 2rem;
  }
  
  .detail-section h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: #495057;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .detail-label {
    font-weight: 600;
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .detail-value {
    color: #212529;
  }
  
  .rwr-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .no-rwr {
    color: #6c757d;
    font-style: italic;
  }
  
  .history-legend {
    margin-top: 2rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 6px;
  }
  
  .history-legend h5 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #495057;
  }
  
  .legend-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
  
  .rwr-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .rwr-item {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 1rem;
    border-left: 3px solid #dc3545;
  }
  
  .rwr-item h5 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #495057;
  }
  
  .rwr-details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }
  
  .rwr-detail {
    margin-bottom: 0.5rem;
  }
  
  .rwr-label {
    font-weight: 600;
    color: #6c757d;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .rwr-value {
    color: #212529;
  }
  
  .rwr-info-box {
    background-color: #e2e3e5;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1.5rem;
  }
  
  .rwr-info-box h5 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #383d41;
  }
  
  .rwr-info-box p {
    margin-bottom: 1rem;
    color: #383d41;
  }
  
  .rwr-code-list {
    margin: 0;
    padding-left: 1.5rem;
    color: #383d41;
  }
  
  .rwr-code-list li {
    margin-bottom: 0.5rem;
  }
  
  .clarifiable-tag {
    color: #6c757d;
    font-size: 0.85rem;
    font-style: italic;
  }
  
  .form-section {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #495057;
  }
  
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    background-color: white;
  }
  
  .form-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
  }
  
  .submit-btn {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
  }
  
  .submit-btn:hover:not(:disabled) {
    background-color: #0069d9;
  }
  
  .submit-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .reinstate-section {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 1.5rem;
    margin-top: 1.5rem;
    border-left: 4px solid #28a745;
  }
  
  .reinstate-info {
    color: #495057;
    margin-bottom: 1.5rem;
  }
  
  .reinstate-btn {
    padding: 0.75rem 1.5rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
  }
  
  .reinstate-btn:hover:not(:disabled) {
    background-color: #218838;
  }
  
  .reinstate-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .rwr-info-alert {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #fff3cd;
    border-radius: 4px;
    color: #856404;
  }
  
  .rwr-info-alert p {
    margin: 0.5rem 0;
  }
  
  .loading, .error {
    padding: 2rem;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 6px;
    margin: 2rem 0;
  }
  
  .error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .retry-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .retry-btn:hover {
    background-color: #5a6268;
  }
  
  .section-subheader {
    font-size: 1rem;
    color: #495057;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #eee;
  }
  
  .documents-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .document-item {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 1rem;
    border-left: 3px solid #dee2e6;
  }
  
  .document-item.verified {
    border-left-color: #28a745;
  }
  
  .document-item.unverified {
    border-left-color: #ffc107;
  }
  
  .document-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .document-type {
    font-weight: 600;
    color: #495057;
  }
  
  .document-detail {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
  
  .count-label {
    color: #6c757d;
  }
  
  .count-value {
    font-weight: 600;
  }
  
  .document-notes {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: #fff;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #6c757d;
    font-style: italic;
  }
  
  /* Document tab styles */
  .doc-description {
    margin-bottom: 1.5rem;
    color: #6c757d;
  }
  
  .document-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .document-card {
    display: flex;
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 1rem;
    gap: 1rem;
    border-left: 4px solid #dee2e6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .document-card.verified {
    border-left-color: #28a745;
  }
  
  .document-card.submitted {
    border-left-color: #ffc107;
  }
  
  .document-card.missing {
    border-left-color: #dc3545;
  }
  
  .document-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #e9ecef;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .material-icon {
    font-size: 1.5rem;
    line-height: 1;
  }
  
  .document-card.verified .material-icon {
    color: #28a745;
  }
  
  .document-card.submitted .material-icon {
    color: #ffc107;
  }
  
  .document-card.missing .material-icon {
    color: #dc3545;
  }
  
  .document-info {
    flex: 1;
  }
  
  .document-title {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #495057;
  }
  
  .document-status-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .document-status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .ref-count {
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  .document-note {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background-color: white;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  .document-actions {
    margin-top: 0.75rem;
    display: flex;
    gap: 1rem;
  }
  
  .document-action-link {
    font-size: 0.85rem;
    color: #007bff;
    text-decoration: none;
  }
  
  .document-action-link:hover {
    text-decoration: underline;
  }
  
  .document-legend {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  .document-legend h5 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #495057;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .application-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .detail-grid,
    .rwr-list,
    .rwr-details,
    .legend-items,
    .documents-list {
      grid-template-columns: 1fr;
    }
    
    .detail-tabs {
      flex-wrap: wrap;
    }
  }
</style>