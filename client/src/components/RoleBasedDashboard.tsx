import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import StaffDashboard from "@/pages/StaffDashboard";
import EnhancedAgentBookingDemo from "@/pages/EnhancedAgentBookingDemo";

export default function RoleBasedDashboard() {
  const { user } = useAuth();
  
  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case 'staff':
      return <StaffDashboard />;
    case 'retail-agent':
    case 'referral-agent':
      return <EnhancedAgentBookingDemo />;
    case 'admin':
    case 'portfolio-manager':
    case 'owner':
    default:
      return <Dashboard />;
  }
}