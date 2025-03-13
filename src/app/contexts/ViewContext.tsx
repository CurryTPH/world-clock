"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

// Define available view types
export type ViewType = 'list' | 'clocks' | 'digital';

// Define the context props
export interface ViewContextProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

// Create the context with default values
const ViewContext = createContext<ViewContextProps>({
  currentView: 'list',
  setCurrentView: () => {},
});

// Create a provider component
export function ViewProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with value from localStorage if available
  const [currentView, setCurrentView] = useState<ViewType>('list');

  // Load saved preference on component mount
  useEffect(() => {
    const savedView = localStorage.getItem('preferredView') as ViewType;
    if (savedView && ['list', 'clocks', 'digital'].includes(savedView)) {
      setCurrentView(savedView);
    }
  }, []);

  // Save preference when view changes
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    localStorage.setItem('preferredView', view);
  };

  return (
    <ViewContext.Provider
      value={{
        currentView,
        setCurrentView: handleViewChange,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

// Custom hook for using the view context
export const useView = () => useContext(ViewContext); 