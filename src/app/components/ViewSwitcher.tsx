"use client";

import React, { useState } from 'react';
import { useView, ViewType } from '../contexts/ViewContext';

export default function ViewSwitcher() {
  const { currentView, setCurrentView } = useView();
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);

  const viewOptions: { id: ViewType; label: string; icon: string }[] = [
    { id: 'list', label: 'List', icon: '📋' },
    { id: 'clocks', label: 'Clocks', icon: '🕒' },
    { id: 'digital', label: 'Digital', icon: '🖥️' },
  ];

  const handleViewChange = (viewId: ViewType) => {
    if (viewId === currentView) return;
    
    // Add animation to the button
    setAnimatingButton(viewId);
    
    // Remove animation after transition completes
    setTimeout(() => {
      setAnimatingButton(null);
    }, 300);
    
    setCurrentView(viewId);
  };

  return (
    <div className="mb-6 flex justify-center" role="tablist" aria-label="View options">
      <div className="bg-gray-800 rounded-lg p-1 flex shadow-lg">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            role="tab"
            aria-selected={currentView === option.id}
            aria-controls={`${option.id}-view`}
            className={`
              px-4 py-2 rounded-md flex items-center space-x-2 hover-lift
              ${animatingButton === option.id ? 'button-press' : ''} 
              ${currentView === option.id 
                ? 'bg-indigo-600 text-white shadow-md transition-all duration-300'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200'
              }
              ${currentView === option.id && !animatingButton ? 'subtle-pulse' : ''}
            `}
            onClick={() => handleViewChange(option.id)}
          >
            <span 
              className={`text-lg ${animatingButton === option.id ? 'transform scale-110 transition-transform duration-300' : ''}`} 
              aria-hidden="true"
            >
              {option.icon}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 