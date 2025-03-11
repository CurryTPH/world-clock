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
  start: string;
  end: string;
  meetingLink?: string;
  attendees?: string[];
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
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30).toISOString(),
      meetingLink: 'https://zoom.us/j/123456789',
    },
    {
      id: '2',
      title: 'Product Review',
      start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0).toISOString(),
      end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0).toISOString(),
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/123',
    },
  ];
};

// Mock data generators
export function generateMockCalendarEvents(calendar: string, count: number = 5): CalendarEvent[] {
  const now = new Date();
  const events: CalendarEvent[] = [];
  
  for (let i = 0; i < count; i++) {
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
  
  executeCommand: async (command: string, context: Record<string, any>): Promise<any> => {
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