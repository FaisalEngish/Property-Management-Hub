import React from "react";

export default function Leaderboard() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-6">Top Agent Board</h1>
      
      {/* Last Month's Winner */}
      <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded">
        <h2 className="text-lg font-bold mb-2">🏆 Last Month's Winner</h2>
        <p className="text-lg"><strong>Anna K.</strong> - Retail Agent - ฿125,000 - 🎉 Weekend getaway prize</p>
      </div>

      {/* Retail Agents */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">Retail Agents - This Month</h2>
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Agent</th>
              <th className="px-4 py-2 text-left">Bookings</th>
              <th className="px-4 py-2 text-left">Earnings</th>
              <th className="px-4 py-2 text-left">Bonus</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2 font-bold">1</td>
              <td className="px-4 py-2">Ploy</td>
              <td className="px-4 py-2">12</td>
              <td className="px-4 py-2 font-bold">฿89,000</td>
              <td className="px-4 py-2">🎉 Dinner voucher</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-bold">2</td>
              <td className="px-4 py-2">Sarah</td>
              <td className="px-4 py-2">8</td>
              <td className="px-4 py-2 font-bold">฿65,000</td>
              <td className="px-4 py-2">🎉 Spa day</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-bold">3</td>
              <td className="px-4 py-2">Lisa</td>
              <td className="px-4 py-2">6</td>
              <td className="px-4 py-2 font-bold">฿42,000</td>
              <td className="px-4 py-2">🎉 Gift card</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Referral Agents */}
      <div>
        <h2 className="text-lg font-bold mb-3">Referral Agents - This Month</h2>
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Agent</th>
              <th className="px-4 py-2 text-left">Referrals</th>
              <th className="px-4 py-2 text-left">Earnings</th>
              <th className="px-4 py-2 text-left">Bonus</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2 font-bold">1</td>
              <td className="px-4 py-2">George</td>
              <td className="px-4 py-2">9</td>
              <td className="px-4 py-2 font-bold">฿54,000</td>
              <td className="px-4 py-2">🎉 2-night stay</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-bold">2</td>
              <td className="px-4 py-2">Mike</td>
              <td className="px-4 py-2">7</td>
              <td className="px-4 py-2 font-bold">฿38,000</td>
              <td className="px-4 py-2">🎉 Cash bonus</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-bold">3</td>
              <td className="px-4 py-2">Tom</td>
              <td className="px-4 py-2">5</td>
              <td className="px-4 py-2 font-bold">฿31,000</td>
              <td className="px-4 py-2">🎉 Restaurant voucher</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}