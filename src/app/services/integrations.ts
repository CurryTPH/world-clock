// Integration services for productivity tools

// Types for integrations
export interface IntegrationStatus {
  connected: boolean;
  lastSynced?: Date;
  error?: string;
}

export interface CalendarIntegration extends IntegrationStatus {
  type: 'outlook' | 'google' | 'apple';
  events?: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  calendar: string;
  link?: string;
}

export interface CommunicationIntegration extends IntegrationStatus {
  type: 'slack' | 'teams' | 'email';
  channels?: string[];
}

export interface VideoIntegration extends IntegrationStatus {
  type: 'zoom' | 'meet' | 'teams' | 'webex';
  personalMeetingId?: string;
}

export interface HRIntegration extends IntegrationStatus {
  type: 'holidays' | 'pto';
  items?: Array<{ date: Date; description: string }>;
}

// State for integrations
export interface IntegrationsState {
  calendars: Record<string, CalendarIntegration>;
  communications: Record<string, CommunicationIntegration>;
  videoServices: Record<string, VideoIntegration>;
  hrSystems: Record<string, HRIntegration>;
  unified: {
    enabled: boolean;
    lastSynced?: Date;
  };
}

// Initial state
export const initialIntegrationsState: IntegrationsState = {
  calendars: {
    outlook: { type: 'outlook', connected: true, lastSynced: new Date() },
    google: { type: 'google', connected: false },
    apple: { type: 'apple', connected: false },
  },
  communications: {
    slack: { type: 'slack', connected: true, lastSynced: new Date() },
    teams: { type: 'teams', connected: true, lastSynced: new Date() },
    email: { type: 'email', connected: true, lastSynced: new Date() },
  },
  videoServices: {
    zoom: { type: 'zoom', connected: true, personalMeetingId: '123-456-789' },
    meet: { type: 'meet', connected: false },
    teams: { type: 'teams', connected: true },
    webex: { type: 'webex', connected: false },
  },
  hrSystems: {
    holidays: { type: 'holidays', connected: true },
    pto: { type: 'pto', connected: true },
  },
  unified: {
    enabled: true,
    lastSynced: new Date(),
  },
};

// Mock data for holidays and PTO
export const mockHolidays = [
  { date: new Date(new Date().getFullYear(), 0, 1), description: 'New Year\'s Day' },
  { date: new Date(new Date().getFullYear(), 11, 25), description: 'Christmas Day' },
  { date: new Date(new Date().getFullYear(), 6, 4), description: 'Independence Day' },
  // Add more holidays as needed
];

export const mockPTOEntries = [
  { date: new Date(new Date().getFullYear(), new Date().getMonth(), 15), description: 'Sarah\'s Vacation' },
  { date: new Date(new Date().getFullYear(), new Date().getMonth(), 16), description: 'Sarah\'s Vacation' },
  { date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5), description: 'Team Building Event' },
];

// Mock calendar events
export const getMockCalendarEvents = (): CalendarEvent[] => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  
  return [
    {
      id: '1',
      title: 'Team Stand-up',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30),
      calendar: 'outlook',
      link: 'https://zoom.us/j/123456789',
    },
    {
      id: '2',
      title: 'Product Review',
      start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
      end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0),
      calendar: 'teams',
      link: 'https://teams.microsoft.com/l/meetup-join/123',
    },
  ];
};

// Mock data generators
export function generateMockCalendarEvents(calendar: string, count: number = 5): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(8, 0, 0, 0);
  
  const eventTitles = [
    'Team Standup',
    'Product Review',
    'Client Meeting',
    'Design Workshop',
    'Sprint Planning',
    'Retrospective',
    '1:1 with Manager',
    'Code Review',
    'Project Kickoff',
    'Quarterly Planning'
  ];
  
  for (let i = 0; i < count; i++) {
    // Random start time between 8 AM and 5 PM
    const startHour = 8 + Math.floor(Math.random() * 9);
    const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
    
    const start = new Date(startOfDay);
    start.setHours(startHour, startMinute, 0, 0);
    
    // Random duration between 30 and 90 minutes
    const durationMinutes = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);
    
    // Random title
    const title = eventTitles[Math.floor(Math.random() * eventTitles.length)];
    
    // 50% chance of having a meeting link
    const hasLink = Math.random() > 0.5;
    const link = hasLink ? `https://meet.example.com/${Math.random().toString(36).substring(2, 8)}` : undefined;
    
    events.push({
      id: `cal-${calendar}-${i}`,
      title,
      start,
      end,
      calendar,
      link
    });
  }
  
  // Sort by start time
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

// API simulation functions
export async function simulateApiCall<T>(
  data: T, 
  delay: number = 1000, 
  errorRate: number = 0.05
): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorRate) {
        reject(new Error('API call failed'));
      } else {
        resolve(data);
      }
    }, delay);
  });
}

// Calendar integration services
export const calendarServices = {
  connect: async (type: 'outlook' | 'google' | 'apple'): Promise<CalendarIntegration> => {
    // In a real implementation, this would initiate OAuth flow and API connection
    console.log(`Connecting to ${type} calendar...`);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      type,
      connected: true,
      lastSynced: new Date(),
      events: getMockCalendarEvents(),
    };
  },
  
  disconnect: async (type: 'outlook' | 'google' | 'apple'): Promise<void> => {
    console.log(`Disconnecting from ${type} calendar...`);
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  getEvents: async (type: 'outlook' | 'google' | 'apple'): Promise<CalendarEvent[]> => {
    console.log(`Fetching events from ${type} calendar...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockCalendarEvents();
  },
  
  addEvent: async (type: 'outlook' | 'google' | 'apple', event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    console.log(`Adding event to ${type} calendar:`, event);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...event,
      id: Math.random().toString(36).substring(2, 11),
    };
  },
};

// Communication platform services
export const communicationServices = {
  connect: async (type: 'slack' | 'teams' | 'email'): Promise<CommunicationIntegration> => {
    console.log(`Connecting to ${type}...`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      type,
      connected: true,
      lastSynced: new Date(),
      channels: type === 'slack' ? ['general', 'random', 'dev'] : undefined,
    };
  },
  
  disconnect: async (type: 'slack' | 'teams' | 'email'): Promise<void> => {
    console.log(`Disconnecting from ${type}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  sendNotification: async (
    type: 'slack' | 'teams' | 'email',
    message: string,
    recipients: string[]
  ): Promise<boolean> => {
    console.log(`Sending ${type} notification to ${recipients.join(', ')}: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  },
};

// Video conferencing services
export const videoServices = {
  connect: async (type: 'zoom' | 'meet' | 'teams' | 'webex'): Promise<VideoIntegration> => {
    console.log(`Connecting to ${type}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      type,
      connected: true,
      personalMeetingId: `${Math.floor(100000000 + Math.random() * 900000000)}`,
    };
  },
  
  disconnect: async (type: 'zoom' | 'meet' | 'teams' | 'webex'): Promise<void> => {
    console.log(`Disconnecting from ${type}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  generateMeetingLink: async (type: 'zoom' | 'meet' | 'teams' | 'webex', title: string): Promise<string> => {
    console.log(`Generating ${type} meeting link for "${title}"...`);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const links = {
      zoom: 'https://zoom.us/j/',
      meet: 'https://meet.google.com/',
      teams: 'https://teams.microsoft.com/l/meetup-join/',
      webex: 'https://meetingsapac.webex.com/meet/',
    };
    
    const baseUrl = links[type];
    const meetingId = Math.random().toString(36).substring(2, 10);
    
    return `${baseUrl}${meetingId}`;
  },
};

// HR and enterprise system services
export const hrServices = {
  connect: async (type: 'holidays' | 'pto'): Promise<HRIntegration> => {
    console.log(`Connecting to HR system for ${type}...`);
    await new Promise(resolve => setTimeout(resolve, 1300));
    
    const items = type === 'holidays' ? mockHolidays : mockPTOEntries;
    
    return {
      type,
      connected: true,
      lastSynced: new Date(),
      items,
    };
  },
  
  disconnect: async (type: 'holidays' | 'pto'): Promise<void> => {
    console.log(`Disconnecting HR system for ${type}...`);
    await new Promise(resolve => setTimeout(resolve, 600));
  },
  
  getItems: async (type: 'holidays' | 'pto'): Promise<Array<{ date: Date; description: string }>> => {
    console.log(`Fetching ${type} entries...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return type === 'holidays' ? mockHolidays : mockPTOEntries;
  },
};

// Unified experience services
export const unifiedServices = {
  enable: async (): Promise<void> => {
    console.log('Enabling unified experience...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  
  disable: async (): Promise<void> => {
    console.log('Disabling unified experience...');
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  executeCommand: async (
    command: string, 
    context: Record<string, unknown>
  ): Promise<unknown> => {
    console.log(`Executing command "${command}" with context:`, context);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (command === '/schedule') {
      // Logic for scheduling would go here
      return {
        success: true,
        result: {
          suggestedTime: new Date(new Date().getTime() + 86400000), // Tomorrow
          participants: context.participants || [],
          title: context.title || 'New Meeting',
        },
      };
    }
    
    return { success: false, error: 'Command not recognized' };
  },
};

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  source: string;
  timestamp: Date;
  read: boolean;
}

// Integration state interface (simplified version of what's in the context)
interface IntegrationState {
  calendars: Record<string, { connected: boolean }>;
  communications: Record<string, { connected: boolean }>;
  videoServices: Record<string, { connected: boolean }>;
  hrSystems: Record<string, { connected: boolean }>;
}

// Generate mock notifications based on integration state
export function generateMockNotifications(state: IntegrationState): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();
  
  // Add notifications for connected calendars
  Object.entries(state.calendars).forEach(([name, calendar]) => {
    if (calendar.connected) {
      notifications.push({
        id: `cal-${name}-${Date.now()}`,
        title: `${name} Calendar Connected`,
        message: `Your ${name} calendar is now synced with World Clock.`,
        type: 'success',
        source: 'calendar',
        timestamp: new Date(now.getTime() - Math.random() * 3600000), // Random time in the last hour
        read: Math.random() > 0.5 // 50% chance of being read
      });
    }
  });
  
  // Add notifications for connected communications
  Object.entries(state.communications).forEach(([name, comm]) => {
    if (comm.connected) {
      notifications.push({
        id: `comm-${name}-${Date.now()}`,
        title: `${name} Integration Active`,
        message: `Your ${name} integration is active and receiving updates.`,
        type: 'info',
        source: 'communication',
        timestamp: new Date(now.getTime() - Math.random() * 7200000), // Random time in the last 2 hours
        read: Math.random() > 0.3 // 70% chance of being read
      });
    }
  });
  
  // Add system notifications
  notifications.push({
    id: `system-${Date.now()}`,
    title: 'System Update',
    message: 'World Clock has been updated to the latest version.',
    type: 'info',
    source: 'system',
    timestamp: new Date(now.getTime() - 86400000), // 1 day ago
    read: true
  });
  
  // Sort by timestamp (newest first)
  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
} 