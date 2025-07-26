import React, { useState } from "react";

// Simple working tabbed interface for Finance Revenue & Payouts
export default function WorkingFinanceRevenuePayouts() {
  const [activeTab, setActiveTab] = useState("enhanced-controls");

  const tabs = [
    { id: "enhanced-controls", name: "Enhanced Financial Controls", icon: "💰" },
    { id: "ota-revenue", name: "OTA Revenue & Net Payout", icon: "📊" },
    { id: "smart-revenue", name: "OTA Payout Logic — Smart Revenue", icon: "🧠" },
    { id: "smart-pricing", name: "Smart Pricing & Performance", icon: "📈" },
    { id: "finance-engine", name: "Finance Engine", icon: "⚙️" },
    { id: "commission-booking", name: "Commission & Booking Rules", icon: "🎯" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "enhanced-controls":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-green-600">฿49,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Month</span>
                    <span className="font-semibold">฿45,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">YTD</span>
                    <span className="font-semibold">฿156,800</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-orange-600">฿12,300</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed</span>
                    <span className="font-semibold text-green-600">฿37,100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled</span>
                    <span className="font-semibold text-blue-600">฿8,500</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Tracking</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retail Agent</span>
                    <span className="font-semibold">฿2,470 (5%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referral Agent</span>
                    <span className="font-semibold">฿1,482 (3%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-semibold">฿988 (2%)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enhanced Financial Controls</h3>
              <p className="text-gray-700 mb-4">Advanced financial management and controls for comprehensive revenue tracking and payout management.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Generate Report</button>
                <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Process Payouts</button>
              </div>
            </div>
          </div>
        );
      
      case "ota-revenue":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">OTA Revenue & Net Payout Calculation</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OTA Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Payout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { platform: "Airbnb", gross: "฿18,500", commission: "฿2,220 (12%)", net: "฿16,280", status: "Paid" },
                    { platform: "Booking.com", gross: "฿15,200", commission: "฿2,280 (15%)", net: "฿12,920", status: "Pending" },
                    { platform: "VRBO", gross: "฿12,800", commission: "฿1,280 (10%)", net: "฿11,520", status: "Paid" },
                    { platform: "Agoda", gross: "฿8,900", commission: "฿1,246 (14%)", net: "฿7,654", status: "Processing" }
                  ].map((ota, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ota.platform}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ota.gross}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ota.commission}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{ota.net}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ota.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          ota.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ota.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "smart-revenue":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">OTA Payout Logic — Smart Revenue</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Revenue Optimization Rules</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Dynamic pricing based on demand</li>
                    <li>• Seasonal rate adjustments</li>
                    <li>• Competitor pricing analysis</li>
                    <li>• Occupancy-based optimization</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Smart Payout Logic</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Automated commission calculations</li>
                    <li>• Multi-currency support</li>
                    <li>• Tax compliance integration</li>
                    <li>• Real-time payout tracking</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-700">Smart revenue logic with automated payout calculations and optimization strategies.</p>
            </div>
          </div>
        );
      
      case "smart-pricing":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Pricing & Performance Toolkit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">AI-Powered Pricing</h4>
                <div className="space-y-3">
                  {["Villa Samui Breeze", "Villa Ocean View", "Villa Aruna Demo", "Villa Tropical Paradise"].map((property, index) => (
                    <div key={property} className="border rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{property}</span>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Suggested: ฿{[8400, 6800, 21500, 12800][index]}</p>
                          <p className="text-xs text-green-600">+{[5, 4.6, 7.5, 6.7][index]}% vs current</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average ADR</span>
                    <span className="font-semibold">฿11,675</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RevPAR</span>
                    <span className="font-semibold">฿9,924</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy Rate</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Optimization Score</span>
                    <span className="font-semibold text-green-600">92/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "finance-engine":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Finance Engine</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">190</div>
                  <div className="text-sm text-gray-600">Total Transactions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">฿156,800</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">4</div>
                  <div className="text-sm text-gray-600">Active Properties</div>
                </div>
              </div>
              <p className="text-gray-700">Core financial processing engine with comprehensive transaction management and automated calculations.</p>
            </div>
          </div>
        );
      
      case "commission-booking":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Commission & Booking Rules</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Commission Structure</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retail Agent</span>
                      <span className="font-medium">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referral Agent</span>
                      <span className="font-medium">3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-medium">2%</span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Booking Rules</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Minimum 2-night stay</li>
                    <li>• 24-hour cancellation policy</li>
                    <li>• 50% deposit required</li>
                    <li>• Check-in after 3 PM</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-700">Automated commission calculations and booking rule management for streamlined operations.</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Finance Revenue & Payouts</h1>
        <p className="text-gray-600 mt-2">Comprehensive financial management with 6 specialized tabs</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6 overflow-x-auto">
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