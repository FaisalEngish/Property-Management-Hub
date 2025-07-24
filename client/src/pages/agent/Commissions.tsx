export default function Commissions() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Commission Tracking</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-semibold">This Month</h3>
          <p className="text-2xl font-bold">฿45,000</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold">Pending</h3>
          <p className="text-2xl font-bold">฿12,000</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-semibold">Year to Date</h3>
          <p className="text-2xl font-bold">฿180,000</p>
        </div>
      </div>
      <div className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Commissions</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Villa Samui Breeze - John Smith</p>
              <p className="text-sm text-gray-600">Jan 28 - Feb 2 (5 nights)</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">฿4,000</p>
              <p className="text-sm text-gray-600">Paid</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Villa Tropical Paradise - Mike Johnson</p>
              <p className="text-sm text-gray-600">Feb 5 - Feb 8 (3 nights)</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-yellow-600">฿3,600</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}