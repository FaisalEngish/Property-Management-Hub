export default function SimpleHelp() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> support@hostpilotpro.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Support Hours:</strong> 9 AM - 6 PM (Monday - Friday)</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <p>• Property Management Guide</p>
            <p>• Booking System Tutorial</p>
            <p>• Financial Reports Help</p>
            <p>• Task Management Overview</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <p className="text-green-600">✓ All systems operational</p>
            <p className="text-green-600">✓ Database connectivity: Good</p>
            <p className="text-green-600">✓ API services: Running</p>
          </div>
        </div>
      </div>
    </div>
  );
}