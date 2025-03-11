"use client";

import type { Props as SelectProps } from 'react-select';
import ReactSelect from 'react-select';

// Define the option type for timezones
export interface TimezoneOption {
  value: string;
  label: string;
}

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
  option: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    background: state.isFocused ? '#4B5563' : '#374151',
    '&:hover': {
      background: '#4B5563',
    },
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: 'white',
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

// Common timezone options
export const commonTimezones: TimezoneOption[] = [
  { value: "UTC", label: "UTC" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
]; 