import { useAuth, canAccessRoute, getDashboardRoute } from "@/lib/auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  route?: string;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, route, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      setLocation("/login");
      return;
    }

    if (!isLoading && user) {
      // Check route access if specified
      if (route && !canAccessRoute(user, route)) {
        // Redirect to user's default dashboard
        const defaultRoute = getDashboardRoute(user.role);
        setLocation(defaultRoute);
        return;
      }

      // Check role access if specified
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to user's default dashboard
        const defaultRoute = getDashboardRoute(user.role);
        setLocation(defaultRoute);
        return;
      }
    }
  }, [user, isLoading, route, allowedRoles, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // Check access one more time before rendering
  if (route && !canAccessRoute(user, route)) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;