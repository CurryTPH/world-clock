import WorldClock from "./components/WorldClock";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Time Zone Comparison Tool</h1>
      <p className="text-gray-300 mb-4">
        View and compare times across multiple timezones simultaneously. Updated and deployed with Vercel.
      </p>
      <WorldClock />
    </div>
  );
}
