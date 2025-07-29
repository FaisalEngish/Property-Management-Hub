export default function SimpleSettings() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Default Currency</label>
              <span className="text-sm text-gray-600">THB (Thai Baht)</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Time Zone</label>
              <span className="text-sm text-gray-600">Asia/Bangkok</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Language</label>
              <span className="text-sm text-gray-600">English</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Commission Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Management Commission</label>
              <span className="text-sm text-gray-600">15%</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Portfolio Manager Commission</label>
              <span className="text-sm text-gray-600">50%</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Referral Agent Commission</label>
              <span className="text-sm text-gray-600">10%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email Notifications</label>
              <span className="text-sm text-green-600">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">SMS Notifications</label>
              <span className="text-sm text-yellow-600">Limited</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Push Notifications</label>
              <span className="text-sm text-green-600">Enabled</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Integration Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Hostaway API</label>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Stripe Payments</label>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email Service</label>
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">MR Pilot AI Bot</label>
              <span className="text-sm text-green-600">Available</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Access AI Assistant</div>
                <div className="text-xs text-gray-500">Get answers about your property data</div>
              </div>
              <a 
                href="/ai-bot" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                Open AI Chat
              </a>
            </div>
            <div className="text-xs text-gray-500">
              💡 Tip: You can also access Captain Cortex using the floating button at the bottom right corner of any page
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}