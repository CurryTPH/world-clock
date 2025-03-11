"use client";

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type?: 'tutorial' | 'info';
  link?: string;
  details?: string;
}

const tutorialNotifications: Notification[] = [
  {
    id: 'dst-indicator',
    message: 'DST Indicator Guide',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    details: 'The green "DST" badge indicates that a timezone is currently in Daylight Saving Time. This means the time is shifted forward by one hour from the standard time.'
  },
  {
    id: 'dst-transitions',
    message: 'DST Transition Dates',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    details: 'Below each timezone, you\'ll see the DST transition dates showing when DST starts and ends. For example: "Mar 10 - Nov 3" means DST begins on March 10 and ends on November 3.'
  },
  {
    id: 'dst-dots',
    message: 'DST Transition Indicators',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    details: 'Yellow dots appear next to times when DST transitions occur. These indicate the exact dates when clocks are adjusted forward in spring or backward in fall.'
  },
  {
    id: 'timezone-conversion',
    message: 'Time Conversion Guide',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    details: 'Click any time to see its equivalent across all timezones. The selected time will be highlighted in pink across all columns, showing you the exact corresponding times.'
  },
  {
    id: 'current-time',
    message: 'Current Time Tracking',
    timestamp: new Date(),
    isRead: false,
    type: 'tutorial',
    details: 'The blue highlighted rows show the current time in each timezone. These automatically update and stay synchronized across all columns.'
  }
];

export default function NotificationButton() {
  const [notifications, setNotifications] = useState<Notification[]>(tutorialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && 
          buttonRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-300 ${
          unreadCount > 0 
            ? 'bg-blue-100 hover:bg-blue-200' 
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        {/* Question Mark Icon for Tutorial */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${unreadCount > 0 ? 'text-blue-500' : 'text-gray-500'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed right-4 mt-12 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto"
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">DST & Timezone Guide</h3>
              <div className="space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <p className={`${!notification.isRead ? 'font-semibold' : ''} text-lg`}>
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <span className="h-2 w-2 bg-blue-600 rounded-full mt-2"></span>
                    )}
                  </div>
                  {notification.details && (
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                      {notification.details}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    {format(notification.timestamp, 'MMM d, h:mm a')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 