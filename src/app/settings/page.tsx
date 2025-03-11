export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Appearance</h2>
          <p className="mb-4">Customize the look and feel of your World Clock app.</p>
          <div className="p-3 bg-gray-700 rounded">
            <p className="text-gray-300">Settings will be implemented in a future update.</p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Default Timezones</h2>
          <p className="mb-4">Configure which timezones appear by default.</p>
          <div className="p-3 bg-gray-700 rounded">
            <p className="text-gray-300">Settings will be implemented in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 