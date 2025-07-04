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
import Layout from "@/components/Layout";
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
import InventoryWelcomePackTracker from "@/pages/InventoryWelcomePackTracker";
import FinancialToolkit from "@/pages/FinancialToolkit";
import UtilityTracking from "@/pages/UtilityTracking";
import RetailAgentBooking from "@/pages/RetailAgentBooking";
import RetailAgentDashboard from "@/pages/RetailAgentDashboard";
import ReferralAgentDashboard from "@/pages/ReferralAgentDashboard";
import StaffDashboard from "@/pages/StaffDashboard";
import AiFeedbackMonitor from "@/pages/AiFeedbackMonitor";
import GuestPortalAiFeedbackDashboard from "@/pages/GuestPortalAiFeedbackDashboard";
import GuestAddonServices from "@/pages/GuestAddonServices";
import RecurringServicesBilling from "@/pages/RecurringServicesBilling";
import PropertyMediaLibrary from "@/pages/PropertyMediaLibrary";
import MediaLibrary from "@/pages/MediaLibrary";
import GuestAddonBooking from "@/pages/GuestAddonBooking";
import AdminAddonBookings from "@/pages/AdminAddonBookings";
import AdminAddonSettings from "@/pages/AdminAddonSettings";
import AddonServicesBooking from "@/pages/AddonServicesBooking";
import OwnerDashboard from "@/pages/OwnerDashboard";
import PortfolioManagerDashboard from "@/pages/PortfolioManagerDashboard";
import FinanceResetControl from "@/pages/FinanceResetControl";
import UtilityCustomization from "@/pages/UtilityCustomization";
import InvoiceGenerator from "@/pages/InvoiceGenerator";
import UtilityTracker from "@/pages/UtilityTracker";
import EnhancedUtilityTracker from "@/pages/EnhancedUtilityTracker";
import PropertyUtilitiesMaintenanceTracker from "@/pages/PropertyUtilitiesMaintenanceTracker";
import AgentCommissionDashboard from "@/pages/AgentCommissionDashboard";
import LoyaltyGuestTracker from "@/pages/LoyaltyGuestTracker";
import LiveBookingCalendar from "@/pages/LiveBookingCalendar";
import RetailAgentBookingEngine from "@/pages/RetailAgentBookingEngine";
import GuestPortal from "@/pages/GuestPortal";
import GuestPortalMessaging from "@/pages/GuestPortalMessaging";
import FinanceEngine from "@/pages/FinanceEngine";
import MaintenanceTaskSystem from "@/pages/MaintenanceTaskSystem";
import MaintenanceUtilitiesRenovationTracker from "@/pages/MaintenanceUtilitiesRenovationTracker";
import TaskAttachmentsNotes from "@/pages/TaskAttachmentsNotes";
import TaskChecklistProofSystem from "@/pages/TaskChecklistProofSystem";
import TaskCompletionPhotoProof from "@/pages/TaskCompletionPhotoProof";
import BookingIncomeRules from "@/pages/BookingIncomeRules";
import AiTaskManager from "@/pages/AiTaskManager";
import OwnerBalanceManagement from "@/pages/OwnerBalanceManagement";
import StaffOverhoursTracker from "@/pages/StaffOverhoursTracker";
import StaffClockinOvertime from "@/pages/StaffClockinOvertime";
import MaintenanceSuggestionsApproval from "@/pages/MaintenanceSuggestionsApproval";
import StaffSalaryOvertimeTracker from "@/pages/StaffSalaryOvertimeTracker";
import StaffAdvanceSalaryOvertimeTracker from "@/pages/StaffAdvanceSalaryOvertimeTracker";
import GuestCommunicationCenter from "@/pages/GuestCommunicationCenter";
import StaffProfilePayrollLogging from "@/pages/StaffProfilePayrollLogging";
import OwnerInvoicingPayouts from "@/pages/OwnerInvoicingPayouts";
import AdminActivityLog from "@/pages/AdminActivityLog";
import DocumentCenter from "@/pages/DocumentCenter";
import PropertyAccessManagement from "@/pages/PropertyAccessManagement";
import DailyOperationsDashboard from "@/pages/DailyOperationsDashboard";
import VillaSamuiDemo from "@/pages/VillaSamuiDemo";
import CheckInCheckOutWorkflow from "@/pages/CheckInCheckOutWorkflow";
import PropertyDetailView from "@/pages/PropertyDetailView";
import OwnerOnboardingWizard from "@/pages/OwnerOnboardingWizard";
import PropertyDocumentUpload from "@/pages/PropertyDocumentUpload";
import OwnerPropertySettings from "@/pages/OwnerPropertySettings";
import OwnerMaintenanceModule from "@/pages/OwnerMaintenanceModule";
import OwnerTaskHistory from "@/pages/OwnerTaskHistory";
import PropertyOnboardingSteps from "@/pages/PropertyOnboardingSteps";
import PropertyDocumentCenter from "@/pages/PropertyDocumentCenter";
import PropertySettingsModule from "@/pages/PropertySettingsModule";
import PropertyTaskHistoryTimeline from "@/pages/PropertyTaskHistoryTimeline";
import VillaArunaDemoWorkflow from "@/pages/VillaArunaDemoWorkflow";
import EnhancedFinancialControls from "@/pages/EnhancedFinancialControls";
import GuestCheckInCheckOutTracker from "@/pages/GuestCheckInCheckOutTracker";
import AutoSchedulingRecurringTaskGenerator from "@/pages/AutoSchedulingRecurringTaskGenerator";
import MaintenanceLogWarrantyTracker from "@/pages/MaintenanceLogWarrantyTracker";

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
        return RetailAgentDashboard;
      case 'referral-agent':
        return ReferralAgentDashboard;
      case 'guest':
        return GuestAddonServices;
      default:
        return Dashboard;
    }
  };

  // Render public routes without layout
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/guest-portal" component={GuestPortal} />
        <Route path="/guest-communication-center" component={GuestCommunicationCenter} />
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Render authenticated routes with layout
  return (
    <Layout>
      <Switch>
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
        <Route path="/staff-overhours-tracker" component={StaffOverhoursTracker} />
        <Route path="/staff-clock-overtime" component={StaffClockinOvertime} />
        <Route path="/staff-salary-overtime-tracker" component={StaffSalaryOvertimeTracker} />
        <Route path="/staff-advance-salary-overtime-tracker" component={StaffAdvanceSalaryOvertimeTracker} />
        <Route path="/maintenance-task-system" component={MaintenanceTaskSystem} />
        <Route path="/maintenance-utilities-renovation-tracker" component={MaintenanceUtilitiesRenovationTracker} />
        <Route path="/guest-checkin-checkout-tracker" component={GuestCheckInCheckOutTracker} />
        <Route path="/auto-scheduling-recurring-task-generator" component={AutoSchedulingRecurringTaskGenerator} />
        <Route path="/maintenance-log-warranty-tracker" component={MaintenanceLogWarrantyTracker} />
        <Route path="/task-attachments-notes" component={TaskAttachmentsNotes} />
        <Route path="/ai-task-manager" component={AiTaskManager} />
        <Route path="/task-checklist-proof" component={TaskChecklistProofSystem} />
        <Route path="/task-completion-photo-proof" component={TaskCompletionPhotoProof} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/services" component={Services} />
        <Route path="/welcome-packs" component={WelcomePacks} />
        <Route path="/inventory-dashboard" component={InventoryDashboard} />
        <Route path="/inventory-welcome-pack-tracker" component={InventoryWelcomePackTracker} />
        <Route path="/finances" component={Finances} />
        <Route path="/payouts" component={Payouts} />
        <Route path="/financial-toolkit" component={FinancialToolkit} />
        <Route path="/enhanced-financial-controls" component={EnhancedFinancialControls} />
        <Route path="/invoice-generator" component={InvoiceGenerator} />
        <Route path="/utility-tracker" component={EnhancedUtilityTracker} />
        <Route path="/utility-tracking" component={UtilityTracking} />
        <Route path="/property-utilities-maintenance" component={PropertyUtilitiesMaintenanceTracker} />
        <Route path="/ai-feedback" component={AiFeedbackMonitor} />
        <Route path="/guest-portal-messaging" component={GuestPortalMessaging} />
        <Route path="/guest-communication-center" component={GuestCommunicationCenter} />
        <Route path="/guest-portal-ai-feedback" component={GuestPortalAiFeedbackDashboard} />
        <Route path="/guest-addon-services" component={GuestAddonServices} />
        <Route path="/recurring-services" component={RecurringServicesBilling} />
        <Route path="/referral-agent" component={ReferralAgentDashboard} />
        <Route path="/retail-booking" component={RetailAgentBooking} />
        <Route path="/agent-commission" component={AgentCommissionDashboard} />
        <Route path="/staff" component={StaffDashboard} />
        <Route path="/agent-media-library" component={PropertyMediaLibrary} />
        <Route path="/media-library" component={MediaLibrary} />
        <Route path="/guest/add-ons" component={GuestAddonBooking} />
        <Route path="/admin/add-ons-bookings" component={AdminAddonBookings} />
        <Route path="/admin/add-ons-settings" component={AdminAddonSettings} />
        <Route path="/addon-services-booking" component={AddonServicesBooking} />
        <Route path="/owner/dashboard" component={OwnerDashboard} />
        <Route path="/owner/balance-management" component={OwnerBalanceManagement} />
        <Route path="/owner-invoicing-payouts" component={OwnerInvoicingPayouts} />
        <Route path="/owner/onboarding" component={OwnerOnboardingWizard} />
        <Route path="/owner/documents" component={PropertyDocumentUpload} />
        <Route path="/owner/property-settings" component={OwnerPropertySettings} />
        <Route path="/owner/maintenance" component={OwnerMaintenanceModule} />
        <Route path="/owner/task-history" component={OwnerTaskHistory} />
        <Route path="/property-onboarding-steps" component={PropertyOnboardingSteps} />
        <Route path="/property-document-center" component={PropertyDocumentCenter} />
        <Route path="/property-settings-module" component={PropertySettingsModule} />
        <Route path="/property-task-history-timeline" component={PropertyTaskHistoryTimeline} />
        <Route path="/villa-aruna-demo" component={VillaArunaDemoWorkflow} />
        <Route path="/pm/dashboard" component={PortfolioManagerDashboard} />
        <Route path="/admin/finance-reset" component={FinanceResetControl} />
        <Route path="/admin/utility-customization" component={UtilityCustomization} />
        <Route path="/admin/activity-log" component={AdminActivityLog} />
        <Route path="/document-center" component={DocumentCenter} />
        <Route path="/property-access" component={PropertyAccessManagement} />
        <Route path="/property/:id" component={PropertyDetailView} />
        <Route path="/checkin-checkout-workflow" component={CheckInCheckOutWorkflow} />
        <Route path="/daily-operations" component={DailyOperationsDashboard} />
        <Route path="/staff-profile-payroll" component={StaffProfilePayrollLogging} />
        <Route path="/loyalty-tracker" component={LoyaltyGuestTracker} />
        <Route path="/hostaway" component={Hostaway} />
        <Route path="/booking-calendar" component={LiveBookingCalendar} />
        <Route path="/retail-agent-booking" component={RetailAgentBookingEngine} />
        <Route path="/finance-engine" component={FinanceEngine} />
        <Route path="/booking-income-rules" component={BookingIncomeRules} />
        <Route path="/maintenance-suggestions" component={MaintenanceSuggestionsApproval} />
        <Route path="/staff-advance-salary-overtime-tracker" component={StaffAdvanceSalaryOvertimeTracker} />
        <Route path="/settings" component={Settings} />
        <Route path="/villa-samui-demo" component={VillaSamuiDemo} />
        <Route component={NotFound} />
        </Switch>
      </Layout>
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
