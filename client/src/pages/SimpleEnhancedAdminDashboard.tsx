import { formatCurrency } from "@/lib/currency";

export default function SimpleEnhancedAdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Enhanced Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Property Overview</h2>
          <p>Total Properties: 3</p>
          <p>Active Bookings: 2</p>
          <p>Maintenance Tasks: 5</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
          <p>Monthly Revenue: <strong>{formatCurrency(450000)}</strong></p>
          <p>Pending Payouts: <strong>{formatCurrency(115200)}</strong></p>
          <p>Commission Earned: <strong>{formatCurrency(67500)}</strong></p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p>New Booking: <strong>Villa Samui</strong></p>
          <p>Maintenance Complete: <strong>Pool Cleaning</strong></p>
          <p>Payout Requested: <strong>{formatCurrency(90000)}</strong></p>
        </div>
      </div>
    </div>
  );
}