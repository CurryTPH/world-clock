"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { format, set } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TimezoneSelect, { TimezoneOption, selectStyles, commonTimezones } from './TimezoneSelect';

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

const generateTimeSlots = (interval: number) => {
  const times = [];
  for (let i = 0; i < 24 * 60; i += interval) {
    const time = set(new Date(), { hours: Math.floor(i / 60), minutes: i % 60, seconds: 0, milliseconds: 0 });
    times.push(time);
  }
  return times;
};

export default function WorldClock() {
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

  const localColumnRef = useRef<HTMLDivElement>(null);
  const columnRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Initialize all client-side only data
  useEffect(() => {
    setMounted(true);
    setUserLocalTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setLocalTime(roundToNearestIncrement(new Date(), 10));
    setLocalTimeSlots(generateTimeSlots(10));
    setTimeSlots(generateTimeSlots(30));
  }, []);

  const scrollToTime = useCallback((targetElement: Element | null) => {
    if (targetElement instanceof HTMLElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const scrollToCurrentTime = useCallback(() => {
    if (!localTime) return;
    
    const roundedLocalTimeForLocal = roundToNearestIncrement(localTime, 10);
    const formattedLocalTime = format(roundedLocalTimeForLocal, "hh:mm a");
    
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
        const formattedConvertedTime = format(convertedTime, "hh:mm a");

        const timeElements = Array.from(ref.current.children);
        const targetElement = timeElements.find((child) => child.textContent?.trim() === formattedConvertedTime) || null;
        scrollToTime(targetElement);
      }
    });
  }, [localTime, selectedTimezones, scrollToTime]);

  useEffect(() => {
    if (localTime) {
      const interval = setInterval(() => {
        setLocalTime(roundToNearestIncrement(new Date(), 10));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [localTime]);

  useEffect(() => {
    if (highlightedTime === null && localTime) {
      setTimeout(() => {
        scrollToCurrentTime();
      }, 50);
    }
  }, [highlightedTime, scrollToCurrentTime, localTime]);

  useEffect(() => {
    if (localTime) {
      scrollToCurrentTime();
    }
  }, [selectedTimezones, scrollToCurrentTime, localTime]);

  const handleTimeSelection = (selectedTime: Date) => {
    setHighlightedTime(selectedTime);

    columnRefs.forEach((ref, idx) => {
      if (ref.current) {
        const timezone = selectedTimezones[idx].value;
        const convertedTime = toZonedTime(selectedTime, timezone);
        const formattedConvertedTime = format(convertedTime, "hh:mm a");

        const timeElements = Array.from(ref.current.children);
        const targetElement = timeElements.find((child) => child.textContent?.trim() === formattedConvertedTime) || null;
        scrollToTime(targetElement);
      }
    });

    setTimeout(() => {
      setHighlightedTime(null);
    }, 5000);
  };

  // Don't render anything until client-side initialization is complete
  if (!mounted || !localTime || !userLocalTimezone || localTimeSlots.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="grid grid-cols-5 gap-4 w-full max-w-7xl">
        {/* 🔵 Local Time Column (User's Timezone, 10-min increments) */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full">
          <h3 className="text-center text-white font-bold mb-4">Local Time ({userLocalTimezone})</h3>
          <div ref={localColumnRef} className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {localTimeSlots.map((time) => {
              const formattedTime = format(toZonedTime(time, userLocalTimezone), "hh:mm a");
              const isNow = localTime && format(time, "hh:mm a") === format(localTime, "hh:mm a");
              return <div key={formattedTime} className={`p-2 text-center ${isNow ? "bg-blue-500 text-white font-bold" : ""}`}>{formattedTime}</div>;
            })}
          </div>
        </div>

        {/* 🌍 Other Timezone Columns */}
        {selectedTimezones.map((tz, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow-lg w-full">
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
              className="mb-4"
              styles={selectStyles}
              isSearchable
              placeholder="Select timezone..."
              noOptionsMessage={() => "No timezones found"}
            />
            <div ref={columnRefs[idx]} className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {timeSlots.map((time) => {
                const formattedTime = format(toZonedTime(time, tz.value), "hh:mm a");
                const isHighlighted = highlightedTime && format(time, "hh:mm a") === format(highlightedTime, "hh:mm a");
                const isLocalTime = localTime && format(time, "hh:mm a") === format(roundToNearestIncrement(localTime, 30), "hh:mm a");

                return (
                  <div key={formattedTime} className={`p-2 text-center cursor-pointer ${
                      isHighlighted ? "bg-pink-500 text-white font-bold highlighted" : ""
                    } ${isLocalTime ? "bg-blue-500 text-white font-bold" : ""}`} 
                    onClick={() => handleTimeSelection(time)}>
                    {formattedTime}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
