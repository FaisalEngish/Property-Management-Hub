export default function SimpleLiveBookingCalendar() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Live Booking Calendar</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Property Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Villa Samui Breeze</h3>
            <p className="text-green-600">Available: Jan 15-20</p>
            <p className="text-red-600">Booked: Jan 21-28</p>
            <p className="text-yellow-600">Maintenance: Jan 29</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Villa Aruna</h3>
            <p className="text-green-600">Available: Jan 15-25</p>
            <p className="text-red-600">Booked: Jan 26-31</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Villa Paradise</h3>
            <p className="text-green-600">Available: Jan 15-30</p>
            <p className="text-yellow-600">Maintenance: Jan 31</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span>John Smith - Villa Samui</span>
              <span className="text-sm text-gray-600">Jan 21-28, $2,800</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span>Sarah Johnson - Villa Aruna</span>
              <span className="text-sm text-gray-600">Jan 26-31, $2,100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}