"use client";

import { useState } from 'react';
import { UserPreferences, defaultPreferences } from './preferences';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      {/* AI Scheduler Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">AI Scheduler</h2>
          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">Beta</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Configure your AI scheduling assistant preferences</p>
        
        <div className="border rounded-lg divide-y divide-border">
          {/* Working Hours */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium">Working Hours</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Set your regular working hours</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={preferences.workingHours.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    workingHours: { ...preferences.workingHours, start: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.workingHours.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    workingHours: { ...preferences.workingHours, end: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Preferred Meeting Times */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium">Preferred Meeting Times</h3>
                <p className="text-xs text-muted-foreground mt-0.5">When you prefer to have meetings scheduled</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={preferences.preferredMeetingTimes.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferredMeetingTimes: { ...preferences.preferredMeetingTimes, start: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.preferredMeetingTimes.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferredMeetingTimes: { ...preferences.preferredMeetingTimes, end: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Focus Time */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium">Focus Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Block out time for focused work</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={preferences.focusTime.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    focusTime: { ...preferences.focusTime, start: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.focusTime.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    focusTime: { ...preferences.focusTime, end: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Lunch Time */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium">Lunch Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Set your preferred lunch break</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={preferences.lunchTime.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    lunchTime: { ...preferences.lunchTime, start: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.lunchTime.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    lunchTime: { ...preferences.lunchTime, end: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Meeting Rules */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium">Meeting Rules</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Configure meeting scheduling rules</p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.backToBackMeetings}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    backToBackMeetings: e.target.checked
                  })}
                  className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm">Allow back-to-back meetings</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">
                    Minimum break between meetings
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={preferences.minimumBreakBetweenMeetings}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        minimumBreakBetweenMeetings: parseInt(e.target.value)
                      })}
                      className="w-20 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">
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
                    className="w-20 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future sections */}
      <div className="opacity-50">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Display & Appearance</h2>
          <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">Coming soon</span>
        </div>
      </div>
    </div>
  );
} 