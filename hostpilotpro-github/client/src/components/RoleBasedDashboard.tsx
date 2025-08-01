import React, { useEffect } from "react";
import { useFastAuth } from "@/lib/fastAuth";
import Dashboard from "@/pages/Dashboard";
import StaffDashboard from "@/pages/StaffDashboard";
import RetailAgentHub from "@/pages/agent/RetailAgentHub";
import ReferralAgentDashboard from "@/pages/ReferralAgentDashboard";
import FastPageTransition from "./FastPageTransition";

export default function RoleBasedDashboard() {
  const { user } = useFastAuth();
  
  // Redirect retail agents to their hub immediately
  useEffect(() => {
    if (user?.role === 'retail-agent') {
      window.location.href = '/agent/hub';
    }
  }, [user?.role]);
  
  // Route to appropriate dashboard based on user role with fast loading
  const renderDashboard = () => {
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
  };

  return (
    <FastPageTransition>
      {renderDashboard()}
    </FastPageTransition>
  );
}