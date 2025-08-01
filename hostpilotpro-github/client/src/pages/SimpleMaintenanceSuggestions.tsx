export default function SimpleMaintenanceSuggestions() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Maintenance Suggestions & Approval</h1>
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pending Suggestions</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-medium">Pool Filter Replacement</h3>
              <p className="text-gray-600">Villa Samui - Recommended based on usage patterns</p>
              <p className="text-sm text-gray-500">Estimated Cost: $150</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-medium">AC Maintenance</h3>
              <p className="text-gray-600">Villa Aruna - Due for quarterly service</p>
              <p className="text-sm text-gray-500">Estimated Cost: $250</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recently Approved</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium">Garden Maintenance</h3>
              <p className="text-gray-600">Villa Paradise - Completed</p>
              <p className="text-sm text-gray-500">Cost: $120</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}