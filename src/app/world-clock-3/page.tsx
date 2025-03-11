import WorldClock3 from "../components/WorldClock3";

export default function WorldClock3Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">World Clock 3 - Advanced Time Zone Comparison</h1>
      <p className="text-gray-300 mb-4">
        An enhanced view for comparing times across multiple timezones with additional features.
      </p>
      <div className="bg-blue-900/20 p-3 mb-6 rounded-lg border border-blue-500/30">
        <p className="text-blue-200">This variant offers the same core functionality with advanced scheduling capabilities.</p>
      </div>
      <WorldClock3 />
    </div>
  );
} 