"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { format, set } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TimezoneSelect, { selectStyles, commonTimezones, isTimezoneDST, getDSTTransitions } from './TimezoneSelect';
import React from "react";
import NotificationButton from './NotificationButton';
import { AIScheduler } from './AIScheduler';
import { UserPreferences, defaultPreferences } from '../settings/preferences';

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

export default function WorldClock3() {
  const userLocalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const [timezones] = useState<TimezoneOption[]>([
    { value: userLocalTimezone || "UTC", label: userLocalTimezone || "UTC" }
  ]);
  const [mounted, setMounted] = useState(false);
  const [localTime, setLocalTime] = useState<Date | null>(null);
  const [localTimeSlots, setLocalTimeSlots] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [showAIScheduler, setShowAIScheduler] = useState(false);
  const [userPreferences] = useState<UserPreferences>(defaultPreferences);

  // State hooks
  const [selectedTimezones, setSelectedTimezones] = useState([
    commonTimezones[0],
    commonTimezones[1],
    commonTimezones[2],
    commonTimezones[3],
  ]);
  const [highlightedTime, setHighlightedTime] = useState<Date | null>(null);

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
    // More AI scheduling logic would go here
  }, []);

  useEffect(() => {
    // Set up time updates
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const updateTimes = () => {
        const now = new Date();
        setLocalTime(now);
        
        // Generate time slots based on the current date
        const baseDate = new Date();
        
        // Generate shorter interval slots for local timezone only
        setLocalTimeSlots(generateTimeSlots(10, baseDate));
        
        // Generate 30 minute interval slots for other timezones
        setTimeSlots(generateTimeSlots(30, baseDate));
      };

      // Initial update
      updateTimes();
      
      // Set interval for updates
      const intervalId = setInterval(updateTimes, 30000);
      
      // Set up keyboard listeners
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('keydown', handleKeyDown);
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
      };
    }
  }, [handleKeyDown]);

  // Scroll to current time when component is first mounted or when time updates
  useEffect(() => {
    if (mounted && localTime) {
      scrollToCurrentTime();
    }
  }, [mounted, localTime, scrollToCurrentTime]);

  // Memoized value for reusable timezone format
  const getTimezoneString = useCallback((timezone: string) => {
    try {
      const now = new Date();
      const zonedTime = toZonedTime(now, timezone);
      const offset = zonedTime.getTimezoneOffset();
      const hourOffset = Math.abs(Math.floor(-offset / 60));
      const minuteOffset = Math.abs(-offset % 60);
      const sign = offset > 0 ? '-' : '+';
      const offsetString = `UTC${sign}${hourOffset.toString().padStart(2, '0')}:${minuteOffset.toString().padStart(2, '0')}`;
      
      const dst = isTimezoneDST(timezone, now);
      const dstInfo = dst ? ' (DST)' : '';
      
      return `${timezone} (${offsetString})${dstInfo}`;
    } catch (e) {
      return timezone;
    }
  }, []);

  // Function to analyze participant patterns
  const analyzeParticipantPatterns = useCallback((participants: Participant[]) => {
    // This would normally be a more complex analysis
    return participants.map(p => ({
      name: p.name,
      timezone: p.timezone,
      workingHours: p.workingHours,
      preferredTimes: p.preferredTimes,
      focusTime: p.focusTime
    }));
  }, []);

  // Score a time slot based on participant preferences
  const scoreTimeSlot = (
    slot: Date, 
    participants: Participant[], 
    duration: number = 60, 
    userPreferences: UserPreferences
  ) => {
    let score = 10;
    
    participants.forEach(participant => {
      const localTime = toZonedTime(slot, participant.timezone);
      const hour = localTime.getHours();
      const minutes = localTime.getMinutes();
      const timeInMinutes = hour * 60 + minutes;
      
      // Working hours
      const workStart = participant.workingHours.start.split(':').map(Number);
      const workEnd = participant.workingHours.end.split(':').map(Number);
      const workStartMinutes = workStart[0] * 60 + workStart[1];
      const workEndMinutes = workEnd[0] * 60 + workEnd[1];
      
      if (timeInMinutes < workStartMinutes || timeInMinutes + duration > workEndMinutes) {
        score -= 5; // Outside working hours
      }
      
      // Preferred times
      if (participant.preferredTimes) {
        const prefStart = participant.preferredTimes.start.split(':').map(Number);
        const prefEnd = participant.preferredTimes.end.split(':').map(Number);
        const prefStartMinutes = prefStart[0] * 60 + prefStart[1];
        const prefEndMinutes = prefEnd[0] * 60 + prefEnd[1];
        
        if (timeInMinutes >= prefStartMinutes && timeInMinutes + duration <= prefEndMinutes) {
          score += 2; // Within preferred time
        }
      }
      
      // Focus time (should avoid scheduling during focus time)
      if (participant.focusTime) {
        const focusStart = participant.focusTime.start.split(':').map(Number);
        const focusEnd = participant.focusTime.end.split(':').map(Number);
        const focusStartMinutes = focusStart[0] * 60 + focusStart[1];
        const focusEndMinutes = focusEnd[0] * 60 + focusEnd[1];
        
        if (timeInMinutes < focusEndMinutes && timeInMinutes + duration > focusStartMinutes) {
          score -= 3; // Overlaps with focus time
        }
      }
      
      // Check day of week
      const dayOfWeek = localTime.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        score -= 7; // Weekend penalty
      }
      
      // Time of day penalties
      if (hour < 7) score -= 6; // Early morning
      if (hour >= 18) score -= 3; // Evening
      if (hour >= 22 || hour < 5) score -= 10; // Night
    });
    
    return score;
  };

  useEffect(() => {
    // Update AI scoring whenever participants, duration, or preferences change
    const scoreSlots = () => {
      if (!showAIScheduler) return;
      
      // Pattern analysis would be more complex in a real implementation
      const patterns = analyzeParticipantPatterns(participants);
      
      // This would update some other state or trigger a calculation
      console.log("Updated participant patterns:", patterns);
    };
    
    scoreSlots();
  }, [participants, showAIScheduler, analyzeParticipantPatterns]);

  // Render component
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">World Clock 3</h2>
          <p className="text-sm text-muted-foreground">Compare times across multiple timezones</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAIScheduler(!showAIScheduler)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showAIScheduler 
                ? 'bg-primary text-white' 
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            {showAIScheduler ? 'Hide AI Scheduler' : 'AI Scheduler'}
          </button>
          <NotificationButton />
        </div>
      </div>

      {showAIScheduler && (
        <div className="mb-6 p-4 border rounded-lg bg-card">
          <AIScheduler 
            participants={participants} 
            setParticipants={setParticipants}
            onSlotSelect={handleAISlotSelect}
            userPreferences={userPreferences}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Your Local Time</h3>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-2xl font-mono">
                {localTime ? format(localTime, "HH:mm:ss") : "--:--:--"}
              </div>
              <div className="text-sm text-muted-foreground">
                {userLocalTimezone} {localTime ? format(localTime, "MMM d, yyyy") : ""}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Detailed Timeline</h3>
            <div 
              ref={localColumnRef} 
              className="h-96 overflow-y-auto p-2 border rounded-md flex flex-col"
            >
              {localTimeSlots.map((slot, index) => {
                const localSlot = toZonedTime(slot, userLocalTimezone);
                const formattedTime = format(localSlot, "MMM d, hh:mm a");
                const isCurrentTime = localTime && 
                  localTime.getHours() === localSlot.getHours() && 
                  Math.abs(localTime.getMinutes() - localSlot.getMinutes()) < 5;
                
                return (
                  <div 
                    key={`local-${index}`}
                    className={`p-2 cursor-pointer transition-colors ${
                      isCurrentTime ? 'bg-primary/20 font-medium' : 
                      (highlightedTime && highlightedTime.getTime() === slot.getTime() ? 'bg-accent' : '')
                    }`}
                    onClick={() => handleTimeSelection(slot)}
                  >
                    {formattedTime}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 col-span-1 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedTimezones.map((timezone, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <TimezoneSelect
                    id={`timezone-select-${idx}`}
                    value={timezone}
                    onChange={(newValue) => {
                      const updatedTimezones = [...selectedTimezones];
                      updatedTimezones[idx] = newValue as TimezoneOption;
                      setSelectedTimezones(updatedTimezones);
                    }}
                    styles={selectStyles}
                  />
                </div>
                <div 
                  ref={columnRefs[idx]}
                  className="h-96 overflow-y-auto flex-1 p-2 border rounded-md flex flex-col"
                >
                  {timeSlots.map((slot, slotIdx) => {
                    const localSlot = toZonedTime(slot, timezone.value);
                    const formattedTime = format(localSlot, "MMM d, hh:mm a");
                    const isCurrentTime = localTime && 
                      localTime.getHours() === localSlot.getHours() && 
                      Math.floor(localTime.getMinutes() / 30) === Math.floor(localSlot.getMinutes() / 30);
                    
                    return (
                      <div 
                        key={`${timezone.value}-${slotIdx}`}
                        className={`p-2 cursor-pointer transition-colors ${
                          isCurrentTime ? 'bg-primary/20 font-medium' : 
                          (highlightedTime && highlightedTime.getTime() === slot.getTime() ? 'bg-accent' : '')
                        }`}
                        onClick={() => handleTimeSelection(slot)}
                      >
                        {formattedTime}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 