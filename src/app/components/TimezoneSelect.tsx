"use client";

import type { Props as SelectProps } from 'react-select';
import ReactSelect from 'react-select';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Define the option type for timezones
export interface TimezoneOption {
  value: string;
  label: string;
  isDST?: boolean;
  dstTransitions?: {
    start: string;
    end: string;
  };
}

// Helper function to check if a timezone is currently in DST
export const isTimezoneDST = (timezone: string): boolean => {
  const now = new Date();
  const timeZoneDate = toZonedTime(now, timezone);
  const januaryOffset = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const julyOffset = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
  const isDST = Math.max(januaryOffset, julyOffset) !== timeZoneDate.getTimezoneOffset();
  return isDST;
};

// Helper function to get DST transition dates for a timezone
export const getDSTTransitions = (timezone: string): { start: string; end: string } | undefined => {
  const year = new Date().getFullYear();
  const transitions = { start: '', end: '' };
  
  // Check each month to find DST transitions
  for (let month = 0; month < 12; month++) {
    const date = new Date(year, month, 1);
    const prevMonth = new Date(year, month - 1, 1);
    
    const currentOffset = toZonedTime(date, timezone).getTimezoneOffset();
    const prevOffset = toZonedTime(prevMonth, timezone).getTimezoneOffset();
    
    if (currentOffset !== prevOffset) {
      // Found a transition, now find the exact day
      for (let day = 1; day <= 31; day++) {
        const currentDay = new Date(year, month, day);
        const prevDay = new Date(year, month, day - 1);
        
        if (toZonedTime(currentDay, timezone).getTimezoneOffset() !== 
            toZonedTime(prevDay, timezone).getTimezoneOffset()) {
          const transitionDate = format(currentDay, 'MMM d');
          if (!transitions.start) {
            transitions.start = transitionDate;
          } else {
            transitions.end = transitionDate;
            return transitions;
          }
          break;
        }
      }
    }
  }
  
  return undefined;
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

// Preload the stylesheet
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

// Fast-loading select component
export default function TimezoneSelect<
  Option extends TimezoneOption = TimezoneOption,
  IsMulti extends boolean = false
>(props: SelectProps<Option, IsMulti>) {
  // Server-side rendering fallback
  if (typeof window === 'undefined') {
    return (
      <div className="h-[38px] bg-gray-700 rounded flex items-center px-3">
        <div className="h-4 bg-gray-600 rounded w-24"></div>
      </div>
    );
  }
  
  return <ReactSelect {...props} />;
} 