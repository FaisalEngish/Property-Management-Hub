import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

function ForceLogout() {
  const [, setLocation] = useLocation();

  const handleForceLogout = async () => {
    try {
      // Clear all storage first
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // Call logout endpoint
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {
        console.log('Logout endpoint error:', e);
      }

      // Try demo logout too
      try {
        await fetch('/api/auth/demo-logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {
        console.log('Demo logout endpoint error:', e);
      }

      // Force reload the entire page
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Force logout error:', error);
      // Force reload anyway
      window.location.href = '/login';
    }
  };

  // Auto-trigger logout when this component loads
  useEffect(() => {
    handleForceLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Logging Out</h2>
          <p className="mt-2 text-gray-600">Please wait while we log you out...</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleForceLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            Force Logout Now
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/login'}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Go to Login Page
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ForceLogout;