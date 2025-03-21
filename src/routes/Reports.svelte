<script>
  import { onMount } from 'svelte';
  import { userRole } from '../stores/roleStore';
  
  let ineligibleApps = [];
  let nonCompliantApps = [];
  let loading = true;
  
  onMount(async () => {
    try {
      // Fetch ineligible applications
      const ineligibleRes = await fetch('/api/applications?status=Ineligible');
      if (ineligibleRes.ok) {
        ineligibleApps = await ineligibleRes.json();
      }
      
      // Fetch non-compliant applications
      const nonCompliantRes = await fetch('/api/applications?status=Non-Compliant');
      if (nonCompliantRes.ok) {
        nonCompliantApps = await nonCompliantRes.json();
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      loading = false;
    }
  });
  
  function downloadCsv() {
    // Simple CSV export function
    const headers = ['ID', 'Applicant Name', 'Status', 'RWR Codes', 'Program'];
    
    // Combine ineligible and non-compliant
    const allApps = [...ineligibleApps, ...nonCompliantApps];
    
    // Generate CSV content
    let csvContent = headers.join(',') + '\n';
    
    allApps.forEach(app => {
      const rwrCodes = app.rwr.map(r => r.code).join(';');
      const row = [
        app.id,
        `"${app.applicantName}"`,
        app.status,
        `"${rwrCodes}"`,
        `"${app.programType}"`
      ];
      csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'collated_report.csv');
    a.click();
  }
</script>

<div class="reports-container">
  <h1>Ineligibility Summary</h1>
  
  <div class="report-actions">
    <button on:click={downloadCsv}>Download Collated Report (CSV)</button>
  </div>
  
  {#if loading}
    <p>Loading report data...</p>
  {:else}
    <h2>Ineligible Applications ({ineligibleApps.length})</h2>
    {#if ineligibleApps.length === 0}
      <p>No ineligible applications found.</p>
    {:else}
      <table class="application-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant Name</th>
            <th>RWR Reasons</th>
            <th>Program</th>
          </tr>
        </thead>
        <tbody>
          {#each ineligibleApps as app}
            <tr>
              <td>{app.id}</td>
              <td>{app.applicantName}</td>
              <td>
                {#if app.rwr.length > 0}
                  <ul>
                    {#each app.rwr as rwr}
                      <li>{rwr.code}</li>
                    {/each}
                  </ul>
                {:else}
                  None
                {/if}
              </td>
              <td>{app.programType}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
    
    <h2>Non-Compliant Applications ({nonCompliantApps.length})</h2>
    {#if nonCompliantApps.length === 0}
      <p>No non-compliant applications found.</p>
    {:else}
      <table class="application-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant Name</th>
            <th>RWR Reasons</th>
            <th>Clarifiable</th>
            <th>Program</th>
          </tr>
        </thead>
        <tbody>
          {#each nonCompliantApps as app}
            <tr>
              <td>{app.id}</td>
              <td>{app.applicantName}</td>
              <td>
                {#if app.rwr.length > 0}
                  <ul>
                    {#each app.rwr as rwr}
                      <li>{rwr.code}</li>
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
              <td>{app.programType}</td>
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
  
  .report-actions {
    margin-bottom: 2rem;
  }
  
  h2 {
    margin-top: 2rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
  }
</style>
