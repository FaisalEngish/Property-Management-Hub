export default function SimpleFilteredFinancialDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Enhanced Financial Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Airbnb</span>
              <span className="font-medium">$18,240 (40%)</span>
            </div>
            <div className="flex justify-between">
              <span>VRBO</span>
              <span className="font-medium">$13,620 (30%)</span>
            </div>
            <div className="flex justify-between">
              <span>Direct Bookings</span>
              <span className="font-medium">$9,080 (20%)</span>
            </div>
            <div className="flex justify-between">
              <span>Booking.com</span>
              <span className="font-medium">$4,340 (10%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Commission Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Management (15%)</span>
              <span className="font-medium">$6,792</span>
            </div>
            <div className="flex justify-between">
              <span>Portfolio Manager (50%)</span>
              <span className="font-medium">$3,396</span>
            </div>
            <div className="flex justify-between">
              <span>Referral Agent (10%)</span>
              <span className="font-medium">$679</span>
            </div>
            <div className="flex justify-between">
              <span>Retail Agent</span>
              <span className="font-medium">$340</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>This Month</span>
              <span className="font-medium text-green-600">$45,280</span>
            </div>
            <div className="flex justify-between">
              <span>Last Month</span>
              <span className="font-medium">$40,450</span>
            </div>
            <div className="flex justify-between">
              <span>Growth Rate</span>
              <span className="font-medium text-green-600">+11.9%</span>
            </div>
            <div className="flex justify-between">
              <span>YTD Total</span>
              <span className="font-medium">$485,320</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Property Financial Performance</h2>
          <div className="space-y-4">
            <div className="border rounded p-4">
              <h4 className="font-semibold">Villa Samui Breeze</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <span>Revenue: $18,240</span>
                <span>Expenses: $7,520</span>
                <span>Net: $10,720</span>
                <span>ROI: 58.8%</span>
              </div>
            </div>
            <div className="border rounded p-4">
              <h4 className="font-semibold">Villa Aruna</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <span>Revenue: $15,680</span>
                <span>Expenses: $6,280</span>
                <span>Net: $9,400</span>
                <span>ROI: 59.9%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Maintenance</span>
              <span className="font-medium">$4,750 (25%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cleaning</span>
              <span className="font-medium">$3,800 (20%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Utilities</span>
              <span className="font-medium">$2,850 (15%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Supplies</span>
              <span className="font-medium">$1,900 (10%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Marketing</span>
              <span className="font-medium">$950 (5%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Other</span>
              <span className="font-medium">$4,750 (25%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}