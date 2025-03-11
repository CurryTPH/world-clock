import WorldClock from "./components/WorldClock";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">World Clock - Time Zone Comparison</h1>
      <p className="text-gray-300 mb-4">
        View and compare times across multiple timezones simultaneously. Deployed on Vercel.
      </p>
      <div className="bg-blue-900/20 p-3 mb-6 rounded-lg border border-blue-500/30">
        <p className="text-blue-200">This app lets you track time across different timezones with automatic scrolling to current time.</p>
      </div>
      <WorldClock />
    </div>
  );
}