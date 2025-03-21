import { writable, get } from 'svelte/store';

// Check localStorage for saved role on initialization
const savedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

// User role store - starts as saved role or null, updated on login
export const userRole = writable(savedRole);

// Helper function to check if user has specific role
export function hasRole(role) {
  return get(userRole) === role;
}

// For debugging
console.log('Initial role from localStorage:', savedRole);
