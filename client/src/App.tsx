import React, { useEffect, lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Sidebar from "./components/Sidebar";
import { useFastAuth } from "./lib/fastAuth";
import { warmCache } from "./lib/sessionCache";
import { CacheProvider } from "./context/CacheContext";
import { SidebarProvider } from "./contexts/SidebarContext";

// Import existing pages with lazy loading for performance
import { LazyDashboard, LazyFinancialDashboard, LazyPropertyDashboard } from "./components/LazyDashboard";
import UltraFastPropertyDashboard from "./pages/UltraFastPropertyDashboard";
import UltraFastTasks from "./pages/UltraFastTasks";
import RoleBasedDashboard from "./components/RoleBasedDashboard";
import Properties from "./pages/Properties";
import Tasks from "./pages/Tasks";
import Bookings from "./pages/Bookings";
import Services from "./pages/Services";
import SimpleFinances from "./pages/SimpleFinances";
import SimpleSettings from "./pages/SimpleSettings";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import Landing from "./pages/Landing";
import NotFound from "./pages/not-found";

import SimpleLiveBookingCalendar from "./pages/SimpleLiveBookingCalendar";
import SimpleMaintenanceSuggestions from "./pages/SimpleMaintenanceSuggestions";
import CheckInCheckOutWorkflow from "./pages/CheckInCheckOutWorkflow";
import GuestCheckInCheckOutTracker from "./pages/GuestCheckInCheckOutTracker";
import DailyOperationsDashboard from "./pages/DailyOperationsDashboard";
import SandboxTestingDashboard from "./pages/SandboxTestingDashboard";
import GuestPortalSmartRequests from "./pages/GuestPortalSmartRequests";
import GuestActivityRecommendations from "./pages/GuestActivityRecommendations";
import SimpleHelp from "./pages/SimpleHelp";
import FastHelp from "./pages/FastHelp";
import HelpCenter from "./pages/HelpCenter";
import UserManagement from "./pages/UserManagement";
import HostawayUserManagement from "./pages/HostawayUserManagement";
import OwnerTargetUpgradeTracker from "./pages/OwnerTargetUpgradeTracker";
import ActivityLogs from "./pages/ActivityLogs";
import ApiConnections from "./pages/admin/ApiConnections";
import OrganizationBranding from "./pages/admin/OrganizationBranding";
import LegalTemplatesManagement from "./pages/admin/LegalTemplatesManagement";
import MarketingPackManagement from "./pages/admin/MarketingPackManagement";
import AiOpsAnomaliesManagement from "./pages/admin/AiOpsAnomaliesManagement";
import AutoScheduleTaskGenerator from "./pages/AutoScheduleTaskGenerator";
import OtaRevenueNetPayoutCalculation from "./pages/OtaRevenueNetPayoutCalculation";
import OtaPayoutLogicSmartRevenue from "./pages/OtaPayoutLogicSmartRevenue";
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
import PropertyEdit from "./pages/PropertyEdit";

import MultiPropertyCalendar from "./pages/MultiPropertyCalendar";
import AdvancedFinancialAnalytics from "./pages/AdvancedFinancialAnalytics";
import AITest from "./pages/AITest";
import AIFeatureDashboard from "./pages/AIFeatureDashboard";
import StaffWalletPettyCash from "./pages/StaffWalletPettyCash";
import StaffCashCollection from "./pages/StaffCashCollection";
import StaffExpenseManagement from "./pages/StaffExpenseManagement";
import StaffDashboard from "./pages/StaffDashboard";
import StaffPermissionManagement from "./pages/StaffPermissionManagement";
import CaptainCortex from "./components/CaptainCortex";
import { InstantPageSwitcher } from "./components/InstantPageSwitcher";

// Import SaaS pages
import SignupRequest from "./pages/public/SignupRequest";
import SaasManagement from "./pages/admin/SaasManagement";

// Import Achievement System
import AchievementsPage from "./pages/AchievementsPage";

// Import Salaries & Wages Management
import SimpleSalariesWages from "./pages/SimpleSalariesWages";

// Import Property Appliances Management
import PropertyAppliancesManagement from "./pages/PropertyAppliancesManagement";
import TaskOverview from "./pages/TaskOverview";
import DailyOperations from "./pages/DailyOperations";
import AlertManagement from "./pages/AlertManagement";
import UpgradedAdminDashboard from "./pages/UpgradedAdminDashboard";
import AutomationManagement from "./pages/AutomationManagement";
import CurrencyTaxManagement from "./pages/CurrencyTaxManagement";
import UpsellRecommendationsManagement from "./pages/UpsellRecommendationsManagement";
import { AIBotPage } from "./pages/AIBotPage";

// Import new agent pages
import QuoteGenerator from "./pages/agent/QuoteGenerator";
import Commissions from "./pages/agent/Commissions";
import Proposals from "./pages/agent/Proposals";
import MediaDownload from "./pages/agent/MediaDownload";
import Leaderboard from "./pages/agent/Leaderboard";
import RetailAgentHub from "./pages/agent/RetailAgentHub";

// Import new hub pages
import DashboardHub from "./pages/DashboardHub";
import PropertyHub from "./pages/PropertyHub";
import OptimizedPropertyHub from "./pages/OptimizedPropertyHub";
import FinanceHub from "./pages/FinanceHub";
import SystemHub from "./pages/SystemHub";
import ConsolidatedSystemHub from "./pages/ConsolidatedSystemHub";
import OptimizedFinanceHub from "./pages/OptimizedFinanceHub";
import OptimizedSystemHub from "./pages/OptimizedSystemHub";

// Import agent dashboards
import RetailAgentBooking from "./pages/RetailAgentBooking";
import ReferralAgentDashboard from "./pages/ReferralAgentDashboard";

// Import additional settings page
import AdditionalSettings from "./pages/AdditionalSettings";

// Import missing components for 404 fixes
import SmartPricingPerformanceToolkit from "./pages/SmartPricingPerformanceToolkit";
import OwnerInvoicingPayouts from "./pages/OwnerInvoicingPayouts";
import PortfolioManagerDashboard from "./pages/PortfolioManagerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import GuestPortal from "./pages/GuestPortal";
import PropertySettingsModule from "./pages/PropertySettingsModule";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import DocumentCenter from "./pages/DocumentCenter";
import PropertyDocumentCenter from "./pages/PropertyDocumentCenter";
import PropertyDocumentUpload from "./pages/PropertyDocumentUpload";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import AutomationAlerts from "./pages/AutomationAlerts";

// QueryClient is now imported from lib/queryClient for better performance

function AppRoutes() {
  const { user, isLoading } = useFastAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-blue-700">Loading HostPilotPro...</div>
        </div>
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <Switch>
        <Route path="/" component={RoleBasedDashboard} />
        <Route path="/properties" component={Properties} />
        <Route path="/property/:id/edit" component={PropertyEdit} />
        <Route path="/property/:id" component={PropertyDetailView} />
        <Route path="/tasks" component={UltraFastTasks} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/services" component={Services} />
        <Route path="/finances" component={SimpleFinances} />
        <Route path="/advanced-analytics" component={AdvancedFinancialAnalytics} />
        <Route path="/settings" component={SimpleSettings} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/help" component={FastHelp} />
        
        {/* Hub Pages */}
        <Route path="/dashboard-hub" component={DashboardHub} />
        <Route path="/property-hub" component={PropertyHub} />
        <Route path="/finance-hub" component={FinanceHub} />
        <Route path="/enhanced-finances">
          {() => {
            const EnhancedFinances = lazy(() => import("./pages/EnhancedFinances"));
            return (
              <Suspense fallback={<div>Loading Enhanced Finance Analytics...</div>}>
                <EnhancedFinances />
              </Suspense>
            );
          }}
        </Route>
        {/* Admin Finance */}
        <Route path="/admin/finance" component={lazy(() => import("./pages/AdminFinance"))} />
        
        <Route path="/system-hub" component={ConsolidatedSystemHub} />
        <Route path="/system-hub-old" component={SystemHub} />
        
        {/* Enhanced Dashboards */}
        <Route path="/enhanced-admin-dashboard" component={EnhancedAdminDashboard} />
        <Route path="/simple-filtered-financial-dashboard" component={LazyFinancialDashboard} />
        <Route path="/filtered-property-dashboard" component={UltraFastPropertyDashboard} />
        
        {/* Core Management */}
        <Route path="/multi-property-calendar" component={MultiPropertyCalendar} />
        <Route path="/maintenance-suggestions" component={SimpleMaintenanceSuggestions} />
        <Route path="/checkin-checkout-workflow" component={CheckInCheckOutWorkflow} />
        <Route path="/daily-operations" component={DailyOperationsDashboard} />
        <Route path="/task-overview" component={TaskOverview} />
        <Route path="/daily-operations-overview" component={DailyOperations} />
        <Route path="/sandbox-testing" component={SandboxTestingDashboard} />
        
        {/* Communication & Guest Services */}
        <Route path="/guest-portal-smart-requests" component={GuestPortalSmartRequests} />
        <Route path="/guest-activity-recommendations" component={GuestActivityRecommendations} />
        <Route path="/upsell-recommendations-management" component={UpsellRecommendationsManagement} />
        
        {/* Administration */}
        <Route path="/admin/api-connections" component={ApiConnections} />
        <Route path="/admin/organization-branding" component={OrganizationBranding} />
        <Route path="/admin/legal-templates" component={LegalTemplatesManagement} />
        <Route path="/admin/marketing-pack-management" component={MarketingPackManagement} />
        <Route path="/admin/ai-ops-anomalies" component={AiOpsAnomaliesManagement} />
        <Route path="/admin/user-management" component={UserManagement} />
        <Route path="/user-management" component={HostawayUserManagement} />
        <Route path="/user-management/edit" component={HostawayUserManagement} />
        <Route path="/legacy-user-management" component={UserManagement} />
        <Route path="/admin/activity-log" component={ActivityLogs} />
        <Route path="/owner-target-upgrade-tracker" component={OwnerTargetUpgradeTracker} />
        <Route path="/auto-scheduling-recurring-task-generator" component={AutoScheduleTaskGenerator} />
        <Route path="/ota-revenue-net-payout-calculation" component={OtaRevenueNetPayoutCalculation} />
        <Route path="/ota-payout-logic-smart-revenue" component={OtaPayoutLogicSmartRevenue} />
        <Route path="/loyalty-guest-tracker" component={LoyaltyGuestTracker} />
        <Route path="/loyalty-tracker" component={LoyaltyGuestTracker} />
        <Route path="/invoice-generator" component={InvoiceGenerator} />
        <Route path="/invoices" component={InvoiceGenerator} />
        <Route path="/staff-advance-salary-overtime-tracker" component={StaffAdvanceSalaryOvertimeTracker} />
        <Route path="/staff-wallet-petty-cash" component={StaffWalletPettyCash} />
        <Route path="/staff-cash-collection" component={StaffCashCollection} />
        <Route path="/staff-expense-management" component={StaffExpenseManagement} />
        <Route path="/admin/staff-permission-management" component={StaffPermissionManagement} />
        <Route path="/system-wide-demo-integration" component={SystemWideDemoIntegration} />
        <Route path="/maintenance-log-warranty-tracker" component={MaintenanceLogWarrantyTracker} />
        <Route path="/staff-profile-payroll" component={StaffProfilePayroll} />
        <Route path="/admin/system-integrity-check" component={SystemIntegrityCheck} />
        <Route path="/utility-tracker" component={UtilityTracker} />
        <Route path="/ai-notifications-reminders" component={AiNotificationsReminders} />
        <Route path="/finance-engine" component={FinanceEngine} />
        
        {/* Property Management */}
        <Route path="/property-appliances-management" component={PropertyAppliancesManagement} />
        <Route path="/alert-management" component={AlertManagement} />
        <Route path="/automation-management" component={AutomationManagement} />
        <Route path="/currency-tax-management" component={CurrencyTaxManagement} />
        
        {/* Document Management */}
        <Route path="/document-center" component={DocumentCenter} />
        <Route path="/property-document-center" component={PropertyDocumentCenter} />
        <Route path="/property-documents-management" component={PropertyDocumentCenter} />
        <Route path="/property-document-upload" component={PropertyDocumentUpload} />
        
        {/* AI Testing */}
        <Route path="/ai-test" component={AITest} />
        <Route path="/ai-features" component={AIFeatureDashboard} />
        
        {/* Agent Dashboards */}
        <Route path="/retail-agent" component={RetailAgentBooking} />
        <Route path="/referral-agent" component={ReferralAgentDashboard} />
        
        {/* Agent Pages */}
        <Route path="/agent/hub" component={RetailAgentHub} />
        <Route path="/agent/quote-generator" component={QuoteGenerator} />
        <Route path="/agent/commissions" component={Commissions} />
        <Route path="/agent/proposals" component={Proposals} />
        <Route path="/agent/media-download" component={MediaDownload} />
        <Route path="/agent/leaderboard" component={Leaderboard} />
        
        {/* SaaS Framework Routes */}
        <Route path="/signup-request" component={SignupRequest} />
        <Route path="/admin/saas-management" component={SaasManagement} />
        
        {/* Settings & Help */}
        <Route path="/simple-settings" component={SimpleSettings} />
        <Route path="/help" component={HelpCenter} />
        <Route path="/simple-help" component={SimpleHelp} />
        <Route path="/fast-help" component={FastHelp} />
        
        {/* Additional Settings */}
        <Route path="/admin/additional-settings" component={AdditionalSettings} />
        
        {/* Upgraded Admin Dashboard */}
        <Route path="/admin/upgraded-dashboard" component={UpgradedAdminDashboard} />
        
        {/* Missing Routes - Fix 404 Errors */}
        <Route path="/smart-pricing-performance-toolkit" component={SmartPricingPerformanceToolkit} />
        <Route path="/smart-pricing" component={SmartPricingPerformanceToolkit} />
        <Route path="/owner-invoicing-payouts" component={OwnerInvoicingPayouts} />
        <Route path="/owner-invoicing" component={OwnerInvoicingPayouts} />
        <Route path="/portfolio-manager-dashboard" component={PortfolioManagerDashboard} />
        <Route path="/owner-dashboard" component={OwnerDashboard} />
        
        {/* Additional Missing Routes - Second Batch */}
        <Route path="/guest-services" component={GuestPortal} />
        <Route path="/guest-portal" component={GuestPortal} />
        <Route path="/property-settings" component={PropertySettingsModule} />
        <Route path="/property-settings-module" component={PropertySettingsModule} />
        <Route path="/staff-operations" component={StaffDashboard} />
        <Route path="/staff-dashboard" component={StaffDashboard} />
        <Route path="/check-in-check-out" component={CheckInCheckOutWorkflow} />
        <Route path="/checkin-checkout" component={CheckInCheckOutWorkflow} />
        <Route path="/guest-checkin-checkout-tracker" component={GuestCheckInCheckOutTracker} />
        <Route path="/guest-check-in-check-out" component={GuestCheckInCheckOutTracker} />
        <Route path="/activity-logs" component={ActivityLogs} />
        <Route path="/daily-operations" component={DailyOperationsDashboard} />
        <Route path="/ai-bot" component={AIBotPage} />
        
        {/* Achievement System */}
        <Route path="/achievements" component={AchievementsPage} />
        
        {/* Salaries & Wages Management */}
        <Route path="/salaries-wages" component={SimpleSalariesWages} />
        <Route path="/staff-salaries" component={SimpleSalariesWages} />
        <Route path="/admin/salaries-wages" component={SimpleSalariesWages} />
        
        {/* Reports & Analytics */}
        <Route path="/reports" component={ReportsAnalytics} />
        <Route path="/reports-analytics" component={ReportsAnalytics} />
        
        {/* Automation & Alerts */}
        <Route path="/automation" component={AutomationAlerts} />
        <Route path="/automation-alerts" component={AutomationAlerts} />
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default function App() {
  // Initialize cache warming on app startup
  useEffect(() => {
    warmCache();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CacheProvider>
        <SidebarProvider>
          <TooltipProvider>
            <InstantPageSwitcher />
            <AppRoutes />
            {/* <CaptainCortex /> */}
            <Toaster />
          </TooltipProvider>
        </SidebarProvider>
      </CacheProvider>
    </QueryClientProvider>
  );
}