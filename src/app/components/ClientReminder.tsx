"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ClientNote } from './PersonalNotes';

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

  // Fetch client data from API
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllClients = async () => {
      try {
        // Fetch clients for all relevant timezones
        const allTimezones = [...selectedTimezones, userLocalTimezone];
        const uniqueTimezones = [...new Set(allTimezones)];
        
        const token = localStorage.getItem('token');
        const fetchPromises = uniqueTimezones.map(tz => 
          fetch(`http://localhost:3001/api/clients?timezone=${encodeURIComponent(tz)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
            .then(res => res.ok ? res.json() : [])
            .then(data => data.map((client: ClientNote) => ({ ...client, timezone: tz })))
        );
        
        const results = await Promise.all(fetchPromises);
        const allClients = results.flat();
        
        setClients(allClients);
      } catch (error) {
        console.error('Error fetching clients for reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllClients();
  }, [user, userLocalTimezone, selectedTimezones]);

  // Generate reminders
  useEffect(() => {
    if (loading || !currentTime || !user || clients.length === 0) return;

    // For demo purposes, show a random client reminder every few minutes
    const minutes = currentTime.getMinutes();
    
    // Show a reminder every 5 minutes (0, 5, 10, etc.)
    if (minutes % 5 === 0 && currentTime.getSeconds() < 10) {
      if (clients.length > 0) {
        // Randomly select a client for the reminder
        const randomIndex = Math.floor(Math.random() * clients.length);
        const randomClient = clients[randomIndex];
        
        // Create a personalized reminder
        let reminderNote = '';
        
        // Build a custom message based on available client data
        if (randomClient.kidsSports && randomClient.kidsSports.length > 0) {
          reminderNote += `Remember, their child plays ${randomClient.kidsSports[0]}. `;
        }
        
        if (randomClient.hobbies && randomClient.hobbies.length > 0) {
          reminderNote += `They enjoy ${randomClient.hobbies.join(' and ')}. `;
        }
        
        if (randomClient.placesVisited && randomClient.placesVisited.length > 0) {
          const recentPlace = randomClient.placesVisited[0];
          reminderNote += `Recently visited ${recentPlace}. `;
        }
        
        if (randomClient.lastMeetingNotes) {
          reminderNote += `Last meeting: ${randomClient.lastMeetingNotes}`;
        }
        
        if (!reminderNote) {
          reminderNote = 'You have notes for this client.';
        }
        
        // Find a display label for the timezone
        let timezoneLabel = randomClient.timezone;
        
        // Simple label conversion
        if (randomClient.timezone === 'America/New_York') timezoneLabel = 'New York';
        if (randomClient.timezone === 'America/Chicago') timezoneLabel = 'Chicago';
        if (randomClient.timezone === 'Europe/London') timezoneLabel = 'London';
        if (randomClient.timezone === 'Asia/Tokyo') timezoneLabel = 'Tokyo';
        
        // Set the reminder
        setActiveReminder({
          clientName: randomClient.clientName,
          timezone: randomClient.timezone,
          timezoneLabel,
          note: reminderNote
        });
        
        // Show the notification
        setIsVisible(true);
        
        // Hide after 20 seconds
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => setActiveReminder(null), 500); // Clear after animation
        }, 20000);
      }
    }
  }, [currentTime, loading, clients, user]);

  // Return null if not authenticated or no active reminder
  if (!user || !activeReminder) return null;

  return (
    <div className={`fixed bottom-8 right-8 max-w-sm w-full bg-gray-800 border border-blue-500 rounded-lg shadow-lg transition-all duration-300 z-50 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white text-lg">Client Reminder</h3>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => setIsVisible(false)}
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
              onClick={() => setIsVisible(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 