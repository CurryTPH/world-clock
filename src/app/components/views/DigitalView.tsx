"use client";

import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TimezoneSelect, { selectStyles, getDSTTransitions, isTimezoneDST, commonTimezones } from '../TimezoneSelect';

// This tells us what props our component needs, we need the selected timezones, the user's timezone, and a way to update them
interface DigitalViewProps {
  selectedTimezones: any[]; // Maybe should be more specific type but it works fine currently
  userLocalTimezone: string; // User's own timezone
  setSelectedTimezones: (timezones: any[]) => void; // Update the timezones
}

export default function DigitalView({
  selectedTimezones,
  userLocalTimezone,
  setSelectedTimezones
}: DigitalViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

// This makes the clock update every second. Without this the time would be frozen when the component first loads
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval); // Clean up to avoid memory leaks
  }, []);

// This function gets the short name or abbreviation for a timezone. Like PST, EST, GMT etc. - makes it more readable for user experience
  const getTimezoneAbbreviation = (timezone: string): string => {
    try {
      const time = toZonedTime(currentTime, timezone);
      const abbreviation = format(time, 'zzz').replace(/[[\]]/g, '');
      return abbreviation || timezone.split('/').pop()?.replace('_', ' ') || timezone;
    } catch (error) {
      return timezone.split('/').pop()?.replace('_', ' ') || timezone;
    }
  };

// This function builds a digital clock for a specific timezone
  const renderDigitalClock = (timezone: string, label: string) => {
    const time = toZonedTime(currentTime, timezone);
    
// Format the time components with leading zeros, so for example 9:5:3 shows as 09:05:03 which looks nicer for user experience
    const hours = format(time, "HH");
    const minutes = format(time, "mm");
    const seconds = format(time, "ss");
    const formattedDate = format(time, "EEEE, MMMM d");
    const location = format(time, "zzz");
    
// Check if DST(day light savings time) is active, useful to show the user if it is or not for user experience
    const isDSTActive = isTimezoneDST(timezone);
    const abbreviation = getTimezoneAbbreviation(timezone);
    
// Extract just the city name from the full timezone path, for example "America/New_York" becomes "New York"
    const cityName = label.split('/').pop()?.replace('_', ' ') || label;

    return (
      <div className="flex flex-col items-center w-full">
        <div className="bg-gray-800/80 p-6 rounded-2xl shadow-lg flex flex-col items-center w-full min-w-[200px] border border-gray-700/30 backdrop-blur-sm">
          {/* This section shows the city name and timezone info */}
          <div className="flex flex-col items-center gap-2 mb-4 w-full">
            <div className="text-lg font-semibold text-white text-center w-full">
              {cityName}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">{abbreviation}</span>
              {isDSTActive && (
                <span className="bg-yellow-400/90 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                  DST
                </span>
              )}
            </div>
          </div>
          
          {/* The actual time display with the big numbers */}
          <div className="flex items-baseline space-x-1">
            <span className="text-4xl font-bold text-white tabular-nums w-[2ch] text-center">{hours}</span>
            <span className="text-4xl font-bold text-white">:</span>
            <span className="text-4xl font-bold text-white tabular-nums w-[2ch] text-center">{minutes}</span>
            <span className="text-4xl font-bold text-white">:</span>
            <span className="text-4xl font-bold text-white tabular-nums w-[2ch] text-center">{seconds}</span>
          </div>
        </div>
          
        {/* Shows the date below the clock */}
        <div className="text-sm text-gray-400 font-medium mt-2">
          {formattedDate}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="w-full max-w-7xl bg-gray-900 rounded-xl p-8"
      role="region" 
      aria-label="World Clock Digital View"
    >
      {/* Sets up a grid with 5 columns for all our clocks, 1 local time and 4 other timezones */}
      <div className="grid grid-cols-5 gap-6">
        {/* This first column is for the user's own local time */}
        <div className="space-y-4">
          <div className="text-lg font-semibold text-white text-center">
            Your Time
          </div>
          {/* Allignment for the dropdowns */}
          <div className="h-[24px]"></div>
          {/* Show DST transition dates if its available for user's timezone */}
          {getDSTTransitions(userLocalTimezone) && (
            <div className="text-xs text-center text-gray-400">
              DST: {getDSTTransitions(userLocalTimezone)?.start} - {getDSTTransitions(userLocalTimezone)?.end}
            </div>
          )}
          {/* Alignment if there's no DST info */}
          {!getDSTTransitions(userLocalTimezone) && <div className="h-[16px]"></div>}
          <div className="flex justify-center mt-[-8px]">
            <div className="bg-gray-800/80 p-6 rounded-2xl shadow-lg flex flex-col items-center border border-gray-700/30 backdrop-blur-sm">
              {/* Shows user's local time info */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="text-lg font-semibold text-white text-center">
                  Your Time
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-300">{getTimezoneAbbreviation(userLocalTimezone)}</span>
                  {isTimezoneDST(userLocalTimezone) && (
                    <span className="bg-yellow-400/90 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                      DST
                    </span>
                  )}
                </div>
              </div>
              
              {/* The user's local time display */}
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-white tabular-nums w-[2ch] text-center">
                  {format(toZonedTime(currentTime, userLocalTimezone), "HH")}
                </span>
                <span className="text-4xl font-bold text-white">:</span>
                <span className="text-4xl font-bold text-white tabular-nums w-[2ch] text-center">
                  {format(toZonedTime(currentTime, userLocalTimezone), "mm")}
                </span>
                <span className="text-4xl font-bold text-white">:</span>
                <span className="text-4xl font-bold text-white tabular-nums w-[2ch] text-center">
                  {format(toZonedTime(currentTime, userLocalTimezone), "ss")}
                </span>
              </div>
              
              {/* Full date display under the time */}
              <div className="text-sm text-gray-400 font-medium mt-4">
                {format(toZonedTime(currentTime, userLocalTimezone), "EEEE, MMMM d")}
              </div>
            </div>
          </div>
        </div>

        {/* Now we map through all the other timezones the user has selected */}
        {selectedTimezones.map((tz, idx) => (
          <div key={idx} className="space-y-4">
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
            {/* Render the digital clock for this timezone (ISSUES HERE FIX ASAP)*/}
            {renderDigitalClock(tz.value, tz.label)}
          </div>
        ))}
      </div>
    </div>
  );
} 