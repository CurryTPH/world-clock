import { UserPreferences, defaultPreferences } from '../settings/preferences';

// Key for storing user preferences in localStorage
const USER_PREFERENCES_KEY = 'userPreferences';

/**
 * Save user preferences to localStorage
 * @param preferences The user preferences to save
 * @returns true if successful, false otherwise
 */
export const saveUserPreferences = (preferences: UserPreferences): boolean => {
  try {
    const preferencesString = JSON.stringify(preferences);
    localStorage.setItem(USER_PREFERENCES_KEY, preferencesString);
    
    // Dispatch a custom event to notify components
    const event = new CustomEvent('preferencesUpdated', { 
      detail: { preferences } 
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return false;
  }
};

/**
 * Load user preferences from localStorage
 * @returns The user preferences or default preferences if none are found
 */
export const loadUserPreferences = (): UserPreferences => {
  try {
    const savedPreferences = localStorage.getItem(USER_PREFERENCES_KEY);
    if (savedPreferences) {
      return JSON.parse(savedPreferences);
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }
  
  return defaultPreferences;
}; 