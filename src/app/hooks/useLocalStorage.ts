"use client";

import { useState, useEffect, useCallback } from 'react';

// Custom hook for using localStorage with TypeScript support (MAY NEED TO CHANGE BASED ON TYPESCRIPT-GO IN LATER VERSIONS)
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
// State to store our value, pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      // Check if item exists and is not null before parsing
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });
  
// Return a wrapped version of useState's setter function that persists the new value to localStorage
// Use useCallback to avoid unnecessary recreations of this function
  const setValue = useCallback((value: T) => {
    try {
      // Handle functional updates correctly
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Only update state and localStorage if the value has actually changed
      if (JSON.stringify(storedValue) !== JSON.stringify(valueToStore)) {
        // Save state
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, storedValue]);
  
// Sync storage across tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    function handleStorageChange(event: StorageEvent) {
      if (event.key === key) {
        try {
          // Handle both setting new values and removing values
          if (event.newValue) {
            setStoredValue(JSON.parse(event.newValue));
          } else {
            // If the item was removed from localStorage in another tab
            setStoredValue(initialValue);
          }
        } catch (error) {
          console.error("Error parsing localStorage change:", error);
        }
      }
    }
    
// Listen for changes to this localStorage key in other tabs
    window.addEventListener('storage', handleStorageChange);
    
// Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);
  
  return [storedValue, setValue];
} 