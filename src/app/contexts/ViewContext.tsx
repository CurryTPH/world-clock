"use client";

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';


export type ViewType = 'list' | 'clocks' | 'digital';


export interface ViewContextProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}


const ViewContext = createContext<ViewContextProps>({
  currentView: 'list',
  setCurrentView: () => {},
});


export function ViewProvider({ children }: { children: React.ReactNode }) {
  // For server-side rendering and hydration consistency
  const [isClient, setIsClient] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [initialized, setInitialized] = useState(false);

  // Handle client-side only logic
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize from localStorage, but only on client
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const savedView = localStorage.getItem('preferredView') as ViewType;
      if (savedView && ['list', 'clocks', 'digital'].includes(savedView)) {
        setCurrentView(savedView);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    } finally {
      setInitialized(true);
    }
  }, [isClient]);

  // Save preference when view changes, but only if initialized to avoid 
  // overwriting preferences during initial hydration
  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    
    if (initialized && isClient) {
      try {
        localStorage.setItem('preferredView', view);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
  }, [initialized, isClient]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentView,
    setCurrentView: handleViewChange,
  }), [currentView, handleViewChange]);

  return (
    <ViewContext.Provider value={contextValue}>
      {children}
    </ViewContext.Provider>
  );
}

export const useView = () => useContext(ViewContext); 