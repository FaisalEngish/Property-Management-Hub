import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AccessDenied from "@/pages/AccessDenied";

interface RolePermissionGuardProps {
  children: React.ReactNode;
  moduleKey: string;
  requiredAccess?: 'read' | 'write' | 'admin';
  fallback?: React.ReactNode;
}

export default function RolePermissionGuard({ 
  children, 
  moduleKey, 
  requiredAccess = 'read',
  fallback 
}: RolePermissionGuardProps) {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch user permissions
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["/api/user/permissions"],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check if user has access to the module
  const modulePermission = permissions?.[moduleKey];
  const hasAccess = modulePermission?.visible && 
    (requiredAccess === 'read' || 
     (requiredAccess === 'write' && ['write', 'admin'].includes(modulePermission.access)) ||
     (requiredAccess === 'admin' && modulePermission.access === 'admin'));

  // Return fallback or access denied
  if (!hasAccess) {
    return fallback || <AccessDenied />;
  }

  return <>{children}</>;
}