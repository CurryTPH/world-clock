"use client";

import React, { useState, useEffect } from 'react';
import { useView } from '../contexts/ViewContext';
import { useDashboard } from '../contexts/DashboardContext';

export default function DashboardToggle() {
  const { currentView } = useView();
  const { isDashboardVisible, toggleDashboard } = useDashboard();
  const [isAnimating, setIsAnimating] = useState(false);
  const [wasVisible, setWasVisible] = useState(false);
  const [actionType, setActionType] = useState<'show' | 'hide' | null>(null);
  
  // Track state changes for animation
  useEffect(() => {
    const currentlyVisible = isDashboardVisible(currentView);
    if (wasVisible !== currentlyVisible) {
      setIsAnimating(true);
      setActionType(currentlyVisible ? 'show' : 'hide');
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setActionType(null);
      }, 500);
      
      setWasVisible(currentlyVisible);
      return () => clearTimeout(timer);
    }
  }, [currentView, isDashboardVisible, wasVisible]);
  
  const handleToggleClick = () => {
    const willBeVisible = !isDashboardVisible(currentView);
    setIsAnimating(true);
    setActionType(willBeVisible ? 'show' : 'hide');
    toggleDashboard(currentView);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
      setActionType(null);
    }, 500);
  };
  
  const isVisible = isDashboardVisible(currentView);
  
  return (
    <div className="flex justify-center mb-4">
      <button 
        onClick={handleToggleClick} 
        className={`
          px-4 py-2 rounded-lg shadow-md 
          focus:outline-none focus:ring-2 focus:ring-blue-400 
          transition-all duration-300 hover-lift scale-on-hover
          ${isAnimating ? 'button-press' : ''}
          ${isVisible 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
          }
          ${actionType === 'hide' ? 'dashboard-hide-pulse' : ''}
        `}
        aria-label={isVisible ? 'Hide dashboard' : 'Show dashboard'}
      >
        <span className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`
              h-5 w-5 mr-2 
              transition-transform duration-300 
              ${isVisible ? 'rotate-180' : 'rotate-0'}
              ${actionType === 'hide' ? 'dashboard-hide-pulse' : ''}
            `} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isVisible ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
            />
          </svg>
          <span className={actionType === 'hide' ? 'dashboard-hide-pulse' : ''}>
            {isVisible ? 'Hide' : 'Show'} Dashboard
          </span>
        </span>
      </button>
    </div>
  );
} 