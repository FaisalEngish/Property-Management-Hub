import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UIResetButton } from "@/components/UIResetButton";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Tasks from "@/pages/Tasks";
import StaffTasks from "@/pages/StaffTasks";
import Bookings from "@/pages/Bookings";
import Services from "@/pages/Services";
import Finances from "@/pages/Finances";
import Payouts from "@/pages/Payouts";
import Settings from "@/pages/Settings";
import Hostaway from "@/pages/Hostaway";
import WelcomePacks from "@/pages/WelcomePacks";
import InventoryDashboard from "@/pages/InventoryDashboard";
import FinancialToolkit from "@/pages/FinancialToolkit";
import UtilityTracking from "@/pages/UtilityTracking";
import RetailAgentBooking from "@/pages/RetailAgentBooking";
import ReferralAgentDashboard from "@/pages/ReferralAgentDashboard";
import StaffDashboard from "@/pages/StaffDashboard";
import AiFeedbackMonitor from "@/pages/AiFeedbackMonitor";
import GuestAddonServices from "@/pages/GuestAddonServices";
import RecurringServicesBilling from "@/pages/RecurringServicesBilling";
import PropertyMediaLibrary from "@/pages/PropertyMediaLibrary";
import GuestAddonBooking from "@/pages/GuestAddonBooking";
import AdminAddonBookings from "@/pages/AdminAddonBookings";
import AdminAddonSettings from "@/pages/AdminAddonSettings";
import OwnerDashboard from "@/pages/OwnerDashboard";
import PortfolioManagerDashboard from "@/pages/PortfolioManagerDashboard";
import FinanceResetControl from "@/pages/FinanceResetControl";
import UtilityCustomization from "@/pages/UtilityCustomization";
import AgentCommissionDashboard from "@/pages/AgentCommissionDashboard";
import LoyaltyGuestTracker from "@/pages/LoyaltyGuestTracker";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();

  // Handle role-based dashboard redirects
  useEffect(() => {
    if (isAuthenticated && user && location.startsWith('/dashboard/')) {
      const roleFromUrl = location.split('/dashboard/')[1];
      if (roleFromUrl !== (user as any)?.role) {
        // Redirect to correct role dashboard
        setLocation(`/dashboard/${(user as any)?.role}`);
      }
    }
  }, [isAuthenticated, user, location, setLocation]);

  // Role-based dashboard component selector
  const getDashboardComponent = (role?: string) => {
    switch (role) {
      case 'admin':
        return Dashboard;
      case 'portfolio-manager':
        return PortfolioManagerDashboard;
      case 'owner':
        return OwnerDashboard;
      case 'staff':
        return StaffDashboard;
      case 'retail-agent':
        return RetailAgentBooking;
      case 'referral-agent':
        return ReferralAgentDashboard;
      case 'guest':
        return GuestAddonServices;
      default:
        return Dashboard;
    }
  };

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            {() => {
              // Redirect to role-specific dashboard
              const userRole = (user as any)?.role;
              const DashboardComponent = getDashboardComponent(userRole);
              return <DashboardComponent />;
            }}
          </Route>
          <Route path="/dashboard/:role">
            {({ role }) => {
              const DashboardComponent = getDashboardComponent(role);
              return <DashboardComponent />;
            }}
          </Route>
          <Route path="/properties" component={Properties} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/staff-tasks" component={StaffTasks} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/services" component={Services} />
          <Route path="/welcome-packs" component={WelcomePacks} />
          <Route path="/inventory-dashboard" component={InventoryDashboard} />
          <Route path="/finances" component={Finances} />
          <Route path="/payouts" component={Payouts} />
          <Route path="/financial-toolkit" component={FinancialToolkit} />
          <Route path="/utility-tracking" component={UtilityTracking} />
          <Route path="/ai-feedback" component={AiFeedbackMonitor} />
          <Route path="/guest-addon-services" component={GuestAddonServices} />
          <Route path="/recurring-services" component={RecurringServicesBilling} />
          <Route path="/referral-agent" component={ReferralAgentDashboard} />
          <Route path="/retail-booking" component={RetailAgentBooking} />
          <Route path="/agent-commission" component={AgentCommissionDashboard} />
          <Route path="/staff" component={StaffDashboard} />
          <Route path="/agent-media-library" component={PropertyMediaLibrary} />
          <Route path="/guest/add-ons" component={GuestAddonBooking} />
          <Route path="/admin/add-ons-bookings" component={AdminAddonBookings} />
          <Route path="/admin/add-ons-settings" component={AdminAddonSettings} />
          <Route path="/owner/dashboard" component={OwnerDashboard} />
          <Route path="/pm/dashboard" component={PortfolioManagerDashboard} />
          <Route path="/admin/finance-reset" component={FinanceResetControl} />
          <Route path="/admin/utility-customization" component={UtilityCustomization} />
          <Route path="/loyalty-tracker" component={LoyaltyGuestTracker} />
          <Route path="/hostaway" component={Hostaway} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <UIResetButton />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
