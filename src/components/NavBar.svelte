<script>
  import { userRole, userInfo, getNavItems } from '../stores/roleStore';
  
  export let navigateTo;
  export let currentRoute = 'home';
  
  $: navItems = getNavItems($userRole);
  $: userName = localStorage.getItem('userName') || 'User';
  
  function logout() {
    userRole.set(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigateTo('login');
  }
</script>

<nav>
  <div class="nav-container">
    <div class="nav-brand">
      <span class="logo" on:click={() => navigateTo('home')}>GRFP Application Master Tracker</span>
    </div>
    
    <div class="nav-links">
      {#each navItems as item}
        <button 
          on:click={() => navigateTo(item.route)}
          class:active={currentRoute === item.route}
          aria-current={currentRoute === item.route ? 'page' : undefined}
        >
          {item.label}
        </button>
      {/each}
    </div>
    
    <div class="user-section">
      {#if $userRole}
        <div class="user-info">
          <span class="user-name">{userName}</span>
          <span class="user-role">{$userRole}</span>
        </div>
        <button class="logout-btn" on:click={logout}>Log Out</button>
      {/if}
    </div>
  </div>
</nav>

<style>
  nav {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 0.75rem 0;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .nav-brand {
    flex: 1;
  }
  
  .logo {
    font-weight: bold;
    font-size: 1.2rem;
    color: #007bff;
    cursor: pointer;
  }
  
  .nav-links {
    display: flex;
    gap: 0.5rem;
    margin: 0 1rem;
  }
  
  .nav-links button {
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .nav-links button:hover {
    background-color: #e9ecef;
    color: #007bff;
  }
  
  .nav-links button.active {
    background-color: #e9ecef;
    color: #007bff;
    font-weight: 600;
  }
  
  .user-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.2;
  }
  
  .user-name {
    font-weight: 500;
    font-size: 0.9rem;
  }
  
  .user-role {
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  .logout-btn {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #6c757d;
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .logout-btn:hover {
    background-color: #e9ecef;
    color: #dc3545;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
    }
    
    .nav-links {
      width: 100%;
      justify-content: center;
      margin: 0.5rem 0;
    }
    
    .user-section {
      width: 100%;
      justify-content: space-between;
      padding-top: 0.5rem;
      border-top: 1px solid #dee2e6;
    }
  }
</style>
