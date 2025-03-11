"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { format, set, addHours, differenceInHours, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import TimezoneSelect, { selectStyles, commonTimezones, isTimezoneDST, getDSTTransitions } from './TimezoneSelect';
import NotificationButton from './NotificationButton';
import { AIScheduler } from './AIScheduler';
import { UserPreferences, defaultPreferences } from '../settings/preferences';
import { useIntegrations, IntegrationsProvider } from '../contexts/IntegrationsContext';
import CalendarEventsPanel from './CalendarEventsPanel';
import IntegrationAnalytics from './IntegrationAnalytics';
import CommandCenter from './CommandCenter';
import NotificationCenter from './NotificationCenter';

interface ProductivityData {
  hour: number;
  activityLevel: number;
  timezone: string;
}

interface WorkPatternMetrics {
  projectCompletionImprovement: number;
  collaborationEfficiency: number;
  recommendations: Array<{
    type: 'warning' | 'insight';
    message: string;
  }>;
}

interface AnalyticsData {
  productivity: ProductivityData[];
  metrics: WorkPatternMetrics;
}

interface Participant {
  name: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  preferredTimes?: {
    start: string;
    end: string;
  };
  focusTime?: {
    start: string;
    end: string;
  };
  meetingHistory: Date[];
}

const roundToNearestIncrement = (date: Date, increment: number) => {
  const minutes = date.getMinutes();
  const remainder = minutes % increment;
  return remainder < increment / 2
    ? set(date, { minutes: minutes - remainder, seconds: 0 })
    : set(date, { minutes: minutes + (increment - remainder), seconds: 0 });
};

const generateTimeSlots = (interval: number, baseDate: Date = new Date()): Date[] => {
  const timeStrings = new Set<string>();
  const result: Date[] = [];
  
  for (let dayOffset = -1; dayOffset <= 1; dayOffset++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayOffset);
    
    for (let i = 0; i < 24 * 60; i += interval) {
      const time = set(new Date(date), {
        hours: Math.floor(i / 60),
        minutes: i % 60,
        seconds: 0,
        milliseconds: 0
      });
      
      const timeString = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}-${time.getHours()}-${time.getMinutes()}`;
      
      if (!timeStrings.has(timeString)) {
        timeStrings.add(timeString);
        result.push(time);
      }
    }
  }
  
  return result.sort((a, b) => a.getTime() - b.getTime());
};

// Helper function to render icons for different services
const renderServiceIcon = (service: string) => {
  switch (service) {
    // Video services
    case 'zoom':
      return <span className="text-blue-400">Z</span>;
    case 'meet':
      return <span className="text-green-400">M</span>;
    case 'teams':
      return <span className="text-purple-400">T</span>;
    case 'webex':
      return <span className="text-yellow-400">W</span>;
    
    // Calendar services
    case 'outlook':
      return <span className="text-blue-400">O</span>;
    case 'google':
      return <span className="text-red-400">G</span>;
    case 'apple':
      return <span className="text-gray-400">A</span>;
    
    // Communication platforms
    case 'slack':
      return <span className="text-green-400">S</span>;
    case 'email':
      return <span className="text-blue-400">E</span>;
    
    // HR systems
    case 'holidays':
      return <span className="text-red-400">H</span>;
    case 'pto':
      return <span className="text-green-400">P</span>;
    
    default:
      return <span>•</span>;
  }
};

// Main component content
function WorldClockContent() {
  const userLocalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const timezones = commonTimezones;
  const [mounted, setMounted] = useState(false);
  const [localTime, setLocalTime] = useState<Date | null>(null);
  const [localTimeSlots, setLocalTimeSlots] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [showAIScheduler, setShowAIScheduler] = useState(false);
  const [userPreferences] = useState<UserPreferences>(defaultPreferences);

  // Integrations state and functions
  const { 
    state: integrationsState, 
    connectVideoService,
    connectCalendar: handleToggleCalendar,
    disconnectCalendar,
    connectCommunication,
    disconnectCommunication,
    connectHRSystem: handleToggleHRSystem,
    disconnectHRSystem,
    executeCommand,
    loading
  } = useIntegrations();
  
  // New state for integration interactions
  const [selectedVideoService, setSelectedVideoService] = useState<'zoom' | 'meet' | 'teams' | 'webex'>('zoom');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandOutput, setCommandOutput] = useState<string>('');

  const [analyticsData] = useState<AnalyticsData>({
    productivity: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activityLevel: Math.random() * 100,
      timezone: 'UTC'
    })),
    metrics: {
      projectCompletionImprovement: 25,
      collaborationEfficiency: 40,
      recommendations: [
        {
          type: 'warning',
          message: 'Support queue spikes at 5pm PT when EU team is offline. Consider adding late-shift coverage.'
        },
        {
          type: 'insight',
          message: 'Opportunity to improve APAC-EU handoff by adjusting team schedules by 1 hour.'
        }
      ]
    }
  });

  const [selectedTimezones, setSelectedTimezones] = useState([
    commonTimezones[0],
    commonTimezones[1],
    commonTimezones[2],
    commonTimezones[3],
  ]);
  const [highlightedTime, setHighlightedTime] = useState<Date | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([
    {
      name: "You",
      timezone: userLocalTimezone || "UTC",
      workingHours: { start: "09:00", end: "17:00" },
      preferredTimes: { start: "10:00", end: "16:00" },
      focusTime: { start: "14:00", end: "16:00" },
      meetingHistory: []
    }
  ]);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const localColumnRef = useRef<HTMLDivElement>(null);
  const refs = useRef([
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>()
  ]);

  const columnRefs = useMemo(() => refs.current, []);

  const scrollToTime = useCallback((targetElement: Element | null) => {
    if (targetElement instanceof HTMLElement) {
      const parent = targetElement.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();
        const scrollTop = parent.scrollTop + (elementRect.top - parentRect.top) - (parentRect.height / 2) + (elementRect.height / 2);
        
        parent.scrollTo({
          top: scrollTop,
          behavior: 'auto'
        });
      }
    }
  }, []);

  const scrollToCurrentTime = useCallback(() => {
    if (!localTime) return;
    
    const roundedLocalTimeForLocal = roundToNearestIncrement(localTime, 10);
    const formattedLocalTime = format(toZonedTime(roundedLocalTimeForLocal, userLocalTimezone), "MMM d, hh:mm a");
    
    const roundedLocalTimeForZones = roundToNearestIncrement(localTime, 30);

    if (localColumnRef.current) {
      const timeElements = Array.from(localColumnRef.current.children);
      const targetElement = timeElements.find((child) => child.textContent?.trim() === formattedLocalTime) || null;
      scrollToTime(targetElement);
    }

    columnRefs.forEach((ref, idx) => {
      if (ref.current) {
        const timezone = selectedTimezones[idx].value;
        const convertedTime = toZonedTime(roundedLocalTimeForZones, timezone);
        const formattedConvertedTime = format(convertedTime, "MMM d, hh:mm a");

        const timeElements = Array.from(ref.current.children);
        const targetElement = timeElements.find((child) => child.textContent?.trim() === formattedConvertedTime) || null;
        scrollToTime(targetElement);
      }
    });
  }, [localTime, selectedTimezones, scrollToTime, columnRefs, userLocalTimezone]);

  const handleTimeSelection = useCallback((selectedTime: Date) => {
    setHighlightedTime(selectedTime);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    columnRefs.forEach((ref, idx) => {
      if (ref.current) {
        const timezone = selectedTimezones[idx].value;
        const convertedTime = toZonedTime(selectedTime, timezone);
        const formattedConvertedTime = format(convertedTime, "MMM d, hh:mm a");

        const timeElements = Array.from(ref.current.children);
        const targetElement = timeElements.find((child) => child.textContent?.trim() === formattedConvertedTime) || null;
        scrollToTime(targetElement);
      }
    });

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedTime(null);
      scrollToCurrentTime();
    }, 5000);
  }, [columnRefs, selectedTimezones, scrollToTime, scrollToCurrentTime]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip handling if the event target is an input, select, or textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLSelectElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLButtonElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }
    
    if (!highlightedTime) return;
    
    const currentTime = new Date(highlightedTime);
    const newTime = new Date(highlightedTime);
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newTime.setMinutes(currentTime.getMinutes() - 30);
        handleTimeSelection(newTime);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newTime.setMinutes(currentTime.getMinutes() + 30);
        handleTimeSelection(newTime);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newTime.setHours(currentTime.getHours() - 1);
        handleTimeSelection(newTime);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newTime.setHours(currentTime.getHours() + 1);
        handleTimeSelection(newTime);
        break;
      case 'PageUp':
        event.preventDefault();
        newTime.setHours(currentTime.getHours() - 1);
        handleTimeSelection(newTime);
        break;
      case 'PageDown':
        event.preventDefault();
        newTime.setHours(currentTime.getHours() + 1);
        handleTimeSelection(newTime);
        break;
      case 'Home':
        event.preventDefault();
        handleTimeSelection(roundToNearestIncrement(new Date(), 30));
        break;
    }
  }, [highlightedTime, handleTimeSelection]);

  useEffect(() => {
    if (userLocalTimezone) {
      setParticipants(prev => prev.map(p => 
        p.name === "You" ? { ...p, timezone: userLocalTimezone } : p
      ));
    }
  }, [userLocalTimezone]);

  const handleAddParticipant = useCallback((timezone: string) => {
    const newParticipant: Participant = {
      name: `Participant ${participants.length + 1}`,
      timezone,
      workingHours: { start: "09:00", end: "17:00" },
      preferredTimes: { start: "10:00", end: "16:00" },
      meetingHistory: []
    };
    setParticipants(prev => [...prev, newParticipant]);
  }, [participants.length]);

  const handleAISlotSelect = useCallback((slot: Date) => {
    setHighlightedTime(slot);
    scrollToCurrentTime();
  }, [scrollToCurrentTime]);

  useEffect(() => {
    setMounted(true);
    setLocalTime(roundToNearestIncrement(new Date(), 10));
    setLocalTimeSlots(generateTimeSlots(10));
    setTimeSlots(generateTimeSlots(30));

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (localTime && !highlightedTime) {
      const interval = setInterval(() => {
        setLocalTime(roundToNearestIncrement(new Date(), 10));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [localTime, highlightedTime]);

  useEffect(() => {
    if (!highlightedTime && localTime) {
      setTimeout(() => {
        scrollToCurrentTime();
      }, 50);
    }
  }, [highlightedTime, scrollToCurrentTime, localTime]);

  useEffect(() => {
    if (!highlightedTime && localTime) {
      scrollToCurrentTime();
    }
  }, [selectedTimezones, scrollToCurrentTime, localTime, highlightedTime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const updateTimes = () => {
      setLocalTime(roundToNearestIncrement(new Date(), 10));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, []);
  
  // Handler for video service selection
  const handleVideoServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const service = e.target.value as 'zoom' | 'meet' | 'teams' | 'webex';
    setSelectedVideoService(service);
  };
  
  // Handler for generating a meeting link
  const handleGenerateMeetingLink = async () => {
    try {
      // Since we don't have generateMeetingLink anymore, we'll just create a mock link
      const mockLink = `https://meet.example.com/${Math.random().toString(36).substring(2, 8)}`;
      setMeetingLink(mockLink);
      
      // Connect the video service if it's not already connected
      if (!integrationsState.videoServices[selectedVideoService]?.connected) {
        await connectVideoService(selectedVideoService as any);
      }
    } catch (error) {
      console.error('Failed to generate meeting link:', error);
    }
  };
  
  // Format last synced time
  const formatLastSynced = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return format(date, 'MMM d');
  };

  // Handle command submission
  const handleExecuteCommand = async () => {
    if (!commandInput) return;
    
    try {
      const result = await executeCommand(commandInput);
      
      if (result) {
        setCommandOutput(`Success! ${result}`);
      } else {
        setCommandOutput(`Error: Command failed`);
      }
    } catch (error) {
      console.error('Failed to execute command:', error);
      setCommandOutput('Error executing command');
    }
  };

  if (!mounted || !localTime || !userLocalTimezone || localTimeSlots.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-0">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">World Clock 4</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Enhanced productivity and collaboration with deep integrations for global teams
        </p>
      </header>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left column - Main content */}
        <div className="lg:col-span-8">
          {/* World Clock Display */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Global Time Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">San Francisco</h3>
                <div className="text-3xl font-bold">
                  {format(new Date(), 'h:mm a')}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">London</h3>
                <div className="text-3xl font-bold">
                  {format(toZonedTime(new Date(), 'Europe/London'), 'h:mm a')}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {format(toZonedTime(new Date(), 'Europe/London'), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Tokyo</h3>
                <div className="text-3xl font-bold">
                  {format(toZonedTime(new Date(), 'Asia/Tokyo'), 'h:mm a')}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {format(toZonedTime(new Date(), 'Asia/Tokyo'), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Sydney</h3>
                <div className="text-3xl font-bold">
                  {format(toZonedTime(new Date(), 'Australia/Sydney'), 'h:mm a')}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {format(toZonedTime(new Date(), 'Australia/Sydney'), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Deep Integrations Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Deep Integrations with Productivity Tools</h2>
            <p className="text-gray-400 mb-6">Seamlessly connect with your existing workflow tools for maximum productivity and efficiency.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calendar Integration */}
              <div className="bg-gray-700 p-5 rounded-lg shadow border border-gray-600 hover:border-blue-500 transition-all group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">Calendar Sync</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Automatic synchronization with Outlook, Google Calendar, and iCloud.</p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Outlook</span>
                    <button 
                      onClick={() => handleToggleCalendar('outlook')}
                      disabled={loading[`connect-calendar-outlook`] || loading[`disconnect-calendar-outlook`]}
                      className={`relative inline-flex items-center h-4 rounded-full w-8 ${
                        integrationsState.calendars.outlook.connected ? 'bg-green-500' : 'bg-gray-600'
                      } transition-colors ${loading[`connect-calendar-outlook`] || loading[`disconnect-calendar-outlook`] ? 'opacity-50' : ''}`}
                    >
                      <span 
                        className={`absolute ${
                          integrationsState.calendars.outlook.connected ? 'right-0.5' : 'left-0.5'
                        } top-0.5 w-3 h-3 rounded-full bg-white transition-all`} 
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Google</span>
                    <button 
                      onClick={() => handleToggleCalendar('google')}
                      disabled={loading[`connect-calendar-google`] || loading[`disconnect-calendar-google`]}
                      className={`relative inline-flex items-center h-4 rounded-full w-8 ${
                        integrationsState.calendars.google.connected ? 'bg-green-500' : 'bg-gray-600'
                      } transition-colors ${loading[`connect-calendar-google`] || loading[`disconnect-calendar-google`] ? 'opacity-50' : ''}`}
                    >
                      <span 
                        className={`absolute ${
                          integrationsState.calendars.google.connected ? 'right-0.5' : 'left-0.5'
                        } top-0.5 w-3 h-3 rounded-full bg-white transition-all`} 
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Communication Platforms */}
              <div className="bg-gray-700 p-5 rounded-lg shadow border border-gray-600 hover:border-indigo-500 transition-all group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-indigo-400 transition-colors">Communication</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Integrate with Slack, Teams, and email for seamless scheduling.</p>
                <div className="flex flex-wrap gap-2">
                  <div className={`flex items-center ${integrationsState.communications.slack.connected ? 'bg-gray-600' : 'bg-gray-800 opacity-60'} rounded-full px-2 py-1 cursor-pointer`} onClick={() => connectCommunication('slack')}>
                    <div className="w-4 h-4 bg-[#4A154B] rounded mr-1"></div>
                    <span className="text-xs">Slack</span>
                    {integrationsState.communications.slack.connected && (
                      <svg className="w-3 h-3 ml-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className={`flex items-center ${integrationsState.communications.teams.connected ? 'bg-gray-600' : 'bg-gray-800 opacity-60'} rounded-full px-2 py-1 cursor-pointer`} onClick={() => connectCommunication('teams')}>
                    <div className="w-4 h-4 bg-[#6264A7] rounded mr-1"></div>
                    <span className="text-xs">Teams</span>
                    {integrationsState.communications.teams.connected && (
                      <svg className="w-3 h-3 ml-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Conferencing */}
              <div className="bg-gray-700 p-5 rounded-lg shadow border border-gray-600 hover:border-purple-500 transition-all group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors">Video Meetings</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Auto-generate meeting links for Zoom, Meet, Teams, and Webex.</p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <select 
                      className="text-xs bg-gray-600 border border-gray-500 rounded-md px-2 py-1 mr-2 flex-1"
                      value={selectedVideoService}
                      onChange={handleVideoServiceChange}
                    >
                      <option value="zoom">Zoom {integrationsState.videoServices.zoom.connected ? '(Connected)' : ''}</option>
                      <option value="meet">Google Meet {integrationsState.videoServices.meet.connected ? '(Connected)' : ''}</option>
                      <option value="teams">Microsoft Teams {integrationsState.videoServices.teams.connected ? '(Connected)' : ''}</option>
                      <option value="webex">Webex {integrationsState.videoServices.webex.connected ? '(Connected)' : ''}</option>
                    </select>
                    <button 
                      className={`text-xs ${loading[`generate-link-${selectedVideoService}`] ? 'bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-md px-2 py-1`}
                      onClick={handleGenerateMeetingLink}
                      disabled={loading[`generate-link-${selectedVideoService}`] || !integrationsState.videoServices[selectedVideoService].connected}
                    >
                      {loading[`generate-link-${selectedVideoService}`] ? 'Generating...' : 'Generate Link'}
                    </button>
                  </div>
                </div>
              </div>

              {/* HR & Enterprise Systems */}
              <div className="bg-gray-700 p-5 rounded-lg shadow border border-gray-600 hover:border-green-500 transition-all group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-green-400 transition-colors">HR & Enterprise</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Connect with HR systems to respect holidays, PTO, and work schedules.</p>
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs">Company Holidays</span>
                    <button 
                      onClick={() => handleToggleHRSystem('holidays')}
                      disabled={loading[`connect-hr-holidays`] || loading[`disconnect-hr-holidays`]}
                      className={`relative inline-flex items-center h-4 rounded-full w-8 ${
                        integrationsState.hrSystems.holidays.connected ? 'bg-green-500' : 'bg-gray-600'
                      } transition-colors`}
                    >
                      <span 
                        className={`absolute ${
                          integrationsState.hrSystems.holidays.connected ? 'right-0.5' : 'left-0.5'
                        } top-0.5 w-3 h-3 rounded-full bg-white transition-all`} 
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Command Center */}
          <div className="h-[400px] mb-6">
            <CommandCenter />
          </div>
          
          {/* Integration Analytics */}
          <IntegrationAnalytics />
        </div>
        
        {/* Right column - Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Integration Controls Panel */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Integration Controls</h3>
            
            {/* Video Services */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Video Services</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(integrationsState.videoServices).map(([key, service]) => (
                  <button
                    key={key}
                    onClick={() => connectVideoService(key as 'zoom' | 'meet' | 'teams' | 'webex')}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm ${
                      service.connected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {renderServiceIcon(key)}
                    <span className="ml-2">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Calendar Services */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Calendar Services</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(integrationsState.calendars).map(([key, service]) => (
                  <button
                    key={key}
                    onClick={() => handleToggleCalendar(key as 'outlook' | 'google' | 'apple')}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm ${
                      service.connected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {renderServiceIcon(key)}
                    <span className="ml-2">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Communication Platforms */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Communication Platforms</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(integrationsState.communications).map(([key, platform]) => (
                  <button
                    key={key}
                    onClick={() => connectCommunication(key as 'slack' | 'teams' | 'email')}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm ${
                      platform.connected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {renderServiceIcon(key)}
                    <span className="ml-2">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* HR Systems */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">HR Systems</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(integrationsState.hrSystems).map(([key, system]) => (
                  <button
                    key={key}
                    onClick={() => handleToggleHRSystem(key as 'holidays' | 'pto')}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm ${
                      system.connected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {renderServiceIcon(key)}
                    <span className="ml-2">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Calendar Events Panel */}
          <CalendarEventsPanel />
          
          {/* Notification Center */}
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
}

// Wrapper component with provider
export default function WorldClock4() {
  return (
    <IntegrationsProvider>
      <WorldClockContent />
    </IntegrationsProvider>
  );
} 