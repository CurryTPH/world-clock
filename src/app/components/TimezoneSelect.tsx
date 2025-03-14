"use client";

import { useState, useEffect, memo, useMemo } from 'react';
import type { Props as SelectProps } from 'react-select';
import ReactSelect from 'react-select';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export interface TimezoneOption {
  value: string;
  label: string;
  isDST?: boolean;
  dstTransitions?: {
    start: string;
    end: string;
  };
}

// Check if a timezone is currently in DST
export const isTimezoneDST = (timezone: string): boolean => {
  try {
    const now = new Date();
    const timeZoneDate = toZonedTime(now, timezone);
    const januaryOffset = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
    const julyOffset = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
    const isDST = Math.max(januaryOffset, julyOffset) !== timeZoneDate.getTimezoneOffset();
    return isDST;
  } catch (error) {
    console.error(`Error checking DST for timezone ${timezone}:`, error);
    return false;
  }
};

// Cache for DST transition dates to avoid recalculating
const dstTransitionCache = new Map<string, { start: string; end: string } | undefined>();

// Optimized binary search for DST transition dates
const findTransitionDay = (year: number, month: number, timezone: string): number | null => {
  let low = 1;
  let high = 31;
  
  // Validate the month has 31 days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  high = Math.min(high, daysInMonth);
  
  // Get offset for first day of month
  const firstDayOffset = toZonedTime(new Date(year, month, 1), timezone).getTimezoneOffset();
  
  // Check if there's even a transition this month
  const lastDayOffset = toZonedTime(new Date(year, month, high), timezone).getTimezoneOffset();
  if (firstDayOffset === lastDayOffset) {
    return null;
  }
  
  // Binary search for transition day
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midOffset = toZonedTime(new Date(year, month, mid), timezone).getTimezoneOffset();
    const prevOffset = toZonedTime(new Date(year, month, mid - 1), timezone).getTimezoneOffset();
    
    if (midOffset !== prevOffset) {
      return mid;
    }
    
    if (midOffset === firstDayOffset) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  return null;
};

// Get DST transition dates for a timezone - now using binary search for efficiency
export const getDSTTransitions = (timezone: string): { start: string; end: string } | undefined => {
  // Check cache first
  if (dstTransitionCache.has(timezone)) {
    return dstTransitionCache.get(timezone);
  }
  
  try {
    const year = new Date().getFullYear();
    const transitions = { start: '', end: '' };
    
    // Check each month for transitions using binary search
    for (let month = 0; month < 12; month++) {
      const transitionDay = findTransitionDay(year, month, timezone);
      
      if (transitionDay !== null) {
        const transitionDate = format(new Date(year, month, transitionDay), 'MMM d');
        
        if (!transitions.start) {
          transitions.start = transitionDate;
        } else {
          transitions.end = transitionDate;
          break;
        }
      }
    }
    
    // Cache the result
    if (transitions.start && transitions.end) {
      dstTransitionCache.set(timezone, transitions);
      return transitions;
    } else {
      dstTransitionCache.set(timezone, undefined);
      return undefined;
    }
  } catch (error) {
    console.error(`Error getting DST transitions for timezone ${timezone}:`, error);
    dstTransitionCache.set(timezone, undefined);
    return undefined;
  }
};

// Common timezone options with DST information
export const commonTimezones: TimezoneOption[] = [
  { value: "UTC", label: "UTC (No DST)" },
  { 
    value: "America/Chicago",
    label: "Chicago (CST/CDT)",
    isDST: isTimezoneDST("America/Chicago"),
    dstTransitions: getDSTTransitions("America/Chicago")
  },
  { 
    value: "America/New_York",
    label: "New York (EST/EDT)",
    isDST: isTimezoneDST("America/New_York"),
    dstTransitions: getDSTTransitions("America/New_York")
  },
  { 
    value: "Europe/London",
    label: "London (GMT/BST)",
    isDST: isTimezoneDST("Europe/London"),
    dstTransitions: getDSTTransitions("Europe/London")
  },
  { 
    value: "Asia/Tokyo",
    label: "Tokyo (JST)",
    isDST: false
  },
  {
    value: "Europe/Paris",
    label: "Paris (CET/CEST)",
    isDST: isTimezoneDST("Europe/Paris"),
    dstTransitions: getDSTTransitions("Europe/Paris")
  },
  {
    value: "Asia/Dubai",
    label: "Dubai (GST)",
    isDST: false
  },
  {
    value: "Asia/Shanghai",
    label: "Shanghai (CST)",
    isDST: false
  },
  {
    value: "Australia/Sydney",
    label: "Sydney (AEST/AEDT)",
    isDST: isTimezoneDST("Australia/Sydney"),
    dstTransitions: getDSTTransitions("Australia/Sydney")
  },
  {
    value: "Pacific/Auckland",
    label: "Auckland (NZST/NZDT)",
    isDST: isTimezoneDST("Pacific/Auckland"),
    dstTransitions: getDSTTransitions("Pacific/Auckland")
  },
  {
    value: "America/Los_Angeles",
    label: "Los Angeles (PST/PDT)",
    isDST: isTimezoneDST("America/Los_Angeles"),
    dstTransitions: getDSTTransitions("America/Los_Angeles")
  },
  {
    value: "America/Toronto",
    label: "Toronto (EST/EDT)",
    isDST: isTimezoneDST("America/Toronto"),
    dstTransitions: getDSTTransitions("America/Toronto")
  },
  {
    value: "Europe/Berlin",
    label: "Berlin (CET/CEST)",
    isDST: isTimezoneDST("Europe/Berlin"),
    dstTransitions: getDSTTransitions("Europe/Berlin")
  },
  {
    value: "Asia/Singapore",
    label: "Singapore (SGT)",
    isDST: false
  },
  {
    value: "Asia/Seoul",
    label: "Seoul (KST)",
    isDST: false
  }
];

// Preload the styles
if (typeof document !== 'undefined') {
  const existingLink = document.querySelector('link[href*="react-select"]');
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/react-select@5.7.0/dist/react-select.min.css';
    document.head.appendChild(link);
  }
}

// Custom styles for the Select component with dark mode
export const selectStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    background: '#374151',
    borderColor: '#4B5563',
    '&:hover': {
      borderColor: '#6B7280',
    },
    boxShadow: 'none',
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    background: '#374151',
    border: '1px solid #4B5563',
  }),
  option: (base: Record<string, unknown>, state: { isFocused: boolean; data: TimezoneOption }) => ({
    ...base,
    background: state.isFocused ? '#4B5563' : '#374151',
    '&:hover': {
      background: '#4B5563',
    },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '&::after': state.data.isDST ? {
      content: '"DST"',
      backgroundColor: '#10B981',
      color: 'white',
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      marginLeft: '8px',
    } : {},
  }),
  singleValue: (base: Record<string, unknown>, { data }: { data: TimezoneOption }) => ({
    ...base,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    '&::after': data.isDST ? {
      content: '"DST"',
      backgroundColor: '#10B981',
      color: 'white',
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      marginLeft: '8px',
    } : {},
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: 'white',
  }),
};

// Memoized select component with proper mounting
function TimezoneSelectComponent<
  Option extends TimezoneOption = TimezoneOption,
  IsMulti extends boolean = false
>(props: SelectProps<Option, IsMulti>) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedValue, setSelectedValue] = useState<any>(props.value);
  const [isChanging, setIsChanging] = useState(false);
  
  // Handle client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Detect value changes for animation
  useEffect(() => {
    if (isMounted && props.value !== selectedValue) {
      setIsChanging(true);
      setSelectedValue(props.value);
      
      const timer = setTimeout(() => {
        setIsChanging(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [props.value, selectedValue, isMounted]);

  // Enhanced styles with animation effects
  const enhancedStyles = {
    ...selectStyles,
    control: (base: any, state: any) => ({
      ...selectStyles.control(base, state),
      transition: 'all 0.2s ease',
      ...(isChanging ? { animation: 'timezone-change-pulse 0.5s ease-in-out' } : {}),
      ...(state.isFocused ? { boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.6)' } : {})
    }),
    option: (base: any, state: any) => ({
      ...selectStyles.option(base, state),
      transition: 'background-color 0.15s ease, transform 0.15s ease',
      ':hover': {
        ...base[':hover'],
        transform: 'translateX(4px)'
      },
      ...(state.isFocused ? { transform: 'translateX(4px)' } : {})
    }),
    menu: (base: any) => ({
      ...selectStyles.menu(base),
      animation: 'fadeIn 0.2s ease-in-out'
    }),
    menuList: (base: any) => ({
      ...selectStyles.menuList ? selectStyles.menuList(base) : base,
      padding: '8px'
    }),
    multiValue: (base: any) => ({
      ...selectStyles.multiValue ? selectStyles.multiValue(base) : base,
      animation: isChanging ? 'fadeIn 0.3s ease-in-out' : 'none',
      transition: 'all 0.2s ease'
    }),
  };
  
  // Server-side rendering fallback
  if (!isMounted) {
    return (
      <div className="h-[38px] bg-gray-700 rounded flex items-center px-3">
        <div className="h-4 bg-gray-600 rounded w-24"></div>
      </div>
    );
  }
  
  return (
    <div className={`${isChanging ? 'timezone-change' : ''}`}>
      <ReactSelect 
        {...props} 
        styles={props.styles || enhancedStyles}
        classNames={{
          control: () => 'input-focus',
          option: () => 'scale-on-hover',
          ...props.classNames
        }}
      />
    </div>
  );
}

// Export a memoized version to prevent unnecessary re-renders
export default memo(TimezoneSelectComponent); 