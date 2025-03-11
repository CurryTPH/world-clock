"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { generateMockCalendarEvents, generateMockNotifications } from '../services/integrations';

// Integration types
export type IntegrationType = 'calendar' | 'communication' | 'video' | 'hr' | 'unified';

// Integration state interfaces
export interface Integration {
  connected: boolean;
  lastSynced?: Date;
  data?: unknown;
}

export interface IntegrationsState {
  calendars: {
    [key: string]: Integration;
  };
  communications: {
    [key: string]: Integration;
  };
  videoServices: {
    [key: string]: Integration;
  };
  hrSystems: {
    [key: string]: Integration;
  };
  calendarEvents: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    calendar: string;
    link?: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    source: string;
    timestamp: Date;
    read: boolean;
  }>;
  loading: boolean;
  error: string | null;
}

// Action types
type IntegrationsAction =
  | { type: 'CONNECT_CALENDAR'; service: string }
  | { type: 'DISCONNECT_CALENDAR'; service: string }
  | { type: 'CONNECT_COMMUNICATION'; service: string }
  | { type: 'DISCONNECT_COMMUNICATION'; service: string }
  | { type: 'CONNECT_VIDEO_SERVICE'; service: string }
  | { type: 'DISCONNECT_VIDEO_SERVICE'; service: string }
  | { type: 'CONNECT_HR_SYSTEM'; service: string }
  | { type: 'DISCONNECT_HR_SYSTEM'; service: string }
  | { type: 'SET_CALENDAR_EVENTS'; events: IntegrationsState['calendarEvents'] }
  | { type: 'SET_NOTIFICATIONS'; notifications: IntegrationsState['notifications'] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

// Initial state
const initialState: IntegrationsState = {
  calendars: {
    outlook: { connected: false },
    google: { connected: false },
    apple: { connected: false }
  },
  communications: {
    slack: { connected: false },
    teams: { connected: false },
    email: { connected: false }
  },
  videoServices: {
    zoom: { connected: false },
    meet: { connected: false },
    teams: { connected: false },
    webex: { connected: false }
  },
  hrSystems: {
    holidays: { connected: false },
    pto: { connected: false }
  },
  calendarEvents: [],
  notifications: [],
  loading: false,
  error: null
};

// Reducer function
function integrationsReducer(state: IntegrationsState, action: IntegrationsAction): IntegrationsState {
  switch (action.type) {
    case 'CONNECT_CALENDAR':
      return {
        ...state,
        calendars: {
          ...state.calendars,
          [action.service]: { connected: true, lastSynced: new Date() }
        }
      };
    case 'DISCONNECT_CALENDAR':
      return {
        ...state,
        calendars: {
          ...state.calendars,
          [action.service]: { connected: false }
        }
      };
    case 'CONNECT_COMMUNICATION':
      return {
        ...state,
        communications: {
          ...state.communications,
          [action.service]: { connected: true, lastSynced: new Date() }
        }
      };
    case 'DISCONNECT_COMMUNICATION':
      return {
        ...state,
        communications: {
          ...state.communications,
          [action.service]: { connected: false }
        }
      };
    case 'CONNECT_VIDEO_SERVICE':
      return {
        ...state,
        videoServices: {
          ...state.videoServices,
          [action.service]: { connected: true, lastSynced: new Date() }
        }
      };
    case 'DISCONNECT_VIDEO_SERVICE':
      return {
        ...state,
        videoServices: {
          ...state.videoServices,
          [action.service]: { connected: false }
        }
      };
    case 'CONNECT_HR_SYSTEM':
      return {
        ...state,
        hrSystems: {
          ...state.hrSystems,
          [action.service]: { connected: true, lastSynced: new Date() }
        }
      };
    case 'DISCONNECT_HR_SYSTEM':
      return {
        ...state,
        hrSystems: {
          ...state.hrSystems,
          [action.service]: { connected: false }
        }
      };
    case 'SET_CALENDAR_EVENTS':
      return {
        ...state,
        calendarEvents: action.events
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.notifications
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error
      };
    default:
      return state;
  }
}

// Context
interface IntegrationsContextType {
  state: IntegrationsState;
  loading: { [key: string]: boolean };
  connectCalendar: (service: string) => Promise<void>;
  disconnectCalendar: (service: string) => Promise<void>;
  connectCommunication: (service: string) => Promise<void>;
  disconnectCommunication: (service: string) => Promise<void>;
  connectVideoService: (service: string) => Promise<void>;
  disconnectVideoService: (service: string) => Promise<void>;
  connectHRSystem: (service: string) => Promise<void>;
  disconnectHRSystem: (service: string) => Promise<void>;
  fetchCalendarEvents: (calendar?: string) => Promise<void>;
  executeCommand: (command: string) => Promise<string>;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

// Custom hook for using the context
export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (!context) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
}

// Provider component
export function IntegrationsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(integrationsReducer, initialState);
  const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({});

  // Helper function to set loading state for a specific operation
  const setLoading = useCallback((operation: string, isLoading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [operation]: isLoading
    }));
  }, []);

  // Helper function to simulate API delay
  const simulateApiDelay = useCallback(async <T,>(result: T): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    return result;
  }, []);

  // Connect calendar service
  const connectCalendar = useCallback(async (service: string) => {
    const operationKey = `connect-calendar-${service}`;
    try {
      setLoading(operationKey, true);
      await simulateApiDelay(null);
      dispatch({ type: 'CONNECT_CALENDAR', service });
    } catch (error) {
      console.error(`Failed to connect ${service} calendar:`, error);
      dispatch({ type: 'SET_ERROR', error: `Failed to connect ${service} calendar` });
    } finally {
      setLoading(operationKey, false);
    }
  }, [setLoading, simulateApiDelay]);

  // Disconnect calendar service
  const disconnectCalendar = useCallback(async (service: string) => {
    const operationKey = `disconnect-calendar-${service}`;
    try {
      setLoading(operationKey, true);
      await simulateApiDelay(null);
      dispatch({ type: 'DISCONNECT_CALENDAR', service });
    } catch (error) {
      console.error(`Failed to disconnect ${service} calendar:`, error);
      dispatch({ type: 'SET_ERROR', error: `Failed to disconnect ${service} calendar` });
    } finally {
      setLoading(operationKey, false);
    }
  }, [setLoading, simulateApiDelay]);

  // Connect communication service
  const connectCommunication = useCallback(async (service: string) => {
    const operationKey = `connect-communication-${service}`;
    try {
      setLoading(operationKey, true);
      await simulateApiDelay(null);
      dispatch({ type: 'CONNECT_COMMUNICATION', service });
    } catch (error) {
      console.error(`Failed to connect ${service} communication:`, error);
      dispatch({ type: 'SET_ERROR', error: `Failed to connect ${service} communication` });
    } finally {
      setLoading(operationKey, false);
    }
  }, [setLoading, simulateApiDelay]);

  // Disconnect communication service
  const disconnectCommunication = useCallback(async (service: string) => {
    const operationKey = `disconnect-communication-${service}`;
    try {
      setLoading(operationKey, true);
      await simulateApiDelay(null);
      dispatch({ type: 'DISCONNECT_COMMUNICATION', service });
    } catch (error) {
      console.error(`Failed to disconnect ${service} communication:`, error);
      dispatch({ type: 'SET_ERROR', error: `Failed to disconnect ${service} communication` });
    } finally {
      setLoading(operationKey, false);
    }
  }, [setLoading, simulateApiDelay]);

  // Connect video service
  const connectVideoService = useCallback(async (service: string) => {
    const operationKey = `connect-video-${service}`;
    try {
      setLoading(operationKey, true);
      await simulateApiDelay(null);
      dispatch({ type: 'CONNECT_VIDEO_SERVICE', service });
    } catch (error) {
      console.error(`Failed to connect ${service} video service:`, error);
      dispatch({ type: 'SET_ERROR', error: `Failed to connect ${service} video service` });
    } finally {
      setLoading(operationKey, false);
    }
  }, [setLoading, simulateApiDelay]);

  // Disconnect video service
  const disconnectVideoService = useCallback(async (service: string) => {
    const operationKey = `disconnect-video-${service}`;
    try {
      setLoading(operationKey, true);
      await simulateApiDelay(null);
      dispatch({ type: 'DISCONNECT_VIDEO_SERVICE', service });
    } catch (error) {
      console.error(`Failed to disconnect ${service} video service:`, error);
      dispatch({ type: 'SET_ERROR', error: `Failed to disconnect ${service} video service` });
    } finally {
      setLoading(operationKey, false);
    }
  }, [setLoading, simulateApiDelay]);

  // Connect HR system
  const connectHRSystem = useCallback(async (service: string) => {
    const operationKey = `connect-hr-${service}`;
    try {
      setLoading(operationKey, true);
      await simulateApiDelay(null);
      dispatch({ type: 'CONNECT_HR_SYSTEM', service });
    } catch (error) {
      console.error(`Failed to connect ${service} HR system:`, error);
      dispatch({ type: 'SET_ERROR', error: `Failed to connect ${service} HR system` });
    } finally {
      setLoading(operationKey, false);
    }
  }, [setLoading, simulateApiDelay]);

  // Disconnect HR system
  const disconnectHRSystem = useCallback(async (service: string) => {
    const operationKey = `disconnect-hr-${service}`;
    try {
      setLoading(operationKey, true);
      await simulateApiDelay(null);
      dispatch({ type: 'DISCONNECT_HR_SYSTEM', service });
    } catch (error) {
      console.error(`Failed to disconnect ${service} HR system:`, error);
      dispatch({ type: 'SET_ERROR', error: `Failed to disconnect ${service} HR system` });
    } finally {
      setLoading(operationKey, false);
    }
  }, [setLoading, simulateApiDelay]);

  // Fetch calendar events
  const fetchCalendarEvents = useCallback(async (calendar?: string) => {
    const operationKey = `fetch-events-${calendar || 'all'}`;
    try {
      setLoading(operationKey, true);
      dispatch({ type: 'SET_LOADING', loading: true });
      
      // Get connected calendars
      const connectedCalendars = Object.entries(state.calendars)
        .filter(([, cal]) => cal.connected)
        .map(([name]) => name);
      
      if (connectedCalendars.length === 0) {
        dispatch({ type: 'SET_CALENDAR_EVENTS', events: [] });
        return;
      }
      
      // Filter by specific calendar if provided
      const calendarsToFetch = calendar 
        ? connectedCalendars.filter(cal => cal === calendar)
        : connectedCalendars;
      
      if (calendarsToFetch.length === 0) {
        dispatch({ type: 'SET_CALENDAR_EVENTS', events: [] });
        return;
      }
      
      // Generate mock events for each calendar
      const allEvents = [];
      for (const cal of calendarsToFetch) {
        const events = await simulateApiDelay(generateMockCalendarEvents(cal, 5));
        allEvents.push(...events);
      }
      
      // Sort by start time
      allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
      
      dispatch({ type: 'SET_CALENDAR_EVENTS', events: allEvents });
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      dispatch({ type: 'SET_ERROR', error: 'Failed to fetch calendar events' });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
      setLoading(operationKey, false);
    }
  }, [state.calendars, setLoading, simulateApiDelay]);

  // Execute command
  const executeCommand = useCallback(async (command: string): Promise<string> => {
    try {
      await simulateApiDelay(null);
      return `Executed command: ${command}`;
    } catch (error) {
      console.error('Failed to execute command:', error);
      throw new Error('Failed to execute command');
    }
  }, [simulateApiDelay]);

  // Generate notifications based on integration state
  useEffect(() => {
    const generateNotifications = async () => {
      try {
        const notifications = await generateMockNotifications(state);
        dispatch({ type: 'SET_NOTIFICATIONS', notifications });
      } catch (error) {
        console.error('Failed to generate notifications:', error);
      }
    };
    
    generateNotifications();
  }, [state]);

  // Connect some services by default for demo purposes
  useEffect(() => {
    connectCalendar('outlook');
    connectCommunication('slack');
    connectVideoService('zoom');
  }, [connectCalendar, connectCommunication, connectVideoService]);

  // Add dummy calendar events for demo purposes
  useEffect(() => {
    const addDummyEvents = async () => {
      try {
        // Generate dummy events for the connected calendar
        const outlookEvents = await simulateApiDelay(generateMockCalendarEvents('outlook', 8));
        
        // Set the events in the state
        dispatch({ type: 'SET_CALENDAR_EVENTS', events: outlookEvents });
      } catch (error) {
        console.error('Failed to generate dummy events:', error);
      }
    };
    
    // Add a small delay to ensure the calendar is connected first
    setTimeout(() => {
      addDummyEvents();
    }, 1000);
  }, [simulateApiDelay]);

  const contextValue = {
    state,
    loading: loadingState,
    connectCalendar,
    disconnectCalendar,
    connectCommunication,
    disconnectCommunication,
    connectVideoService,
    disconnectVideoService,
    connectHRSystem,
    disconnectHRSystem,
    fetchCalendarEvents,
    executeCommand
  };

  return (
    <IntegrationsContext.Provider value={contextValue}>
      {children}
    </IntegrationsContext.Provider>
  );
} 