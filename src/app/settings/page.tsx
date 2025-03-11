"use client";

import { useState } from 'react';
import { UserPreferences, defaultPreferences } from './preferences';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        {/* Working Hours */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Working Hours</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={preferences.workingHours.start}
                onChange={(e) => setPreferences({
                  ...preferences,
                  workingHours: { ...preferences.workingHours, start: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={preferences.workingHours.end}
                onChange={(e) => setPreferences({
                  ...preferences,
                  workingHours: { ...preferences.workingHours, end: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Preferred Meeting Times */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Preferred Meeting Times</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={preferences.preferredMeetingTimes.start}
                onChange={(e) => setPreferences({
                  ...preferences,
                  preferredMeetingTimes: { ...preferences.preferredMeetingTimes, start: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={preferences.preferredMeetingTimes.end}
                onChange={(e) => setPreferences({
                  ...preferences,
                  preferredMeetingTimes: { ...preferences.preferredMeetingTimes, end: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Focus Time */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Focus Time</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={preferences.focusTime.start}
                onChange={(e) => setPreferences({
                  ...preferences,
                  focusTime: { ...preferences.focusTime, start: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={preferences.focusTime.end}
                onChange={(e) => setPreferences({
                  ...preferences,
                  focusTime: { ...preferences.focusTime, end: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Lunch Time */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Lunch Time</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={preferences.lunchTime.start}
                onChange={(e) => setPreferences({
                  ...preferences,
                  lunchTime: { ...preferences.lunchTime, start: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={preferences.lunchTime.end}
                onChange={(e) => setPreferences({
                  ...preferences,
                  lunchTime: { ...preferences.lunchTime, end: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Other Preferences */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Other Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.backToBackMeetings}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    backToBackMeetings: e.target.checked
                  })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2">Allow back-to-back meetings</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum break between meetings (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={preferences.minimumBreakBetweenMeetings}
                onChange={(e) => setPreferences({
                  ...preferences,
                  minimumBreakBetweenMeetings: parseInt(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum meetings per day
              </label>
              <input
                type="number"
                min="1"
                value={preferences.maxMeetingsPerDay}
                onChange={(e) => setPreferences({
                  ...preferences,
                  maxMeetingsPerDay: parseInt(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 