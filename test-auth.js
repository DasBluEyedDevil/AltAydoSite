/**
 * Auth Flow Test Script
 * 
 * This script logs various authentication-related events to help diagnose issues.
 * Add this to your project and import it in your components where needed.
 */

// Function to test login functionality
export const testLogin = async (credentials) => {
  try {
    const response = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      console.error('Login failed:', response.status, response.statusText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

// Function to test session state
export const testSession = async () => {
  try {
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    console.log('Current session:', session);
    return session;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
};

// Function to test logout
export const testLogout = async () => {
  try {
    const response = await fetch('/api/auth/signout', { method: 'POST' });
    return response.ok;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}; 