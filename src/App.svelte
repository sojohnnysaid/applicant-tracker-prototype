<script>
  import { onMount } from 'svelte';
  import NavBar from './components/NavBar.svelte';
  import Home from './routes/Home.svelte';
  import Login from './routes/Login.svelte';
  import ApplicationList from './routes/ApplicationList.svelte';
  import RWR from './routes/RWR.svelte';
  import Reports from './routes/Reports.svelte';
  import { userRole } from './stores/roleStore';
  
  let currentRoute = 'login';
  
  // Simple routing function
  function navigateTo(route) {
    currentRoute = route;
  }
  
  // Create a subscribe to userRole
  // If user logs out, return to login page
  onMount(() => {
    const unsubscribe = userRole.subscribe(value => {
      if (value === null) {
        currentRoute = 'login';
      }
    });
    
    // Cleanup subscription on component destroy
    return unsubscribe;
  });
</script>

<main>
  {#if $userRole}
    <NavBar {navigateTo} />
  {/if}
  
  <div class="container">
    {#if currentRoute === 'login'}
      <Login {navigateTo} />
    {:else if currentRoute === 'home'}
      <Home {navigateTo} />
    {:else if currentRoute === 'applications'}
      <ApplicationList />
    {:else if currentRoute === 'rwr'}
      <RWR />
    {:else if currentRoute === 'reports'}
      <Reports />
    {/if}
  </div>
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
</style>
