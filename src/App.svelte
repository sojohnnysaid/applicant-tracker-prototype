<script>
  import { onMount } from 'svelte';
  import NavBar from './components/NavBar.svelte';
  import Home from './routes/Home.svelte';
  import Login from './routes/Login.svelte';
  import ApplicationList from './routes/ApplicationList.svelte';
  import RWR from './routes/RWR.svelte';
  import Reports from './routes/Reports.svelte';
  import { userRole } from './stores/roleStore';
  
  // Default route is login
  let currentRoute = 'login';
  
  // Simple routing function
  function navigateTo(route) {
    console.log(`Navigating to: ${route}`);
    currentRoute = route;
  }
  
  onMount(() => {
    console.log("App mounted, current role:", $userRole);
    
    // If user already has a role, go to home
    if ($userRole) {
      currentRoute = 'home';
    }
    
    // Listen for role changes
    const unsubscribe = userRole.subscribe(value => {
      console.log("Role changed to:", value);
      if (value === null) {
        currentRoute = 'login';
      }
    });
    
    // Cleanup subscription on component destroy
    return unsubscribe;
  });
</script>

<svelte:head>
  <!-- Add app.css for additional styles -->
  <link rel="stylesheet" href="/src/app.css">
</svelte:head>

<main>
  <!-- Show navbar only if logged in -->
  {#if $userRole}
    <NavBar {navigateTo} />
  {/if}
  
  <div class="container">
    <!-- Simple router -->
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
    {:else}
      <div class="error-page">
        <h1>Page Not Found</h1>
        <p>The route "{currentRoute}" doesn't exist.</p>
        <button on:click={() => navigateTo('home')}>Go Home</button>
      </div>
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
  
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    flex: 1;
  }
  
  .error-page {
    text-align: center;
    margin-top: 2rem;
  }
</style>
