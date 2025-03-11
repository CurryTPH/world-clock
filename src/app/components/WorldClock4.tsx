"use client";

import React, { useState, useEffect, memo } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { IntegrationsProvider } from '../contexts/IntegrationsContext';
import CalendarEventsPanel from './CalendarEventsPanel';
import CommandCenter from './CommandCenter';
import NotificationCenter from './NotificationCenter';
import IntegrationAnalytics from './IntegrationAnalytics';

// Memoize the TimeDisplay component to prevent unnecessary re-renders
const TimeDisplay = memo(({ timezone, cityName, currentTime }: { 
  timezone: string; 
  cityName: string;
  currentTime: Date;
}) => {
  const zonedTime = toZonedTime(currentTime, timezone);
  const formattedTime = format(zonedTime, 'h:mm:ss a');
  
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-2">{cityName}</h3>
      <p className="text-2xl font-mono">{formattedTime}</p>
    </div>
  );
});

// Add display name to fix ESLint error
TimeDisplay.displayName = 'TimeDisplay';

export default function WorldClock4() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update time every 5 seconds for better performance
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    
    // Clean up the timer when component unmounts
    return () => clearInterval(timer);
  }, []);

  return (
    <IntegrationsProvider>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">World Clock 4 - Enterprise Integration Hub</h1>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Welcome to the Enterprise Integration Hub. This advanced view connects your global time management with your productivity ecosystem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Current Time</h2>
              <div className="grid grid-cols-2 gap-4">
                <TimeDisplay 
                  timezone="America/New_York" 
                  cityName="New York" 
                  currentTime={currentTime} 
                />
                <TimeDisplay 
                  timezone="Europe/London" 
                  cityName="London" 
                  currentTime={currentTime} 
                />
                <TimeDisplay 
                  timezone="Asia/Tokyo" 
                  cityName="Tokyo" 
                  currentTime={currentTime} 
                />
                <TimeDisplay 
                  timezone="Australia/Sydney" 
                  cityName="Sydney" 
                  currentTime={currentTime} 
                />
              </div>
            </div>
            
            <div className="h-[350px]">
              <CalendarEventsPanel />
            </div>
            
            <div className="h-[350px]">
              <IntegrationAnalytics />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="h-[350px]">
              <CommandCenter />
            </div>
            
            <div className="h-[350px]">
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>
    </IntegrationsProvider>
  );
} 