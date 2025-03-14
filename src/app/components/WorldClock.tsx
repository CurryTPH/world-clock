"use client";
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
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
import { useView, ViewType } from '../contexts/ViewContext';
import { useDashboard } from '../contexts/DashboardContext';
import Cookies from 'js-cookie';
import DashboardToggle from './DashboardToggle';

import { ListView, ClocksView, DigitalView } from './views';


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
  const roundedBaseDate = roundToNearestIncrement(baseDate, interval);
  const timeMap = new Map(); // Use a Map for better performance with complex keys
  const result = [];
  
// Generate slots for previous, current, and next day
  for (let dayOffset = -1; dayOffset <= 1; dayOffset++) {
    const date = new Date(roundedBaseDate);
    date.setDate(date.getDate() + dayOffset);
    
// Reset hours and minutes to start of day
    date.setHours(0, 0, 0, 0);
    
    for (let minutes = 0; minutes < 24 * 60; minutes += interval) {
      const time = new Date(date);
      time.setMinutes(time.getMinutes() + minutes);
      
      const timeKey = time.getTime();
      
      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, time);
        result.push(time);
      }
    }
  }
  
  return result.sort((a, b) => a.getTime() - b.getTime());
};

// Utility function for creating throttled functions
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout> | undefined;
  let lastRan: number | undefined;

  return function(this: any, ...args: Parameters<T>): void {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastFunc) {
          clearTimeout(lastFunc);
          lastFunc = undefined;
          func.apply(context, args);
        }
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - (lastRan || 0) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - (lastRan || 0)));
    }
  };
}

// Utility function for creating debounced functions
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

export default function WorldClock() {
  // Prevent duplicate renders during server-side rendering
  const [hasMounted, setHasMounted] = useState(false);
  
  const { currentView } = useView();
  const { isDashboardVisible, toggleDashboard } = useDashboard();

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
  const [timeInterval, setTimeInterval] = useState(30); // Default 30-minute intervals
  const [activeView, setActiveView] = useState<ViewType>(currentView);
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [isDashboardAnimating, setIsDashboardAnimating] = useState(false);
  
  // Effect to track dashboard visibility for animations
  useEffect(() => {
    if (mounted) {
      const isVisible = isDashboardVisible(activeView);
      
      if (dashboardVisible !== isVisible) {
        setIsDashboardAnimating(true);
        // If showing dashboard, update state immediately
        if (isVisible) {
          setDashboardVisible(true);
        } 
        // If hiding dashboard, delay state update until animation completes
        else {
          setTimeout(() => {
            setDashboardVisible(false);
          }, 300); // Match animation duration
        }
        
        // Reset animation flag after animation completes
        setTimeout(() => {
          setIsDashboardAnimating(false);
        }, 350);
      }
    }
  }, [isDashboardVisible, activeView, dashboardVisible, mounted]);
  
  // Initialize dashboard visibility on mount
  useEffect(() => {
    if (mounted && !dashboardVisible) {
      setDashboardVisible(isDashboardVisible(activeView));
    }
  }, [mounted, isDashboardVisible, activeView, dashboardVisible]);
  
  // Effect to handle view transitions
  useEffect(() => {
    if (mounted && activeView !== currentView) {
      setIsViewTransitioning(true);
      // Small timeout to ensure animations complete before switching views
      const timer = setTimeout(() => {
        setActiveView(currentView);
        setIsViewTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentView, activeView, mounted]);
  
  // Memoize the time slots calculation to avoid recalculating on every render
  const timeSlots = useMemo(() => 
    generateTimeSlots(timeInterval, localTime || new Date()), 
    [timeInterval, localTime]
  );
  
  const [localTimeSlots, setLocalTimeSlots] = useState<Date[]>([]);
  const [activeTimezones, setActiveTimezones] = useState<string[]>([]);
  const [timezoneValues, setTimezoneValues] = useState<string[]>([]);
  const [ignoreNextClick, setIgnoreNextClick] = useState(false);
  const [initialSelectionDone, setInitialSelectionDone] = useState(false);
  const [columnsScrolled, setColumnsScrolled] = useState<Set<string>>(new Set());
  const scrollInProgressRef = useRef(false);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const manualSelectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MANUAL_SELECTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  const lastManuallySelectedTimeRef = useRef<Date | null>(null);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const localColumnRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const timeColumnsContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const domCacheRef = useRef<{
    timeColumns: Element[] | null;
    localTimeElements: Map<Element, Element[]>;
    highlightedElements: Map<Element, Element[]>;
  }>({
    timeColumns: null,
    localTimeElements: new Map(),
    highlightedElements: new Map(),
  });
  
  const refsArray = useRef<React.RefObject<HTMLDivElement>[]>([]);
  
  useEffect(() => {
    if (refsArray.current.length !== selectedTimezones.length) {
      refsArray.current = Array(selectedTimezones.length)
        .fill(null)
        .map((_, i) => refsArray.current[i] || React.createRef<HTMLDivElement>());
    }
  }, [selectedTimezones]);
  
  const columnRefs = useMemo(() => refsArray.current, [refsArray.current]);

  // First scrollToTime function
  const scrollToTime = useCallback((targetElement: Element | null) => {
    if (!targetElement) return;
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  // Renamed to scrollColumnToTime to avoid redeclaration
  const scrollColumnToTime = useCallback((columnIndex: number, smooth = true) => {
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
        const columnRect = columnElement.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();
        
        const offset = elementRect.top - columnRect.top;
        const center = columnElement.clientHeight / 2 - (highlightedElement as HTMLElement).clientHeight / 2;
        const scrollTarget = columnElement.scrollTop + offset - center;
        
        columnElement.scrollTo({
          top: scrollTarget,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
      animationFrameRef.current = null;
    });
  }, [refsArray]);

  const scrollAllColumnsToHighlightedTime = useCallback((smooth = true, isManualScroll = false) => {
    if (!timeColumnsContainerRef.current || currentView !== 'list') return;

    const initialWindowScrollY = window.scrollY;
    const initialWindowScrollX = window.scrollX;

 
    const restoreWindowScroll = () => {
      window.scrollTo({
        left: initialWindowScrollX,
        top: initialWindowScrollY,
        behavior: 'auto' 
      });
    };

    if (scrollInProgressRef.current) {
      console.log('Scroll already in progress, deferring new scroll request');
      if (!isManualScroll) {
        scrollInProgressRef.current = false;
      } else {
        return;
      }
    }
    
    scrollInProgressRef.current = true;
    
  // Clear any previous animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    console.log(`**** BEGINNING NEW SCROLL OPERATION (${isManualScroll ? 'MANUAL' : 'AUTO'}) ****`);
    
  // For auto-scrolling use a shorter timeout
    const timeoutDuration = isManualScroll ? 50 : 0;
    
    setTimeout(() => {
      restoreWindowScroll();
      
      const targetTime = isManualScroll && lastManuallySelectedTimeRef.current ? 
                         lastManuallySelectedTimeRef.current : 
                         highlightedTime;
                         
      if (!targetTime) {
        console.log('No target time available for scrolling');
        scrollInProgressRef.current = false;
        return;
      }
      
      const timeColumns = Array.from(timeColumnsContainerRef.current?.querySelectorAll('[role="listbox"]') || []);
      
      if (timeColumns.length === 0) {
        console.log('No time columns found for scrolling');
        scrollInProgressRef.current = false;
        return;
      }
      
      const timeKey = targetTime.getTime().toString();
      const formattedTime = format(targetTime, 'h:mm a');
      const hour24 = targetTime.getHours();
      const minutes = targetTime.getMinutes();
      
      console.log(`Attempting to center time: ${formattedTime} (${timeKey})`);

      timeColumns.forEach(column => {
        const options = column.querySelectorAll('[role="option"]');
        options.forEach(option => {
          option.setAttribute('aria-selected', 'false');
          
          option.classList.remove('scrolling-to-element');
          option.classList.remove('auto-scroll-transition');
          option.classList.remove('user-selected');
        });
      });
      
      restoreWindowScroll();
      
      const foundElements: Element[] = [];
      
      timeColumns.forEach((column, columnIndex) => {
        const options = Array.from(column.querySelectorAll('[role="option"]'));
        let foundElement: Element | null = null;
        
        if (!foundElement) {
          foundElement = options.find(option => {
            const key = option.getAttribute('data-key');
            return key && key.includes(timeKey);
          }) || null;
          
          if (foundElement) {
            console.log(`Column ${columnIndex}: Found by data-key match`);
          }
        }
        
        if (!foundElement) {
          foundElement = options.find(option => {
            const text = option.textContent || '';
            return text.includes(formattedTime);
          }) || null;
          
          if (foundElement) {
            console.log(`Column ${columnIndex}: Found by text match`);
          }
        }
        
        if (!foundElement) {
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
        
        if (!foundElement) {
          const minuteOfDay = hour24 * 60 + minutes;
          const dayPercentage = minuteOfDay / (24 * 60);
          
          const targetIndex = Math.floor(dayPercentage * options.length);
          foundElement = options[targetIndex] || null;
          
          if (foundElement) {
            console.log(`Column ${columnIndex}: No match found, using proportional position (${targetIndex}/${options.length})`);
          }
        }
        
        if (foundElement) {
          foundElements[columnIndex] = foundElement;
          foundElement.setAttribute('aria-selected', 'true');
          
          if (isManualScroll) {
            foundElement.classList.add('scrolling-to-element');
            setTimeout(() => {
              foundElement?.classList.remove('scrolling-to-element');
              restoreWindowScroll(); // Restore window scroll after animation
            }, 1000);
          } else {
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
      
      restoreWindowScroll();
      
      console.log(`Found ${foundElements.filter(Boolean).length} matching elements across ${timeColumns.length} columns`);
      
// Calculate the best scroll position that will center the selected time in all columns
      let bestReferenceColumn: Element | null = null;
      let bestScrollPosition: number | null = null;
      let bestFoundElement: Element | null = null;
      
      for (let i = 0; i < timeColumns.length; i++) {
        if (foundElements[i]) {
          const column = timeColumns[i];
          const element = foundElements[i];
          
          const isManuallySelectedColumn = isManualScroll && 
            element.getAttribute('data-key')?.includes(timeKey);
            
          if (!bestReferenceColumn || isManuallySelectedColumn) {
            bestReferenceColumn = column;
            bestFoundElement = element;
            
            if (isManuallySelectedColumn) {
              break;
            }
          }
        }
      }
      
      if (!bestReferenceColumn || !bestFoundElement) {
        console.error('Failed to find any suitable reference column');
        scrollInProgressRef.current = false;
        
        timeColumns.forEach(column => {
          const options = column.querySelectorAll('.scrolling-to-element');
          options.forEach(option => option.classList.remove('scrolling-to-element'));
        });
        
        restoreWindowScroll();
        return;
      }
      
      const columnRect = bestReferenceColumn.getBoundingClientRect();
      const elementRect = bestFoundElement.getBoundingClientRect();
      
      const columnHeight = bestReferenceColumn.clientHeight;
      const elementHeight = bestFoundElement.clientHeight || 40; // Default to 40px if not available
      

      const visibleColumnCenter = columnHeight / 2;
      const elementOffset = elementRect.top - columnRect.top;
      
      bestScrollPosition = bestReferenceColumn.scrollTop + elementOffset - visibleColumnCenter + (elementHeight / 2);
      
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
      
      restoreWindowScroll();
      
// Apply smooth scrolling to all columns
      const animations: { column: Element, startPosition: number, targetPosition: number }[] = [];
      
      timeColumns.forEach((column) => {
        const maxScroll = column.scrollHeight - column.clientHeight;
        let finalPosition = Math.min(Math.max(0, bestScrollPosition), maxScroll);
        
        animations.push({
          column,
          startPosition: column.scrollTop,
          targetPosition: finalPosition
        });
      });
      
      const startTime = performance.now();
      

      const duration = !smooth ? 100 : (isManualScroll ? 600 : 400);
      
      const animateScroll = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        restoreWindowScroll();
        

        let eased;
        if (isManualScroll) {
          eased = 1 - Math.pow(1 - progress, 3);
        } else {
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
          animations.forEach(({ column, targetPosition }) => {
            column.scrollTop = targetPosition;
          });
          
          restoreWindowScroll();
          
          animationFrameRef.current = null;
          
          scrollInProgressRef.current = false;
          
          console.log('Scroll animation complete');
          
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
      
      restoreWindowScroll();
    };
  }, [highlightedTime, currentView, isManualSelection, lastManuallySelectedTimeRef]);

  useEffect(() => {
    domCacheRef.current = {
      timeColumns: null,
      localTimeElements: new Map(),
      highlightedElements: new Map(),
    };
  }, [currentView, selectedTimezones.length]);

  const handleTimeSelection = useCallback((time: Date) => {
    if (ignoreNextClick) {
      setIgnoreNextClick(false);
      return;
    }
    
    console.log('Manual time selection:', time);
    console.log('Time details:', {
      timestamp: time.getTime(),
      formatted: format(time, 'h:mm a'),
      hour: time.getHours(),
      minute: time.getMinutes()
    });
    
    const initialWindowScrollY = window.scrollY;
    const initialWindowScrollX = window.scrollX;
    
    lastManuallySelectedTimeRef.current = time;
    
    setHighlightedTime(time);
    setIgnoreNextClick(true);
    setIsManualSelection(true);
    
    if (manualSelectionTimeoutRef.current) {
      clearTimeout(manualSelectionTimeoutRef.current);
    }
    
    manualSelectionTimeoutRef.current = setTimeout(() => {
      console.log('Manual selection timed out after inactivity');
      
      const previouslySelectedTime = lastManuallySelectedTimeRef.current;
      
      setIsManualSelection(false);
      lastManuallySelectedTimeRef.current = null;
      manualSelectionTimeoutRef.current = null;
      
// Only update if im in list view
      if (currentView === 'list') {

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
            if (previouslySelectedTime && 
                (previouslySelectedTime.getTime() !== matchingTimeSlot.getTime())) {
                
              console.log('Selection timed out - smoothly transitioning to current time');
              
              scrollInProgressRef.current = false;
              
              setHighlightedTime(matchingTimeSlot);
              
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
    
    scrollInProgressRef.current = false;
    

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
          selectedElement.classList.add('user-selected');
          
          setTimeout(() => {
            selectedElement.classList.remove('user-selected');
          }, 1500);
        }
      });
    };
    
    addFocusIndicator();
    

    setTimeout(() => {
      console.log('Now executing scroll to selected time:', format(time, 'h:mm a'));
      
      const preserveScrollPosition = () => {
        window.scrollTo({
          left: initialWindowScrollX,
          top: initialWindowScrollY,
          behavior: 'auto'
        });
      };
      
// Start the actual column scrolling
      scrollAllColumnsToHighlightedTime(true, true);
      
      preserveScrollPosition();
      setTimeout(preserveScrollPosition, 50);
      setTimeout(preserveScrollPosition, 150);
    }, 150);
  }, [scrollAllColumnsToHighlightedTime, currentView, localTime, roundToNearestIncrement, timeSlots]);

  useEffect(() => {
    if (localTime && timeSlots.length > 0 && mounted) {
      if (!highlightedTime && initialSelectionDone) {
        return;
      }


      if (isManualSelection && lastManuallySelectedTimeRef.current) {
        return;
      }
      
      const roundedLocalTime = roundToNearestIncrement(localTime, 30);
      

      const timeIndex = timeSlots.findIndex(time => {
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

  useEffect(() => {
    if (!mounted || currentView !== 'list') return;
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame instead of setTimeout
    animationFrameRef.current = requestAnimationFrame(() => {
      if (highlightedTime) {
        const isManualScroll = isManualSelection && lastManuallySelectedTimeRef.current === highlightedTime;
        scrollAllColumnsToHighlightedTime(true, isManualScroll);
      } else {

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
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [highlightedTime, currentView, mounted, scrollAllColumnsToHighlightedTime, isManualSelection]);

  const scrollToCurrentLocalTimeSlot = useCallback(() => {
    if (!timeColumnsContainerRef.current || currentView !== 'list' || !localTime) {
      return;
    }
    
    if (scrollInProgressRef.current) return;
    
    if (isManualSelection && highlightedTime) {
      return;
    }
    
    scrollInProgressRef.current = true;
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      console.log('Scrolling to current local time slot');
      
      const initialWindowScrollY = window.scrollY;
      const initialWindowScrollX = window.scrollX;
      
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
      
      let index = 0;
      const processColumn = () => {
        if (index >= timeColumns!.length) {
          scrollInProgressRef.current = false;
          animationFrameRef.current = null;
          
          window.scrollTo({
            left: initialWindowScrollX,
            top: initialWindowScrollY,
            behavior: 'auto' 
          });
          return;
        }
        
        const column = timeColumns![index];
        
        let localTimeElements = domCacheRef.current.localTimeElements.get(column);
        
        if (!localTimeElements) {
          localTimeElements = Array.from(column.querySelectorAll('[data-local-time="true"]'));
          domCacheRef.current.localTimeElements.set(column, localTimeElements);
        }
        
        if (localTimeElements.length > 0) {
          const element = localTimeElements[0];
          const columnRect = column.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          
          const offset = elementRect.top - columnRect.top;
          const center = column.clientHeight / 2 - element.clientHeight / 2;
          const scrollTarget = column.scrollTop + offset - center;
          
          column.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
          });
        }
        
        index++;
        requestAnimationFrame(processColumn);
      };
      
      processColumn();
    });
  }, [timeColumnsContainerRef, currentView, localTime, isManualSelection, highlightedTime]);

  useEffect(() => {
    if (currentView === 'list' && mounted) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      const timeout = setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(() => {
          domCacheRef.current = {
            timeColumns: null,
            localTimeElements: new Map(),
            highlightedElements: new Map(),
          };
          
          if (highlightedTime) {
            scrollAllColumnsToHighlightedTime(false); 
          } else if (!isManualSelection) {
            scrollToCurrentLocalTimeSlot();
          }
          
          animationFrameRef.current = null;
        });
      }, 200); 
      
      return () => {
        clearTimeout(timeout);
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }
  }, [currentView, mounted, highlightedTime, scrollAllColumnsToHighlightedTime, scrollToCurrentLocalTimeSlot, isManualSelection]);

  // Effect for initial mount and timezone detection
  useEffect(() => {
    // Only run once and avoid unnecessary remounts
    if (mounted) return;
    
    // Set mounted first to prevent duplicate initialization
    setMounted(true);
    
    // Use window.requestIdleCallback for non-critical initialization when browsers support it
    const initializeApp = () => {
      try {
        // Detect user's timezone
        const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserLocalTimezone(userTZ);
        
        const now = new Date();
        const rounded = roundToNearestIncrement(now, 30);
        
        setLocalTime(rounded);
        
        // Update timeInterval if needed, timeSlots will be recalculated via useMemo
        setTimeInterval(30);
        setInitialSelectionDone(true);
        
        startContextualNotifications(userTZ);
      } catch (error) {
        console.error("Error initializing WorldClock:", error);
      }
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      // Use requestIdleCallback if available
      // @ts-ignore - TypeScript may not recognize requestIdleCallback
      window.requestIdleCallback(initializeApp, { timeout: 1000 });
    } else {
      // Fall back to setTimeout
      setTimeout(initializeApp, 0);
    }
  }, []);

  // Separate effect for initial scrolling - runs after initialization and only once
  useEffect(() => {
    // Only run this effect after component has been mounted and initialized
    if (!mounted || !initialSelectionDone || !localTime) return;
    
    // Store original scroll position
    const initialWindowScrollY = window.scrollY;
    const initialWindowScrollX = window.scrollX;
    
    // Use a timeout to ensure DOM is fully rendered before scrolling
    const scrollTimeout = setTimeout(() => {
      if (currentView === 'list') {
        // Safely scroll to the current time
        scrollToCurrentLocalTimeSlot();
        
        // Restore original window scroll position after column scrolling
        requestAnimationFrame(() => {
          window.scrollTo({
            left: initialWindowScrollX,
            top: initialWindowScrollY,
            behavior: 'auto'
          });
        });
      }
    }, 300);
    
    return () => clearTimeout(scrollTimeout);
  }, [mounted, initialSelectionDone, localTime, currentView, scrollToCurrentLocalTimeSlot]);

// Optimized timer to update the local time every minute
  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      const currentTime = new Date();
      setLocalTime(currentTime);
      
      if (!isManualSelection || !highlightedTime) {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          if (currentView === 'list') {
            scrollToCurrentLocalTimeSlot();
          } else {
            console.log('Auto-tracking in non-list view');
          }
          animationFrameRef.current = null;
        });
      }
    }, 60000); // 60000 ms = 1 minute
    
    return () => {
      clearInterval(timer);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [mounted, scrollToCurrentLocalTimeSlot, currentView, isManualSelection, highlightedTime]);

// Cleanup animation frames
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const values = selectedTimezones.map(tz => tz.value);
    setTimezoneValues(values);
    setActiveTimezones([userLocalTimezone, ...values]);
  }, [selectedTimezones, userLocalTimezone]);

  useEffect(() => {
    const handleKeyDown = throttle((e: KeyboardEvent) => {
      // Clear selection on Escape key
      if (e.key === 'Escape' && highlightedTime) {
        if (localTime && currentView === 'list') {
          const initialWindowScrollY = window.scrollY;
          const initialWindowScrollX = window.scrollX;
          const roundedLocalTime = roundToNearestIncrement(localTime, 30);
          const currentTimeSlot = timeSlots.find(time => {
            return time.getFullYear() === roundedLocalTime.getFullYear() &&
                  time.getMonth() === roundedLocalTime.getMonth() &&
                  time.getDate() === roundedLocalTime.getDate() &&
                  time.getHours() === roundedLocalTime.getHours() &&
                  time.getMinutes() === roundedLocalTime.getMinutes();
          });
          
          if (currentTimeSlot) {
            console.log('Escape pressed - cancelling selection and returning to current time');
            
            setIsManualSelection(false);
            const previousSelection = lastManuallySelectedTimeRef.current;
            lastManuallySelectedTimeRef.current = null;

            if (manualSelectionTimeoutRef.current) {
              clearTimeout(manualSelectionTimeoutRef.current);
              manualSelectionTimeoutRef.current = null;
            }
            
            scrollInProgressRef.current = false;
            
            setHighlightedTime(null);
            
            const listViewContainer = timeColumnsContainerRef.current;
            if (!listViewContainer) return;
            
            requestAnimationFrame(() => {
              const timeColumns = Array.from(listViewContainer.querySelectorAll('[role="listbox"]') || []);
              if (timeColumns.length === 0) return;
              
              timeColumns.forEach(column => {
                const options = Array.from(column.querySelectorAll('[role="option"]'));
                const currentTimeElement = options.find(option => {
                  const timeText = format(currentTimeSlot, 'h:mm a');
                  return option.textContent?.includes(timeText);
                });
                
// If found, scroll to it
                if (currentTimeElement) {
                  currentTimeElement.classList.add('auto-scroll-transition');
                  setTimeout(() => {
                    currentTimeElement.classList.remove('auto-scroll-transition');
                  }, 1200);
                  
                  const columnRect = column.getBoundingClientRect();
                  const elementRect = currentTimeElement.getBoundingClientRect();
                  
                  const offset = elementRect.top - columnRect.top;
                  const center = column.clientHeight / 2 - currentTimeElement.clientHeight / 2;
                  const scrollTarget = column.scrollTop + offset - center;
                  
                  column.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                  });
                }
              });
              
              setTimeout(() => {
                window.scrollTo({
                  left: initialWindowScrollX,
                  top: initialWindowScrollY,
                  behavior: 'auto'
                });
              }, 100);
            });
          } else {
            setHighlightedTime(null);
            setIsManualSelection(false);
            lastManuallySelectedTimeRef.current = null;
            
            if (manualSelectionTimeoutRef.current) {
              clearTimeout(manualSelectionTimeoutRef.current);
              manualSelectionTimeoutRef.current = null;
            }
          }
        } else {
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
          newIndex = Math.max(0, currentIndex - 4);
          break;
        case 'PageDown':
          newIndex = Math.min(timeSlots.length - 1, currentIndex + 4);
          break;
        case 'Home':
          if (localTime) {
            const roundedLocalTime = roundToNearestIncrement(localTime, 30);
            
            newIndex = timeSlots.findIndex(time => {
              return time.getFullYear() === roundedLocalTime.getFullYear() &&
                    time.getMonth() === roundedLocalTime.getMonth() &&
                    time.getDate() === roundedLocalTime.getDate() &&
                    time.getHours() === roundedLocalTime.getHours() &&
                    time.getMinutes() === roundedLocalTime.getMinutes();
            });
            
            if (newIndex === -1) {
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
        
      }
    }, 50); // Throttle to 50ms
    
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    highlightedTime, 
    timeSlots, 
    localTime, 
    activeTimezones, 
    roundToNearestIncrement, 
    currentView, 
    scrollAllColumnsToHighlightedTime
  ]);

  // Add effect to handle clicks outside time columns
  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (ignoreNextClick) {
        setIgnoreNextClick(false); // Reset the flag immediately
        return;
      }

      if (currentView !== 'list') return;
      
      const listViewContainer = timeColumnsContainerRef.current;
      if (!listViewContainer) return;
      
      const timeColumns = listViewContainer.querySelectorAll('[role="listbox"]');
      
      const timeSlotElements = listViewContainer.querySelectorAll('[role="option"]');
      
      const isOnTimeSlot = Array.from(timeSlotElements).some(slot => 
        slot === event.target || slot.contains(event.target as Node)
      );
      
      if (isOnTimeSlot) return;
      
      let isInsideTimeColumn = false;
      
      if (listViewContainer.contains(event.target as Node)) {
        isInsideTimeColumn = Array.from(timeColumns).some(column => 
          column.contains(event.target as Node)
        );
      }
      
      if (!isInsideTimeColumn && highlightedTime) {
        console.log('Click outside detected - cancelling selection');
        
// First clear the highlighted time
        setHighlightedTime(null);
        

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        scrollInProgressRef.current = false;
        

        setIsManualSelection(false);
        lastManuallySelectedTimeRef.current = null;
        
       
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
            
            requestAnimationFrame(() => {
              const timeColumns = Array.from(listViewContainer.querySelectorAll('[role="listbox"]') || []);
              if (timeColumns.length === 0) return;
              
// For each column, find the time element that matches the current time
              timeColumns.forEach(column => {
                const options = Array.from(column.querySelectorAll('[role="option"]'));
                const currentTimeElement = options.find(option => {
                  const isLocalTime = option.getAttribute('data-local-time') === 'true';
                  return isLocalTime;
                });
                
                if (currentTimeElement) {
                  currentTimeElement.classList.add('auto-scroll-transition');
                  setTimeout(() => {
                    currentTimeElement.classList.remove('auto-scroll-transition');
                  }, 1200);
                  
                  const columnRect = column.getBoundingClientRect();
                  const elementRect = currentTimeElement.getBoundingClientRect();
                  
                  const offset = elementRect.top - columnRect.top;
                  const center = column.clientHeight / 2 - currentTimeElement.clientHeight / 2;
                  const scrollTarget = column.scrollTop + offset - center;
                  
                  column.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                  });
                }
              });
              
// Restore window scroll position after a short delay to so all animations are complete
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
    

    document.addEventListener('mousedown', handleClickOutside);
    

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

// Cleanup timers and animation frames
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

  // Fix hydration issues by only rendering once mounted on client
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // If we haven't mounted yet, don't render anything to avoid hydration mismatch
  if (!hasMounted && typeof window !== 'undefined') {
    return null;
  }
  
  // Show loading state when not yet initialized but component has mounted for client-side render
  if (!mounted && hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading World Clock...</h2>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
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
      <DashboardToggle />
      
      {/* Dynamic View Rendering */}
      <div className="flex justify-center w-full">
        {activeView === 'list' && (
          <div 
            ref={timeColumnsContainerRef}
            className={`isolate overflow-hidden ${isViewTransitioning ? 'view-transition-exit-active' : 'view-transition-enter-active'}`}
            style={{ 
              contain: 'paint layout', 
              isolation: 'isolate', 
              position: 'relative' 
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
        
        {activeView === 'clocks' && (
          <div className={`w-full ${isViewTransitioning ? 'view-transition-exit-active' : 'view-transition-enter-active'}`}>
            <ClocksView 
              selectedTimezones={selectedTimezones}
              userLocalTimezone={userLocalTimezone}
              setSelectedTimezones={setSelectedTimezones}
            />
          </div>
        )}
        
        {activeView === 'digital' && (
          <div className={`w-full ${isViewTransitioning ? 'view-transition-exit-active' : 'view-transition-enter-active'}`}>
            <DigitalView 
              selectedTimezones={selectedTimezones}
              userLocalTimezone={userLocalTimezone}
              setSelectedTimezones={setSelectedTimezones}
            />
          </div>
        )}
      </div>

      {/* Dashboard with Animation */}
      {(dashboardVisible || isDashboardAnimating) && (
        <div 
          className={`
            flex justify-center w-full mt-8 pb-12 
            ${isDashboardVisible(activeView) ? 'dashboard-enter-active' : 'dashboard-exit-active'}
          `}
          aria-hidden={!isDashboardVisible(activeView)}
        >
          <div 
            className={`
              grid grid-cols-5 gap-4 w-full max-w-7xl dashboard-container
              ${isDashboardVisible(activeView) ? 'visible' : ''}
            `}
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