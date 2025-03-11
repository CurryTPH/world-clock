import WorldClock2 from "../components/WorldClock2";

export default function WorldClock2Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">World Clock 2 - Enhanced Time Zone Comparison</h1>
      <p className="text-gray-300 mb-4">
        An alternative view for comparing times across multiple timezones simultaneously.
      </p>
      <div className="bg-blue-900/20 p-3 mb-6 rounded-lg border border-blue-500/30">
        <p className="text-blue-200">This variant of the World Clock offers the same functionality with a different visual style.</p>
      </div>
      <WorldClock2 />
    </div>
  );
} 