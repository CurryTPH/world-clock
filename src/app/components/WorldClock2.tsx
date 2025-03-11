"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { format, set } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TimezoneSelect, { selectStyles, commonTimezones, isTimezoneDST, getDSTTransitions } from './TimezoneSelect';
import React from "react";
import NotificationButton from './NotificationButton';
import { AIScheduler } from './AIScheduler';
import { UserPreferences, defaultPreferences } from '../settings/page';

export interface TimezoneOption {
  value: string;
  label: string;
  group?: string;
}

interface Participant {
  name: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  preferredTimes?: {
    start: string;
    end: string;
  };
  focusTime?: {
    start: string;
    end: string;
  };
  meetingHistory: Date[];
}

// Move timezone resolution to useEffect
const roundToNearestIncrement = (date: Date, increment: number) => {
  const minutes = date.getMinutes();
  const remainder = minutes % increment;
  return remainder < increment / 2
    ? set(date, { minutes: minutes - remainder, seconds: 0 })
    : set(date, { minutes: minutes + (increment - remainder), seconds: 0 });
};

const generateTimeSlots = (interval: number, baseDate: Date = new Date()): Date[] => {
  const timeStrings = new Set<string>(); // Track formatted times to prevent duplicates
  const result: Date[] = [];
  
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
      
      // Create a unique string representation of this time
      const timeString = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}-${time.getHours()}-${time.getMinutes()}`;
      
      // Only add if we haven't seen this exact time before
      if (!timeStrings.has(timeString)) {
        timeStrings.add(timeString);
        result.push(time);
      }
    }
  }
  
  return result.sort((a, b) => a.getTime() - b.getTime());
};

export default function WorldClock2() {
  const userLocalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const [timezones, setTimezones] = useState<TimezoneOption[]>([
    { value: userLocalTimezone || "UTC", label: userLocalTimezone || "UTC" }
  ]);
  const [currentTimes, setCurrentTimes] = useState<{ timezone: string; time: Date }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [userPreferences] = useState<UserPreferences>(defaultPreferences);

  // State hooks
  const [mounted, setMounted] = useState(false);
  const [selectedTimezones, setSelectedTimezones] = useState([
    commonTimezones[0],
    commonTimezones[1],
    commonTimezones[2],
    commonTimezones[3],
  ]);
  const [highlightedTime, setHighlightedTime] = useState<Date | null>(null);
  const [localTime, setLocalTime] = useState<Date | null>(null);
  const [localTimeSlots, setLocalTimeSlots] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);

  // New state for AI scheduling
  const [participants, setParticipants] = useState<Participant[]>([
    {
      name: "You",
      timezone: userLocalTimezone || "UTC",
      workingHours: { start: "09:00", end: "17:00" },
      preferredTimes: { start: "10:00", end: "16:00" },
      focusTime: { start: "14:00", end: "16:00" },
      meetingHistory: []
    }
  ]);

  const [showAIScheduler, setShowAIScheduler] = useState(false);

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
      const parent = targetElement.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();
        const scrollTop = parent.scrollTop + (elementRect.top - parentRect.top) - (parentRect.height / 2) + (elementRect.height / 2);
        
        parent.scrollTo({
          top: scrollTop,
          behavior: 'auto'  // Change from 'smooth' to 'auto' to prevent visual glitches
        });
      }
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

  const handleTimeSelection = useCallback((selectedTime: Date) => {
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
  }, [columnRefs, selectedTimezones, scrollToTime, scrollToCurrentTime]);

  // Add keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!highlightedTime) return;

    const currentTime = new Date(highlightedTime);
    const newTime = new Date(currentTime);

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newTime.setMinutes(currentTime.getMinutes() - 30);
        handleTimeSelection(newTime);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newTime.setMinutes(currentTime.getMinutes() + 30);
        handleTimeSelection(newTime);
        break;
      case 'PageUp':
        event.preventDefault();
        newTime.setHours(currentTime.getHours() - 1);
        handleTimeSelection(newTime);
        break;
      case 'PageDown':
        event.preventDefault();
        newTime.setHours(currentTime.getHours() + 1);
        handleTimeSelection(newTime);
        break;
      case 'Home':
        event.preventDefault();
        handleTimeSelection(roundToNearestIncrement(new Date(), 30));
        break;
    }
  }, [highlightedTime, handleTimeSelection]);

  // Handle participant timezone changes
  useEffect(() => {
    if (userLocalTimezone) {
      setParticipants(prev => prev.map(p => 
        p.name === "You" ? { ...p, timezone: userLocalTimezone } : p
      ));
    }
  }, [userLocalTimezone]);

  // Handle adding a new participant
  const handleAddParticipant = useCallback((timezone: string) => {
    const newParticipant: Participant = {
      name: `Participant ${participants.length + 1}`,
      timezone,
      workingHours: { start: "09:00", end: "17:00" },
      preferredTimes: { start: "10:00", end: "16:00" },
      meetingHistory: []
    };
    setParticipants(prev => [...prev, newParticipant]);
  }, [participants.length]);

  // Handle AI scheduling slot selection
  const handleAISlotSelect = useCallback((slot: Date) => {
    setHighlightedTime(slot);
    scrollToCurrentTime();
  }, [scrollToCurrentTime]);

  // Initialize all client-side only data
  useEffect(() => {
    setMounted(true);
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

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const updateTimes = () => {
      setCurrentTimes(timezones.map(tz => ({
        timezone: tz.value,
        time: toZonedTime(new Date(), tz.value)
      })));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [timezones]);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setIsMobile(newWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render anything until client-side initialization is complete
  if (!mounted || !localTime || !userLocalTimezone || localTimeSlots.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="relative w-full">
      {/* Top Bar with Notification */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-4">
        <NotificationButton />
      </div>

      <div className="flex justify-center w-full pt-16">
        <div className="w-full max-w-7xl space-y-6">
          {/* AI Scheduling Controls */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">AI-Powered Scheduling</h2>
              <button
                onClick={() => setShowAIScheduler(!showAIScheduler)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {showAIScheduler ? 'Hide Scheduler' : 'Show Scheduler'}
              </button>
            </div>
            
            {showAIScheduler && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <TimezoneSelect
                      options={timezones}
                      onChange={(val) => val && handleAddParticipant(val.value)}
                      placeholder="Add participant timezone..."
                      styles={selectStyles}
                    />
                  </div>
                </div>
                
                <AIScheduler
                  participants={participants.map(p => ({
                    ...p,
                    workingHours: p.name === "You" ? userPreferences.workingHours : p.workingHours,
                    preferredTimes: p.name === "You" ? userPreferences.preferredMeetingTimes : p.preferredTimes,
                    focusTime: p.name === "You" ? userPreferences.focusTime : p.focusTime
                  }))}
                  duration={60}
                  onSlotSelect={handleAISlotSelect}
                  userPreferences={userPreferences}
                />
              </div>
            )}
          </div>

          {/* Existing Clock Grid */}
          <div 
            className="grid grid-cols-5 gap-4 w-full"
            role="region" 
            aria-label="World Clock Timezone Comparison"
          >
            {/* 🔵 Local Time Column (User's Timezone, 10-min increments) */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full">
              <div className="text-center text-white mb-4">
                <h3 className="font-bold">Local Time</h3>
                <div className="text-sm text-gray-400">
                  {userLocalTimezone}
                  {isTimezoneDST(userLocalTimezone) && (
                    <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded" role="status">DST</span>
                  )}
                </div>
                {getDSTTransitions(userLocalTimezone) && (
                  <div className="text-xs text-gray-400 mt-1" role="note">
                    DST: {getDSTTransitions(userLocalTimezone)?.start} - {getDSTTransitions(userLocalTimezone)?.end}
                  </div>
                )}
              </div>
              <div 
                ref={localColumnRef} 
                className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                role="listbox"
                aria-label="Local times"
                style={{ willChange: 'transform' }}
              >
                {localTimeSlots.map((time, index) => {
                  const zonedTime = toZonedTime(time, userLocalTimezone);
                  const formattedTime = format(zonedTime, "MMM d, hh:mm a");
                  const isNow = localTime && 
                    format(zonedTime, "MMM d, hh:mm a") === format(toZonedTime(localTime, userLocalTimezone), "MMM d, hh:mm a");
                  return (
                    <div 
                      key={`${formattedTime}-${index}`}
                      role="option"
                      aria-selected={isNow}
                      tabIndex={0}
                      className={`p-2 text-center cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isNow ? "bg-blue-500 text-white font-bold shadow-lg" : "text-gray-300"
                      }`}
                      onClick={() => handleTimeSelection(time)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTimeSelection(time)}
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
                <div 
                  key={idx} 
                  className="bg-gray-800 p-4 rounded-lg shadow-lg w-full transform transition-all duration-200 hover:shadow-xl"
                  role="region"
                  aria-label={`Timezone: ${tz.label}`}
                >
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
                      <div className="text-xs text-center text-gray-400 transition-opacity duration-200 hover:text-gray-200">
                        DST: {transitions.start} - {transitions.end}
                      </div>
                    )}
                  </div>
                  <div 
                    ref={columnRefs[idx]} 
                    className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    role="listbox"
                    aria-label={`Times for ${tz.label}`}
                    style={{ willChange: 'transform' }}
                  >
                    {timeSlots.map((time) => {
                      const zonedTime = toZonedTime(time, tz.value);
                      const formattedTime = format(zonedTime, "MMM d, hh:mm a");
                      const timeKey = `${time.getTime()}-${tz.value}`; // Create a truly unique key
                      
                      const isHighlighted = highlightedTime && 
                        format(toZonedTime(time, tz.value), "MMM d, hh:mm a") === 
                        format(toZonedTime(highlightedTime, tz.value), "MMM d, hh:mm a");
                      const isLocalTime = localTime && 
                        format(zonedTime, "MMM d, hh:mm a") === 
                        format(toZonedTime(roundToNearestIncrement(localTime, 30), tz.value), "MMM d, hh:mm a");

                      const timeString = format(zonedTime, "MMM d");
                      const isDSTTransition = transitions && (timeString === transitions.start || timeString === transitions.end);

                      return (
                        <div 
                          key={timeKey}
                          role="option"
                          aria-selected={isHighlighted || isLocalTime}
                          tabIndex={0}
                          style={{
                            contain: 'content',
                            height: '40px',
                            lineHeight: '24px'
                          }}
                          className={`p-2 text-center cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isHighlighted ? "bg-pink-500 text-white font-bold" : 
                            isLocalTime ? "bg-blue-500 text-white font-bold" : 
                            "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                          onClick={() => handleTimeSelection(time)}
                          onKeyPress={(e) => e.key === 'Enter' && handleTimeSelection(time)}
                        >
                          {formattedTime}
                          {isDSTTransition && (
                            <div 
                              className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full transform transition-transform duration-200 group-hover:scale-150" 
                              title={`DST ${timeString === transitions.start ? 'Starts' : 'Ends'}`}
                              role="status"
                              aria-label={`DST ${timeString === transitions.start ? 'Starts' : 'Ends'}`}
                            >
                              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                            </div>
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

      {/* Keyboard Navigation Help */}
      <div className="fixed bottom-4 left-4 text-sm text-gray-400 bg-gray-800 p-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200">
        <p>Keyboard Navigation:</p>
        <ul className="list-disc list-inside">
          <li>↑↓: Navigate 30 minutes</li>
          <li>Page Up/Down: Navigate hours</li>
          <li>Home: Current time</li>
        </ul>
      </div>
    </div>
  );
} 