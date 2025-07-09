import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth once on component mount
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/user', { 
        credentials: 'include',
        cache: 'no-cache'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Auth check failed');
      setUser(null);
    }
    setIsLoading(false);
    return null;
  };

  // Check auth on mount only
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    checkAuth,
  };
}
