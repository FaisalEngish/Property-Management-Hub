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
          <p>Monthly Revenue: $12,500</p>
          <p>Pending Payouts: $3,200</p>
          <p>Commission Earned: $1,875</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p>New Booking: Villa Samui</p>
          <p>Maintenance Complete: Pool Cleaning</p>
          <p>Payout Requested: $2,500</p>
        </div>
      </div>
    </div>
  );
}