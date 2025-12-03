import React from "react";

export default function UltraSimpleUtilityTracker() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utility Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor utility bills, track usage, and manage property expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            ⚡ Utilities
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border-2 border-gray-200 hover:shadow-lg transition-shadow">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 text-yellow-500">⚡</div>
                <div>
                  <h3 className="text-lg font-semibold">Electricity</h3>
                  <p className="text-sm text-gray-600">Villa Samui Breeze</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Paid
              </span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold">฿3,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="text-sm">2024-02-15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usage:</span>
                <span className="text-sm">425 kWh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 hover:shadow-lg transition-shadow">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 text-blue-500">💧</div>
                <div>
                  <h3 className="text-lg font-semibold">Water</h3>
                  <p className="text-sm text-gray-600">Villa Aruna Paradise</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold">฿890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="text-sm">2024-02-20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usage:</span>
                <span className="text-sm">15 m³</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 hover:shadow-lg transition-shadow">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 text-green-500">🌐</div>
                <div>
                  <h3 className="text-lg font-semibold">Internet</h3>
                  <p className="text-sm text-gray-600">All Properties</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Overdue
              </span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold">฿1,299</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="text-sm">2024-02-01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Speed:</span>
                <span className="text-sm">1000 Mbps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Utility Management Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <strong>Track Bills:</strong> Monitor electricity, water, and internet expenses across all properties
          </div>
          <div>
            <strong>Usage Analytics:</strong> View consumption patterns and optimize utility costs
          </div>
          <div>
            <strong>Payment Tracking:</strong> Keep track of due dates and payment status
          </div>
        </div>
      </div>
    </div>
  );
}