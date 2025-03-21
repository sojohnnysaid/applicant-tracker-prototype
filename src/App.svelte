<script>
  import { onMount } from 'svelte';
  console.log('App.svelte script executed');
  
  // Generate title based on current route
  $: pageTitle = currentRoute === 'home' 
    ? 'GRFP Application Tracker' 
    : `${currentRoute === 'msw-test' ? 'MSW Test' : currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1)} | GRFP Application Tracker`;
  
  // Simple counter state
  let counter = 0;
  
  // Simple router state
  let currentRoute = 'home';
  
  // State for API test results
  let testApiResult = null;
  let userApiResult = null;
  let itemsApiResult = null;
  let applicationsResult = null;
  let singleApplicationResult = null;
  let isLoading = false;
  let apiError = null;
  
  onMount(async () => {
    console.log('App.svelte component mounted');
  });
  
  function incrementCounter() {
    counter += 1;
    console.log('Counter incremented to:', counter);
  }
  
  function navigateTo(route) {
    console.log(`Navigating to: ${route}`);
    currentRoute = route;
  }
  
  // Function to test the MSW endpoints
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
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main>
  <header>
    <div class="app-header">
      <h1>GRFP Application Tracker</h1>
      <p class="subtitle">Mock Service Worker Integration Test</p>
    </div>
    
    <!-- Simple navigation -->
    <nav>
      <button on:click={() => navigateTo('home')} class:active={currentRoute === 'home'}>
        Home
      </button>
      <button on:click={() => navigateTo('msw-test')} class:active={currentRoute === 'msw-test'}>
        MSW Test
      </button>
      <button on:click={() => navigateTo('applications')} class:active={currentRoute === 'applications'}>
        Applications
      </button>
    </nav>
  </header>
  
  <!-- Simple router implementation -->
  <div class="content">
    {#if currentRoute === 'home'}
      <section>
        <h2>Dashboard</h2>
        <p>Welcome to the GRFP Application Tracker prototype.</p>
        <p>This simple prototype demonstrates the integration of Mock Service Worker (MSW) for handling API requests.</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <h3>API Mocking</h3>
            <p>Simulates backend APIs without a real server</p>
          </div>
          
          <div class="feature-card">
            <h3>Application Tracking</h3>
            <p>View and manage application statuses</p>
          </div>
          
          <div class="feature-card">
            <h3>MSW Testing</h3>
            <p>Click the "MSW Test" tab to test API endpoints</p>
          </div>
        </div>
        
        <div class="counter-demo">
          <p>Sample Counter: {counter}</p>
          <button on:click={incrementCounter}>Increment</button>
        </div>
      </section>
    
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
    
    {:else if currentRoute === 'applications'}
      <section>
        <h2>Applications</h2>
        <p>This page demonstrates a simple list of applications using the MSW mock API.</p>
        
        <button on:click={async () => {
          isLoading = true;
          try {
            const response = await fetch('/api/applications');
            applicationsResult = await response.json();
          } catch (error) {
            apiError = error.message;
          } finally {
            isLoading = false;
          }
        }} class="load-button">Load Applications</button>
        
        {#if isLoading}
          <p>Loading applications...</p>
        {:else if apiError}
          <div class="error-message">
            <p>Error: {apiError}</p>
          </div>
        {:else if applicationsResult && applicationsResult.length > 0}
          <table class="applications-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant Name</th>
                <th>Status</th>
                <th>Program</th>
              </tr>
            </thead>
            <tbody>
              {#each applicationsResult as app}
                <tr>
                  <td>{app.id}</td>
                  <td>{app.applicantName}</td>
                  <td class="status-cell {app.status.toLowerCase()}">{app.status}</td>
                  <td>{app.program}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else if applicationsResult}
          <p>No applications found.</p>
        {/if}
      </section>
    {/if}
  </div>
</main>

<style>
  main {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  header {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
  }
  
  nav button {
    padding: 0.5rem 1rem;
    background: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  nav button:hover:not(:disabled) {
    background: #e0e0e0;
  }
  
  nav button.active {
    background: #007bff;
    color: white;
    border-color: #0069d9;
  }
  
  nav button.active:hover:not(:disabled) {
    background: #0069d9;
  }
  
  .content {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 5px;
    border: 1px solid #eee;
  }
  
  section {
    margin-bottom: 2rem;
  }
  
  .counter-demo {
    background: #e9ecef;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
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
  
  .counter-demo button {
    background: #28a745;
  }
  
  .counter-demo button:hover:not(:disabled) {
    background: #218838;
  }
  
  /* Features grid on home page */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }
  
  .feature-card {
    background: #f0f7ff;
    border-radius: 5px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .feature-card h3 {
    margin-top: 0;
    color: #0056b3;
  }
  
  /* Applications table */
  .applications-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  
  .applications-table th,
  .applications-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .applications-table th {
    background: #f5f5f5;
    font-weight: 600;
  }
  
  .applications-table tr:hover {
    background: #f9f9f9;
  }
  
  .status-cell {
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
  }
  
  .status-cell.eligible {
    background: #e6ffed;
    color: #22863a;
  }
  
  .status-cell.non-compliant {
    background: #fff5f5;
    color: #d73a49;
  }
  
  .status-cell.ineligible {
    background: #f8eae7;
    color: #cb2431;
  }
  
  .status-cell.pending {
    background: #fff8e1;
    color: #b08800;
  }
  
  .load-button {
    margin-top: 1rem;
    background: #6f42c1;
  }
  
  .load-button:hover:not(:disabled) {
    background: #5a32a3;
  }
  
  .subtitle {
    color: #666;
    font-style: italic;
    margin-top: -0.5rem;
  }
  
  .app-header {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .app-header h1 {
    margin-bottom: 0.25rem;
  }
</style>
