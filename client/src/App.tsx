import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";

// Import existing pages
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Tasks from "@/pages/Tasks";
import Bookings from "@/pages/Bookings";
import Services from "@/pages/Services";
import SimpleFinances from "./pages/SimpleFinances";
import SimpleSettings from "./pages/SimpleSettings";
import LoginPage from "@/pages/LoginPage";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import SimpleFilteredFinancialDashboard from "./pages/SimpleFilteredFinancialDashboard";
import FilteredPropertyDashboard from "@/pages/FilteredPropertyDashboard";

import SimpleLiveBookingCalendar from "./pages/SimpleLiveBookingCalendar";
import SimpleMaintenanceSuggestions from "./pages/SimpleMaintenanceSuggestions";
import CheckInCheckOutWorkflow from "@/pages/CheckInCheckOutWorkflow";
import DailyOperationsDashboard from "@/pages/DailyOperationsDashboard";
import SandboxTestingDashboard from "@/pages/SandboxTestingDashboard";
import GuestPortalSmartRequests from "@/pages/GuestPortalSmartRequests";
import GuestActivityRecommendations from "@/pages/GuestActivityRecommendations";
import SimpleHelp from "./pages/SimpleHelp";
import UserManagement from "./pages/UserManagement";
import OwnerTargetUpgradeTracker from "./pages/OwnerTargetUpgradeTracker";
import ActivityLogs from "./pages/ActivityLogs";
import AutoScheduleTaskGenerator from "./pages/AutoScheduleTaskGenerator";
import OtaRevenueNetPayoutCalculation from "./pages/OtaRevenueNetPayoutCalculation";
import LoyaltyGuestTracker from "./pages/LoyaltyGuestTracker";
import InvoiceGenerator from "./pages/InvoiceGenerator";
import StaffAdvanceSalaryOvertimeTracker from "./pages/StaffAdvanceSalaryOvertimeTracker";
import SystemWideDemoIntegration from "./pages/SystemWideDemoIntegration";
import MaintenanceLogWarrantyTracker from "./pages/MaintenanceLogWarrantyTracker";
import StaffProfilePayroll from "./pages/StaffProfilePayroll";
import SystemIntegrityCheck from "./pages/SystemIntegrityCheck";
import UtilityTracker from "./pages/UtilityTracker";
import AiNotificationsReminders from "./pages/AiNotificationsReminders";
import FinanceEngine from "./pages/FinanceEngine";
import PropertyDetailView from "./pages/PropertyDetailView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (!response.ok) {
          if (response.status >= 500) {
            throw new Error(`Server error: ${response.status}`);
          }
          if (response.status === 404) {
            throw new Error(`Not found: ${queryKey[0]}`);
          }
          if (response.status === 401) {
            throw new Error(`401: Unauthorized`);
          }
          throw new Error(`Request failed: ${response.status}`);
        }
        
        return response.json();
      },
      retry: (failureCount, error) => {
        if (error.message.includes('401: Unauthorized')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, show login page
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // User is authenticated, show the main app
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/properties" component={Properties} />
        <Route path="/property/:id" component={PropertyDetailView} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/services" component={Services} />
        <Route path="/finances" component={SimpleFinances} />
        <Route path="/settings" component={SimpleSettings} />
        <Route path="/help" component={SimpleHelp} />
        
        {/* Enhanced Dashboards */}
        <Route path="/filtered-financial-dashboard" component={SimpleFilteredFinancialDashboard} />
        <Route path="/filtered-property-dashboard" component={FilteredPropertyDashboard} />
        
        {/* Core Management */}
        <Route path="/booking-calendar" component={SimpleLiveBookingCalendar} />
        <Route path="/maintenance-suggestions" component={SimpleMaintenanceSuggestions} />
        <Route path="/checkin-checkout-workflow" component={CheckInCheckOutWorkflow} />
        <Route path="/daily-operations" component={DailyOperationsDashboard} />
        <Route path="/sandbox-testing" component={SandboxTestingDashboard} />
        
        {/* Communication & Guest Services */}
        <Route path="/guest-portal-smart-requests" component={GuestPortalSmartRequests} />
        <Route path="/guest-activity-recommendations" component={GuestActivityRecommendations} />
        
        {/* Administration */}
        <Route path="/admin/user-management" component={UserManagement} />
        <Route path="/user-management" component={UserManagement} />
        <Route path="/admin/activity-log" component={ActivityLogs} />
        <Route path="/owner-target-upgrade-tracker" component={OwnerTargetUpgradeTracker} />
        <Route path="/auto-scheduling-recurring-task-generator" component={AutoScheduleTaskGenerator} />
        <Route path="/ota-revenue-net-payout-calculation" component={OtaRevenueNetPayoutCalculation} />
        <Route path="/loyalty-guest-tracker" component={LoyaltyGuestTracker} />
        <Route path="/loyalty-tracker" component={LoyaltyGuestTracker} />
        <Route path="/invoice-generator" component={InvoiceGenerator} />
        <Route path="/invoices" component={InvoiceGenerator} />
        <Route path="/staff-advance-salary-overtime-tracker" component={StaffAdvanceSalaryOvertimeTracker} />
        <Route path="/system-wide-demo-integration" component={SystemWideDemoIntegration} />
        <Route path="/maintenance-log-warranty-tracker" component={MaintenanceLogWarrantyTracker} />
        <Route path="/staff-profile-payroll" component={StaffProfilePayroll} />
        <Route path="/admin/system-integrity-check" component={SystemIntegrityCheck} />
        <Route path="/utility-tracker" component={UtilityTracker} />
        <Route path="/ai-notifications-reminders" component={AiNotificationsReminders} />
        <Route path="/finance-engine" component={FinanceEngine} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRoutes />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}