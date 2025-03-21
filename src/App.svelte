<script>
  // Simplified App.svelte for debugging
  import { onMount } from 'svelte';
  console.log('App.svelte script executed');
  
  let appLoaded = false;
  
  onMount(() => {
    console.log('App.svelte mounted');
    appLoaded = true;
  });
  
  function goToLogin() {
    console.log('Login button clicked');
    // We'll implement actual login functionality once basic app works
  }
</script>

<main>
  <div class="container">
    <h1>GRFP Application Master Tracker</h1>
    <p>Simplified version for debugging</p>
    
    {#if appLoaded}
      <div class="debug-info">
        <p>✅ App successfully loaded!</p>
      </div>
    {:else}
      <div class="debug-info">
        <p>⏳ App is loading...</p>
      </div>
    {/if}
    
    <button on:click={goToLogin}>Go to Login</button>
  </div>
</main>

<style>
  main {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    padding: 2rem;
    text-align: center;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  h1 {
    color: #333;
  }
  
  .debug-info {
    background: #f3f3f3;
    padding: 1rem;
    border-radius: 5px;
    margin: 2rem 0;
  }
  
  button {
    background: #4a90e2;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #3a80d2;
  }
</style>
