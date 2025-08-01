import { formatCurrency } from "@/lib/currency";

export default function SimpleFinances() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Financial Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(1630080)}</p>
          <p className="text-xs text-gray-500">+12% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(675000)}</p>
          <p className="text-xs text-gray-500">+5% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(955080)}</p>
          <p className="text-xs text-gray-500">+18% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Payouts</h3>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(321120)}</p>
          <p className="text-xs text-gray-500">3 requests pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <p className="font-medium">Villa Samui - Guest Payment</p>
                <p className="text-sm text-gray-600">Jan 15, 2025</p>
              </div>
              <span className="text-green-600 font-medium">+{formatCurrency(100800)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <p className="font-medium">Maintenance - Villa Aruna</p>
                <p className="text-sm text-gray-600">Jan 14, 2025</p>
              </div>
              <span className="text-red-600 font-medium">-{formatCurrency(16200)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <p className="font-medium">Commission - Agent John</p>
                <p className="text-sm text-gray-600">Jan 13, 2025</p>
              </div>
              <span className="text-red-600 font-medium">-{formatCurrency(10080)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue by Property</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Villa Samui Breeze</span>
              <span className="font-medium">$15,680 (35%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Villa Aruna</span>
              <span className="font-medium">$18,240 (40%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Villa Paradise</span>
              <span className="font-medium">$11,360 (25%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Monthly Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-600">Completed Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">94%</p>
            <p className="text-sm text-gray-600">Occupancy Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">$3,773</p>
            <p className="text-sm text-gray-600">Average Booking Value</p>
          </div>
        </div>
      </div>
    </div>
  );
}