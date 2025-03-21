<script>
  import { userRole } from '../stores/roleStore';
  
  export let navigateTo;
  
  function logout() {
    userRole.set(null);
    localStorage.removeItem('userRole');
    navigateTo('login');
  }
</script>

<nav>
  <div class="nav-container">
    <div class="nav-brand">
      <span>GRFP Application Master Tracker</span>
    </div>
    
    <div class="nav-links">
      <button on:click={() => navigateTo('home')}>Home</button>
      
      {#if $userRole === 'Screener'}
        <button on:click={() => navigateTo('applications')}>Applications</button>
      {:else if $userRole === 'Manager'}
        <button on:click={() => navigateTo('applications')}>Applications</button>
        <button on:click={() => navigateTo('rwr')}>RWR Management</button>
      {:else if $userRole === 'ProgramOfficer'}
        <button on:click={() => navigateTo('applications')}>Applications</button>
        <button on:click={() => navigateTo('reports')}>Reports</button>
      {/if}
      
      <button on:click={logout}>Log Out</button>
    </div>
  </div>
</nav>

<style>
  nav {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 0.5rem 0;
    margin-bottom: 1rem;
  }
  
  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .nav-links button {
    margin-left: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
  }
  
  .nav-links button:hover {
    text-decoration: underline;
  }
</style>
