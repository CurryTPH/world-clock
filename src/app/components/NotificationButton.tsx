"use client";

import { useState, useEffect, useCallback, useMemo, memo } from 'react';

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

// Store notifications in memory for the session
let notificationsStore: Notification[] = [];

// Function to add a new notification
export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date(),
    read: false
  };
  
  notificationsStore = [newNotification, ...notificationsStore];
  
  // Dispatch event to inform all instances about the change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notifications-changed', {
      detail: { notificationsStore }
    }));
  }
  
  // Show browser notification if permission granted
  if (typeof window !== 'undefined' && 
      'Notification' in window && 
      Notification.permission === 'granted') {
    const browserNotification = new window.Notification(notification.title, {
      body: notification.message,
      icon: '/notification-icon.png' // Add your icon path
    });
    
    if (notification.link) {
      browserNotification.onclick = function() {
        window.open(notification.link);
      };
    }
  }
  
  return newNotification;
}

// Mark a notification as read
export function markNotificationAsRead(id: string) {
  notificationsStore = notificationsStore.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  
  // Dispatch event to inform all instances about the change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notifications-changed', {
      detail: { notificationsStore }
    }));
  }
  
  return notificationsStore;
}

// Custom hook to use notifications across components
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsStore);
  
  useEffect(() => {
    // Update local state when store changes
    const handleNotificationsChanged = (event: any) => {
      setNotifications([...event.detail.notificationsStore]);
    };
    
    window.addEventListener('notifications-changed', handleNotificationsChanged);
    
    return () => {
      window.removeEventListener('notifications-changed', handleNotificationsChanged);
    };
  }, []);
  
  const markAsRead = useCallback((id: string) => {
    markNotificationAsRead(id);
  }, []);
  
  return {
    notifications,
    markAsRead,
    addNotification
  };
}

const NotificationItem = memo(({ 
  notification, 
  onNotificationClick,
  style
}: { 
  notification: Notification, 
  onNotificationClick: (notification: Notification) => void,
  style?: React.CSSProperties
}) => {
  const handleClick = useCallback(() => {
    onNotificationClick(notification);
  }, [onNotificationClick, notification]);
  
  return (
    <li 
      onClick={handleClick}
      style={style}
      className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors duration-200 scale-on-hover ${
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
  );
});

NotificationItem.displayName = 'NotificationItem';

const NotificationButton = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead } = useNotifications();
  
  // Calculate unread count with useMemo to optimize performance
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );
  
  // Close notifications when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notifications-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Request notification permission if not already granted or denied
  useEffect(() => {
    if (typeof window !== 'undefined' && 
        'Notification' in window && 
        Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const toggleNotifications = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      window.open(notification.link, '_blank', 'noopener,noreferrer');
    }
  }, [markAsRead]);
  
  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className={`
          relative p-2 text-gray-300 rounded-full hover:bg-gray-700 
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
          hover-lift scale-on-hover
          ${isOpen ? 'bg-gray-700 text-white' : ''}
          ${unreadCount > 0 ? 'animate-pulse-slow' : ''}
        `}
        aria-label={`${unreadCount} notifications`}
        aria-expanded={isOpen}
        aria-controls="notifications-panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isOpen ? 'text-blue-400' : ''} transition-colors duration-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center subtle-pulse" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-700 animate-fadeIn notifications-container" 
          role="dialog" 
          aria-modal="true" 
          aria-label="Notifications"
          style={{
            transformOrigin: 'top right',
            animation: 'fadeIn 0.2s ease-out, slideDown 0.2s ease-out'
          }}
        >
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h3 className="text-white font-bold">Notifications</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors duration-200 hover-lift"
              aria-label="Close notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-5 text-center text-gray-400 animate-fadeIn">
                No notifications
              </div>
            ) : (
              <ul>
                {notifications.map((notification, index) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onNotificationClick={handleNotificationClick}
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

NotificationButton.displayName = 'NotificationButton';
export default NotificationButton; 