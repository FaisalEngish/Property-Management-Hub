import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
