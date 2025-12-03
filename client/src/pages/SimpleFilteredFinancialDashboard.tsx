import { useCurrency } from "@/hooks/useCurrency";

export default function SimpleFilteredFinancialDashboard() {
  const { formatWithConversion } = useCurrency();
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Financial Admin Cockpit</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Airbnb</span>
              <span className="font-medium">{formatWithConversion(0)} (0%)</span>
            </div>
            <div className="flex justify-between">
              <span>VRBO</span>
              <span className="font-medium">{formatWithConversion(0)} (0%)</span>
            </div>
            <div className="flex justify-between">
              <span>Direct Bookings</span>
              <span className="font-medium">{formatWithConversion(0)} (0%)</span>
            </div>
            <div className="flex justify-between">
              <span>Booking.com</span>
              <span className="font-medium">{formatWithConversion(0)} (0%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Commission Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Management (15%)</span>
              <span className="font-medium">{formatWithConversion(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Portfolio Manager (50%)</span>
              <span className="font-medium">{formatWithConversion(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Referral Agent (10%)</span>
              <span className="font-medium">{formatWithConversion(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Retail Agent</span>
              <span className="font-medium">{formatWithConversion(0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>This Month</span>
              <span className="font-medium">$0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Month</span>
              <span className="font-medium">$0</span>
            </div>
            <div className="flex justify-between">
              <span>Growth Rate</span>
              <span className="font-medium">0%</span>
            </div>
            <div className="flex justify-between">
              <span>YTD Total</span>
              <span className="font-medium">$0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Property Financial Performance</h2>
          <div className="space-y-4 text-center text-gray-500 py-8">
            <p>No properties with financial data available</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Maintenance</span>
              <span className="font-medium">$0 (0%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cleaning</span>
              <span className="font-medium">$0 (0%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Utilities</span>
              <span className="font-medium">$0 (0%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Supplies</span>
              <span className="font-medium">$0 (0%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Marketing</span>
              <span className="font-medium">$0 (0%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Other</span>
              <span className="font-medium">$0 (0%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}