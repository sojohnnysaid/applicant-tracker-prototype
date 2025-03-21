import { writable } from 'svelte/store';

// User role store - starts as null/guest, updated on login
export const userRole = writable(null);

// Helper function to check if user has specific role
export function hasRole(role) {
  let currentRole;
  userRole.subscribe(value => {
    currentRole = value;
  })();
  
  return currentRole === role;
}
