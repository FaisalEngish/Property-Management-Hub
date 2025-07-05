import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UIResetButton } from "@/components/UIResetButton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthSessionManager, useAuth } from "@/lib/auth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import Landing from "@/pages/Landing";
import Help from "@/pages/Help";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Tasks from "@/pages/Tasks";
import StaffTasks from "@/pages/StaffTasks";
import StaffTaskList from "@/pages/StaffTaskList";
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
import GuestPortalSmartRequests from "@/pages/GuestPortalSmartRequests";
import ServiceRequestConfirmation from "@/pages/ServiceRequestConfirmation";
import FinanceEngine from "@/pages/FinanceEngine";
import MaintenanceTaskSystem from "@/pages/MaintenanceTaskSystem";
import MaintenanceUtilitiesRenovationTracker from "@/pages/MaintenanceUtilitiesRenovationTracker";
import MaintenanceServiceTracking from "@/pages/MaintenanceServiceTracking";
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
import SmartInventoryDashboard from "@/pages/SmartInventoryDashboard";
import ServiceMarketplaceDashboard from "@/pages/ServiceMarketplaceDashboard";
import OwnerOnboardingSystem from "@/pages/OwnerOnboardingSystem";
import EnhancedGuestDashboard from "@/pages/EnhancedGuestDashboard";
import GuestCheckoutSurvey from "@/pages/GuestCheckoutSurvey";
import OwnerOnboardingUtilitySettings from "@/pages/OwnerOnboardingUtilitySettings";
import EnhancedAgentBookingDemo from "@/pages/EnhancedAgentBookingDemo";
import SandboxTestingDashboard from "@/pages/SandboxTestingDashboard";
import LocalContactsManagement from "@/pages/LocalContactsManagement";
import GuestActivityRecommendations from "@/pages/GuestActivityRecommendations";
import SystemWideDemoIntegration from "@/pages/SystemWideDemoIntegration";
import SystemIntegrityCheck from "@/pages/SystemIntegrityCheck";
import UserManagementModule from "@/pages/UserManagementModule";
import UserAccessVisibilityControls from "@/pages/UserAccessVisibilityControls";
import AccessDenied from "@/pages/AccessDenied";
import ExtendedUtilitiesManagement from "@/pages/ExtendedUtilitiesManagement";
import PropertyAccess from "@/pages/portfolio/PropertyAccess";
import Documents from "@/pages/portfolio/Documents";
import Maintenance from "@/pages/portfolio/Maintenance";
import ServiceTracker from "@/pages/portfolio/ServiceTracker";
import Invoices from "@/pages/portfolio/Invoices";
import AiNotificationsReminders from "@/pages/AiNotificationsReminders";
import BookingRevenueTransparency from "@/pages/BookingRevenueTransparency";
import WaterUtilityEmergencyTruckRefillLog from "@/pages/WaterUtilityEmergencyTruckRefillLog";
import PropertyGoalsInvestmentPlans from "@/pages/PropertyGoalsInvestmentPlans";
import WaterUtilityEmergencyTracker from "@/pages/WaterUtilityEmergencyTracker";
import OtaRevenueNetPayoutCalculation from "@/pages/OtaRevenueNetPayoutCalculation";
import SmartPricingPerformanceToolkit from "@/pages/SmartPricingPerformanceToolkit";
import OwnerTargetUpgradeTracker from "@/pages/OwnerTargetUpgradeTracker";
import WaterUtilityEnhanced from "@/pages/WaterUtilityEnhanced";
import OtaPayoutLogicSmartRevenue from "@/pages/OtaPayoutLogicSmartRevenue";
import EnhancedAdminDashboard from "@/pages/EnhancedAdminDashboard";
import FixedGuestCheckInTracker from "@/pages/FixedGuestCheckInTracker";
import UserAccessManager from "@/pages/UserAccessManager";
import PropertyVisibilityControl from "@/pages/PropertyVisibilityControl";
import FilteredFinancialDashboard from "@/pages/FilteredFinancialDashboard";
import FilteredPropertyDashboard from "@/pages/FilteredPropertyDashboard";

function Router() {
  const [location, setLocation] = useLocation();
  const { user: currentUser, isLoading, isAuthenticated } = useAuth();

  // Auto-redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && location !== '/login') {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

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
        return EnhancedGuestDashboard;
      default:
        return Dashboard;
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full" />
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/guest-portal" component={GuestPortal} />
        <Route path="/guest-communication-center" component={GuestCommunicationCenter} />
        <Route path="/enhanced-guest-dashboard" component={EnhancedGuestDashboard} />
        <Route path="/" component={LoginPage} />
        <Route component={LoginPage} />
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
            const userRole = currentUser?.role;
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
        <Route path="/staff-task-list" component={StaffTaskList} />
        <Route path="/staff-overhours-tracker" component={StaffOverhoursTracker} />
        <Route path="/staff-clock-overtime" component={StaffClockinOvertime} />
        <Route path="/staff-salary-overtime-tracker" component={StaffSalaryOvertimeTracker} />
        <Route path="/staff-advance-salary-overtime-tracker" component={StaffAdvanceSalaryOvertimeTracker} />
        <Route path="/maintenance-task-system" component={MaintenanceTaskSystem} />
        <Route path="/maintenance-utilities-renovation-tracker" component={MaintenanceUtilitiesRenovationTracker} />
        <Route path="/maintenance-service-tracking" component={MaintenanceServiceTracking} />
        <Route path="/guest-checkin-checkout-tracker" component={GuestCheckInCheckOutTracker} />
        <Route path="/fixed-guest-checkin-tracker" component={FixedGuestCheckInTracker} />
        <Route path="/enhanced-admin-dashboard" component={EnhancedAdminDashboard} />
        <Route path="/filtered-financial-dashboard" component={FilteredFinancialDashboard} />
        <Route path="/filtered-property-dashboard" component={FilteredPropertyDashboard} />
        <Route path="/auto-scheduling-recurring-task-generator" component={AutoSchedulingRecurringTaskGenerator} />
        <Route path="/maintenance-log-warranty-tracker" component={MaintenanceLogWarrantyTracker} />
        <Route path="/smart-inventory-dashboard" component={SmartInventoryDashboard} />
        <Route path="/service-marketplace-dashboard" component={ServiceMarketplaceDashboard} />
        <Route path="/ai-notifications-reminders" component={AiNotificationsReminders} />
        <Route path="/property-goals-investment-plans" component={PropertyGoalsInvestmentPlans} />
        <Route path="/water-utility-emergency-tracker" component={WaterUtilityEmergencyTracker} />
        <Route path="/ota-revenue-net-payout-calculation" component={OtaRevenueNetPayoutCalculation} />
        <Route path="/owner-onboarding-system" component={OwnerOnboardingSystem} />
        <Route path="/owner-onboarding-utility-settings" component={OwnerOnboardingUtilitySettings} />
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
        <Route path="/guest-portal-smart-requests" component={GuestPortalSmartRequests} />
        <Route path="/service-request-confirmation" component={ServiceRequestConfirmation} />
        <Route path="/guest-addon-services" component={GuestAddonServices} />
        <Route path="/enhanced-guest-dashboard" component={EnhancedGuestDashboard} />
        <Route path="/guest-checkout-survey" component={GuestCheckoutSurvey} />
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
        <Route path="/local-contacts-management" component={LocalContactsManagement} />
        <Route path="/villa-aruna-demo" component={VillaArunaDemoWorkflow} />
        <Route path="/pm/dashboard" component={PortfolioManagerDashboard} />
        <Route path="/admin/finance-reset" component={FinanceResetControl} />
        <Route path="/admin/utility-customization" component={UtilityCustomization} />
        <Route path="/admin/activity-log" component={AdminActivityLog} />
        <Route path="/admin/system-integrity-check" component={SystemIntegrityCheck} />
        <Route path="/admin/user-management" component={UserManagementModule} />
        <Route path="/admin/user-access" component={UserAccessVisibilityControls} />
        <Route path="/admin/user-access-manager" component={UserAccessManager} />
        <Route path="/access-denied" component={AccessDenied} />
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
        <Route path="/enhanced-agent-booking-demo" component={EnhancedAgentBookingDemo} />
        <Route path="/sandbox-testing" component={SandboxTestingDashboard} />
        <Route path="/guest-activity-recommendations" component={GuestActivityRecommendations} />
        <Route path="/system-wide-demo-integration" component={SystemWideDemoIntegration} />
        <Route path="/extended-utilities-management" component={ExtendedUtilitiesManagement} />
        <Route path="/water-utility-emergency-truck-refill-log" component={WaterUtilityEmergencyTruckRefillLog} />
        <Route path="/booking-revenue-transparency" component={BookingRevenueTransparency} />
        <Route path="/portfolio/property-access" component={PropertyAccess} />
        <Route path="/portfolio/documents" component={Documents} />
        <Route path="/portfolio/maintenance" component={Maintenance} />
        <Route path="/portfolio/service-tracker" component={ServiceTracker} />
        <Route path="/portfolio/invoices" component={Invoices} />
        <Route path="/help" component={Help} />
        <Route path="/smart-pricing-performance-toolkit" component={SmartPricingPerformanceToolkit} />
        <Route path="/owner-target-upgrade-tracker" component={OwnerTargetUpgradeTracker} />
        <Route path="/water-utility-enhanced" component={WaterUtilityEnhanced} />
        <Route path="/ota-payout-logic-smart-revenue" component={OtaPayoutLogicSmartRevenue} />
        <ProtectedRoute path="/property-visibility-control" component={PropertyVisibilityControl} allowedRoles={['admin']} />
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
