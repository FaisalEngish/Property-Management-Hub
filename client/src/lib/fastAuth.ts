import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  permissions?: string[];
  listingsAccess?: string[];
}

interface AuthSession {
  user: AuthUser;
  expiresAt: Date;
}

// Fast session management with immediate local storage
class FastAuthSessionManager {
  private static SESSION_KEY = "hostpilot_fast_auth_session";

  static saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({
        ...session,
        expiresAt: session.expiresAt.toISOString()
      }));
    } catch (error) {
      console.error("Failed to save auth session:", error);
    }
  }

  static getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const expiresAt = new Date(parsed.expiresAt);

      if (expiresAt <= new Date()) {
        this.clearSession();
        return null;
      }

      return {
        ...parsed,
        expiresAt
      };
    } catch (error) {
      console.error("Failed to retrieve auth session:", error);
      this.clearSession();
      return null;
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error("Failed to clear auth session:", error);
    }
  }
}

// Fast login with optimistic updates
export async function fastLogin(email: string, password: string): Promise<AuthUser> {
  // Start the API request
  const loginPromise = fetch('/api/auth/demo-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });

  try {
    const response = await loginPromise;
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const userData = await response.json();
    
    // Create optimized auth user
    const authUser: AuthUser = {
      ...userData,
      permissions: [],
      listingsAccess: []
    };

    // Immediately save session for instant future loads
    const session: AuthSession = {
      user: authUser,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    FastAuthSessionManager.saveSession(session);
    
    return authUser;
  } catch (error) {
    FastAuthSessionManager.clearSession();
    throw error;
  }
}

export async function fastLogout(): Promise<void> {
  // Clear session immediately
  FastAuthSessionManager.clearSession();
  
  // Fire and forget the logout API call
  fetch('/api/auth/demo-logout', {
    method: 'POST',
    credentials: 'include'
  }).catch(error => {
    console.error('Logout API failed:', error);
  });
}

// Fast auth hook with immediate local storage check
export function useFastAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Immediately check local storage first
    const storedSession = FastAuthSessionManager.getSession();
    if (storedSession) {
      setUser(storedSession.user);
      setIsLoading(false);
      return;
    }

    // Only then check server if no local session
    checkServerAuth();
  }, []);

  const checkServerAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        const authUser: AuthUser = {
          ...userData,
          permissions: [],
          listingsAccess: []
        };
        
        // Save to session for next time
        const session: AuthSession = {
          user: authUser,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        FastAuthSessionManager.saveSession(session);
        setUser(authUser);
      } else {
        FastAuthSessionManager.clearSession();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      FastAuthSessionManager.clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const authUser = await fastLogin(email, password);
    setUser(authUser);
    return authUser;
  };

  const logout = async () => {
    await fastLogout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };
}