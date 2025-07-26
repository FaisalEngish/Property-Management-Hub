import React, { useState } from "react";
import { Link, useLocation } from "wouter";

// Simple navigation items for the 4-menu structure
const navigationItems = [
  {
    title: "Dashboard",
    items: [
      { name: "Admin Dashboard", href: "/", icon: "🏠" },
      { name: "Financial Dashboard", href: "/filtered-financial-dashboard", icon: "💰" },
      { name: "Property Dashboard", href: "/portfolio-manager-dashboard", icon: "🏢" },
    ]
  },
  {
    title: "Property",
    items: [
      { name: "Properties", href: "/properties-with-tabs", icon: "🏠" },
      { name: "Calendar & Bookings", href: "/bookings", icon: "📅" },
      { name: "Tasks", href: "/tasks", icon: "✓" },
      { name: "Check-in/Check-out", href: "/checkin-checkout-workflow", icon: "🔑" },
    ]
  },
  {
    title: "Finance",
    items: [
      { name: "Revenue & Payouts", href: "/finance-revenue-payouts", icon: "💵" },
      { name: "Invoices & Income", href: "/finance-invoices-income", icon: "📄" },
      { name: "Utility Tracker", href: "/utility-tracker", icon: "⚡" },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/system-settings", icon: "⚙️" },
      { name: "User Management", href: "/user-management", icon: "👥" },
      { name: "Automation", href: "/automation-management", icon: "🤖" },
      { name: "Activity Logs", href: "/admin/activity-log", icon: "📊" },
    ]
  }
];

export default function SimpleSidebar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Dashboard: true,
    Property: true,
    Finance: true,
    System: true,
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (href: string) => {
    return location === href;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">HostPilotPro</h2>
        <p className="text-sm text-gray-500">Property Management</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-4">
          {navigationItems.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span>{section.title}</span>
                <span className="transform transition-transform duration-200">
                  {expandedSections[section.title] ? "▼" : "▶"}
                </span>
              </button>

              {expandedSections[section.title] && (
                <div className="mt-2 space-y-1 pl-4">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive(item.href)
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-gray-500">
          <p>Version 2.0</p>
          <p>Multi-tenant SaaS Platform</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-md shadow-md border text-gray-600 hover:text-gray-900"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}