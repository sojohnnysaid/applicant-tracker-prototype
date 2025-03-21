<script>
  import { userRole } from '../stores/roleStore';
  
  export let navigateTo;
  
  let selectedRole = 'Screener';
  
  function onLogin() {
    // Update the role store
    userRole.set(selectedRole);
    
    // Store in localStorage for persistence
    localStorage.setItem('userRole', selectedRole);
    
    // Navigate to home
    navigateTo('home');
  }
</script>

<div class="login-container">
  <h1>GRFP Application Master Tracker</h1>
  <p>Select your role to continue:</p>
  
  <div class="form-group">
    <select bind:value={selectedRole}>
      <option value="Screener">Ops Center Screener</option>
      <option value="Manager">Ops Center Manager</option>
      <option value="ProgramOfficer">NSF Program Officer</option>
    </select>
  </div>
  
  <button on:click={onLogin}>Log In</button>
</div>

<style>
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
  }
  
  button {
    width: 100%;
  }
</style>
