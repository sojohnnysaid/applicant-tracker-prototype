<script>
  import { onMount } from 'svelte';
  import { userRole } from '../stores/roleStore';
  
  export let navigateTo;
  
  let summaryData = {
    total: 0,
    eligible: 0,
    nonCompliant: 0,
    ineligible: 0,
    pending: 0,
    rwrIssued: 0,
    clarificationPending: 0
  };
  
  onMount(async () => {
    try {
      const response = await fetch('/api/summary');
      if (response.ok) {
        summaryData = await response.json();
      }
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  });
</script>

<div class="home-container">
  <h1>Welcome, {$userRole}</h1>
  
  <div class="dashboard">
    <div class="summary-card">
      <h2>Applications Overview</h2>
      <p>Total Applications: {summaryData.total}</p>
      <p>Eligible: {summaryData.eligible}</p>
      <p>Non-Compliant: {summaryData.nonCompliant}</p>
      <p>Ineligible: {summaryData.ineligible}</p>
      <p>Pending Review: {summaryData.pending}</p>
    </div>
    
    {#if $userRole === 'Screener'}
      <div class="actions-card">
        <h2>Screener Actions</h2>
        <button on:click={() => navigateTo('applications')}>View Assigned Applications</button>
      </div>
    {:else if $userRole === 'Manager'}
      <div class="actions-card">
        <h2>Manager Actions</h2>
        <button on:click={() => navigateTo('applications')}>Review Applications</button>
        <button on:click={() => navigateTo('rwr')}>Manage RWRs</button>
      </div>
    {:else if $userRole === 'ProgramOfficer'}
      <div class="actions-card">
        <h2>Program Officer Actions</h2>
        <button on:click={() => navigateTo('applications')}>View All Applications</button>
        <button on:click={() => navigateTo('reports')}>Ineligibility Summary</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .home-container {
    padding: 1rem;
  }
  
  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .actions-card button {
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
  }
</style>
