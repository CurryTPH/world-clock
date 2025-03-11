"use client";

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { format } from 'date-fns';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { CalendarEvent } from '../services/integrations';
import { UserPreferences, defaultPreferences } from '../settings/preferences';
import { loadUserPreferences } from '../utils/localStorage';

// Memoize the event item to prevent unnecessary re-renders
const EventItem = memo(({ event, activeCalendar, getServiceColor }: { 
  event: CalendarEvent; 
  activeCalendar: string;
  getServiceColor: (service: string) => string;
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-3 hover:bg-gray-650 transition-colors">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-white">{event.title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full ${getServiceColor(activeCalendar)} bg-opacity-20 text-white`}>
          {activeCalendar}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-300">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {format(new Date(event.start), 'MMM d, h:mm a')} - {format(new Date(event.end), 'h:mm a')}
        </div>
        {event.link && (
          <div className="flex items-center mt-1.5">
            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Join Meeting
            </a>
          </div>
        )}
      </div>
    </div>
  );
});

// Add display name to fix ESLint error
EventItem.displayName = 'EventItem';

// Memoize the service color function to prevent unnecessary recalculations
const useServiceColors = () => {
  return useMemo(() => {
    return (service: string) => {
      switch (service) {
        case 'outlook':
          return 'bg-blue-500';
        case 'google':
          return 'bg-red-500';
        case 'apple':
          return 'bg-gray-500';
        default:
          return 'bg-purple-500';
      }
    };
  }, []);
};

// Memoize the service icon function to prevent unnecessary recalculations
const useServiceIcons = () => {
  return useMemo(() => {
    const ServiceIcon = (service: string) => {
      switch (service) {
        case 'outlook':
          return (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h-.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v1.83l3.75-1.83zM9 3.75V6h2l.13.01.12.04v-2.3zm0 4.5V9h2.5v-2.25H9.1zm.15 4.5v1.83l2.5-1.83z" />
            </svg>
          );
        case 'google':
          return (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22q-2.05 0-3.875-.788-1.825-.787-3.187-2.15-1.363-1.363-2.15-3.187Q2 14.05 2 12q0-2.075.788-3.887.787-1.813 2.15-3.175Q6.3 3.575 8.125 2.787 9.95 2 12 2q2.075 0 3.887.787 1.813.788 3.175 2.151 1.363 1.362 2.15 3.175Q22 9.925 22 12v1.45q0 1.475-1.012 2.513Q19.975 17 18.5 17q-.9 0-1.675-.4-.775-.4-1.275-1.05-.675.675-1.587 1.063Q13.05 17 12 17q-2.075 0-3.537-1.463Q7 14.075 7 12t1.463-3.538Q9.925 7 12 7t3.538 1.462Q17 9.925 17 12v1.45q0 .725.45 1.137 .45.413 1.05.413.6 0 1.05-.413.45-.412.45-1.137V12q0-3.35-2.325-5.675Q15.35 4 12 4 8.65 4 6.325 6.325 4 8.65 4 12q0 3.35 2.325 5.675Q8.65 20 12 20h5v2zm0-7q1.25 0 2.125-.875T15 12q0-1.25-.875-2.125T12 9q-1.25 0-2.125.875T9 12q0 1.25.875 2.125T12 15z" />
            </svg>
          );
        case 'apple':
          return (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.92 12.29 4.24 17 6 19.47c.8 1.21 1.8 2.58 3.12 2.53s1.75-.82 3.28-.82 2 .82 3.3.79 2.22-1.23 3.06-2.45a11 11 0 0 0 1.38-2.85 4.41 4.41 0 0 1-2.68-4.04z" />
            </svg>
          );
        default:
          return null;
      }
    };
    
    // Add display name to fix ESLint error
    ServiceIcon.displayName = 'ServiceIcon';
    
    return ServiceIcon;
  }, []);
};

// Memoize the entire component to prevent unnecessary re-renders
const CalendarEventsPanel = memo(function CalendarEventsPanel() {
  const { state, fetchCalendarEvents, loading } = useIntegrations();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<'outlook' | 'google' | 'apple'>('outlook');
  const [error, setError] = useState<string | null>(null);
  
  // Get user preferences from localStorage if available
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);
  
  // Load user preferences from localStorage
  useEffect(() => {
    try {
      const loadedPreferences = loadUserPreferences();
      console.log('Loading preferences in CalendarEventsPanel using utility function');
      setUserPreferences(loadedPreferences);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }, []);
  
  // Use refs to track component state without causing re-renders
  const isMounted = useRef(true);
  
  // Get memoized service colors and icons
  const getServiceColor = useServiceColors();
  const getServiceIcon = useServiceIcons();

  // Check if calendar is enabled in user preferences
  const isCalendarEnabled = useMemo(() => {
    return userPreferences.enterpriseIntegration.enableCalendar;
  }, [userPreferences.enterpriseIntegration.enableCalendar]);

  // Initialize events from state when component mounts or when state.calendarEvents changes
  useEffect(() => {
    if (state.calendarEvents.length > 0 && isCalendarEnabled) {
      setEvents(state.calendarEvents);
    }
  }, [state.calendarEvents, isCalendarEnabled]);

  // Update loading state when state.loading changes
  useEffect(() => {
    setIsLoading(state.loading);
  }, [state.loading]);

  // Fetch events function
  const fetchEvents = useCallback(async () => {
    if (isLoading || !isCalendarEnabled) return;
    
    if (state.calendars[activeCalendar]?.connected) {
      setIsLoading(true);
      setError(null);
      
      try {
        await fetchCalendarEvents(activeCalendar);
      } catch (err) {
        console.error(`Error fetching ${activeCalendar} events:`, err);
        
        if (isMounted.current) {
          setError(`Failed to load events from ${activeCalendar}`);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    } else {
      // Clear events if calendar is not connected
      setEvents([]);
    }
  }, [fetchCalendarEvents, state.calendars, activeCalendar, isLoading, isCalendarEnabled]);

  // Setup effect for initial fetch and cleanup
  useEffect(() => {
    // Set isMounted to true at the start
    isMounted.current = true;
    
    // Fetch events when the component mounts or when activeCalendar changes
    if (isCalendarEnabled) {
      fetchEvents();
    } else {
      // Clear events if calendar is disabled
      setEvents([]);
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [activeCalendar, fetchEvents, isCalendarEnabled]);

  // Handle calendar selection
  const handleCalendarChange = useCallback((calendarType: 'outlook' | 'google' | 'apple') => {
    setActiveCalendar(calendarType);
  }, []);

  // Handle retry button click
  const handleRetry = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Memoize the calendar buttons to prevent unnecessary re-renders
  const calendarButtons = useMemo(() => {
    return Object.entries(state.calendars).map(([key, calendar]) => (
      <button
        key={key}
        onClick={() => handleCalendarChange(key as 'outlook' | 'google' | 'apple')}
        disabled={!calendar.connected || loading[`fetch-events-${key}`]}
        className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
          activeCalendar === key 
            ? `${getServiceColor(key)} text-white` 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        } ${!calendar.connected ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="mr-1.5">{getServiceIcon(key)}</span>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </button>
    ));
  }, [state.calendars, activeCalendar, loading, handleCalendarChange, getServiceColor, getServiceIcon]);

  // Memoize the event list to prevent unnecessary re-renders
  const eventList = useMemo(() => {
    return events.map(event => (
      <EventItem 
        key={event.id} 
        event={event} 
        activeCalendar={activeCalendar}
        getServiceColor={getServiceColor}
      />
    ));
  }, [events, activeCalendar, getServiceColor]);

  // Function to reload preferences
  const reloadPreferences = useCallback(() => {
    try {
      const loadedPreferences = loadUserPreferences();
      console.log('Reloading preferences in CalendarEventsPanel using utility function');
      setUserPreferences(loadedPreferences);
    } catch (error) {
      console.error('Failed to reload user preferences:', error);
    }
  }, []);

  // Add event listener for storage changes
  useEffect(() => {
    // Function to handle storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userPreferences') {
        console.log('Storage changed, reloading preferences');
        reloadPreferences();
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [reloadPreferences]);

  // Add event listener for custom preferences updated event
  useEffect(() => {
    // Function to handle preferences updated event
    const handlePreferencesUpdated = (event: Event) => {
      console.log('Preferences updated event received');
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.preferences) {
        console.log('Setting new preferences from event:', customEvent.detail.preferences);
        setUserPreferences(customEvent.detail.preferences);
      } else {
        reloadPreferences();
      }
    };

    // Add event listener
    window.addEventListener('preferencesUpdated', handlePreferencesUpdated);

    // Clean up
    return () => {
      window.removeEventListener('preferencesUpdated', handlePreferencesUpdated);
    };
  }, [reloadPreferences]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-700 relative z-0">
      <h3 className="text-xl font-semibold mb-4">Calendar Events</h3>
      
      {isCalendarEnabled ? (
        <>
          {/* Calendar selection tabs */}
          <div className="flex mb-4 space-x-2">
            {calendarButtons}
          </div>
          
          {/* Fixed height container to prevent layout shifts */}
          <div className="h-[320px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-lg text-center">
                  <p>{error}</p>
                  <button 
                    onClick={handleRetry} 
                    className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : events.length > 0 ? (
              <div className="h-full overflow-y-auto pr-2 space-y-3">
                {eventList}
              </div>
            ) : (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-400 w-full">
                  {state.calendars[activeCalendar]?.connected ? (
                    <p>No events found in your calendar</p>
                  ) : (
                    <p>Connect your {activeCalendar} calendar to see events</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="h-[320px] flex items-center justify-center">
          <div className="bg-gray-700 rounded-lg p-6 text-center text-gray-300 max-w-md">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-xl font-semibold mb-2">Calendar Integration Disabled</h4>
            <p className="mb-4">Calendar integration is currently disabled in your settings.</p>
            <p className="text-sm text-gray-400">You can enable it in the Enterprise Integration Hub settings.</p>
          </div>
        </div>
      )}
    </div>
  );
});

// Add display name to fix ESLint error
CalendarEventsPanel.displayName = 'CalendarEventsPanel';

export default CalendarEventsPanel; 