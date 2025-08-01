export default function Commissions() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Commissions</h1>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Villa</th>
            <th className="px-4 py-2 text-left">Guest</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Booking</th>
            <th className="px-4 py-2 text-left">Commission</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2">20/07/2025</td>
            <td className="px-4 py-2">Villa Sky</td>
            <td className="px-4 py-2">John D.</td>
            <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Paid</span></td>
            <td className="px-4 py-2">฿42,000</td>
            <td className="px-4 py-2 font-bold">฿4,200</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">18/07/2025</td>
            <td className="px-4 py-2">Villa Samui Breeze</td>
            <td className="px-4 py-2">Sarah M.</td>
            <td className="px-4 py-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Pending</span></td>
            <td className="px-4 py-2">฿35,000</td>
            <td className="px-4 py-2 font-bold">฿3,500</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">15/07/2025</td>
            <td className="px-4 py-2">Villa Tropical Paradise</td>
            <td className="px-4 py-2">Mike J.</td>
            <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Paid</span></td>
            <td className="px-4 py-2">฿48,000</td>
            <td className="px-4 py-2 font-bold">฿4,800</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">12/07/2025</td>
            <td className="px-4 py-2">Villa Ocean View</td>
            <td className="px-4 py-2">Lisa T.</td>
            <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Paid</span></td>
            <td className="px-4 py-2">฿28,000</td>
            <td className="px-4 py-2 font-bold">฿2,800</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}