import React, { useState } from "react";

// Simple working tabbed interface for Properties
export default function WorkingPropertiesWithTabs() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", name: "Properties Overview", icon: "🏠" },
    { id: "operations", name: "Daily Operations", icon: "⚡" },
    { id: "appliances", name: "Appliances", icon: "🔧" },
    { id: "maintenance", name: "Maintenance & Warranty", icon: "🛠️" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {["Villa Samui Breeze", "Villa Ocean View", "Villa Aruna Demo", "Villa Tropical Paradise"].map((property, index) => (
                <div key={property} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{property}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📍 Koh Samui, Thailand</p>
                    <p>🛏️ {[3, 2, 4, 3][index]} Bedrooms</p>
                    <p>💰 ฿{[8000, 6500, 20000, 12000][index]} per night</p>
                    <p>📅 85% Occupancy</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700">
                      View Details
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded hover:bg-gray-300">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "operations":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Operations Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-500 text-white p-2 rounded-full mr-3">✓</div>
                  <div>
                    <p className="text-sm text-gray-600">Tasks Completed Today</p>
                    <p className="text-2xl font-bold text-blue-600">12</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-orange-500 text-white p-2 rounded-full mr-3">⏰</div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Tasks</p>
                    <p className="text-2xl font-bold text-orange-600">8</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-500 text-white p-2 rounded-full mr-3">👥</div>
                  <div>
                    <p className="text-sm text-gray-600">Active Staff</p>
                    <p className="text-2xl font-bold text-green-600">6</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-700">Daily operations management with task tracking, staff coordination, and operational insights.</p>
          </div>
        );
      
      case "appliances":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Appliances Management</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appliance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { name: "Air Conditioner (Main)", property: "Villa Samui Breeze", status: "Working", warranty: "2025-06-15" },
                    { name: "Pool Pump", property: "Villa Ocean View", status: "Maintenance", warranty: "2024-12-01" },
                    { name: "Water Heater", property: "Villa Aruna Demo", status: "Working", warranty: "2025-03-22" },
                    { name: "Refrigerator", property: "Villa Tropical Paradise", status: "Working", warranty: "2025-08-10" }
                  ].map((appliance, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appliance.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appliance.property}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          appliance.status === 'Working' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appliance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appliance.warranty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "maintenance":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Log & Warranty Tracker</h3>
            <div className="space-y-4">
              {[
                { task: "Pool cleaning", property: "Villa Samui Breeze", date: "2024-01-25", status: "Completed", cost: "฿800" },
                { task: "AC maintenance", property: "Villa Ocean View", date: "2024-01-24", status: "In Progress", cost: "฿1,200" },
                { task: "Garden maintenance", property: "Villa Aruna Demo", date: "2024-01-23", status: "Scheduled", cost: "฿600" },
                { task: "Plumbing repair", property: "Villa Tropical Paradise", date: "2024-01-22", status: "Completed", cost: "฿950" }
              ].map((maintenance, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{maintenance.task}</h4>
                      <p className="text-sm text-gray-600">{maintenance.property}</p>
                      <p className="text-xs text-gray-500">{maintenance.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        maintenance.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        maintenance.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {maintenance.status}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">{maintenance.cost}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
        <p className="text-gray-600 mt-2">Complete property management with tabs for different aspects</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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