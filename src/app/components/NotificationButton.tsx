"use client";

import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'tutorial' | 'alert' | 'info';
  details: string;
  category?: 'basic' | 'ai-scheduling' | 'analytics';
}

const tutorialNotifications: Notification[] = [
  // Analytics tutorials
  {
    id: 'analytics-overview',
    message: 'Global Workforce Analytics',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'analytics',
    details: 'Welcome to Global Workforce Analytics! This powerful feature helps you understand and optimize your team\'s productivity across different time zones. The analytics dashboard provides real-time insights into work patterns and collaboration efficiency.'
  },
  {
    id: 'productivity-heatmap',
    message: 'Understanding the Productivity Heat Map',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'analytics',
    details: 'The heat map visualization shows activity levels across a 24-hour period. Darker colors indicate higher activity levels. Use this to identify peak productivity periods and potential coverage gaps in your global team.'
  },
  {
    id: 'efficiency-metrics',
    message: 'Work Pattern & Efficiency Metrics',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'analytics',
    details: 'Track key performance indicators like project completion improvement and collaboration efficiency. These metrics help you measure the impact of your timezone management strategies.'
  },
  {
    id: 'ai-recommendations',
    message: 'AI-Driven Insights',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'analytics',
    details: 'Our AI system analyzes work patterns and provides actionable recommendations to improve team coordination. Look for warning signs (⚠️) that indicate potential issues and insights (💡) for optimization opportunities.'
  },
  {
    id: 'data-interpretation',
    message: 'Interpreting Analytics Data',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'analytics',
    details: 'The analytics dashboard updates in real-time as your team works. Use this data to make informed decisions about scheduling, hiring in new time zones, or adjusting work hours to improve global collaboration.'
  },
  // Basic functionality tutorials
  {
    id: 'dst-indicator',
    message: 'DST Indicator Guide',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'basic',
    details: 'The green "DST" badge indicates that a timezone is currently in Daylight Saving Time. This means the time is shifted forward by one hour from the standard time.'
  },
  {
    id: 'dst-transitions',
    message: 'DST Transition Dates',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'basic',
    details: 'Below each timezone, you\'ll see the DST transition dates showing when DST starts and ends. For example: "Mar 10 - Nov 3" means DST begins on March 10 and ends on November 3.'
  },
  {
    id: 'dst-dots',
    message: 'DST Transition Indicators',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'basic',
    details: 'Yellow dots appear next to times when DST transitions occur. These indicate the exact dates when clocks are adjusted forward in spring or backward in fall.'
  },
  {
    id: 'timezone-conversion',
    message: 'Time Conversion Guide',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'basic',
    details: 'Click any time to see its equivalent across all timezones. The selected time will be highlighted in pink across all columns, showing you the exact corresponding times.'
  },
  {
    id: 'current-time',
    message: 'Current Time Tracking',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'basic',
    details: 'The blue highlighted rows show the current time in each timezone. These automatically update and stay synchronized across all columns.'
  },
  // AI Scheduling tutorials
  {
    id: 'ai-scheduling-intro',
    message: 'AI-Powered Scheduling',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'ai-scheduling',
    details: 'Click the "Show Scheduler" button to access our intelligent meeting scheduling assistant. It helps find optimal meeting times across different timezones while considering everyone\'s preferences and working hours. Visit the Settings page to customize your scheduling preferences.'
  },
  {
    id: 'scheduling-preferences',
    message: 'Customizing Scheduling Preferences',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'ai-scheduling',
    details: 'Visit the Settings page to customize your scheduling preferences including working hours, preferred meeting times, focus time blocks, lunch time, and meeting frequency. These settings help the AI make better scheduling suggestions tailored to your needs.'
  },
  {
    id: 'adding-participants',
    message: 'Adding Participants',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'ai-scheduling',
    details: 'Use the timezone selector to add participants from different timezones. Each participant starts with default working hours (9 AM - 5 PM) and preferred meeting times in their local timezone. Your preferences from the settings will be automatically applied to your schedule.'
  },
  {
    id: 'ai-suggestions',
    message: 'Understanding AI Suggestions',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'ai-scheduling',
    details: 'The AI analyzes multiple factors to suggest the best meeting times based on your settings: working hours, preferred times, focus time protection, historical patterns, and lunch hours. Each suggestion shows a score and participant availability.'
  },
  {
    id: 'availability-indicators',
    message: 'Availability Status',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'ai-scheduling',
    details: 'Green badges indicate preferred times for participants, blue shows available times, and red indicates unavailable times. The AI ensures suggested slots work for everyone while respecting the preferences set in your scheduling settings.'
  },
  {
    id: 'focus-time',
    message: 'Focus Time Protection',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'ai-scheduling',
    details: 'Protect your productivity by setting focus time blocks in the scheduling settings. The AI will avoid suggesting meetings during these hours unless absolutely necessary. You can customize your focus time, default is 2-4 PM.'
  },
  {
    id: 'meeting-preferences',
    message: 'Meeting Preferences',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'ai-scheduling',
    details: 'In the settings, you can set your maximum meetings per day, minimum break between meetings, and whether to allow back-to-back meetings. The AI uses these preferences to prevent meeting fatigue and maintain a balanced schedule.'
  },
  {
    id: 'ai-learning',
    message: 'AI Learning & Adaptation',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    category: 'ai-scheduling',
    details: 'The AI learns from meeting patterns and your settings to improve suggestions. It considers your preferred time of day (morning/afternoon/evening) and scheduling habits. Update your preferences any time in the settings to adjust the AI\'s behavior.'
  }
];

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(tutorialNotifications);
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'ai-scheduling' | 'analytics'>('basic');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const basicTutorials = notifications.filter(n => n.category === 'basic');
  const aiTutorials = notifications.filter(n => n.category === 'ai-scheduling');
  const analyticsTutorials = notifications.filter(n => n.category === 'analytics');
  
  const basicProgress = (basicTutorials.filter(n => n.isRead).length / basicTutorials.length) * 100;
  const aiProgress = (aiTutorials.filter(n => n.isRead).length / aiTutorials.length) * 100;
  const analyticsProgress = (analyticsTutorials.filter(n => n.isRead).length / analyticsTutorials.length) * 100;

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSelectedCategory('basic')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  selectedCategory === 'basic' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Basic Features
                <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${basicProgress}%` }}
                  />
                </div>
              </button>
              <button
                onClick={() => setSelectedCategory('ai-scheduling')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  selectedCategory === 'ai-scheduling'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                AI Scheduling
                <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              </button>
              <button
                onClick={() => setSelectedCategory('analytics')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  selectedCategory === 'analytics'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Analytics
                <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${analyticsProgress}%` }}
                  />
                </div>
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications
                .filter(n => n.category === selectedCategory)
                .map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg transition-colors ${
                      notification.isRead 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-600 text-white'
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {index + 1}. {notification.message}
                      </h3>
                      {!notification.isRead && (
                        <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{notification.details}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 