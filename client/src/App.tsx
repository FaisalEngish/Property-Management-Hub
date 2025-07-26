import React from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Import working components
import SimpleSidebar from "./components/SimpleSidebar";

// Import the working rich tabbed pages
import WorkingPropertiesWithTabs from "./pages/WorkingPropertiesWithTabs";
import WorkingFinanceRevenuePayouts from "./pages/WorkingFinanceRevenuePayouts";
import WorkingSystemSettings from "./pages/WorkingSystemSettings";

// Import other key pages - simplify for now
// import FilteredFinancialDashboard from "./pages/FilteredFinancialDashboard";
// import PortfolioManagerDashboard from "./pages/PortfolioManagerDashboard";

function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleSidebar />
      <div className="lg:pl-80">
        <div className="lg:hidden h-20"></div>
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Simple dashboard component
function SimpleDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to HostPilotPro - Your complete property management solution</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Properties</h3>
          <p className="text-3xl font-bold text-blue-600">4</p>
          <p className="text-sm text-gray-500">Active villa properties</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Bookings</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
          <p className="text-sm text-gray-500">Current reservations</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold text-orange-600">8</p>
          <p className="text-sm text-gray-500">Maintenance & cleaning</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">฿49,400</p>
          <p className="text-sm text-gray-500">This month's income</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Navigation Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-blue-600 mb-2">Dashboard</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Admin Dashboard</li>
              <li>• Financial Dashboard</li>
              <li>• Property Dashboard</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-green-600 mb-2">Property</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Properties (with tabs)</li>
              <li>• Calendar & Bookings</li>
              <li>• Tasks</li>
              <li>• Check-in/Check-out</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-orange-600 mb-2">Finance</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Revenue & Payouts (6 tabs)</li>
              <li>• Invoices & Income (2 tabs)</li>
              <li>• Utility Tracker</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-purple-600 mb-2">System</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Settings (comprehensive tabs)</li>
              <li>• User Management</li>
              <li>• Automation Management</li>
              <li>• Activity Logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple placeholder for other pages
function SimplePage({ title }: { title: string }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">This page is ready for navigation testing</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">
          The {title} page is working. Navigation structure has been successfully reorganized into 4 main menu items.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <MinimalLayout>
          <Switch>
            <Route path="/" component={SimpleDashboard} />
            
            {/* Dashboard routes */}
            <Route path="/filtered-financial-dashboard" component={() => <SimplePage title="Financial Dashboard" />} />
            <Route path="/portfolio-manager-dashboard" component={() => <SimplePage title="Property Dashboard" />} />
            
            {/* Property routes with full tabbed functionality */}
            <Route path="/properties-with-tabs" component={WorkingPropertiesWithTabs} />
            <Route path="/bookings" component={() => <SimplePage title="Calendar & Bookings" />} />
            <Route path="/tasks" component={() => <SimplePage title="Tasks" />} />
            <Route path="/checkin-checkout-workflow" component={() => <SimplePage title="Check-in/Check-out" />} />
            
            {/* Finance routes with full tabbed functionality */}
            <Route path="/finance-revenue-payouts" component={WorkingFinanceRevenuePayouts} />
            <Route path="/finance-invoices-income" component={() => <SimplePage title="Invoices & Income" />} />
            <Route path="/utility-tracker" component={() => <SimplePage title="Utility Tracker" />} />
            
            {/* System routes with full tabbed functionality */}
            <Route path="/system-settings" component={WorkingSystemSettings} />
            <Route path="/user-management" component={() => <SimplePage title="User Management" />} />
            <Route path="/automation-management" component={() => <SimplePage title="Automation Management" />} />
            <Route path="/admin/activity-log" component={() => <SimplePage title="Activity Logs" />} />
            
            <Route component={() => <SimplePage title="Page Not Found" />} />
          </Switch>
        </MinimalLayout>
      </div>
    </QueryClientProvider>
  );
}

export default App;