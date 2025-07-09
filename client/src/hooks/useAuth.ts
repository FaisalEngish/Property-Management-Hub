import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simple auth check without infinite loops - DON'T call automatically
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', { 
        credentials: 'include',
        cache: 'no-cache'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.log('Auth check failed');
    }
    return null;
  };

  // Return minimal auth state to stop the loop
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    checkAuth,
  };
}
