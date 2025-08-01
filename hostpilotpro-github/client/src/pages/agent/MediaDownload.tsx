import { useState } from "react";

import OptimizedMediaDownload from "./OptimizedMediaDownload";

export default function MediaDownload() {
  return <OptimizedMediaDownload />;
}

function OriginalMediaDownload() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Media Library</h1>
      
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search media..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Properties</option>
          <option value="villa-samui-breeze">Villa Samui Breeze</option>
          <option value="villa-tropical-paradise">Villa Tropical Paradise</option>
          <option value="villa-ocean-view">Villa Ocean View</option>
          <option value="villa-aruna">Villa Aruna</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
            <span className="text-gray-500">Photo 1</span>
          </div>
          <h3 className="font-semibold">Villa Samui Breeze - Pool View</h3>
          <p className="text-sm text-gray-600">High Resolution • 4MB</p>
          <button className="w-full mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Download
          </button>
        </div>

        <div className="border rounded p-4">
          <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
            <span className="text-gray-500">Video 1</span>
          </div>
          <h3 className="font-semibold">Villa Tropical Paradise - Tour</h3>
          <p className="text-sm text-gray-600">1080p Video • 45MB</p>
          <button className="w-full mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Download
          </button>
        </div>

        <div className="border rounded p-4">
          <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
            <span className="text-gray-500">Photo 2</span>
          </div>
          <h3 className="font-semibold">Villa Ocean View - Sunset</h3>
          <p className="text-sm text-gray-600">High Resolution • 3.2MB</p>
          <button className="w-full mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}