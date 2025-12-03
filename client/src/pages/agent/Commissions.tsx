import { useQuery } from "@tanstack/react-query";

export default function Commissions() {
  // Fetch commissions from API
  const { data: commissions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/commissions"],
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">My Commissions</h1>
        <div className="animate-pulse space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

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
          {commissions.length === 0 ? (
            <tr className="border-b">
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No commissions found. Commissions will appear here when bookings are made.
              </td>
            </tr>
          ) : (
            commissions.map((commission: any) => (
              <tr key={commission.id} className="border-b">
                <td className="px-4 py-2">{new Date(commission.date || commission.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">{commission.propertyName || commission.villa}</td>
                <td className="px-4 py-2">{commission.guestName || "Guest"}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    commission.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {commission.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-2">฿{(commission.bookingAmount || 0).toLocaleString()}</td>
                <td className="px-4 py-2 font-bold">฿{(commission.commissionAmount || 0).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}