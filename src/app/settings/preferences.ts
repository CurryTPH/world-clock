export interface UserPreferences {
  workingHours: {
    start: string; // Format: "HH:mm"
    end: string;   // Format: "HH:mm"
  };
  preferredMeetingTimes: {
    start: string; // Format: "HH:mm"
    end: string;   // Format: "HH:mm"
  };
  focusTime: {
    start: string; // Format: "HH:mm"
    end: string;   // Format: "HH:mm"
  };
  lunchTime: {
    start: string; // Format: "HH:mm"
    end: string;   // Format: "HH:mm"
  };
  backToBackMeetings: boolean;
  minimumBreakBetweenMeetings: number; // in minutes
  maxMeetingsPerDay: number;
  analytics: {
    enableProductivityTracking: boolean;
    showTeamMetrics: boolean;
    activityTrackingInterval: number; // in minutes
    retentionPeriod: number; // in days
    notifyProductivityInsights: boolean;
    teamTimezonesOfInterest: string[];
  };
  enterpriseIntegration: {
    enableAutoSync: boolean;
    syncInterval: number; // in minutes
    defaultCalendar: 'outlook' | 'google' | 'apple';
    defaultCommunication: 'slack' | 'teams' | 'email';
    defaultVideoService: 'zoom' | 'meet' | 'teams' | 'webex';
    notificationPreferences: {
      calendarSync: boolean;
      upcomingMeetings: boolean;
      communicationMessages: boolean;
    };
    dataPrivacy: {
      shareCalendarData: boolean;
      shareCommunicationData: boolean;
      shareAnalyticsData: boolean;
    };
  };
}

export const defaultPreferences: UserPreferences = {
  workingHours: {
    start: "09:00",
    end: "17:00"
  },
  preferredMeetingTimes: {
    start: "10:00",
    end: "16:00"
  },
  focusTime: {
    start: "14:00",
    end: "16:00"
  },
  lunchTime: {
    start: "12:00",
    end: "13:00"
  },
  backToBackMeetings: false,
  minimumBreakBetweenMeetings: 15,
  maxMeetingsPerDay: 5,
  analytics: {
    enableProductivityTracking: true,
    showTeamMetrics: true,
    activityTrackingInterval: 30,
    retentionPeriod: 90,
    notifyProductivityInsights: true,
    teamTimezonesOfInterest: []
  },
  enterpriseIntegration: {
    enableAutoSync: true,
    syncInterval: 15,
    defaultCalendar: 'outlook',
    defaultCommunication: 'slack',
    defaultVideoService: 'zoom',
    notificationPreferences: {
      calendarSync: true,
      upcomingMeetings: true,
      communicationMessages: true
    },
    dataPrivacy: {
      shareCalendarData: true,
      shareCommunicationData: false,
      shareAnalyticsData: true
    }
  }
}; 