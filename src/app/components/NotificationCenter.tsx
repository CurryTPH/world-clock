"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  source: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export default function NotificationCenter() {
  const { state } = useIntegrations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use a ref to store previous notification IDs for comparison
  const prevNotificationIdsRef = useRef<string[]>([]);

  // Generate mock notifications based on integration state
  useEffect(() => {
    const generateMockNotifications = () => {
      const mockNotifications: Notification[] = [];
      
      // Use a stable seed for random values to prevent unnecessary re-renders
      const getStableRandom = (seed: string) => {
        // Simple hash function for string
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
          hash = ((hash << 5) - hash) + seed.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        // Normalize to 0-1 range
        return Math.abs(hash) / 2147483647;
      };
      
      // Add notifications based on connected services
      Object.entries(state.calendars).forEach(([name, calendar]) => {
        if (calendar.connected) {
          const syncRandom = getStableRandom(`sync-${name}`);
          mockNotifications.push({
            id: `cal-${name}-${name}`, // Use consistent ID to prevent re-renders
            title: 'Calendar Sync Complete',
            message: `Your ${name} calendar has been synchronized.`,
            type: 'success',
            source: name,
            timestamp: new Date(Date.now() - syncRandom * 3600000),
            read: syncRandom > 0.5,
          });
          
          const eventRandom = getStableRandom(`event-${name}`);
          if (eventRandom > 0.7) {
            mockNotifications.push({
              id: `cal-event-${name}-${name}`, // Use consistent ID to prevent re-renders
              title: 'Upcoming Meeting',
              message: 'You have a meeting in 30 minutes with the Product team.',
              type: 'info',
              source: name,
              timestamp: new Date(Date.now() - eventRandom * 1800000),
              read: false,
              actionUrl: '#',
              actionLabel: 'View Details',
            });
          }
        }
      });
      
      Object.entries(state.communications).forEach(([name, comm]) => {
        if (comm.connected) {
          const commRandom = getStableRandom(`comm-${name}`);
          mockNotifications.push({
            id: `comm-${name}-${name}`, // Use consistent ID to prevent re-renders
            title: 'New Message',
            message: `You have a new message on ${name}.`,
            type: 'info',
            source: name,
            timestamp: new Date(Date.now() - commRandom * 7200000),
            read: commRandom > 0.3,
            actionUrl: '#',
            actionLabel: 'Read Message',
          });
        }
      });
      
      // Add some system notifications
      mockNotifications.push({
        id: `system-update-1`, // Use consistent ID to prevent re-renders
        title: 'System Update',
        message: 'World Clock has been updated to the latest version.',
        type: 'info',
        source: 'system',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        read: true,
      });
      
      if (Object.values(state.videoServices).some(v => !v.connected)) {
        mockNotifications.push({
          id: `video-suggestion-1`, // Use consistent ID to prevent re-renders
          title: 'Enhance Your Experience',
          message: 'Connect your video conferencing services to schedule meetings directly.',
          type: 'warning',
          source: 'system',
          timestamp: new Date(Date.now() - 43200000), // 12 hours ago
          read: false,
          actionUrl: '#',
          actionLabel: 'Connect Now',
        });
      }
      
      // Sort by timestamp (newest first)
      mockNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Get current notification IDs
      const mockNotificationIds = mockNotifications.map(n => n.id);
      
      // Only update state if the notifications have actually changed
      // Compare with the previous notification IDs stored in the ref
      const notificationsChanged = 
        prevNotificationIdsRef.current.length !== mockNotificationIds.length ||
        !prevNotificationIdsRef.current.every((id, index) => id === mockNotificationIds[index]);
      
      if (notificationsChanged) {
        // Update the ref with the new IDs
        prevNotificationIdsRef.current = mockNotificationIds;
        setNotifications(mockNotifications);
      }
    };
    
    generateMockNotifications();
    // Only regenerate notifications when connection status changes
  }, [state.calendars, state.communications, state.videoServices]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-700 h-full relative z-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Notification Center</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-full flex items-center ${
              filter === 'unread' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear all
          </button>
        </div>
      </div>
      
      <div className="h-[320px] overflow-y-auto pr-1 space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`bg-gray-700 rounded-lg p-3 transition-colors ${
                notification.read ? 'opacity-70' : 'border-l-4 border-blue-500'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-white">{notification.title}</h4>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                  {notification.actionUrl && notification.actionLabel && (
                    <a 
                      href={notification.actionUrl} 
                      className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notification.actionLabel}
                    </a>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    Source: {notification.source}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
            <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm">No notifications to display</p>
          </div>
        )}
      </div>
    </div>
  );
} 