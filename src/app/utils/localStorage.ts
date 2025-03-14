import { UserPreferences, defaultPreferences } from '../settings/preferences';

// Key for storing user preferences in localStorage
const USER_PREFERENCES_KEY = 'userPreferences';

// In-memory fallback storage if both localStorage and sessionStorage fail
let memoryStorage: Record<string, string> = {};

/**
 * Check if localStorage is available
 * @returns boolean indicating if localStorage is available
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
};

/**
 * Check if sessionStorage is available
 * @returns boolean indicating if sessionStorage is available
 */
const isSessionStorageAvailable = (): boolean => {
  try {
    const testKey = '__test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('sessionStorage is not available:', e);
    return false;
  }
};

/**
 * Set a cookie
 * @param name Cookie name
 * @param value Cookie value
 * @param days Days until expiration
 */
const setCookie = (name: string, value: string, days: number = 30): void => {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    console.log(`Cookie set: ${name}`);
  } catch (e) {
    console.error('Failed to set cookie:', e);
  }
};

/**
 * Get a cookie by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
const getCookie = (name: string): string | null => {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const encodedValue = c.substring(nameEQ.length, c.length);
        return decodeURIComponent(encodedValue);
      }
    }
  } catch (e) {
    console.error('Failed to get cookie:', e);
  }
  return null;
};

/**
 * Save user preferences to storage (localStorage, sessionStorage, cookies, or memory)
 * @param preferences The user preferences to save
 * @returns true if successful, false otherwise
 */
export const saveUserPreferences = (preferences: UserPreferences): boolean => {
  try {
    // Log the preferences being saved
    console.log('Saving preferences:', preferences);
    
    const preferencesString = JSON.stringify(preferences);
    console.log('Stringified preferences:', preferencesString);
    
    let savedSuccessfully = false;
    
    // Try localStorage first
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(USER_PREFERENCES_KEY, preferencesString);
        console.log('Saved to localStorage');
        savedSuccessfully = true;
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
    
    // Try sessionStorage if localStorage failed
    if (!savedSuccessfully && isSessionStorageAvailable()) {
      try {
        sessionStorage.setItem(USER_PREFERENCES_KEY, preferencesString);
        console.log('Saved to sessionStorage');
        savedSuccessfully = true;
      } catch (e) {
        console.error('Failed to save to sessionStorage:', e);
      }
    }
    
    // Try cookies if both localStorage and sessionStorage failed
    if (!savedSuccessfully) {
      try {
        setCookie(USER_PREFERENCES_KEY, preferencesString);
        console.log('Saved to cookies');
        savedSuccessfully = true;
      } catch (e) {
        console.error('Failed to save to cookies:', e);
      }
    }
    
    // Fall back to memory storage if all else fails
    if (!savedSuccessfully) {
      memoryStorage[USER_PREFERENCES_KEY] = preferencesString;
      console.log('Saved to memory storage');
      savedSuccessfully = true;
    }
    
    // Dispatch a custom event to notify components
    try {
      const event = new CustomEvent('preferencesUpdated', { 
        detail: { preferences } 
      });
      window.dispatchEvent(event);
      console.log('Dispatched preferencesUpdated event');
    } catch (e) {
      console.error('Failed to dispatch event:', e);
    }
    
    return savedSuccessfully;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return false;
  }
};

/**
 * Load user preferences from storage (localStorage, sessionStorage, cookies, or memory)
 * @returns The user preferences or default preferences if none are found
 */
export const loadUserPreferences = (): UserPreferences => {
  try {
    let savedPreferences: string | null = null;
    
    // Try localStorage first
    if (isLocalStorageAvailable()) {
      try {
        savedPreferences = localStorage.getItem(USER_PREFERENCES_KEY);
        if (savedPreferences) {
          console.log('Loaded from localStorage');
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    }
    
    // Try sessionStorage if localStorage failed or had no data
    if (!savedPreferences && isSessionStorageAvailable()) {
      try {
        savedPreferences = sessionStorage.getItem(USER_PREFERENCES_KEY);
        if (savedPreferences) {
          console.log('Loaded from sessionStorage');
        }
      } catch (e) {
        console.error('Failed to load from sessionStorage:', e);
      }
    }
    
    // Try cookies if both localStorage and sessionStorage failed or had no data
    if (!savedPreferences) {
      try {
        savedPreferences = getCookie(USER_PREFERENCES_KEY);
        if (savedPreferences) {
          console.log('Loaded from cookies');
        }
      } catch (e) {
        console.error('Failed to load from cookies:', e);
      }
    }
    
    // Try memory storage if all else failed or had no data
    if (!savedPreferences && memoryStorage[USER_PREFERENCES_KEY]) {
      savedPreferences = memoryStorage[USER_PREFERENCES_KEY];
      console.log('Loaded from memory storage');
    }
    
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        console.log('Parsed preferences:', parsedPreferences);
        return parsedPreferences;
      } catch (e) {
        console.error('Failed to parse preferences:', e);
      }
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }
  
  console.log('No saved preferences found, using defaults');
  return defaultPreferences;
}; 