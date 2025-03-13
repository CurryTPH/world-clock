"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { format, set } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TimezoneSelect, { selectStyles, commonTimezones, isTimezoneDST, getDSTTransitions } from './TimezoneSelect';
import React from "react";
import NotificationButton from './NotificationButton';
import ContextualInfo from './ContextualInfo';
import PersonalNotes from './PersonalNotes';
import ClientReminder from './ClientReminder';
import { startContextualNotifications } from './contextual-demo-data';
import ViewSwitcher from './ViewSwitcher';
import { useView } from '../contexts/ViewContext';
import Cookies from 'js-cookie';

// Import view components
import { ListView, ClocksView, DigitalView } from './views';

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
    ? set(date, { minutes: minutes - remainder, seconds: 0, milliseconds: 0 })
    : set(date, { minutes: minutes + (increment - remainder), seconds: 0, milliseconds: 0 });
};

const generateTimeSlots = (interval: number, baseDate: Date = new Date()) => {
  // Ensure baseDate is rounded to the specified interval
  const roundedBaseDate = roundToNearestIncrement(baseDate, interval);
  const timeMap = new Map(); // Use a Map for better performance with complex keys
  const result = [];
  
  // Generate slots for previous, current, and next day
  for (let dayOffset = -1; dayOffset <= 1; dayOffset++) {
    const date = new Date(roundedBaseDate);
    date.setDate(date.getDate() + dayOffset);
    
    // Reset hours and minutes to start of day
    date.setHours(0, 0, 0, 0);
    
    // Generate slots for the entire day at the specified interval
    for (let minutes = 0; minutes < 24 * 60; minutes += interval) {
      const time = new Date(date);
      time.setMinutes(time.getMinutes() + minutes);
      
      // Use timestamp as key for uniqueness
      const timeKey = time.getTime();
      
      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, time);
        result.push(time);
      }
    }
  }
  
  return result.sort((a, b) => a.getTime() - b.getTime());
};

export default function WorldClock() {
  // Access the current view from context
  const { currentView } = useView();

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
  const [activeTimezones, setActiveTimezones] = useState<string[]>([]);
  const [timezoneValues, setTimezoneValues] = useState<string[]>([]);
  const [ignoreNextClick, setIgnoreNextClick] = useState(false);
  const [initialSelectionDone, setInitialSelectionDone] = useState(false);
  // Track which columns have been scrolled already to avoid redundant operations
  const [columnsScrolled, setColumnsScrolled] = useState<Set<string>>(new Set());
  // Track if a scroll operation is already in progress
  const scrollInProgressRef = useRef(false);
  // Add a flag to track if the time was manually selected
  const [isManualSelection, setIsManualSelection] = useState(false);
  // Add reference to track manual selection timeout
  const manualSelectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // How long a manual selection should remain active (in milliseconds)
  const MANUAL_SELECTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  // Add a ref to track the last manually selected time
  const lastManuallySelectedTimeRef = useRef<Date | null>(null);
  // State to manage dashboard visibility
  const [isDashboardVisible, setIsDashboardVisible] = useState(() => {
    const savedPreference = Cookies.get('dashboardVisible');
    return savedPreference ? JSON.parse(savedPreference) : true;
  });

  // Ref hooks
  const highlightTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const localColumnRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const timeColumnsContainerRef = useRef<HTMLDivElement>(null);
  // Add ref to track animation frame ID for cancelation
  const animationFrameRef = useRef<number | null>(null);
  // Cache for DOM elements to avoid repeated lookups
  const domCacheRef = useRef<{
    timeColumns: Element[] | null;
    localTimeElements: Map<Element, Element[]>;
    highlightedElements: Map<Element, Element[]>;
  }>({
    timeColumns: null,
    localTimeElements: new Map(),
    highlightedElements: new Map(),
  });
  
  // Create dynamic refs based on the number of selected timezones
  const refsArray = useRef<React.RefObject<HTMLDivElement>[]>([]);
  
  // Update refs when selected timezones change
  useEffect(() => {
    // Create new array of refs if needed
    if (refsArray.current.length !== selectedTimezones.length) {
      refsArray.current = Array(selectedTimezones.length)
        .fill(null)
        .map((_, i) => refsArray.current[i] || React.createRef<HTMLDivElement>());
    }
  }, [selectedTimezones]);
  
  // Memoized values
  const columnRefs = useMemo(() => refsArray.current, [refsArray.current]);

  // Callbacks
  const scrollToTime = useCallback((targetElement: Element | null) => {
    if (!targetElement) return;
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  // Improved scrollColumn function with requestAnimationFrame
  const scrollColumn = useCallback((columnIndex: number, smooth = true) => {
    // Make sure we don't try to access a non-existent ref
    if (columnIndex < 0 || columnIndex >= refsArray.current.length) return;
    
    const columnElement = refsArray.current[columnIndex]?.current;
    if (!columnElement) return;

    // Cancel any existing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smoother scrolling
    animationFrameRef.current = requestAnimationFrame(() => {
      const highlightedElement = columnElement.querySelector('[aria-selected="true"]');
      if (highlightedElement) {
        // Calculate scroll position manually instead of using scrollIntoView
        const columnRect = columnElement.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();
        
        // Calculate the scroll position that would center the element
        const offset = elementRect.top - columnRect.top;
        const center = columnElement.clientHeight / 2 - (highlightedElement as HTMLElement).clientHeight / 2;
        const scrollTarget = columnElement.scrollTop + offset - center;
        
        // Apply the scroll directly to avoid window scrolling
        columnElement.scrollTo({
          top: scrollTarget,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
      animationFrameRef.current = null;
    });
  }, [refsArray]);

  // Optimized scroll function using requestAnimationFrame and DOM caching
  const scrollAllColumnsToHighlightedTime = useCallback((smooth = true, isManualScroll = false) => {
    if (!timeColumnsContainerRef.current || currentView !== 'list') return;

    // Store initial window scroll position
    const initialWindowScrollY = window.scrollY;
    const initialWindowScrollX = window.scrollX;

    // Helper function to restore window scroll position
    const restoreWindowScroll = () => {
      window.scrollTo({
        left: initialWindowScrollX,
        top: initialWindowScrollY,
        behavior: 'auto' // Use 'auto' to avoid animation
      });
    };

    // Prevent multiple scroll operations from happening simultaneously
    if (scrollInProgressRef.current) {
      console.log('Scroll already in progress, deferring new scroll request');
      // For auto-scrolling due to cancellation, we want to force it even if a scroll is in progress
      if (!isManualScroll) {
        // Force reset the scroll lock for auto-scrolling (e.g., when canceling a selection)
        scrollInProgressRef.current = false;
      } else {
        return;
      }
    }
    
    // Set the lock to prevent other scroll operations
    scrollInProgressRef.current = true;
    
    // Clear any previous animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    console.log(`**** BEGINNING NEW SCROLL OPERATION (${isManualScroll ? 'MANUAL' : 'AUTO'}) ****`);
    
    // For auto-scrolling (like when canceling selections), use a shorter timeout
    // This makes the response feel more immediate
    const timeoutDuration = isManualScroll ? 50 : 0;
    
    setTimeout(() => {
      // Restore window position in case it changed
      restoreWindowScroll();
      
      // Determine which time to scroll to
      const targetTime = isManualScroll && lastManuallySelectedTimeRef.current ? 
                         lastManuallySelectedTimeRef.current : 
                         highlightedTime;
                         
      if (!targetTime) {
        console.log('No target time available for scrolling');
        scrollInProgressRef.current = false;
        return;
      }
      
      // Find all time columns
      const timeColumns = Array.from(timeColumnsContainerRef.current?.querySelectorAll('[role="listbox"]') || []);
      
      if (timeColumns.length === 0) {
        console.log('No time columns found for scrolling');
        scrollInProgressRef.current = false;
        return;
      }
      
      // Get time string to properly match the target time
      const timeKey = targetTime.getTime().toString();
      const formattedTime = format(targetTime, 'h:mm a');
      const hour24 = targetTime.getHours();
      const minutes = targetTime.getMinutes();
      
      console.log(`Attempting to center time: ${formattedTime} (${timeKey})`);

      // Reset all aria-selected attributes first
      timeColumns.forEach(column => {
        const options = column.querySelectorAll('[role="option"]');
        options.forEach(option => {
          option.setAttribute('aria-selected', 'false');
          
          // Remove any existing transition classes
          option.classList.remove('scrolling-to-element');
          option.classList.remove('auto-scroll-transition');
          option.classList.remove('user-selected');
        });
      });
      
      // Restore window position again
      restoreWindowScroll();
      
      // First, try to locate the target element in each column using different strategies
      const foundElements: Element[] = [];
      
      timeColumns.forEach((column, columnIndex) => {
        const options = Array.from(column.querySelectorAll('[role="option"]'));
        let foundElement: Element | null = null;
        
        // Try finding by data-key attribute (most precise)
        if (!foundElement) {
          foundElement = options.find(option => {
            const key = option.getAttribute('data-key');
            return key && key.includes(timeKey);
          }) || null;
          
          if (foundElement) {
            console.log(`Column ${columnIndex}: Found by data-key match`);
          }
        }
        
        // If not found, try finding by time text
        if (!foundElement) {
          foundElement = options.find(option => {
            const text = option.textContent || '';
            return text.includes(formattedTime);
          }) || null;
          
          if (foundElement) {
            console.log(`Column ${columnIndex}: Found by text match`);
          }
        }
        
        // If still not found, try by hour and minute
        if (!foundElement) {
          // Try 12-hour format
          const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
          const ampm = hour24 >= 12 ? 'PM' : 'AM';
          const timePattern12 = `${hour12}:${minutes.toString().padStart(2, '0')}`;
          
          foundElement = options.find(option => {
            const text = option.textContent || '';
            return text.includes(timePattern12) && 
                  ((hour24 >= 12 && text.includes('PM')) || 
                   (hour24 < 12 && text.includes('AM')));
          }) || null;
          
          if (foundElement) {
            console.log(`Column ${columnIndex}: Found by 12-hour format match`);
          }
        }
        
        // Last resort - try by index proportional to the day
        if (!foundElement) {
          // Calculate time as percentage of day
          const minuteOfDay = hour24 * 60 + minutes;
          const dayPercentage = minuteOfDay / (24 * 60);
          
          // Apply percentage to column
          const targetIndex = Math.floor(dayPercentage * options.length);
          foundElement = options[targetIndex] || null;
          
          if (foundElement) {
            console.log(`Column ${columnIndex}: No match found, using proportional position (${targetIndex}/${options.length})`);
          }
        }
        
        if (foundElement) {
          foundElements[columnIndex] = foundElement;
          foundElement.setAttribute('aria-selected', 'true');
          
          // Add the appropriate visual feedback class based on whether this is a manual or auto scroll
          if (isManualScroll) {
            // For manual selection, highlight with a pink pulse
            foundElement.classList.add('scrolling-to-element');
            setTimeout(() => {
              foundElement?.classList.remove('scrolling-to-element');
              restoreWindowScroll(); // Restore window scroll after animation
            }, 1000);
          } else {
            // For automatic selection (like when canceling selections), use a blue pulse
            foundElement.classList.add('auto-scroll-transition');
            setTimeout(() => {
              foundElement?.classList.remove('auto-scroll-transition');
              restoreWindowScroll(); // Restore window scroll after animation
            }, 1200);
          }
        } else {
          console.error(`Column ${columnIndex}: Failed to find any matching element`);
        }
      });
      
      // Restore window position again
      restoreWindowScroll();
      
      console.log(`Found ${foundElements.filter(Boolean).length} matching elements across ${timeColumns.length} columns`);
      
      // Calculate the best scroll position that will center the selected time in all columns
      let bestReferenceColumn: Element | null = null;
      let bestScrollPosition: number | null = null;
      let bestFoundElement: Element | null = null;
      
      // First pass: find the best column to use as reference (prefer the column where selection was made)
      for (let i = 0; i < timeColumns.length; i++) {
        if (foundElements[i]) {
          const column = timeColumns[i];
          const element = foundElements[i];
          
          // Use this column as reference if it's the first one found or if it contains the manually selected element
          const isManuallySelectedColumn = isManualScroll && 
            element.getAttribute('data-key')?.includes(timeKey);
            
          if (!bestReferenceColumn || isManuallySelectedColumn) {
            bestReferenceColumn = column;
            bestFoundElement = element;
            
            // If this is the manually selected column, we can break early
            if (isManuallySelectedColumn) {
              break;
            }
          }
        }
      }
      
      // If no reference column was found, we can't proceed
      if (!bestReferenceColumn || !bestFoundElement) {
        console.error('Failed to find any suitable reference column');
        scrollInProgressRef.current = false;
        
        // Remove highlight classes
        timeColumns.forEach(column => {
          const options = column.querySelectorAll('.scrolling-to-element');
          options.forEach(option => option.classList.remove('scrolling-to-element'));
        });
        
        // Restore window position before returning
        restoreWindowScroll();
        return;
      }
      
      // Calculate the target scroll position that will center the element in the viewport
      const columnRect = bestReferenceColumn.getBoundingClientRect();
      const elementRect = bestFoundElement.getBoundingClientRect();
      
      // Calculate the ideal position to center the element in the column
      const columnHeight = bestReferenceColumn.clientHeight;
      const elementHeight = bestFoundElement.clientHeight || 40; // Default to 40px if not available
      
      // Calculate the offset needed to center the element in the visible area
      // We want to position the element so that it's exactly in the middle of the visible column
      const visibleColumnCenter = columnHeight / 2;
      const elementOffset = elementRect.top - columnRect.top;
      
      // Calculate the target scroll position
      bestScrollPosition = bestReferenceColumn.scrollTop + elementOffset - visibleColumnCenter + (elementHeight / 2);
      
      // Make sure the calculated position is valid
      if (bestScrollPosition < 0) {
        console.warn(`Calculated negative scroll position (${bestScrollPosition}), clamping to 0`);
        bestScrollPosition = 0;
      }
      
      console.log('Calculated scroll position:', {
        columnHeight,
        elementHeight,
        visibleColumnCenter,
        elementOffset,
        currentScrollTop: bestReferenceColumn.scrollTop,
        targetScrollPosition: bestScrollPosition
      });
      
      // Restore window position again
      restoreWindowScroll();
      
      // Apply smooth scrolling to all columns
      const animations: { column: Element, startPosition: number, targetPosition: number }[] = [];
      
      timeColumns.forEach((column) => {
        // Make sure we don't exceed column bounds
        const maxScroll = column.scrollHeight - column.clientHeight;
        let finalPosition = Math.min(Math.max(0, bestScrollPosition), maxScroll);
        
        animations.push({
          column,
          startPosition: column.scrollTop,
          targetPosition: finalPosition
        });
      });
      
      // Use an improved animation with better easing for a smoother UX
      const startTime = performance.now();
      
      // Adjust animation durations based on the type of scroll:
      // - For manual selections, use a longer, more noticeable animation
      // - For auto selections (like cancellations), use a quicker, smoother animation
      const duration = !smooth ? 100 : (isManualScroll ? 600 : 400);
      
      const animateScroll = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Restore window position during each animation frame
        restoreWindowScroll();
        
        // Use different easing functions based on type of scroll
        // - For manual: strong bounce effect (cubic)
        // - For auto: gentler ease-out (quadratic)
        let eased;
        if (isManualScroll) {
          // Cubic easing for manual selections (more pronounced)
          eased = 1 - Math.pow(1 - progress, 3);
        } else {
          // Quadratic easing for auto selections (smoother, more subtle)
          eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        }
        
        animations.forEach(({ column, startPosition, targetPosition }) => {
          const currentPosition = startPosition + (targetPosition - startPosition) * eased;
          column.scrollTop = currentPosition;
        });
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateScroll);
        } else {
          // Ensure we hit the exact position at the end
          animations.forEach(({ column, targetPosition }) => {
            column.scrollTop = targetPosition;
          });
          
          // Restore window position again
          restoreWindowScroll();
          
          // Clear the animation frame reference
          animationFrameRef.current = null;
          
          // Release the scroll lock
          scrollInProgressRef.current = false;
          
          console.log('Scroll animation complete');
          
          // Final window position restoration
          setTimeout(restoreWindowScroll, 50);
          setTimeout(restoreWindowScroll, 150);
        }
      };
      
      // Start the animation
      animationFrameRef.current = requestAnimationFrame(animateScroll);
    }, timeoutDuration);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      scrollInProgressRef.current = false;
      
      // Restore window position in cleanup
      restoreWindowScroll();
    };
  }, [highlightedTime, currentView, isManualSelection, lastManuallySelectedTimeRef]);

  // Clear DOM cache when component updates
  useEffect(() => {
    // Clear the cache when key data changes
    domCacheRef.current = {
      timeColumns: null,
      localTimeElements: new Map(),
      highlightedElements: new Map(),
    };
  }, [currentView, selectedTimezones.length]);

  const handleTimeSelection = useCallback((time: Date) => {
    console.log('Manual time selection:', time);
    console.log('Time details:', {
      timestamp: time.getTime(),
      formatted: format(time, 'h:mm a'),
      hour: time.getHours(),
      minute: time.getMinutes()
    });
    
    // Store initial window scroll position
    const initialWindowScrollY = window.scrollY;
    const initialWindowScrollX = window.scrollX;
    
    // Store the manually selected time
    lastManuallySelectedTimeRef.current = time;
    
    // Set state
    setHighlightedTime(time);
    setIgnoreNextClick(true);
    setIsManualSelection(true);
    
    // Clear any existing manual selection timeout
    if (manualSelectionTimeoutRef.current) {
      clearTimeout(manualSelectionTimeoutRef.current);
    }
    
    // Set a new timeout
    manualSelectionTimeoutRef.current = setTimeout(() => {
      console.log('Manual selection timed out after inactivity');
      
      // Store the current highlighted time before resetting
      const previouslySelectedTime = lastManuallySelectedTimeRef.current;
      
      // Reset the manual selection flags
      setIsManualSelection(false);
      lastManuallySelectedTimeRef.current = null;
      manualSelectionTimeoutRef.current = null;
      
      // Only update if we're in list view
      if (currentView === 'list') {
        // Don't immediately set highlightedTime to null - that would cause a jarring snap
        // Instead, first scroll smoothly to the current time
        if (localTime) {
          const roundedLocalTime = roundToNearestIncrement(localTime, 30);
          
          // Find the time slot that corresponds to current local time
          const matchingTimeSlot = timeSlots.find(time => {
            return time.getFullYear() === roundedLocalTime.getFullYear() &&
                  time.getMonth() === roundedLocalTime.getMonth() &&
                  time.getDate() === roundedLocalTime.getDate() &&
                  time.getHours() === roundedLocalTime.getHours() &&
                  time.getMinutes() === roundedLocalTime.getMinutes();
          });
          
          if (matchingTimeSlot) {
            // Only update if the previous selection is different from current time
            if (previouslySelectedTime && 
                (previouslySelectedTime.getTime() !== matchingTimeSlot.getTime())) {
                
              console.log('Selection timed out - smoothly transitioning to current time');
              
              // Ensure any in-progress scroll is cancelled
              scrollInProgressRef.current = false;
              
              // Set the highlighted time to the current time
              setHighlightedTime(matchingTimeSlot);
              
              // Force immediate scroll with requestAnimationFrame for better responsiveness
              requestAnimationFrame(() => {
                scrollAllColumnsToHighlightedTime(true, false);
              });
            }
          }
        }
      }
    }, MANUAL_SELECTION_TIMEOUT);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      setIgnoreNextClick(false);
    }, 50);

    // Cancel any existing animations
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Ensure all in-progress scrolling is complete
    scrollInProgressRef.current = false;
    
    // Add visual focus indication to show that a time was selected
    // This gives immediate feedback before scrolling starts
    const addFocusIndicator = () => {
      if (!timeColumnsContainerRef.current) return;
      
      const timeColumns = Array.from(timeColumnsContainerRef.current.querySelectorAll('[role="listbox"]') || []);
      const timeKey = time.getTime().toString();
      
      timeColumns.forEach(column => {
        const options = Array.from(column.querySelectorAll('[role="option"]'));
        const selectedElement = options.find(option => {
          const key = option.getAttribute('data-key');
          return key && key.includes(timeKey);
        });
        
        if (selectedElement) {
          // Add a temporary focus class for immediate visual feedback
          selectedElement.classList.add('user-selected');
          
          // Remove the class after animation completes
          setTimeout(() => {
            selectedElement.classList.remove('user-selected');
          }, 1500);
        }
      });
    };
    
    // First provide immediate visual feedback
    addFocusIndicator();
    
    // Then scroll to the selected time with a slight delay
    // This helps the user understand what's happening
    setTimeout(() => {
      console.log('Now executing scroll to selected time:', format(time, 'h:mm a'));
      
      // Preserve the window scroll position during column scrolling
      const preserveScrollPosition = () => {
        window.scrollTo({
          left: initialWindowScrollX,
          top: initialWindowScrollY,
          behavior: 'auto'
        });
      };
      
      // Start the actual column scrolling
      scrollAllColumnsToHighlightedTime(true, true);
      
      // Restore scroll position immediately and after a short delay to ensure it works
      preserveScrollPosition();
      setTimeout(preserveScrollPosition, 50);
      setTimeout(preserveScrollPosition, 150);
    }, 150);
  }, [scrollAllColumnsToHighlightedTime, currentView, localTime, roundToNearestIncrement, timeSlots]);

  // Modify the automatic time tracking effect to respect manual selections
  useEffect(() => {
    if (localTime && timeSlots.length > 0 && mounted) {
      // Skip the very first update after mount
      if (!highlightedTime && initialSelectionDone) {
        // Don't auto-select on initial page load, but allow manual selection
        return;
      }

      // CRITICAL: Skip updating highlightedTime if there is a manual selection
      // This prevents automatic current-time updates from overriding user selection
      if (isManualSelection && lastManuallySelectedTimeRef.current) {
        return;
      }
      
      // Only proceed with automatic updates if there's no manual selection
      const roundedLocalTime = roundToNearestIncrement(localTime, 30);
      
      // Find the time slot that corresponds with the current time by comparing timestamps
      // instead of formatted strings for more reliable comparison
      const timeIndex = timeSlots.findIndex(time => {
        // Compare at the level of minutes, ignoring seconds
        return time.getFullYear() === roundedLocalTime.getFullYear() &&
              time.getMonth() === roundedLocalTime.getMonth() &&
              time.getDate() === roundedLocalTime.getDate() &&
              time.getHours() === roundedLocalTime.getHours() &&
              time.getMinutes() === roundedLocalTime.getMinutes();
      });

      if (timeIndex !== -1) {
        const targetTime = timeSlots[timeIndex];
        setHighlightedTime(targetTime);
      } else {
        // If exact match not found, find closest time slot
        let closestIndex = 0;
        let minDiff = Infinity;
        
        timeSlots.forEach((time, index) => {
          const diff = Math.abs(time.getTime() - roundedLocalTime.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = index;
          }
        });
        
        setHighlightedTime(timeSlots[closestIndex]);
      }
    }
  }, [localTime, timeSlots, mounted, initialSelectionDone, isManualSelection, roundToNearestIncrement]);

  // Optimized effect for handling scrolling on time selection - modify to respect manual selection
  useEffect(() => {
    if (!mounted || currentView !== 'list') return;
    
    // Cancel any existing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame instead of setTimeout
    animationFrameRef.current = requestAnimationFrame(() => {
      if (highlightedTime) {
        // Pass isManualSelection flag to tell scrollAllColumnsToHighlightedTime whether this is a manual or auto scroll
        const isManualScroll = isManualSelection && lastManuallySelectedTimeRef.current === highlightedTime;
        scrollAllColumnsToHighlightedTime(true, isManualScroll);
      } else {
        // If no time is highlighted, scroll to the middle of each column
        // Only do this if there's no manual selection active
        if (!isManualSelection) {
          const timeColumns = timeColumnsContainerRef.current?.querySelectorAll('[role="listbox"]');
          if (timeColumns) {
            let index = 0;
            const processColumn = () => {
              if (index >= timeColumns.length) return;
              const column = timeColumns[index];
              column.scrollTop = column.scrollHeight / 2;
              index++;
              requestAnimationFrame(processColumn);
            };
            requestAnimationFrame(processColumn);
          }
        }
      }
      animationFrameRef.current = null;
    });
    
    // Cleanup function to cancel animation frames
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [highlightedTime, currentView, mounted, scrollAllColumnsToHighlightedTime, isManualSelection]);

  // Optimized function to scroll to current local time slot
  const scrollToCurrentLocalTimeSlot = useCallback(() => {
    // Skip if not in list view or container ref not available
    if (!timeColumnsContainerRef.current || currentView !== 'list' || !localTime) {
      return;
    }
    
    // Don't start a new scroll operation if one is already in progress
    if (scrollInProgressRef.current) return;
    
    // Skip scrolling to current time if the user has manually selected a time
    if (isManualSelection && highlightedTime) {
      return;
    }
    
    scrollInProgressRef.current = true;
    
    // Clear existing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for better performance
    animationFrameRef.current = requestAnimationFrame(() => {
      console.log('Scrolling to current local time slot');
      
      // Store initial window scroll position
      const initialWindowScrollY = window.scrollY;
      const initialWindowScrollX = window.scrollX;
      
      // Find all time columns
      let timeColumns = domCacheRef.current.timeColumns;
      
      if (!timeColumns || timeColumns.length === 0) {
        if (timeColumnsContainerRef.current) {
          timeColumns = Array.from(timeColumnsContainerRef.current.querySelectorAll('[role="listbox"]'));
          domCacheRef.current.timeColumns = timeColumns;
        } else {
          scrollInProgressRef.current = false;
          animationFrameRef.current = null;
          return;
        }
      }
      
      if (timeColumns.length === 0) {
        console.log('No columns found for local time scrolling');
        scrollInProgressRef.current = false;
        animationFrameRef.current = null;
        return;
      }
      
      // Process columns in batches for better performance
      let index = 0;
      const processColumn = () => {
        if (index >= timeColumns!.length) {
          // All columns processed
          scrollInProgressRef.current = false;
          animationFrameRef.current = null;
          
          // Restore window scroll position
          window.scrollTo({
            left: initialWindowScrollX,
            top: initialWindowScrollY,
            behavior: 'auto' // Use 'auto' to avoid additional animation
          });
          return;
        }
        
        const column = timeColumns![index];
        
        // Check cache first
        let localTimeElements = domCacheRef.current.localTimeElements.get(column);
        
        if (!localTimeElements) {
          localTimeElements = Array.from(column.querySelectorAll('[data-local-time="true"]'));
          domCacheRef.current.localTimeElements.set(column, localTimeElements);
        }
        
        if (localTimeElements.length > 0) {
          // Calculate scroll position manually instead of using scrollIntoView
          const element = localTimeElements[0];
          const columnRect = column.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          
          // Calculate the scroll position that would center the element
          const offset = elementRect.top - columnRect.top;
          const center = column.clientHeight / 2 - element.clientHeight / 2;
          const scrollTarget = column.scrollTop + offset - center;
          
          // Apply the scroll
          column.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
          });
        }
        
        // Process next column
        index++;
        requestAnimationFrame(processColumn);
      };
      
      // Start processing columns
      processColumn();
    });
  }, [timeColumnsContainerRef, currentView, localTime, isManualSelection, highlightedTime]);

  // Optimized effect for view changes
  useEffect(() => {
    if (currentView === 'list' && mounted) {
      // Clear existing animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Use a shorter delay with requestAnimationFrame
      const timeout = setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(() => {
          // Clear DOM cache when switching views
          domCacheRef.current = {
            timeColumns: null,
            localTimeElements: new Map(),
            highlightedElements: new Map(),
          };
          
          if (highlightedTime) {
            // Use our improved scroll function
            scrollAllColumnsToHighlightedTime(false); // Use false for smooth to avoid janky transitions
          } else if (!isManualSelection) {
            // Only scroll to local time if no manual selection has occurred
            scrollToCurrentLocalTimeSlot();
          }
          
          animationFrameRef.current = null;
        });
      }, 200); // Reduced from 500ms
      
      return () => {
        clearTimeout(timeout);
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }
  }, [currentView, mounted, highlightedTime, scrollAllColumnsToHighlightedTime, scrollToCurrentLocalTimeSlot, isManualSelection]);

  // Initialize when component mounts
  useEffect(() => {
    if (mounted) return;
    setMounted(true);
    
    // Detect user's timezone
    const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserLocalTimezone(userTZ);
    
    // Get current time and round to nearest 30min
    const now = new Date();
    const rounded = roundToNearestIncrement(now, 30);
    
    // Batch these state updates together
    setLocalTime(rounded);
    
    // Generate time slots around the current time
    const slots = generateTimeSlots(30, rounded);
    setTimeSlots(slots);
    setInitialSelectionDone(true);
    
    // Start contextual notifications for demo purposes
    startContextualNotifications(userTZ);
    
    // Store initial window scroll position to prevent page jump
    const initialWindowScrollY = window.scrollY;
    const initialWindowScrollX = window.scrollX;
    
    // Use requestAnimationFrame for initial scroll with a slightly longer delay
    // to ensure component is fully rendered and measured
    requestAnimationFrame(() => {
      // Delay to ensure the component has rendered and all measurements are accurate
      setTimeout(() => {
        // Start scrolling operations
        scrollToCurrentLocalTimeSlot();
        
        // Restore original window scroll position right after initiating column scrolls
        requestAnimationFrame(() => {
          window.scrollTo({
            left: initialWindowScrollX,
            top: initialWindowScrollY,
            behavior: 'auto'
          });
        });
      }, 200); // Slightly longer delay for better initial render stability
    });
  }, [mounted, roundToNearestIncrement, scrollToCurrentLocalTimeSlot]);

  // Optimized timer to update the local time every minute
  useEffect(() => {
    if (!mounted) return;

    // Update local time every minute to keep in sync
    const timer = setInterval(() => {
      const currentTime = new Date();
      setLocalTime(currentTime);
      
      // Only scroll to current time if no manual selection is active
      if (!isManualSelection || !highlightedTime) {
        // Use requestAnimationFrame instead of setTimeout
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          if (currentView === 'list') {
            // In list view, use our dedicated function
            scrollToCurrentLocalTimeSlot();
          } else {
            // For other views, might need view-specific handling
            console.log('Auto-tracking in non-list view');
          }
          animationFrameRef.current = null;
        });
      }
    }, 60000); // 60000 ms = 1 minute
    
    // Clean up timer and animation frames on unmount
    return () => {
      clearInterval(timer);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [mounted, scrollToCurrentLocalTimeSlot, currentView, isManualSelection, highlightedTime]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Update list of active timezones for syncing
    const values = selectedTimezones.map(tz => tz.value);
    setTimezoneValues(values);
    setActiveTimezones([userLocalTimezone, ...values]);
  }, [selectedTimezones, userLocalTimezone]);

  // Keyboard navigation - update to track last manually selected time
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear selection on Escape key
      if (e.key === 'Escape' && highlightedTime) {
        // Don't immediately set highlighted time to null, which causes a jarring snap
        // Instead, find the current time slot and smoothly scroll to it
        if (localTime && currentView === 'list') {
          // Store initial window scroll position
          const initialWindowScrollY = window.scrollY;
          const initialWindowScrollX = window.scrollX;
          
          const roundedLocalTime = roundToNearestIncrement(localTime, 30);
          
          // Find the time slot that corresponds to the current time
          const currentTimeSlot = timeSlots.find(time => {
            return time.getFullYear() === roundedLocalTime.getFullYear() &&
                  time.getMonth() === roundedLocalTime.getMonth() &&
                  time.getDate() === roundedLocalTime.getDate() &&
                  time.getHours() === roundedLocalTime.getHours() &&
                  time.getMinutes() === roundedLocalTime.getMinutes();
          });
          
          if (currentTimeSlot) {
            console.log('Escape pressed - cancelling selection and returning to current time');
            
            // First reset selection state
            setIsManualSelection(false);
            const previousSelection = lastManuallySelectedTimeRef.current;
            lastManuallySelectedTimeRef.current = null;
            
            // Clear any manual selection timeout
            if (manualSelectionTimeoutRef.current) {
              clearTimeout(manualSelectionTimeoutRef.current);
              manualSelectionTimeoutRef.current = null;
            }
            
            // Ensure any in-progress scroll is cancelled
            scrollInProgressRef.current = false;
            
            // Clear the highlighted time
            setHighlightedTime(null);
            
            // Find all time columns
            const listViewContainer = timeColumnsContainerRef.current;
            if (!listViewContainer) return;
            
            // Don't use the previous scrollAllColumnsToHighlightedTime which might affect page scroll
            requestAnimationFrame(() => {
              // Find all time columns
              const timeColumns = Array.from(listViewContainer.querySelectorAll('[role="listbox"]') || []);
              if (timeColumns.length === 0) return;
              
              // For each column, find the time element that matches the current time
              timeColumns.forEach(column => {
                const options = Array.from(column.querySelectorAll('[role="option"]'));
                const currentTimeElement = options.find(option => {
                  const timeText = format(currentTimeSlot, 'h:mm a');
                  return option.textContent?.includes(timeText);
                });
                
                // If found, scroll to it
                if (currentTimeElement) {
                  // Add a temporary highlight class to show the auto-scroll effect
                  currentTimeElement.classList.add('auto-scroll-transition');
                  setTimeout(() => {
                    currentTimeElement.classList.remove('auto-scroll-transition');
                  }, 1200);
                  
                  // Calculate scroll position manually instead of using scrollIntoView
                  const columnRect = column.getBoundingClientRect();
                  const elementRect = currentTimeElement.getBoundingClientRect();
                  
                  // Calculate the scroll position that would center the element
                  const offset = elementRect.top - columnRect.top;
                  const center = column.clientHeight / 2 - currentTimeElement.clientHeight / 2;
                  const scrollTarget = column.scrollTop + offset - center;
                  
                  // Apply the scroll to just the column
                  column.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                  });
                }
              });
              
              // Restore window scroll position after scrolling columns
              setTimeout(() => {
                window.scrollTo({
                  left: initialWindowScrollX,
                  top: initialWindowScrollY,
                  behavior: 'auto'
                });
              }, 100);
            });
          } else {
            // Fallback if no matching time slot found
            setHighlightedTime(null);
            setIsManualSelection(false);
            lastManuallySelectedTimeRef.current = null;
            
            if (manualSelectionTimeoutRef.current) {
              clearTimeout(manualSelectionTimeoutRef.current);
              manualSelectionTimeoutRef.current = null;
            }
          }
        } else {
          // In other views or if no local time, just reset
          setHighlightedTime(null);
          setIsManualSelection(false);
          lastManuallySelectedTimeRef.current = null;
          
          if (manualSelectionTimeoutRef.current) {
            clearTimeout(manualSelectionTimeoutRef.current);
            manualSelectionTimeoutRef.current = null;
          }
        }
        
        return;
      }
      
      if (!highlightedTime || !timeSlots.length) return;
      
      const currentIndex = timeSlots.findIndex(
        time => time.getTime() === highlightedTime.getTime()
      );
      
      if (currentIndex === -1) return;
      
      let newIndex = currentIndex;
      
      switch (e.key) {
        case 'ArrowUp':
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowDown':
          newIndex = Math.min(timeSlots.length - 1, currentIndex + 1);
          break;
        case 'PageUp':
          // Move up by approximately 2 hours (4 slots at 30 min intervals)
          newIndex = Math.max(0, currentIndex - 4);
          break;
        case 'PageDown':
          // Move down by approximately 2 hours (4 slots at 30 min intervals)
          newIndex = Math.min(timeSlots.length - 1, currentIndex + 4);
          break;
        case 'Home':
          if (localTime) {
            const roundedLocalTime = roundToNearestIncrement(localTime, 30);
            
            // Find the exact time slot for current local time
            newIndex = timeSlots.findIndex(time => {
              return time.getFullYear() === roundedLocalTime.getFullYear() &&
                    time.getMonth() === roundedLocalTime.getMonth() &&
                    time.getDate() === roundedLocalTime.getDate() &&
                    time.getHours() === roundedLocalTime.getHours() &&
                    time.getMinutes() === roundedLocalTime.getMinutes();
            });
            
            if (newIndex === -1) {
              // Find the closest time to current time if exact match not found
              const localTimeMs = roundedLocalTime.getTime();
              let minDiff = Infinity;
              
              timeSlots.forEach((time, idx) => {
                const diff = Math.abs(time.getTime() - localTimeMs);
                if (diff < minDiff) {
                  minDiff = diff;
                  newIndex = idx;
                }
              });
            }
          }
          break;
        default:
          return;
      }
      
      if (newIndex !== currentIndex) {
        e.preventDefault();
        const newTime = timeSlots[newIndex];
        setHighlightedTime(newTime);
        setIsManualSelection(true); // Set manual selection flag
        lastManuallySelectedTimeRef.current = newTime;
        
        // Reset manual selection timeout
        if (manualSelectionTimeoutRef.current) {
          clearTimeout(manualSelectionTimeoutRef.current);
        }
        
        // Set a new timeout for the manual selection
        manualSelectionTimeoutRef.current = setTimeout(() => {
          console.log('Manual selection timed out after inactivity');
          setIsManualSelection(false);
          lastManuallySelectedTimeRef.current = null;
          manualSelectionTimeoutRef.current = null;
        }, MANUAL_SELECTION_TIMEOUT);
        
        // Scroll will happen automatically through our consolidated scrolling effect
        // We don't need to call scrollColumn manually here
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    highlightedTime, 
    timeSlots, 
    localTime, 
    activeTimezones, 
    roundToNearestIncrement, 
    currentView, 
    scrollAllColumnsToHighlightedTime
  ]);

  // Add effect to handle clicks outside time columns - update to reset lastManuallySelectedTimeRef
  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if we should ignore this click
      if (ignoreNextClick) {
        setIgnoreNextClick(false); // Reset the flag immediately
        return;
      }

      // Don't clear selection when in other views
      if (currentView !== 'list') return;
      
      // Get the local column element from the ListView component
      const listViewContainer = timeColumnsContainerRef.current;
      if (!listViewContainer) return;
      
      // Find all time columns in the ListView
      const timeColumns = listViewContainer.querySelectorAll('[role="listbox"]');
      
      // Also find all individual time slot elements that could be clicked
      const timeSlotElements = listViewContainer.querySelectorAll('[role="option"]');
      
      // Check if the click was directly on a time slot (we want to keep selection in this case)
      const isOnTimeSlot = Array.from(timeSlotElements).some(slot => 
        slot === event.target || slot.contains(event.target as Node)
      );
      
      // If clicking on a time slot, don't clear the selection
      if (isOnTimeSlot) return;
      
      // Check if the click was inside any time column
      let isInsideTimeColumn = false;
      
      // Check the container itself
      if (listViewContainer.contains(event.target as Node)) {
        // Now check if the click was specifically in a time column
        isInsideTimeColumn = Array.from(timeColumns).some(column => 
          column.contains(event.target as Node)
        );
      }
      
      // If clicking outside time columns and we have a highlighted time
      if (!isInsideTimeColumn && highlightedTime) {
        console.log('Click outside detected - cancelling selection');
        
        // First clear the highlighted time
        setHighlightedTime(null);
        
        // Cancel any in-progress scrolling immediately
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        scrollInProgressRef.current = false;
        
        // Reset manual selection flags right away
        setIsManualSelection(false);
        lastManuallySelectedTimeRef.current = null;
        
        // Clear any manual selection timeout
        if (manualSelectionTimeoutRef.current) {
          clearTimeout(manualSelectionTimeoutRef.current);
          manualSelectionTimeoutRef.current = null;
        }
        
        // Force immediate scrolling to current time without highlighting it
        if (localTime && currentView === 'list') {
          const roundedLocalTime = roundToNearestIncrement(localTime, 30);
          
          // Find the current time slot
          const currentTimeSlot = timeSlots.find(time => {
            return time.getFullYear() === roundedLocalTime.getFullYear() &&
                  time.getMonth() === roundedLocalTime.getMonth() &&
                  time.getDate() === roundedLocalTime.getDate() &&
                  time.getHours() === roundedLocalTime.getHours() &&
                  time.getMinutes() === roundedLocalTime.getMinutes();
          });
          
          if (currentTimeSlot) {
            // Store initial window scroll position
            const initialWindowScrollY = window.scrollY;
            const initialWindowScrollX = window.scrollX;
            
            // Manually scroll to the current time using DOM APIs instead of updating state
            requestAnimationFrame(() => {
              // Find all time columns
              const timeColumns = Array.from(listViewContainer.querySelectorAll('[role="listbox"]') || []);
              if (timeColumns.length === 0) return;
              
              // For each column, find the time element that matches the current time
              timeColumns.forEach(column => {
                const options = Array.from(column.querySelectorAll('[role="option"]'));
                const currentTimeElement = options.find(option => {
                  const isLocalTime = option.getAttribute('data-local-time') === 'true';
                  return isLocalTime;
                });
                
                // If found, scroll to it
                if (currentTimeElement) {
                  // Add a temporary highlight class to show the auto-scroll effect
                  currentTimeElement.classList.add('auto-scroll-transition');
                  setTimeout(() => {
                    currentTimeElement.classList.remove('auto-scroll-transition');
                  }, 1200);
                  
                  // Calculate scroll position manually instead of using scrollIntoView
                  const columnRect = column.getBoundingClientRect();
                  const elementRect = currentTimeElement.getBoundingClientRect();
                  
                  // Calculate the scroll position that would center the element
                  const offset = elementRect.top - columnRect.top;
                  const center = column.clientHeight / 2 - currentTimeElement.clientHeight / 2;
                  const scrollTarget = column.scrollTop + offset - center;
                  
                  // Apply the scroll to just the column
                  column.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                  });
                }
              });
              
              // Restore window scroll position after a short delay to ensure all animations are complete
              setTimeout(() => {
                window.scrollTo({
                  left: initialWindowScrollX,
                  top: initialWindowScrollY,
                  behavior: 'auto'
                });
              }, 100);
            });
          }
        }
      }
    };
    
    // Add the global click listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    mounted, 
    highlightedTime, 
    ignoreNextClick, 
    currentView, 
    localTime, 
    timeSlots, 
    roundToNearestIncrement, 
    isManualSelection
  ]);

  // Cleanup timers and animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (manualSelectionTimeoutRef.current) {
        clearTimeout(manualSelectionTimeoutRef.current);
        manualSelectionTimeoutRef.current = null;
      }
    };
  }, []);

  // Function to toggle dashboard visibility
  const toggleDashboard = () => {
    setIsDashboardVisible((prev: boolean) => {
      const newValue = !prev;
      Cookies.set('dashboardVisible', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Check if we're in a mounting phase
  if (!mounted) {
    return <div className="p-8 text-white text-center">Loading World Clock...</div>;
  }

  return (
    <div 
      className="p-8 w-full"
      ref={clockContainerRef}
      role="application"
      aria-label="World Clock Application"
    >
      <h2 className="text-2xl font-bold text-white mb-6 text-center">World Clock</h2>
      
      {/* View Switcher */}
      <div className="flex justify-between items-center mb-4">
        <ViewSwitcher />
      </div>
      
      {/* Dashboard Toggle Button */}
      <div className="flex justify-center mb-4">
        <button 
          onClick={toggleDashboard} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Toggle Dashboard
        </button>
      </div>
      
      {/* Dynamic View Rendering */}
      <div className="flex justify-center w-full">
        {currentView === 'list' && (
          <div 
            ref={timeColumnsContainerRef}
            className="isolate overflow-hidden" // Add CSS containment
            style={{ 
              contain: 'paint layout', // Contain layout and paint operations 
              isolation: 'isolate', // Further isolate the stacking context
              position: 'relative' // Establish a positioning context
            }}
          >
            <ListView 
              selectedTimezones={selectedTimezones}
              userLocalTimezone={userLocalTimezone}
              timeSlots={timeSlots}
              localTime={localTime}
              highlightedTime={highlightedTime}
              handleTimeSelection={handleTimeSelection}
              setSelectedTimezones={setSelectedTimezones}
              roundToNearestIncrement={roundToNearestIncrement}
            />
          </div>
        )}
        
        {currentView === 'clocks' && (
          <ClocksView 
            selectedTimezones={selectedTimezones}
            userLocalTimezone={userLocalTimezone}
            setSelectedTimezones={setSelectedTimezones}
          />
        )}
        
        {currentView === 'digital' && (
          <DigitalView 
            selectedTimezones={selectedTimezones}
            userLocalTimezone={userLocalTimezone}
            setSelectedTimezones={setSelectedTimezones}
          />
        )}
      </div>

      {/* Conditional Rendering of Dashboard */}
      {isDashboardVisible && (
        <div className="flex justify-center w-full mt-8 pb-12">
          <div 
            className="grid grid-cols-5 gap-4 w-full max-w-7xl"
            role="region" 
            aria-label="Weather Information for Timezones"
          >
            {/* Weather for Local Time */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
              <h3 className="font-bold text-white text-center mb-2">Your Time</h3>
              <div className="mt-2">
                <ContextualInfo timezone={userLocalTimezone} />
                <PersonalNotes timezone={userLocalTimezone} />
              </div>
            </div>

            {/* Weather for Selected Timezones */}
            {selectedTimezones.map((tz, idx) => (
              <div 
                key={idx} 
                className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center"
              >
                <h3 className="font-bold text-white text-center mb-2">{tz.label.split('/').pop()?.replace('_', ' ') || tz.label}</h3>
                <div className="mt-2">
                  <ContextualInfo timezone={tz.value} />
                  <PersonalNotes timezone={tz.value} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Navigation Help - Only show in list view */}
      {currentView === 'list' && (
        <div className="fixed bottom-4 left-4 text-sm text-gray-400 bg-gray-800 p-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200">
          <p>Keyboard Navigation:</p>
          <ul className="list-disc list-inside">
            <li>↑↓: Navigate 30 minutes</li>
            <li>Page Up/Down: Navigate hours</li>
            <li>Home: Current time</li>
          </ul>
        </div>
      )}
    </div>
  );
}