import React, { useState } from "react";

// Simple working tabbed interface for System Settings
export default function WorkingSystemSettings() {
  const [activeTab, setActiveTab] = useState("api-connections");

  const tabs = [
    { id: "api-connections", name: "API Connections", icon: "🔑" },
    { id: "branding", name: "Organization Branding", icon: "🎨" },
    { id: "legal-templates", name: "Legal Templates", icon: "📋" },
    { id: "currency-tax", name: "Currency & Tax", icon: "💰" },
    { id: "property-defaults", name: "Property Defaults", icon: "🏠" },
    { id: "ai-operations", name: "AI Operations", icon: "🧠" },
    { id: "security", name: "Security Settings", icon: "🛡️" },
    { id: "data-integration", name: "Data Integration", icon: "🔗" },
    { id: "owner-goals", name: "Owner Goals", icon: "🎯" },
    { id: "activity-monitoring", name: "Activity Monitoring", icon: "📊" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "api-connections":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "Hostaway", status: "Connected", description: "Property management system integration" },
                { name: "Stripe", status: "Connected", description: "Payment processing and subscriptions" },
                { name: "OpenAI", status: "Configured", description: "AI-powered features and automation" },
                { name: "Twilio", status: "Not Connected", description: "SMS notifications and communication" }
              ].map((api, index) => (
                <div key={api.name} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      api.status === 'Connected' ? 'bg-green-100 text-green-800' :
                      api.status === 'Configured' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {api.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{api.description}</p>
                  <button className="bg-blue-600 text-white text-sm py-2 px-4 rounded hover:bg-blue-700">
                    {api.status === 'Not Connected' ? 'Connect' : 'Configure'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "branding":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Organization Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input type="text" value="MR PROPERTY SIAM" disabled className="w-full p-2 border rounded-md bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-gray-500">Upload logo (recommended: 200x60px)</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <input type="color" value="#2563eb" className="w-16 h-10 border rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domain</label>
                    <input type="text" value="mrpropertysiam.hostpilotpro.com" disabled className="w-full p-2 border rounded-md bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input type="email" value="admin@mrpropertysiam.com" className="w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" value="+66 XX XXX XXXX" className="w-full p-2 border rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "legal-templates":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal Templates Management</h3>
            <div className="space-y-4">
              {[
                { name: "Thai Rental Agreement", status: "Active", lastUpdated: "2024-01-15" },
                { name: "International Guest Terms", status: "Active", lastUpdated: "2024-01-10" },
                { name: "Damage Liability Waiver", status: "Draft", lastUpdated: "2024-01-08" },
                { name: "Privacy Policy (PDPA Compliant)", status: "Active", lastUpdated: "2024-01-05" }
              ].map((template, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">Last updated: {template.lastUpdated}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {template.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "currency-tax":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Currency & Tax Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Currency Settings</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="THB">Thai Baht (฿)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supported Currencies</label>
                  <div className="space-y-2">
                    {["THB", "USD", "EUR", "GBP"].map(currency => (
                      <label key={currency} className="flex items-center">
                        <input type="checkbox" checked={true} className="mr-2" />
                        <span>{currency}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Tax Settings</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
                  <input type="number" value="7" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tourist Tax (per night)</label>
                  <input type="number" value="50" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City Tax</label>
                  <input type="number" value="0" className="w-full p-2 border rounded-md" />
                </div>
              </div>
            </div>
          </div>
        );
      
      case "property-defaults":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Defaults</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Check-in/Check-out</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
                  <input type="time" value="15:00" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Time</label>
                  <input type="time" value="11:00" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stay (nights)</label>
                  <input type="number" value="2" className="w-full p-2 border rounded-md" />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Default Amenities</h4>
                <div className="space-y-2">
                  {["Pool", "Air Conditioning", "WiFi", "Kitchen", "Parking", "Garden"].map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input type="checkbox" checked={true} className="mr-2" />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case "ai-operations":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Operations</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">AI Features Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Smart Pricing</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Task Auto-Assignment</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Anomaly Detection</span>
                      <span className="text-blue-600">Learning</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Guest Communication</span>
                      <span className="text-green-600">Active</span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">AI Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prediction Accuracy</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks Auto-Assigned</span>
                      <span className="font-medium">68/72</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Anomalies Detected</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auto-Responses</span>
                      <span className="font-medium">156</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">AI-powered automation and intelligence for optimized property management operations.</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{tabs.find(t => t.id === activeTab)?.name}</h3>
            <p className="text-gray-700">This section provides comprehensive settings and configuration options for your property management platform.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Comprehensive system configuration with 10 specialized tabs</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
    </div>
  );
}