"use client";

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import { ViewType } from './ViewContext';

interface DashboardVisibility {
  list: boolean;
  clocks: boolean;
  digital: boolean;
}

export interface DashboardContextProps {
  dashboardVisibility: DashboardVisibility;
  toggleDashboard: (view: ViewType) => void;
  isDashboardVisible: (view: ViewType) => boolean;
}

const defaultVisibility: DashboardVisibility = { 
  list: false, 
  clocks: false, 
  digital: false 
};

const DashboardContext = createContext<DashboardContextProps>({
  dashboardVisibility: defaultVisibility,
  toggleDashboard: () => {},
  isDashboardVisible: () => false,
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // For server-side rendering and hydration consistency
  const [isClient, setIsClient] = useState(false);
  
  const [dashboardVisibility, setDashboardVisibility] = useState<DashboardVisibility>(() => {
    // Return default state for server rendering
    return defaultVisibility;
  });
  
  const [initialized, setInitialized] = useState(false);

  // Handle client-side only logic
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize from cookies on the client side
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const savedPreferences = Cookies.get('dashboardVisibility');
      if (savedPreferences) {
        setDashboardVisibility(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error("Error initializing dashboard preferences:", error);
    } finally {
      setInitialized(true);
    }
  }, [isClient]);

  // Save to cookies whenever visibility changes, but only if initialized
  useEffect(() => {
    if (!initialized || !isClient) return;
    
    try {
      Cookies.set('dashboardVisibility', JSON.stringify(dashboardVisibility), {
        expires: 365, // Store for a year
        sameSite: 'strict',
        secure: window.location.protocol === 'https:'
      });
    } catch (error) {
      console.error("Error saving dashboard preferences:", error);
    }
  }, [dashboardVisibility, initialized, isClient]);

  const toggleDashboard = useCallback((view: ViewType) => {
    setDashboardVisibility(prev => ({
      ...prev,
      [view]: !prev[view]
    }));
  }, []);

  const isDashboardVisible = useCallback((view: ViewType): boolean => {
    return dashboardVisibility[view];
  }, [dashboardVisibility]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    dashboardVisibility,
    toggleDashboard,
    isDashboardVisible
  }), [dashboardVisibility, toggleDashboard, isDashboardVisible]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext); 