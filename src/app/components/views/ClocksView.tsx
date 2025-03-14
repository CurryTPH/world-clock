"use client";

import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TimezoneSelect, { selectStyles, getDSTTransitions, isTimezoneDST, commonTimezones } from '../TimezoneSelect';

// This tells us what props our component needs, we need the selected timezones, the user's timezone, and a way to update them
interface ClocksViewProps {
  selectedTimezones: any[]; // The timezones the user has picked
  userLocalTimezone: string; // User's own current timezone
  setSelectedTimezones: (timezones: any[]) => void; // Update selected timezones
}

export default function ClocksView({
  selectedTimezones,
  userLocalTimezone,
  setSelectedTimezones
}: ClocksViewProps) {
// Setting up state to track the current time - will update every second
  const [currentTime, setCurrentTime] = useState(new Date());

// This runs once when component loads and sets up a timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

// This tries to make timezone labels shorter for user experience. It'll use the timezone abbreviation if it exists, or just use the city name
  const formatTimezoneLabel = (timezone: string, label: string): string => {
    try {
      const time = toZonedTime(currentTime, timezone);
      const abbreviation = format(time, 'zzz').replace(/[[\]]/g, '');
    
      if (abbreviation && abbreviation.length > 0 && abbreviation.length <= 5) {
        const isDST = isTimezoneDST(timezone);
        return `${abbreviation}${isDST ? '' : ' (No DST)'}`;
      } else {
        const shortLabel = label.split('/').pop()?.replace('_', ' ') || label;
        return shortLabel;
      }
    } catch (error) {
      return label.split('/').pop()?.replace('_', ' ') || label;
    }
  };

// This is where it builds a whole analog clock for a timezone and calculates all the hand positions and formats times for display
  const renderClock = (timezone: string, label: string) => {
    const time = toZonedTime(currentTime, timezone);
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    
// Math to figure out how much to rotate each clock hand, hours: 30 degrees per hour plus a bit extra based on minutes
// Minutes and seconds: 6 degrees per unit (360 / 60)
    const hourDegrees = (hours * 30) + (minutes * 0.5);
    const minuteDegrees = minutes * 6;
    const secondDegrees = seconds * 6;
    
// Making the digital time strings to show under the clock
    const formattedTime = format(time, "hh:mm:ss a");
    const formattedDate = format(time, "EEE, MMM d");
    
// Check if DST is active and grab shorter label
    const isDSTActive = isTimezoneDST(timezone);
    const shortLabel = formatTimezoneLabel(timezone, label);
    
// Get the city name by itself from the full timezone string
    const cityName = label.split('/').pop()?.replace('_', ' ') || label;

    return (
      <div className="flex flex-col items-center">
        <div className="text-lg font-semibold text-white mb-2">
          {cityName}
        </div>
        
        {/* This is the actual clock face, a big circle with elements inside */}
        <div className="relative w-48 h-48 rounded-full bg-gray-800 border-4 border-gray-700 shadow-xl mb-3">
          {/* These are the hour markers around the clock (1-12) */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute w-1 h-4 ${i % 3 === 0 ? 'bg-gray-200 h-6' : 'bg-gray-400'}`}
              style={{
                top: '8%',
                left: '50%',
                transform: `rotate(${i * 30}deg) translateX(-50%)`,
                transformOrigin: '50% 400%'
              }}
            />
          ))}
          
          {/* Hour hand, the big short one */}
          <div 
            className="absolute w-1.5 h-[28%] bg-white rounded-full shadow-md"
            style={{
              top: '22%',
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${hourDegrees}deg)`
            }}
          />
          {/* Minute hand, the medium length one */}
          <div 
            className="absolute w-1 h-[38%] bg-white rounded-full shadow-md"
            style={{
              top: '12%',
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${minuteDegrees}deg)`
            }}
          />
          {/* Second hand, the thin red one */}
          <div 
            className="absolute w-0.5 h-[45%] bg-red-500 rounded-full"
            style={{
              top: '5%',
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${secondDegrees}deg)`
            }}
          />
          
          {/* The little circle in the middle where hands meet */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm z-10" />
          
          {/* Extra border to make clock look better */}
          <div className="absolute inset-2 rounded-full border-2 border-gray-600" />
          
          {/* Shows the timezone abbreviation in the clock */}
          <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
            {shortLabel}
          </div>
          
          {/* Shows a special badge if DST is active */}
          {isDSTActive && (
            <div 
              className="absolute top-[30%] left-1/2 transform -translate-x-1/2 bg-yellow-400/90 text-xs font-bold text-black px-2 py-0.5 rounded-full"
              title="Daylight Saving Time is active"
            >
              DST
            </div>
          )}
        </div>
        
        {/* Shows digital time under the clock for accessibility */}
        <div className="text-xl font-mono font-semibold text-white tracking-wide">{formattedTime}</div>
        <div className="text-sm text-gray-300 mt-1">{formattedDate}</div>
        <div className="text-xs text-gray-400 mt-1">{timezone}</div>
      </div>
    );
  };

  return (
    <div 
      className="w-full max-w-7xl bg-gray-900 rounded-lg p-6"
      role="region" 
      aria-label="World Clock Analog View"
    >
      {/* This section has a label for user's time and dropdown selectors for other timezones */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="p-2 rounded-lg">
          <h3 className="text-lg font-semibold text-white text-center mb-2">
            Your Time
          </h3>
        </div>
        
        {/* Map over each selected timezone to create dropdown selectors */}
        {selectedTimezones.map((tz, idx) => (
          <div key={idx} className="p-2 rounded-lg">
            <TimezoneSelect
              options={commonTimezones}
              value={tz}
              onChange={(val) => {
                if (val) {
                  const newZones = [...selectedTimezones];
                  newZones[idx] = val;
                  setSelectedTimezones(newZones);
                }
              }}
              className="mb-2"
              styles={{
                ...selectStyles,
                control: (base) => ({
                  ...base,
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                  color: 'white',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#4F46E5'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  maxHeight: '300px'
                }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: '300px'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#374151'
                  }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white'
                })
              }}
              isSearchable
              placeholder="Select timezone..."
              noOptionsMessage={() => "No timezones found"}
            />
            {/* Show DST transition dates if available */}
            {getDSTTransitions(tz.value) && (
              <div className="text-xs text-center text-gray-400">
                DST: {getDSTTransitions(tz.value)?.start} - {getDSTTransitions(tz.value)?.end}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* This section shows all the clocks in a grid layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* The user's local time clock */}
        <div className="flex justify-center p-6 rounded-lg bg-gray-800/80 shadow-lg border border-gray-700/50">
          {renderClock(userLocalTimezone, "Your Time")}
        </div>
        
        {/* Map the selected timezones to create a clock for each */}
        {selectedTimezones.map((tz, idx) => (
          <div key={idx} className="flex justify-center p-6 rounded-lg bg-gray-800/80 shadow-lg border border-gray-700/50">
            {renderClock(tz.value, tz.label)}
          </div>
        ))}
      </div>
    </div>
  );
} 