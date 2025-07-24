import { useState } from "react";

export default function Proposals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Client Proposals</h1>
      
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search proposals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="grid gap-4">
        <div className="border rounded p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">Johnson Family - Villa Samui Breeze</h3>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Approved</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">5 nights • Feb 10-15, 2025</p>
          <p className="font-bold">Total: ฿40,000</p>
        </div>

        <div className="border rounded p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">Smith Wedding - Villa Tropical Paradise</h3>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Sent</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">7 nights • Mar 5-12, 2025</p>
          <p className="font-bold">Total: ฿84,000</p>
        </div>

        <div className="border rounded p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">Wilson Group - Villa Ocean View</h3>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Draft</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">3 nights • Feb 20-23, 2025</p>
          <p className="font-bold">Total: ฿19,500</p>
        </div>
      </div>
    </div>
  );
}