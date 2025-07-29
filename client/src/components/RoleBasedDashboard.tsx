import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import StaffDashboard from "@/pages/StaffDashboard";
import RetailAgentHub from "@/pages/agent/RetailAgentHub";
import ReferralAgentDashboard from "@/pages/ReferralAgentDashboard";

export default function RoleBasedDashboard() {
  const { user } = useAuth();
  
  // Redirect retail agents to their hub immediately
  useEffect(() => {
    if (user?.role === 'retail-agent') {
      window.location.href = '/agent/hub';
    }
  }, [user?.role]);
  
  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case 'staff':
      return <StaffDashboard />;
    case 'retail-agent':
      return <RetailAgentHub />;
    case 'referral-agent':
      return <ReferralAgentDashboard />;
    case 'admin':
    case 'portfolio-manager':
    case 'owner':
    default:
      return <Dashboard />;
  }
}