"use client";

import { useState, useEffect } from 'react';
import { UserPreferences, defaultPreferences } from './preferences';
import { saveUserPreferences, loadUserPreferences } from '../utils/localStorage';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // Load preferences from localStorage when component mounts
  useEffect(() => {
    try {
      const loadedPreferences = loadUserPreferences();
      setPreferences(loadedPreferences);
    } catch (error) {
      console.error('Failed to load preferences from localStorage:', error);
    }
  }, []);

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
      
      {/* Enterprise Integration Hub Settings */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Enterprise Integration Hub Settings</h2>
        <div className="space-y-4 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          {/* General Integration Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">General Integration Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <span>Enable Auto Sync</span>
                  <input
                    type="checkbox"
                    checked={preferences.enterpriseIntegration.enableAutoSync}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        enableAutoSync: e.target.checked
                      }
                    })}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex flex-col">
                  <span className="mb-1">Sync Interval (minutes)</span>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={preferences.enterpriseIntegration.syncInterval}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        syncInterval: parseInt(e.target.value)
                      }
                    })}
                    className="form-input px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Default Services */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Default Services</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <span>Enable Calendar Integration</span>
                  <input
                    type="checkbox"
                    checked={preferences.enterpriseIntegration.enableCalendar}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        enableCalendar: e.target.checked,
                        defaultCalendar: e.target.checked ? preferences.enterpriseIntegration.defaultCalendar : 'none'
                      }
                    })}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">Default Calendar</label>
                <select
                  value={preferences.enterpriseIntegration.defaultCalendar}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    enterpriseIntegration: {
                      ...preferences.enterpriseIntegration,
                      defaultCalendar: e.target.value as 'outlook' | 'google' | 'apple' | 'none'
                    }
                  })}
                  disabled={!preferences.enterpriseIntegration.enableCalendar}
                  className={`form-select px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!preferences.enterpriseIntegration.enableCalendar ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="outlook">Outlook</option>
                  <option value="google">Google</option>
                  <option value="apple">Apple</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">Default Communication</label>
                <select
                  value={preferences.enterpriseIntegration.defaultCommunication}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    enterpriseIntegration: {
                      ...preferences.enterpriseIntegration,
                      defaultCommunication: e.target.value as 'slack' | 'teams' | 'email'
                    }
                  })}
                  className="form-select px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="slack">Slack</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">Default Video Service</label>
                <select
                  value={preferences.enterpriseIntegration.defaultVideoService}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    enterpriseIntegration: {
                      ...preferences.enterpriseIntegration,
                      defaultVideoService: e.target.value as 'zoom' | 'meet' | 'teams' | 'webex'
                    }
                  })}
                  className="form-select px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="zoom">Zoom</option>
                  <option value="meet">Google Meet</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="webex">Webex</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`flex items-center space-x-2 ${!preferences.enterpriseIntegration.enableCalendar ? 'opacity-50' : ''}`}>
                  <span>Calendar Sync Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.enterpriseIntegration.notificationPreferences.calendarSync}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        notificationPreferences: {
                          ...preferences.enterpriseIntegration.notificationPreferences,
                          calendarSync: e.target.checked
                        }
                      }
                    })}
                    disabled={!preferences.enterpriseIntegration.enableCalendar}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className={`flex items-center space-x-2 ${!preferences.enterpriseIntegration.enableCalendar ? 'opacity-50' : ''}`}>
                  <span>Upcoming Meeting Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.enterpriseIntegration.notificationPreferences.upcomingMeetings}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        notificationPreferences: {
                          ...preferences.enterpriseIntegration.notificationPreferences,
                          upcomingMeetings: e.target.checked
                        }
                      }
                    })}
                    disabled={!preferences.enterpriseIntegration.enableCalendar}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <span>Communication Message Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.enterpriseIntegration.notificationPreferences.communicationMessages}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        notificationPreferences: {
                          ...preferences.enterpriseIntegration.notificationPreferences,
                          communicationMessages: e.target.checked
                        }
                      }
                    })}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Data Privacy */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Data Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`flex items-center space-x-2 ${!preferences.enterpriseIntegration.enableCalendar ? 'opacity-50' : ''}`}>
                  <span>Share Calendar Data</span>
                  <input
                    type="checkbox"
                    checked={preferences.enterpriseIntegration.dataPrivacy.shareCalendarData}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        dataPrivacy: {
                          ...preferences.enterpriseIntegration.dataPrivacy,
                          shareCalendarData: e.target.checked
                        }
                      }
                    })}
                    disabled={!preferences.enterpriseIntegration.enableCalendar}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <span>Share Communication Data</span>
                  <input
                    type="checkbox"
                    checked={preferences.enterpriseIntegration.dataPrivacy.shareCommunicationData}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        dataPrivacy: {
                          ...preferences.enterpriseIntegration.dataPrivacy,
                          shareCommunicationData: e.target.checked
                        }
                      }
                    })}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <span>Share Analytics Data</span>
                  <input
                    type="checkbox"
                    checked={preferences.enterpriseIntegration.dataPrivacy.shareAnalyticsData}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enterpriseIntegration: {
                        ...preferences.enterpriseIntegration,
                        dataPrivacy: {
                          ...preferences.enterpriseIntegration.dataPrivacy,
                          shareAnalyticsData: e.target.checked
                        }
                      }
                    })}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-8">
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => {
            try {
              // Save preferences to localStorage using utility function
              const success = saveUserPreferences(preferences);
              
              // Show a success message
              if (success) {
                alert('Settings saved successfully!');
              } else {
                alert('Failed to save settings. Please try again.');
              }
            } catch (error) {
              console.error('Failed to save preferences:', error);
              alert('Failed to save settings. Please try again.');
            }
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
} 