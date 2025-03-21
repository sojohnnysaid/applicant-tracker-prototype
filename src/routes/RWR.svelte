<script>
  import { onMount } from 'svelte';
  import { userRole } from '../stores/roleStore';
  
  let applications = [];
  let rwrCodes = [];
  let loading = true;
  
  onMount(async () => {
    try {
      // Fetch RWR-related applications (non-compliant, etc.)
      const appResponse = await fetch('/api/applications?status=Non-Compliant');
      if (appResponse.ok) {
        applications = await appResponse.json();
      }
      
      // Fetch RWR codes
      const codesResponse = await fetch('/api/rwr-codes');
      if (codesResponse.ok) {
        rwrCodes = await codesResponse.json();
      }
    } catch (error) {
      console.error('Error fetching RWR data:', error);
    } finally {
      loading = false;
    }
  });
</script>

<div class="rwr-container">
  <h1>RWR Management</h1>
  
  {#if loading}
    <p>Loading RWR data...</p>
  {:else if applications.length === 0}
    <p>No applications with RWR status found.</p>
  {:else}
    <table class="application-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Applicant Name</th>
          <th>RWR Codes</th>
          <th>Date Issued</th>
          <th>Clarifiable</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each applications as app}
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
                {app.rwr[0].dateSent}
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
                {app.rwr[0].status}
              {:else}
                N/A
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .rwr-container {
    padding: 1rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
  }
</style>
