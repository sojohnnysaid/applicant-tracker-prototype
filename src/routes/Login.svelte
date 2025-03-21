<script>
  import { userRole } from '../stores/roleStore';
  import { onMount } from 'svelte';
  
  export let navigateTo;
  
  let selectedRole = 'Screener';
  let userName = "";
  let loginInProgress = false;
  let errorMessage = "";
  
  // Role descriptions for help text
  const roleDescriptions = {
    Screener: "Performs initial reviews and checks eligibility",
    Manager: "Oversees final eligibility decisions and handles RWR cases",
    ProgramOfficer: "Reviews outcomes and has reinstatement authority"
  };
  
  onMount(() => {
    // Check if user is already logged in
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      selectedRole = savedRole;
    }
  });
  
  function onLogin() {
    // Basic validation
    if (!userName.trim()) {
      errorMessage = "Please enter your name";
      return;
    }
    
    loginInProgress = true;
    
    // Simulate login process
    setTimeout(() => {
      // Update the role store
      userRole.set(selectedRole);
      
      // Store in localStorage for persistence
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('userName', userName);
      
      // Navigate to home
      navigateTo('home');
      
      loginInProgress = false;
    }, 800); // Simulated delay for UX
  }
</script>

<div class="login-container">
  <h1>GRFP Application Master Tracker</h1>
  <p class="subtitle">Prototype</p>
  
  <div class="form-card">
    <h2>User Login</h2>
    
    {#if errorMessage}
      <div class="error-message">{errorMessage}</div>
    {/if}
    
    <div class="form-group">
      <label for="userName">Your Name</label>
      <input 
        type="text" 
        id="userName" 
        bind:value={userName} 
        placeholder="Enter your name"
        on:keypress={(e) => e.key === 'Enter' && onLogin()}
      />
    </div>
    
    <div class="form-group">
      <label for="role">Select Role</label>
      <select id="role" bind:value={selectedRole}>
        <option value="Screener">Ops Center Screener</option>
        <option value="Manager">Ops Center Manager</option>
        <option value="ProgramOfficer">NSF Program Officer</option>
      </select>
      
      <p class="role-description">
        {roleDescriptions[selectedRole]}
      </p>
    </div>
    
    <button on:click={onLogin} disabled={loginInProgress}>
      {loginInProgress ? 'Logging in...' : 'Log In'}
    </button>
    
    <p class="login-note">
      Note: This is a prototype with simulated authentication.
    </p>
  </div>
</div>

<style>
  .login-container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 1rem;
    text-align: center;
  }
  
  .subtitle {
    color: #666;
    margin-top: -1rem;
    font-style: italic;
  }
  
  .form-card {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 2rem;
    margin-top: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .form-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover:not(:disabled) {
    background-color: #0069d9;
  }
  
  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .role-description {
    font-size: 0.9rem;
    color: #666;
    margin-top: 0.5rem;
    font-style: italic;
  }
  
  .login-note {
    font-size: 0.8rem;
    color: #666;
    margin-top: 1.5rem;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
</style>
