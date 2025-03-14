"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ClientNote } from './PersonalNotes';

// Add cache for API responses
const clientCache: {
  [key: string]: {
    data: (ClientNote & { timezone: string })[],
    timestamp: number
  }
} = {};

// Cache TTL in milliseconds (10 minutes)
const CACHE_TTL = 10 * 60 * 1000;

interface ReminderProps {
  userLocalTimezone: string;
  selectedTimezones: string[];
  currentTime: Date;
}

export default function ClientReminder({ userLocalTimezone, selectedTimezones, currentTime }: ReminderProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<(ClientNote & { timezone: string })[]>([]);
  const [activeReminder, setActiveReminder] = useState<{
    clientName: string;
    timezone: string;
    note: string;
    timezoneLabel: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Refs for timeouts to ensure proper cleanup
  const reminderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearReminderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Track last shown reminder time to prevent duplicates
  const lastReminderTimeRef = useRef<number>(0);
  
  // Deduplicate timezones with useMemo
  const uniqueTimezones = useMemo(() => {
    return [...new Set([...selectedTimezones, userLocalTimezone])];
  }, [selectedTimezones, userLocalTimezone]);
  
  // Memoize the fetch function to prevent recreation on each render
  const fetchClientsForTimezone = useCallback(async (timezone: string, token: string | null) => {
    // Check cache first
    const cacheKey = `${timezone}_${token}`;
    const cachedData = clientCache[cacheKey];
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
      console.log(`Using cached client data for ${timezone}`);
      return cachedData.data;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/clients?timezone=${encodeURIComponent(timezone)}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      const clientsWithTimezone = data.map((client: ClientNote) => ({ ...client, timezone }));
      
      // Cache the result
      clientCache[cacheKey] = {
        data: clientsWithTimezone,
        timestamp: Date.now()
      };
      
      return clientsWithTimezone;
    } catch (error) {
      console.error(`Error fetching clients for ${timezone}:`, error);
      return [];
    }
  }, []);

  // Fetch client data from API with proper error handling and caching
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const token = localStorage.getItem('token');

    const fetchAllClients = async () => {
      try {
        setLoading(true);
        
        // Use Promise.all with our memoized fetch function
        const fetchPromises = uniqueTimezones.map(tz => 
          fetchClientsForTimezone(tz, token)
        );
        
        const results = await Promise.all(fetchPromises);
        const allClients = results.flat();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setClients(allClients);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching clients for reminders:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllClients();
    
    // Clean up function
    return () => {
      isMounted = false;
    };
  }, [user, uniqueTimezones, fetchClientsForTimezone]);

  // Generate reminders with better state management
  useEffect(() => {
    if (loading || !currentTime || !user || clients.length === 0) return;

    // Prevent showing reminders too frequently
    const currentTimeMs = currentTime.getTime();
    if (currentTimeMs - lastReminderTimeRef.current < 60000) { // At least 1 minute between reminders
      return;
    }

    const minutes = currentTime.getMinutes();
    
    // Show a reminder every 5 minutes (0, 5, 10, etc.)
    if (minutes % 5 === 0 && currentTime.getSeconds() < 10) {
      if (clients.length > 0) {
        // Only update if we don't already have an active reminder
        if (!isVisible && !activeReminder) {
          // Randomly select a client for the reminder
          const randomIndex = Math.floor(Math.random() * clients.length);
          const randomClient = clients[randomIndex];
          
          // Create a personalized reminder - move this to a separate function for clarity
          const reminderNote = createPersonalizedNote(randomClient);
          
          // Get a friendly timezone label
          const timezoneLabel = getTimezoneLabel(randomClient.timezone);
          
          // Update last reminder time
          lastReminderTimeRef.current = currentTimeMs;
          
          setActiveReminder({
            clientName: randomClient.clientName,
            timezone: randomClient.timezone,
            timezoneLabel,
            note: reminderNote
          });
          
          setIsVisible(true);
          
          // Clear any existing timeouts to prevent memory leaks
          if (reminderTimeoutRef.current) {
            clearTimeout(reminderTimeoutRef.current);
          }
          if (clearReminderTimeoutRef.current) {
            clearTimeout(clearReminderTimeoutRef.current);
          }
          
          // Hide after 20 seconds
          reminderTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
            clearReminderTimeoutRef.current = setTimeout(() => {
              setActiveReminder(null);
            }, 500); // Clear after animation
          }, 20000);
        }
      }
    }
  }, [currentTime, loading, clients, user, isVisible, activeReminder]);

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      if (reminderTimeoutRef.current) {
        clearTimeout(reminderTimeoutRef.current);
      }
      if (clearReminderTimeoutRef.current) {
        clearTimeout(clearReminderTimeoutRef.current);
      }
    };
  }, []);

  // Extract these to helper functions outside the render cycle
  function createPersonalizedNote(client: ClientNote & { timezone: string }): string {
    let reminderNote = '';
    
    if (client.kidsSports && client.kidsSports.length > 0) {
      reminderNote += `Remember, their child plays ${client.kidsSports[0]}. `;
    }
    
    if (client.hobbies && client.hobbies.length > 0) {
      reminderNote += `They enjoy ${client.hobbies.join(' and ')}. `;
    }
    
    if (client.placesVisited && client.placesVisited.length > 0) {
      const recentPlace = client.placesVisited[0];
      reminderNote += `Recently visited ${recentPlace}. `;
    }
    
    if (client.lastMeetingNotes) {
      reminderNote += `Last meeting: ${client.lastMeetingNotes}`;
    }
    
    return reminderNote || 'You have notes for this client.';
  }
  
  function getTimezoneLabel(timezone: string): string {
    const labels: Record<string, string> = {
      'America/New_York': 'New York',
      'America/Chicago': 'Chicago',
      'Europe/London': 'London',
      'Asia/Tokyo': 'Tokyo'
    };
    
    return labels[timezone] || timezone;
  }

  // Optimize rendering with early returns
  if (!user) return null;
  if (!activeReminder) return null;
  
  // Handle dismiss action
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setActiveReminder(null), 500); // Clear after animation
  }, []);

  return (
    <div className={`fixed bottom-8 right-8 max-w-sm w-full bg-gray-800 border border-blue-500 rounded-lg shadow-lg transition-all duration-300 z-50 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white text-lg">Client Reminder</h3>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={handleDismiss}
            aria-label="Close reminder"
          >
            ✕
          </button>
        </div>
        
        <div className="mt-2">
          <p className="text-blue-300 font-medium">
            {activeReminder.clientName} ({activeReminder.timezoneLabel})
          </p>
          
          <p className="text-gray-300 mt-2 text-sm">
            {activeReminder.note}
          </p>
          
          <div className="mt-4 flex justify-end">
            <button
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 