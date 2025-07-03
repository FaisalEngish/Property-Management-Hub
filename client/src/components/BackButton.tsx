import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface BackButtonProps {
  fallbackRoute?: string;
  variant?: "default" | "ghost" | "outline";
  position?: "top-left" | "floating";
  className?: string;
  children?: React.ReactNode;
}

export function BackButton({ 
  fallbackRoute = "/", 
  variant = "ghost", 
  position = "top-left",
  className = "",
  children 
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to specified route
      setLocation(fallbackRoute);
    }
  };

  const baseClasses = position === "floating" 
    ? "fixed bottom-4 left-4 z-50 shadow-lg" 
    : "";

  return (
    <Button
      onClick={handleBack}
      variant={variant}
      size="sm"
      className={`${baseClasses} ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {children || "Back"}
    </Button>
  );
}

// Role-specific back button with proper fallback routes
export function RoleBackButton({ role, ...props }: BackButtonProps & { role: string }) {
  const getFallbackRoute = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return "/dashboard";
      case "portfolio-manager":
        return "/dashboard";
      case "staff":
        return "/staff-dashboard";
      case "owner":
        return "/owner-dashboard";
      case "retail-agent":
        return "/retail-agent";
      case "referral-agent":
        return "/referral-agent";
      case "guest":
        return "/guest-portal";
      default:
        return "/";
    }
  };

  return <BackButton fallbackRoute={getFallbackRoute(role)} {...props} />;
}