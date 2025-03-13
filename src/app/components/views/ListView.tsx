"use client";

import React, { useRef, useCallback, useMemo } from 'react';
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TimezoneSelect, { selectStyles, getDSTTransitions, commonTimezones } from '../TimezoneSelect';

interface ListViewProps {
  selectedTimezones: any[];
  userLocalTimezone: string;
  timeSlots: Date[];
  localTime: Date | null;
  highlightedTime: Date | null;
  handleTimeSelection: (time: Date) => void;
  setSelectedTimezones: (timezones: any[]) => void;
  roundToNearestIncrement: (date: Date, increment: number) => Date;
}

export default function ListView({
  selectedTimezones,
  userLocalTimezone,
  timeSlots,
  localTime,
  highlightedTime,
  handleTimeSelection,
  setSelectedTimezones,
  roundToNearestIncrement
}: ListViewProps) {
  // Ref for column scrolling
  const columnRefs = useRef(
    Array(selectedTimezones.length)
      .fill(null)
      .map(() => React.createRef<HTMLDivElement>())
  ).current;

  // Track the local column with a ref
  const localColumnRef = useRef<HTMLDivElement>(null);

  // Scroll column to match the currently highlighted time
  const scrollColumn = useCallback(
    (columnIndex: number, smooth = true) => {
      const columnElement = columnRefs[columnIndex]?.current;
      if (!columnElement) return;

      const highlightedElement = columnElement.querySelector(
        '[aria-selected="true"]'
      );

      if (highlightedElement) {
        // Calculate scroll position manually instead of using scrollIntoView
        const columnRect = columnElement.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();
        
        // Calculate the scroll position that would center the element
        const offset = elementRect.top - columnRect.top;
        const center = columnElement.clientHeight / 2 - (highlightedElement as HTMLElement).clientHeight / 2;
        const scrollTarget = columnElement.scrollTop + offset - center;
        
        // Apply the scroll directly to the column element
        columnElement.scrollTo({
          top: scrollTarget,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    },
    [columnRefs]
  );

  // Sync column scrolling when highlighted time changes
  React.useEffect(() => {
    if (highlightedTime) {
      selectedTimezones.forEach((_, index) => {
        scrollColumn(index);
      });
    }
  }, [highlightedTime, scrollColumn, selectedTimezones]);

  return (
    <div
      className="grid grid-cols-5 gap-4 w-full max-w-7xl"
      role="region"
      aria-label="World Clock List View"
    >
      {/* Current Time Zone */}
      <div 
        className="bg-gray-800 p-4 rounded-lg shadow-lg w-full transform transition-all duration-200 hover:shadow-xl flex flex-col"
        role="region"
        aria-label={`Local Timezone: ${userLocalTimezone}`}
      >
        <div className="h-[76px] flex flex-col justify-center mb-4">
          <h3 className="text-lg font-semibold text-white text-center">
            Your Time
          </h3>
          <div className="text-sm text-gray-400 text-center">
            {userLocalTimezone.replace('_', ' ').split('/').pop() || userLocalTimezone}
          </div>
        </div>
        <div 
          ref={localColumnRef}
          className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transform-gpu flex-grow isolate"
          style={{ 
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain', // Prevent scroll chaining to parent
            willChange: 'transform', // Optimize for GPU
          }}
          role="listbox"
          aria-label={`Times for ${userLocalTimezone}`}
          onWheel={(e) => {
            // Prevent wheel events from propagating to the window
            e.stopPropagation();
          }}
        >
          {timeSlots.map((time) => {
            const zonedTime = toZonedTime(time, userLocalTimezone);
            const formattedTime = format(zonedTime, "MMM d, hh:mm a");
            const timeKey = `${time.getTime()}-${userLocalTimezone}`;
            
            // Check if this time slot represents the highlighted time using direct date comparison
            const isHighlighted = highlightedTime && 
              time.getTime() === highlightedTime.getTime();
            
            // Check if this time slot represents the current local time
            const roundedLocal = localTime ? roundToNearestIncrement(localTime, 30) : null;
            const isLocalTime = roundedLocal && 
              time.getFullYear() === roundedLocal.getFullYear() && 
              time.getMonth() === roundedLocal.getMonth() && 
              time.getDate() === roundedLocal.getDate() && 
              time.getHours() === roundedLocal.getHours() && 
              time.getMinutes() === roundedLocal.getMinutes();

            return (
              <div 
                key={timeKey}
                role="option"
                aria-selected={isHighlighted || isLocalTime}
                tabIndex={0}
                data-key={timeKey}
                data-local-time={isLocalTime ? "true" : "false"}
                style={{
                  contain: 'content',
                  height: '40px',
                  lineHeight: '24px'
                }}
                className={`p-2 text-center cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isHighlighted ? "bg-pink-500 text-white font-bold" : 
                  isLocalTime ? "bg-blue-600 text-white font-bold" : 
                  "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => handleTimeSelection(time)}
                onKeyPress={(e) => e.key === 'Enter' && handleTimeSelection(time)}
              >
                {formattedTime}
                {isLocalTime && (
                  <span className="absolute right-0 top-0 h-2 w-2 bg-blue-300 rounded-full m-1 shadow-glow animate-pulse" title="Current local time"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Time Zones */}
      {selectedTimezones.map((tz, idx) => {
        const transitions = getDSTTransitions(tz.value);
        
        return (
          <div 
            key={idx} 
            className="bg-gray-800 p-4 rounded-lg shadow-lg w-full transform transition-all duration-200 hover:shadow-xl flex flex-col"
            role="region"
            aria-label={`Timezone: ${tz.label}`}
          >
            <div className="h-[76px] mb-4">
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
              className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transform-gpu flex-grow isolate"
              style={{ 
                scrollBehavior: 'smooth',
                overscrollBehavior: 'contain', // Prevent scroll chaining to parent
                willChange: 'transform', // Optimize for GPU
              }}
              role="listbox"
              aria-label={`Times for ${tz.label}`}
              onWheel={(e) => {
                // Prevent wheel events from propagating to the window
                e.stopPropagation();
              }}
            >
              {timeSlots.map((time) => {
                const zonedTime = toZonedTime(time, tz.value);
                const formattedTime = format(zonedTime, "MMM d, hh:mm a");
                const timeKey = `${time.getTime()}-${tz.value}`;
                
                // Check if this time slot represents the highlighted time using direct date comparison
                const isHighlighted = highlightedTime && 
                  time.getTime() === highlightedTime.getTime();
                
                // Check if this time slot represents the current local time
                const roundedLocal = localTime ? roundToNearestIncrement(localTime, 30) : null;
                const isLocalTime = roundedLocal && 
                  time.getFullYear() === roundedLocal.getFullYear() && 
                  time.getMonth() === roundedLocal.getMonth() && 
                  time.getDate() === roundedLocal.getDate() && 
                  time.getHours() === roundedLocal.getHours() && 
                  time.getMinutes() === roundedLocal.getMinutes();
                
                const timeString = format(zonedTime, "MMM d");
                const isDSTTransition = transitions && (timeString === transitions.start || timeString === transitions.end);

                return (
                  <div 
                    key={timeKey}
                    role="option"
                    aria-selected={isHighlighted || isLocalTime}
                    tabIndex={0}
                    data-key={timeKey}
                    data-local-time={isLocalTime ? "true" : "false"}
                    style={{
                      contain: 'content',
                      height: '40px',
                      lineHeight: '24px'
                    }}
                    className={`p-2 text-center cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isHighlighted ? "bg-pink-500 text-white font-bold" : 
                      isLocalTime ? "bg-blue-600 text-white font-bold" : 
                      "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    onClick={() => handleTimeSelection(time)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTimeSelection(time)}
                  >
                    {formattedTime}
                    {isLocalTime && (
                      <span className="absolute right-0 top-0 h-2 w-2 bg-blue-300 rounded-full m-1 shadow-glow animate-pulse" title="Current local time"></span>
                    )}
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
  );
} 