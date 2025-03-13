"use client";

import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  source?: string;
  link?: string;
}

// Create a global notification state that can be accessed from multiple components
let globalNotifications: Notification[] = [];
let notificationListeners: (() => void)[] = [];

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newNotification = {
    ...notification,
    id,
    timestamp: new Date(),
    read: false
  };
  
  globalNotifications = [newNotification, ...globalNotifications].slice(0, 20); // Keep only 20 most recent
  
  // Notify all listeners
  notificationListeners.forEach(listener => listener());
  
  // If browser notifications are supported and allowed, show a browser notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(newNotification.title, {
      body: newNotification.message,
      icon: '/notification-icon.png' // Add an icon appropriate for your app
    });
    
    // Open the related link if clicked
    if (newNotification.link) {
      notification.onclick = function() {
        window.open(newNotification.link);
      };
    }
  }
  
  return id;
}

export function markNotificationAsRead(id: string) {
  globalNotifications = globalNotifications.map(notification => 
    notification.id === id ? { ...notification, read: true } : notification
  );
  
  // Notify all listeners
  notificationListeners.forEach(listener => listener());
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(globalNotifications);
  
  useEffect(() => {
    // Update local state when global state changes
    const updateNotifications = () => {
      setNotifications([...globalNotifications]);
    };
    
    // Register this component as a listener
    notificationListeners.push(updateNotifications);
    
    // Cleanup: remove listener when component unmounts
    return () => {
      notificationListeners = notificationListeners.filter(listener => listener !== updateNotifications);
    };
  }, []);
  
  return {
    notifications,
    markAsRead: markNotificationAsRead,
    addNotification
  };
}

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Request notification permission if not already granted or denied
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      window.open(notification.link, '_blank');
    }
  };
  
  return (
    <div className="relative">
      <button 
        onClick={toggleNotifications}
        className="relative p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-700 animate-fadeIn">
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h3 className="text-white font-bold">Notifications</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-5 text-center text-gray-400">
                No notifications
              </div>
            ) : (
              <ul>
                {notifications.map(notification => (
                  <li 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors duration-200 ${
                      notification.read ? 'opacity-70' : 'bg-gray-750'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 rounded-full w-2 h-2 mt-2 mr-3 ${
                        notification.type === 'info' ? 'bg-blue-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{notification.title}</div>
                        <p className="text-sm text-gray-300">{notification.message}</p>
                        {notification.source && (
                          <div className="text-xs text-gray-400 mt-1">{notification.source}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 