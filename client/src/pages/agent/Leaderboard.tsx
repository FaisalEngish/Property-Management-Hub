import { useState } from "react";

export default function Leaderboard() {
  const [periodFilter, setPeriodFilter] = useState("month");

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Agent Leaderboard</h1>
      
      <div className="mb-6">
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="border rounded p-4 bg-yellow-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full font-bold">1</span>
              <div>
                <h3 className="font-semibold">Sarah Wilson</h3>
                <p className="text-sm text-gray-600">Retail Agent</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">฿125,000</p>
              <p className="text-sm text-gray-600">18 bookings</p>
            </div>
          </div>
        </div>

        <div className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="bg-gray-500 text-white px-3 py-1 rounded-full font-bold">2</span>
              <div>
                <h3 className="font-semibold">Mike Chen</h3>
                <p className="text-sm text-gray-600">Referral Agent</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">฿98,000</p>
              <p className="text-sm text-gray-600">14 bookings</p>
            </div>
          </div>
        </div>

        <div className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="bg-gray-500 text-white px-3 py-1 rounded-full font-bold">3</span>
              <div>
                <h3 className="font-semibold">Lisa Thompson</h3>
                <p className="text-sm text-gray-600">Retail Agent</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">฿87,500</p>
              <p className="text-sm text-gray-600">12 bookings</p>
            </div>
          </div>
        </div>

        <div className="border rounded p-4 bg-green-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full font-bold">4</span>
              <div>
                <h3 className="font-semibold">You</h3>
                <p className="text-sm text-gray-600">Current Agent</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">฿45,000</p>
              <p className="text-sm text-gray-600">8 bookings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}