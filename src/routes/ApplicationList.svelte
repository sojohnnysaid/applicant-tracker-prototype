<script>
  import { onMount } from 'svelte';
  import { userRole } from '../stores/roleStore';
  
  let applications = [];
  let loading = true;
  let error = null;
  
  onMount(async () => {
    try {
      // Fetch applications with role-based filtering
      const response = await fetch(`/api/applications?role=${$userRole}`);
      if (response.ok) {
        applications = await response.json();
      } else {
        error = `Error: ${response.status}`;
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="applications-container">
  <h1>Applications</h1>
  
  {#if loading}
    <p>Loading applications...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if applications.length === 0}
    <p>No applications found.</p>
  {:else}
    <table class="application-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Applicant Name</th>
          <th>Status</th>
          <th>Program</th>
          <th>RWR</th>
          <th>Submission Date</th>
        </tr>
      </thead>
      <tbody>
        {#each applications as app}
          <tr>
            <td>{app.id}</td>
            <td>{app.applicantName}</td>
            <td class="status-{app.status.toLowerCase().replace(' ', '-')}">{app.status}</td>
            <td>{app.programType}</td>
            <td>{app.rwr.length > 0 ? 'Yes' : 'No'}</td>
            <td>{app.submissionDate}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .applications-container {
    padding: 1rem;
  }
  
  .error {
    color: red;
  }
</style>
