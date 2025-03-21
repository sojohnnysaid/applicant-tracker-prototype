<script>
  import { onMount } from 'svelte';
  import { userRole, isLoggedIn } from './stores/roleStore';
  import NavBar from './components/NavBar.svelte';
  import Login from './routes/Login.svelte';
  import ApplicationList from './routes/ApplicationList.svelte';
  import Home from './routes/Home.svelte';
  import RWR from './routes/RWR.svelte';
  import Reports from './routes/Reports.svelte';
  import ApplicationDetail from './routes/ApplicationDetail.svelte';
  
  console.log('App.svelte script executed');
  
  // Router state
  let currentRoute = 'home';
  let routeParams = {};
  
  // Generate title based on current route
  $: pageTitle = currentRoute === 'home' 
    ? 'GRFP Application Tracker' 
    : `${capitalizeFirstLetter(currentRoute)} | GRFP Application Tracker`;
  
  // Helper to capitalize first letter
  function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // MSW Testing page state (kept from original)
  let testApiResult = null;
  let userApiResult = null;
  let itemsApiResult = null;
  let applicationsResult = null;
  let singleApplicationResult = null;
  let isLoading = false;
  let apiError = null;
  
  onMount(async () => {
    console.log('App.svelte component mounted');
    
    // Check if user is logged in from localStorage
    const savedRole = localStorage.getItem('userRole');
    if (!savedRole) {
      // Redirect to login if not logged in
      navigateTo('login');
    }
    
    // Set up hash-based routing
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });
  
  // Handle hash-based routing
  function handleHashChange() {
    const hash = window.location.hash.slice(1) || '/';
    const [routePath, ...params] = hash.split('/').filter(Boolean);
    
    console.log('Hash changed:', hash, 'Route:', routePath, 'Params:', params);
    
    if (routePath === 'applications' && params.length > 0) {
      // If route is /applications/{id}, then it's an application detail view
      routeParams = { id: params[0] };
      currentRoute = 'application-detail';
    } else if (routePath) {
      currentRoute = routePath;
      routeParams = {};
    } else {
      currentRoute = 'home';
      routeParams = {};
    }
    
    // Update page scroll position
    window.scrollTo(0, 0);
  }
  
  // Navigation function
  function navigateTo(route, params = {}) {
    console.log(`Navigating to: ${route}`, params);
    
    if (Object.keys(params).length > 0) {
      // Handle routes with parameters
      if (route === 'application-detail' && params.id) {
        window.location.hash = `applications/${params.id}`;
      } else {
        window.location.hash = route;
        routeParams = params;
      }
    } else {
      window.location.hash = route;
      routeParams = {};
    }
  }
  
  // Function to test the MSW endpoints (kept from original)
  async function testMswEndpoints() {
    isLoading = true;
    apiError = null;
    
    try {
      // Test /api/test endpoint
      console.log('Testing /api/test endpoint');
      const testResponse = await fetch('/api/test');
      testApiResult = await testResponse.json();
      
      // Test /api/user endpoint
      console.log('Testing /api/user endpoint');
      const userResponse = await fetch('/api/user');
      userApiResult = await userResponse.json();
      
      // Test /api/items endpoint
      console.log('Testing /api/items endpoint');
      const itemsResponse = await fetch('/api/items');
      itemsApiResult = await itemsResponse.json();
      
      // Test /api/applications endpoint
      console.log('Testing /api/applications endpoint');
      const applicationsResponse = await fetch('/api/applications');
      applicationsResult = await applicationsResponse.json();
      
      // Test /api/applications/:id endpoint
      console.log('Testing /api/applications/:id endpoint');
      const appId = applicationsResult?.[0]?.id || 'APP-001';
      const singleAppResponse = await fetch(`/api/applications/${appId}`);
      singleApplicationResult = await singleAppResponse.json();
      
      console.log('All endpoints tested successfully');
    } catch (error) {
      console.error('Error testing MSW endpoints:', error);
      apiError = error.message;
    } finally {
      isLoading = false;
    }
  }
  
  // Handle role changes
  // If role is set to null (logout), navigate to login
  $: if ($userRole === null && currentRoute !== 'login') {
    navigateTo('login');
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main>
  <!-- Show navigation bar only if user is logged in -->
  {#if $isLoggedIn && currentRoute !== 'login'}
    <NavBar {navigateTo} {currentRoute} />
  {/if}
  
  <!-- Router implementation -->
  <div class="content">
    {#if currentRoute === 'login'}
      <Login {navigateTo} />
      
    {:else if currentRoute === 'home'}
      <Home {navigateTo} />
    
    {:else if currentRoute === 'applications'}
      <ApplicationList />
    
    {:else if currentRoute === 'application-detail'}
      <ApplicationDetail id={routeParams.id} />
    
    {:else if currentRoute === 'rwr'}
      <RWR />
      
    {:else if currentRoute === 'reports'}
      <Reports />
    
    {:else if currentRoute === 'msw-test'}
      <section>
        <h2>MSW Test</h2>
        <p>This page tests the Mock Service Worker setup by making API requests to mocked endpoints.</p>
        
        <div class="action-buttons">
          <button on:click={testMswEndpoints} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test MSW Endpoints'}
          </button>
        </div>
        
        {#if apiError}
          <div class="error-message">
            <h3>Error:</h3>
            <pre>{apiError}</pre>
          </div>
        {/if}
        
        {#if testApiResult}
          <div class="result-card">
            <h3>/api/test Response:</h3>
            <pre>{JSON.stringify(testApiResult, null, 2)}</pre>
          </div>
        {/if}
        
        {#if userApiResult}
          <div class="result-card">
            <h3>/api/user Response:</h3>
            <pre>{JSON.stringify(userApiResult, null, 2)}</pre>
          </div>
        {/if}
        
        {#if itemsApiResult}
          <div class="result-card">
            <h3>/api/items Response:</h3>
            <pre>{JSON.stringify(itemsApiResult, null, 2)}</pre>
          </div>
        {/if}
        
        {#if applicationsResult}
          <div class="result-card">
            <h3>/api/applications Response:</h3>
            <pre>{JSON.stringify(applicationsResult, null, 2)}</pre>
          </div>
        {/if}
        
        {#if singleApplicationResult}
          <div class="result-card">
            <h3>/api/applications/:id Response:</h3>
            <pre>{JSON.stringify(singleApplicationResult, null, 2)}</pre>
          </div>
        {/if}
      </section>
      
    {:else}
      <div class="not-found">
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or is still under development.</p>
        <button on:click={() => navigateTo('home')}>Go to Home</button>
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .content {
    min-height: 75vh;
  }
  
  section {
    margin-bottom: 2rem;
  }
  
  .action-buttons {
    margin: 1rem 0;
  }
  
  .action-buttons button {
    background: #6200ee;
    font-weight: bold;
    padding: 0.75rem 1.5rem;
  }
  
  .action-buttons button:hover:not(:disabled) {
    background: #5000ca;
  }
  
  .result-card {
    background: #e9f7ef;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    overflow: auto;
  }
  
  .error-message {
    background: #ffebee;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
  }
  
  pre {
    white-space: pre-wrap;
    word-break: break-all;
    background: #f5f5f5;
    padding: 0.5rem;
    border-radius: 4px;
  }
  
  button {
    cursor: pointer;
    background: #4a90e2;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  button:hover:not(:disabled) {
    background: #3a80d2;
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .not-found {
    text-align: center;
    padding: 3rem 1rem;
    background: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #eee;
    margin-top: 2rem;
  }
  
  .not-found button {
    margin-top: 1rem;
  }
</style>
