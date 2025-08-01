import { User } from "@shared/schema";

export interface AuthUser extends User {
  permissions: PermissionMatrix;
  listingsAccess: number[];
}

export interface PermissionMatrix {
  [section: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface AuthSession {
  user: AuthUser;
  token?: string;
  expiresAt: Date;
}

// Role-based dashboard routes
export const ROLE_DASHBOARDS: Record<string, string> = {
  'admin': '/admin-dashboard',
  'portfolio-manager': '/portfolio-dashboard', 
  'owner': '/owner-dashboard',
  'retail-agent': '/agent-dashboard',
  'referral-agent': '/agent-dashboard',
  'staff': '/housekeeping-dashboard',
  'guest': '/guest-dashboard'
};

// Default permissions for each role
export const DEFAULT_PERMISSIONS: Record<string, PermissionMatrix> = {
  'admin': {
    properties: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
    finances: { view: true, create: true, edit: true, delete: true },
    bookings: { view: true, create: true, edit: true, delete: true },
    tasks: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true }
  },
  'portfolio-manager': {
    properties: { view: true, create: true, edit: true, delete: false },
    users: { view: true, create: false, edit: true, delete: false },
    finances: { view: true, create: true, edit: true, delete: false },
    bookings: { view: true, create: true, edit: true, delete: false },
    tasks: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, create: true, edit: false, delete: false }
  },
  'owner': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: true, create: false, edit: false, delete: false },
    bookings: { view: true, create: false, edit: false, delete: false },
    tasks: { view: true, create: true, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false }
  },
  'retail-agent': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: true, create: false, edit: false, delete: false },
    bookings: { view: true, create: true, edit: true, delete: false },
    tasks: { view: false, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false }
  },
  'referral-agent': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: true, create: false, edit: false, delete: false },
    bookings: { view: true, create: true, edit: false, delete: false },
    tasks: { view: false, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false }
  },
  'staff': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: false, create: false, edit: false, delete: false },
    bookings: { view: true, create: false, edit: false, delete: false },
    tasks: { view: true, create: false, edit: true, delete: false },
    reports: { view: false, create: false, edit: false, delete: false }
  },
  'guest': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: false, create: false, edit: false, delete: false },
    bookings: { view: true, create: false, edit: false, delete: false },
    tasks: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false }
  }
};

/**
 * Check if user has access to a specific section and action
 */
export function canAccess(
  user: AuthUser | null, 
  section: string, 
  action: 'view' | 'create' | 'edit' | 'delete' = 'view',
  listingId?: number
): boolean {
  if (!user) return false;
  
  // Check role-based permissions
  const sectionPermissions = user.permissions[section];
  if (!sectionPermissions || !sectionPermissions[action]) {
    return false;
  }
  
  // Check listing access if listing ID is provided
  if (listingId && user.listingsAccess.length > 0) {
    return user.listingsAccess.includes(listingId);
  }
  
  return true;
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(user: AuthUser | null, route: string): boolean {
  if (!user) return false;
  
  // Define route permissions
  const routePermissions: Record<string, string> = {
    '/admin-dashboard': 'admin',
    '/portfolio-dashboard': 'portfolio-manager',
    '/owner-dashboard': 'owner', 
    '/agent-dashboard': 'retail-agent,referral-agent',
    '/housekeeping-dashboard': 'staff',
    '/guest-dashboard': 'guest',
    '/enhanced-admin-dashboard': 'admin',
    '/god-mode-role-manager': 'admin',
    '/user-management': 'admin'
  };
  
  const allowedRoles = routePermissions[route];
  if (!allowedRoles) return true; // Public route
  
  return allowedRoles.split(',').includes(user.role);
}

/**
 * Get redirect URL based on user role
 */
export function getDashboardRoute(role: string): string {
  return ROLE_DASHBOARDS[role] || '/';
}

/**
 * Session management
 */
export class AuthSessionManager {
  private static SESSION_KEY = 'hostpilot_auth_session';
  
  static saveSession(session: AuthSession): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }
  
  static getSession(): AuthSession | null {
    try {
      const stored = sessionStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;
      
      const session = JSON.parse(stored) as AuthSession;
      
      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }
  
  static clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }
  
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
  
  static getCurrentUser(): AuthUser | null {
    const session = this.getSession();
    return session?.user || null;
  }
}

// Authentication API functions
export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await fetch('/api/auth/demo-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const userData = await response.json();
  
  // Create auth user with permissions and listing access
  const authUser: AuthUser = {
    ...userData,
    permissions: DEFAULT_PERMISSIONS[userData.role] || DEFAULT_PERMISSIONS.guest,
    listingsAccess: [] // TODO: Get from user properties
  };

  // Save session
  const session: AuthSession = {
    user: authUser,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
  
  AuthSessionManager.saveSession(session);
  
  return authUser;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/demo-logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout API failed:', error);
  } finally {
    AuthSessionManager.clearSession();
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include'
    });

    if (!response.ok) {
      AuthSessionManager.clearSession();
      return null;
    }

    const userData = await response.json();
    
    const authUser: AuthUser = {
      ...userData,
      permissions: DEFAULT_PERMISSIONS[userData.role] || DEFAULT_PERMISSIONS.guest,
      listingsAccess: [] // TODO: Get from user properties
    };

    // Update session
    const session: AuthSession = {
      user: authUser,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    
    AuthSessionManager.saveSession(session);
    
    return authUser;
  } catch (error) {
    console.error('Failed to get current user:', error);
    AuthSessionManager.clearSession();
    return null;
  }
}

// React hook for authentication
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    
    // First check session storage
    const storedSession = AuthSessionManager.getSession();
    if (storedSession) {
      setUser(storedSession.user);
      setIsLoading(false);
      return;
    }

    // Then check server
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const authUser = await loginUser(email, password);
    setUser(authUser);
    return authUser;
  };

  const logout = async () => {
    await logoutUser();
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