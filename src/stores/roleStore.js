import { writable, get, derived } from 'svelte/store';

// Check localStorage for saved role on initialization
const savedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

// User role store - starts as saved role or null, updated on login
export const userRole = writable(savedRole);

// Create derived stores for easier role-based checks
export const isLoggedIn = derived(userRole, $role => $role !== null);
export const isScreener = derived(userRole, $role => $role === 'Screener');
export const isManager = derived(userRole, $role => $role === 'Manager');
export const isProgramOfficer = derived(userRole, $role => $role === 'ProgramOfficer');

// Helper function to check if user has specific role
export function hasRole(role) {
  return get(userRole) === role;
}

// Helper function to get navigation items based on role
export function getNavItems(role) {
  const baseItems = [
    { label: 'Home', route: 'home' }
  ];
  
  if (!role) return baseItems;
  
  if (role === 'Screener') {
    return [
      ...baseItems,
      { label: 'Applications', route: 'applications' }
    ];
  } else if (role === 'Manager') {
    return [
      ...baseItems,
      { label: 'Applications', route: 'applications' },
      { label: 'RWR Management', route: 'rwr' }
    ];
  } else if (role === 'ProgramOfficer') {
    return [
      ...baseItems,
      { label: 'Applications', route: 'applications' },
      { label: 'Reports', route: 'reports' }
    ];
  }
  
  return baseItems;
}

// User information - can be expanded with real auth
export const userInfo = derived(userRole, $role => {
  if (!$role) return null;
  
  return {
    role: $role,
    name: `Test ${$role}`,
    id: `user-${Date.now()}`
  };
});

// For debugging
console.log('Initial role from localStorage:', savedRole);
