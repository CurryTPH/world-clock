"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false in this client component
const WorldClock = dynamic(() => import('./WorldClock'), {
  ssr: false,
  loading: () => <WorldClockLoading />
});

// Loading component for the WorldClock
function WorldClockLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Loading World Clock...</h2>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

export default function WorldClockWrapper() {
  // Add a simple client-side state to ensure this runs as a Client Component
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // If not client-side yet, show loading state
  if (!isClient) {
    return <WorldClockLoading />;
  }
  
  return <WorldClock />;
}
