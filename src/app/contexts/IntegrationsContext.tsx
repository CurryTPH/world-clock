"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  initialIntegrationsState, 
  IntegrationsState,
  calendarServices,
  communicationServices,
  videoServices,
  hrServices,
  unifiedServices,
  CalendarEvent
} from '../services/integrations';

// Integration Types
export interface VideoIntegration {
  connected: boolean;
  lastSynced?: Date;
}

export interface CalendarIntegration {
  connected: boolean;
  lastSynced?: Date;
}

export interface CommunicationIntegration {
  connected: boolean;
  lastSynced?: Date;
}

export interface HRIntegration {
  connected: boolean;
  lastSynced?: Date;
}

// Integration State
interface IntegrationsState {
  videoServices: {
    zoom: VideoIntegration;
    meet: VideoIntegration;
    teams: VideoIntegration;
    webex: VideoIntegration;
  };
  calendars: {
    outlook: CalendarIntegration;
    google: CalendarIntegration;
    apple: CalendarIntegration;
  };
  communications: {
    slack: CommunicationIntegration;
    teams: CommunicationIntegration;
    email: CommunicationIntegration;
  };
  hrSystems: {
    holidays: HRIntegration;
    pto: HRIntegration;
  };
}

// Loading State
interface LoadingState {
  [key: string]: boolean;
}

// Context Type
interface IntegrationsContextType {
  state: IntegrationsState;
  loading: LoadingState;
  connectVideoService: (service: keyof IntegrationsState['videoServices']) => Promise<void>;
  disconnectVideoService: (service: keyof IntegrationsState['videoServices']) => Promise<void>;
  connectCalendar: (calendar: keyof IntegrationsState['calendars']) => Promise<void>;
  disconnectCalendar: (calendar: keyof IntegrationsState['calendars']) => Promise<void>;
  connectCommunication: (platform: keyof IntegrationsState['communications']) => Promise<void>;
  disconnectCommunication: (platform: keyof IntegrationsState['communications']) => Promise<void>;
  connectHRSystem: (system: keyof IntegrationsState['hrSystems']) => Promise<void>;
  disconnectHRSystem: (system: keyof IntegrationsState['hrSystems']) => Promise<void>;
  getCalendarEvents: (calendar: keyof IntegrationsState['calendars']) => Promise<CalendarEvent[]>;
  executeCommand: (command: string) => Promise<string>;
}

// Initial State
const initialState: IntegrationsState = {
  videoServices: {
    zoom: { connected: false },
    meet: { connected: false },
    teams: { connected: false },
    webex: { connected: false },
  },
  calendars: {
    outlook: { connected: false },
    google: { connected: false },
    apple: { connected: false },
  },
  communications: {
    slack: { connected: false },
    teams: { connected: false },
    email: { connected: false },
  },
  hrSystems: {
    holidays: { connected: false },
    pto: { connected: false },
  },
};

// Create Context
const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

// Provider Component
export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IntegrationsState>(initialState);
  const [loading, setLoading] = useState<LoadingState>({});

  // Helper to set loading state
  const withLoading = async <T extends any>(
    key: string,
    callback: () => Promise<T>
  ): Promise<T> => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      return await callback();
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Video Service Functions
  const connectVideoService = async (service: keyof IntegrationsState['videoServices']) => {
    await withLoading(`connect-video-${service}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        videoServices: {
          ...prev.videoServices,
          [service]: { connected: true, lastSynced: new Date() },
        },
      }));
    });
  };

  const disconnectVideoService = async (service: keyof IntegrationsState['videoServices']) => {
    await withLoading(`disconnect-video-${service}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        videoServices: {
          ...prev.videoServices,
          [service]: { connected: false },
        },
      }));
    });
  };

  // Calendar Functions
  const connectCalendar = async (calendar: keyof IntegrationsState['calendars']) => {
    await withLoading(`connect-calendar-${calendar}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setState(prev => ({
        ...prev,
        calendars: {
          ...prev.calendars,
          [calendar]: { connected: true, lastSynced: new Date() },
        },
      }));
    });
  };

  const disconnectCalendar = async (calendar: keyof IntegrationsState['calendars']) => {
    await withLoading(`disconnect-calendar-${calendar}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        calendars: {
          ...prev.calendars,
          [calendar]: { connected: false },
        },
      }));
    });
  };

  // Communication Platform Functions
  const connectCommunication = async (platform: keyof IntegrationsState['communications']) => {
    await withLoading(`connect-comm-${platform}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setState(prev => ({
        ...prev,
        communications: {
          ...prev.communications,
          [platform]: { connected: true, lastSynced: new Date() },
        },
      }));
    });
  };

  const disconnectCommunication = async (platform: keyof IntegrationsState['communications']) => {
    await withLoading(`disconnect-comm-${platform}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        communications: {
          ...prev.communications,
          [platform]: { connected: false },
        },
      }));
    });
  };

  // HR System Functions
  const connectHRSystem = async (system: keyof IntegrationsState['hrSystems']) => {
    await withLoading(`connect-hr-${system}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        hrSystems: {
          ...prev.hrSystems,
          [system]: { connected: true, lastSynced: new Date() },
        },
      }));
    });
  };

  const disconnectHRSystem = async (system: keyof IntegrationsState['hrSystems']) => {
    await withLoading(`disconnect-hr-${system}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        hrSystems: {
          ...prev.hrSystems,
          [system]: { connected: false },
        },
      }));
    });
  };

  // Get Calendar Events
  const getCalendarEvents = async (calendar: keyof IntegrationsState['calendars']): Promise<CalendarEvent[]> => {
    return await withLoading(`get-events-${calendar}`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock events
      const now = new Date();
      const events: CalendarEvent[] = [];
      
      for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
        const startHour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
        const startDate = new Date(now);
        startDate.setHours(startHour, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + (Math.floor(Math.random() * 4) + 1) * 30); // 30 to 120 minutes
        
        const hasMeetingLink = Math.random() > 0.3;
        
        events.push({
          id: `event-${calendar}-${i}`,
          title: [
            'Team Standup',
            'Product Review',
            'Client Meeting',
            'Design Workshop',
            'Sprint Planning',
            'Retrospective',
            '1:1 with Manager',
            'Code Review'
          ][Math.floor(Math.random() * 8)],
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          meetingLink: hasMeetingLink ? `https://meet.example.com/${Math.random().toString(36).substring(2, 8)}` : undefined,
        });
      }
      
      // Sort by start time
      events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      
      return events;
    });
  };

  // Execute Command
  const executeCommand = async (command: string): Promise<string> => {
    return await withLoading(`execute-command`, async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Process command (in a real app, this would be more sophisticated)
      if (command.includes('meeting') || command.includes('schedule')) {
        return 'Command processed: Meeting scheduling initiated.';
      } else if (command.includes('sync') || command.includes('update')) {
        return 'Command processed: Synchronization started for connected services.';
      } else if (command.includes('notify') || command.includes('alert')) {
        return 'Command processed: Notification sent to team members.';
      } else {
        return `Command "${command}" processed successfully.`;
      }
    });
  };

  // Initialize with some connected services for demo purposes
  useEffect(() => {
    const initializeDemo = async () => {
      // Connect some services by default for demo
      await connectVideoService('zoom');
      await connectCalendar('outlook');
      await connectCommunication('slack');
    };
    
    initializeDemo();
  }, []);

  const value = {
    state,
    loading,
    connectVideoService,
    disconnectVideoService,
    connectCalendar,
    disconnectCalendar,
    connectCommunication,
    disconnectCommunication,
    connectHRSystem,
    disconnectHRSystem,
    getCalendarEvents,
    executeCommand,
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
}

// Custom Hook
export function useIntegrations(): IntegrationsContextType {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
} 