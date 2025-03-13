"use client";

import React from 'react';
import { useView, ViewType } from '../contexts/ViewContext';

export default function ViewSwitcher() {
  const { currentView, setCurrentView } = useView();

  const viewOptions: { id: ViewType; label: string; icon: string }[] = [
    { id: 'list', label: 'List', icon: '📋' },
    { id: 'clocks', label: 'Clocks', icon: '🕒' },
    { id: 'digital', label: 'Digital', icon: '🖥️' },
  ];

  return (
    <div className="mb-6 flex justify-center" role="tablist" aria-label="View options">
      <div className="bg-gray-800 rounded-lg p-1 flex shadow-lg">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            role="tab"
            aria-selected={currentView === option.id}
            aria-controls={`${option.id}-view`}
            className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ${
              currentView === option.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => setCurrentView(option.id)}
          >
            <span className="text-lg" aria-hidden="true">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 