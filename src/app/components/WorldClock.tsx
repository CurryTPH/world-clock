"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { format, set } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TimezoneSelect, { selectStyles, commonTimezones, isTimezoneDST, getDSTTransitions } from './TimezoneSelect';
import React from "react";
import NotificationButton from './NotificationButton';

// Add this effect to preload the Select component stylesheet
// in a higher scope outside the component
if (typeof document !== 'undefined') {
  const existingLink = document.querySelector('link[href*="react-select"]');
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/react-select@5.7.0/dist/react-select.min.css';
    document.head.appendChild(link);
  }
}

// Use the common timezones from the TimezoneSelect component
const timezones = commonTimezones;

// Move timezone resolution to useEffect
const roundToNearestIncrement = (date: Date, increment: number) => {
  const minutes = date.getMinutes();
  const remainder = minutes % increment;
  return remainder < increment / 2
    ? set(date, { minutes: minutes - remainder, seconds: 0 })
    : set(date, { minutes: minutes + (increment - remainder), seconds: 0 });
};

const generateTimeSlots = (interval: number, baseDate: Date = new Date()) => {
  const times = [];
  // Generate slots for previous, current, and next day
  for (let dayOffset = -1; dayOffset <= 1; dayOffset++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayOffset);
    
    for (let i = 0; i < 24 * 60; i += interval) {
      const time = set(new Date(date), {
        hours: Math.floor(i / 60),
        minutes: i % 60,
        seconds: 0,
        milliseconds: 0
      });
      times.push(time);
    }
  }
  return times;
};

export default function WorldClock() {
  // State hooks
  const [mounted, setMounted] = useState(false);
  const [userLocalTimezone, setUserLocalTimezone] = useState("");
  const [selectedTimezones, setSelectedTimezones] = useState([
    timezones[0],
    timezones[1],
    timezones[2],
    timezones[3],
  ]);
  const [highlightedTime, setHighlightedTime] = useState<Date | null>(null);
  const [localTime, setLocalTime] = useState<Date | null>(null);
  const [localTimeSlots, setLocalTimeSlots] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);

  // Ref hooks
  const highlightTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const localColumnRef = useRef<HTMLDivElement>(null);
  const refs = useRef([
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>()
  ]);

  // Memoized values
  const columnRefs = useMemo(() => refs.current, []);

  // Callbacks
  const scrollToTime = useCallback((targetElement: Element | null) => {
    if (targetElement instanceof HTMLElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const scrollToCurrentTime = useCallback(() => {
    if (!localTime) return;
    
    const roundedLocalTimeForLocal = roundToNearestIncrement(localTime, 10);
    const formattedLocalTime = format(toZonedTime(roundedLocalTimeForLocal, userLocalTimezone), "MMM d, hh:mm a");
    
    const roundedLocalTimeForZones = roundToNearestIncrement(localTime, 30);

    if (localColumnRef.current) {
      const timeElements = Array.from(localColumnRef.current.children);
      const targetElement = timeElements.find((child) => child.textContent?.trim() === formattedLocalTime) || null;
      scrollToTime(targetElement);
    }

    columnRefs.forEach((ref, idx) => {
      if (ref.current) {
        const timezone = selectedTimezones[idx].value;
        const convertedTime = toZonedTime(roundedLocalTimeForZones, timezone);
        const formattedConvertedTime = format(convertedTime, "MMM d, hh:mm a");

        const timeElements = Array.from(ref.current.children);
        const targetElement = timeElements.find((child) => child.textContent?.trim() === formattedConvertedTime) || null;
        scrollToTime(targetElement);
      }
    });
  }, [localTime, selectedTimezones, scrollToTime, columnRefs, userLocalTimezone]);

  const handleTimeSelection = (selectedTime: Date) => {
    setHighlightedTime(selectedTime);

    // Clear any existing timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    columnRefs.forEach((ref, idx) => {
      if (ref.current) {
        const timezone = selectedTimezones[idx].value;
        const convertedTime = toZonedTime(selectedTime, timezone);
        const formattedConvertedTime = format(convertedTime, "MMM d, hh:mm a");

        const timeElements = Array.from(ref.current.children);
        const targetElement = timeElements.find((child) => child.textContent?.trim() === formattedConvertedTime) || null;
        scrollToTime(targetElement);
      }
    });

    // Store the timeout ID in the ref
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedTime(null);
      scrollToCurrentTime(); // Only scroll to current time after highlight is cleared
    }, 5000);
  };

  // Initialize all client-side only data
  useEffect(() => {
    setMounted(true);
    setUserLocalTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setLocalTime(roundToNearestIncrement(new Date(), 10));
    setLocalTimeSlots(generateTimeSlots(10));
    setTimeSlots(generateTimeSlots(30));

    // Cleanup function to clear any existing timeout
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (localTime && !highlightedTime) {
      const interval = setInterval(() => {
        setLocalTime(roundToNearestIncrement(new Date(), 10));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [localTime, highlightedTime]);

  // Only scroll to current time if there's no highlighted time
  useEffect(() => {
    if (!highlightedTime && localTime) {
      setTimeout(() => {
        scrollToCurrentTime();
      }, 50);
    }
  }, [highlightedTime, scrollToCurrentTime, localTime]);

  // Only scroll on timezone changes if there's no highlighted time
  useEffect(() => {
    if (!highlightedTime && localTime) {
      scrollToCurrentTime();
    }
  }, [selectedTimezones, scrollToCurrentTime, localTime, highlightedTime]);

  // Don't render anything until client-side initialization is complete
  if (!mounted || !localTime || !userLocalTimezone || localTimeSlots.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="relative w-full">
      {/* Notification Button */}
      <div className="absolute top-4 right-4 z-50">
        <NotificationButton />
      </div>

      <div className="flex justify-center w-full">
        <div className="grid grid-cols-5 gap-4 w-full max-w-7xl">
          {/* 🔵 Local Time Column (User's Timezone, 10-min increments) */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full">
            <div className="text-center text-white mb-4">
              <h3 className="font-bold">Local Time</h3>
              <div className="text-sm text-gray-400">
                {userLocalTimezone}
                {isTimezoneDST(userLocalTimezone) && (
                  <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">DST</span>
                )}
              </div>
              {getDSTTransitions(userLocalTimezone) && (
                <div className="text-xs text-gray-400 mt-1">
                  DST: {getDSTTransitions(userLocalTimezone)?.start} - {getDSTTransitions(userLocalTimezone)?.end}
                </div>
              )}
            </div>
            <div ref={localColumnRef} className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {localTimeSlots.map((time) => {
                const zonedTime = toZonedTime(time, userLocalTimezone);
                const formattedTime = format(zonedTime, "MMM d, hh:mm a");
                const isNow = localTime && 
                  format(zonedTime, "MMM d, hh:mm a") === format(toZonedTime(localTime, userLocalTimezone), "MMM d, hh:mm a");
                return (
                  <div 
                    key={formattedTime} 
                    className={`p-2 text-center ${isNow ? "bg-blue-500 text-white font-bold" : ""}`}
                    onClick={() => handleTimeSelection(time)}
                  >
                    {formattedTime}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🌍 Other Timezone Columns */}
          {selectedTimezones.map((tz, idx) => {
            const transitions = getDSTTransitions(tz.value);
            
            return (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow-lg w-full">
                <div className="mb-4">
                  <TimezoneSelect
                    options={timezones}
                    value={tz}
                    onChange={(val) => {
                      if (val) {
                        const newZones = [...selectedTimezones];
                        newZones[idx] = val;
                        setSelectedTimezones(newZones);
                      }
                    }}
                    className="mb-2"
                    styles={selectStyles}
                    isSearchable
                    placeholder="Select timezone..."
                    noOptionsMessage={() => "No timezones found"}
                  />
                  {transitions && (
                    <div className="text-xs text-center text-gray-400">
                      DST: {transitions.start} - {transitions.end}
                    </div>
                  )}
                </div>
                <div ref={columnRefs[idx]} className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {timeSlots.map((time) => {
                    const zonedTime = toZonedTime(time, tz.value);
                    const formattedTime = format(zonedTime, "MMM d, hh:mm a");
                    const isHighlighted = highlightedTime && 
                      format(toZonedTime(time, tz.value), "MMM d, hh:mm a") === 
                      format(toZonedTime(highlightedTime, tz.value), "MMM d, hh:mm a");
                    const isLocalTime = localTime && 
                      format(zonedTime, "MMM d, hh:mm a") === 
                      format(toZonedTime(roundToNearestIncrement(localTime, 30), tz.value), "MMM d, hh:mm a");

                    // Check if this time is during a DST transition
                    const timeString = format(zonedTime, "MMM d");
                    const isDSTTransition = transitions && (timeString === transitions.start || timeString === transitions.end);

                    return (
                      <div 
                        key={formattedTime} 
                        className={`p-2 text-center cursor-pointer relative ${
                          isHighlighted ? "bg-pink-500 text-white font-bold highlighted" : ""
                        } ${isLocalTime ? "bg-blue-500 text-white font-bold" : ""}`}
                        onClick={() => handleTimeSelection(time)}
                      >
                        {formattedTime}
                        {isDSTTransition && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" 
                               title={`DST ${timeString === transitions.start ? 'Starts' : 'Ends'}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
