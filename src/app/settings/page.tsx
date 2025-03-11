"use client";

import { useState } from 'react';

export interface TimeRange {
  start: string;
  end: string;
}

export interface UserPreferences {
  workingHours: TimeRange;
  preferredMeetingTimes: TimeRange;
  focusTime: TimeRange;
  lunchTime: TimeRange;
  backToBackMeetings: boolean;
  maxMeetingsPerDay: number;
  preferredDayTime: 'morning' | 'afternoon' | 'evening';
  minimumBreakBetweenMeetings: number;
}

export const defaultPreferences: UserPreferences = {
  workingHours: { start: "09:00", end: "17:00" },
  preferredMeetingTimes: { start: "10:00", end: "16:00" },
  focusTime: { start: "14:00", end: "16:00" },
  lunchTime: { start: "12:00", end: "13:00" },
  backToBackMeetings: false,
  maxMeetingsPerDay: 5,
  preferredDayTime: 'morning',
  minimumBreakBetweenMeetings: 15
};

export default function Settings() {
  const [currentPreferences, setCurrentPreferences] = useState<UserPreferences>(defaultPreferences);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const handleSave = () => {
    // TODO: Implement save functionality
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const TimeRangeInput = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: TimeRange; 
    onChange: (range: TimeRange) => void;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">{label}</label>
      <div className="flex gap-4">
        <div>
          <label className="block text-xs text-gray-400">Start</label>
          <input
            type="time"
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="mt-1 block w-32 rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400">End</label>
          <input
            type="time"
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="mt-1 block w-32 rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Appearance</h2>
          <p className="mb-4">Customize the look and feel of your World Clock app.</p>
          <div className="p-3 bg-gray-700 rounded">
            <p className="text-gray-300">Settings will be implemented in a future update.</p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Default Timezones</h2>
          <p className="mb-4">Configure which timezones appear by default.</p>
          <div className="p-3 bg-gray-700 rounded">
            <p className="text-gray-300">Settings will be implemented in a future update.</p>
          </div>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">AI Scheduling Preferences</h2>
          <p className="mb-4">Customize your scheduling preferences for AI-powered meeting suggestions.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <TimeRangeInput
              label="Working Hours"
              value={currentPreferences.workingHours}
              onChange={(range) => setCurrentPreferences(prev => ({ ...prev, workingHours: range }))}
            />

            <TimeRangeInput
              label="Preferred Meeting Times"
              value={currentPreferences.preferredMeetingTimes}
              onChange={(range) => setCurrentPreferences(prev => ({ ...prev, preferredMeetingTimes: range }))}
            />

            <TimeRangeInput
              label="Focus Time"
              value={currentPreferences.focusTime}
              onChange={(range) => setCurrentPreferences(prev => ({ ...prev, focusTime: range }))}
            />

            <TimeRangeInput
              label="Lunch Time"
              value={currentPreferences.lunchTime}
              onChange={(range) => setCurrentPreferences(prev => ({ ...prev, lunchTime: range }))}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Preferred Time of Day</label>
              <select
                value={currentPreferences.preferredDayTime}
                onChange={(e) => setCurrentPreferences(prev => ({ 
                  ...prev, 
                  preferredDayTime: e.target.value as 'morning' | 'afternoon' | 'evening' 
                }))}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Maximum Meetings per Day</label>
              <input
                type="number"
                min="1"
                max="10"
                value={currentPreferences.maxMeetingsPerDay}
                onChange={(e) => setCurrentPreferences(prev => ({ 
                  ...prev, 
                  maxMeetingsPerDay: parseInt(e.target.value) 
                }))}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Minimum Break Between Meetings (minutes)</label>
              <input
                type="number"
                min="0"
                max="60"
                step="5"
                value={currentPreferences.minimumBreakBetweenMeetings}
                onChange={(e) => setCurrentPreferences(prev => ({ 
                  ...prev, 
                  minimumBreakBetweenMeetings: parseInt(e.target.value) 
                }))}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-sm font-medium text-gray-200">
                <input
                  type="checkbox"
                  checked={currentPreferences.backToBackMeetings}
                  onChange={(e) => setCurrentPreferences(prev => ({ 
                    ...prev, 
                    backToBackMeetings: e.target.checked 
                  }))}
                  className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span>Allow back-to-back meetings</span>
              </label>
              <p className="text-xs text-gray-400">
                When enabled, meetings can be scheduled immediately after each other without breaks
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-6">
            {showSavedMessage && (
              <span className="text-green-400 self-center">Settings saved!</span>
            )}
            <button
              onClick={() => setCurrentPreferences(defaultPreferences)}
              className="px-4 py-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 