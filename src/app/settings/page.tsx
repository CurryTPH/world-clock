"use client";

import { useState } from 'react';
import { UserPreferences, defaultPreferences } from './preferences';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="divide-y divide-border">
        {/* Working Hours */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium">Working Hours</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={preferences.workingHours.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    workingHours: { ...preferences.workingHours, start: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.workingHours.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    workingHours: { ...preferences.workingHours, end: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Meeting Times */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium">Preferred Meeting Times</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={preferences.preferredMeetingTimes.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferredMeetingTimes: { ...preferences.preferredMeetingTimes, start: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.preferredMeetingTimes.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferredMeetingTimes: { ...preferences.preferredMeetingTimes, end: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Focus Time */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium">Focus Time</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={preferences.focusTime.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    focusTime: { ...preferences.focusTime, start: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.focusTime.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    focusTime: { ...preferences.focusTime, end: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lunch Time */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium">Lunch Time</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={preferences.lunchTime.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    lunchTime: { ...preferences.lunchTime, start: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.lunchTime.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    lunchTime: { ...preferences.lunchTime, end: e.target.value }
                  })}
                  className="w-32 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Preferences */}
        <div className="py-4">
          <h2 className="text-base font-medium mb-4">Meeting Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Allow back-to-back meetings</label>
              <input
                type="checkbox"
                checked={preferences.backToBackMeetings}
                onChange={(e) => setPreferences({
                  ...preferences,
                  backToBackMeetings: e.target.checked
                })}
                className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">
                Minimum break between meetings
              </label>
              <input
                type="number"
                min="0"
                value={preferences.minimumBreakBetweenMeetings}
                onChange={(e) => setPreferences({
                  ...preferences,
                  minimumBreakBetweenMeetings: parseInt(e.target.value)
                })}
                className="w-20 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">
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
                className="w-20 px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Settings Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Global Workforce Analytics Settings</h2>
        <div className="space-y-4 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <span>Enable Productivity Tracking</span>
              <input
                type="checkbox"
                checked={preferences.analytics.enableProductivityTracking}
                onChange={(e) => setPreferences({
                  ...preferences,
                  analytics: {
                    ...preferences.analytics,
                    enableProductivityTracking: e.target.checked
                  }
                })}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <span>Show Team Metrics</span>
              <input
                type="checkbox"
                checked={preferences.analytics.showTeamMetrics}
                onChange={(e) => setPreferences({
                  ...preferences,
                  analytics: {
                    ...preferences.analytics,
                    showTeamMetrics: e.target.checked
                  }
                })}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <span>Notify Productivity Insights</span>
              <input
                type="checkbox"
                checked={preferences.analytics.notifyProductivityInsights}
                onChange={(e) => setPreferences({
                  ...preferences,
                  analytics: {
                    ...preferences.analytics,
                    notifyProductivityInsights: e.target.checked
                  }
                })}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex flex-col">
              <span className="mb-1">Activity Tracking Interval (minutes)</span>
              <input
                type="number"
                min="5"
                max="120"
                value={preferences.analytics.activityTrackingInterval}
                onChange={(e) => setPreferences({
                  ...preferences,
                  analytics: {
                    ...preferences.analytics,
                    activityTrackingInterval: parseInt(e.target.value)
                  }
                })}
                className="form-input px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex flex-col">
              <span className="mb-1">Data Retention Period (days)</span>
              <input
                type="number"
                min="1"
                max="365"
                value={preferences.analytics.retentionPeriod}
                onChange={(e) => setPreferences({
                  ...preferences,
                  analytics: {
                    ...preferences.analytics,
                    retentionPeriod: parseInt(e.target.value)
                  }
                })}
                className="form-input px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="flex flex-col">
            <label className="mb-2">Team Timezones of Interest</label>
            <div className="flex flex-wrap gap-2">
              {preferences.analytics.teamTimezonesOfInterest.map((timezone, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-700 px-3 py-1 rounded-full"
                >
                  <span>{timezone}</span>
                  <button
                    onClick={() => {
                      const newTimezones = [...preferences.analytics.teamTimezonesOfInterest];
                      newTimezones.splice(index, 1);
                      setPreferences({
                        ...preferences,
                        analytics: {
                          ...preferences.analytics,
                          teamTimezonesOfInterest: newTimezones
                        }
                      });
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const timezone = prompt('Enter timezone (e.g., America/New_York):');
                  if (timezone && !preferences.analytics.teamTimezonesOfInterest.includes(timezone)) {
                    setPreferences({
                      ...preferences,
                      analytics: {
                        ...preferences.analytics,
                        teamTimezonesOfInterest: [...preferences.analytics.teamTimezonesOfInterest, timezone]
                      }
                    });
                  }
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-sm"
              >
                Add Timezone
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-8">
        <button className="px-4 py-2 bg-primary text-white rounded-md">Save</button>
      </div>
    </div>
  );
} 