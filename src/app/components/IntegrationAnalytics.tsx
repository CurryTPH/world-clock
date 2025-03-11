"use client";

import React, { useState, useEffect, useMemo, memo } from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';

interface AnalyticsData {
  totalConnections: number;
  activeServices: {
    calendars: number;
    communications: number;
    videoServices: number;
    hrSystems: number;
  };
  syncStatus: {
    healthy: number;
    warning: number;
    error: number;
  };
  usageMetrics: {
    meetingsScheduled: number;
    notificationsSent: number;
    commandsExecuted: number;
  };
  timezoneCoverage: {
    regions: string[];
    percentage: number;
  };
}

// Create a stable seed for random values
const getStableRandom = (seed: string) => {
  // Simple hash function for string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  // Normalize to 0-1 range
  return Math.abs(hash) / 2147483647;
};

// Memoize the component to prevent unnecessary re-renders
const IntegrationAnalytics = memo(function IntegrationAnalytics() {
  const { state } = useIntegrations();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalConnections: 0,
    activeServices: {
      calendars: 0,
      communications: 0,
      videoServices: 0,
      hrSystems: 0,
    },
    syncStatus: {
      healthy: 0,
      warning: 0,
      error: 0,
    },
    usageMetrics: {
      meetingsScheduled: 0,
      notificationsSent: 0,
      commandsExecuted: 0,
    },
    timezoneCoverage: {
      regions: [],
      percentage: 0,
    },
  });

  // Extract connection status as dependencies
  const connectionStatus = useMemo(() => {
    return {
      calendarsActive: Object.values(state.calendars).filter(c => c.connected).length,
      communicationsActive: Object.values(state.communications).filter(c => c.connected).length,
      videoServicesActive: Object.values(state.videoServices).filter(v => v.connected).length,
      hrSystemsActive: Object.values(state.hrSystems).filter(h => h.connected).length
    };
  }, [
    state.calendars,
    state.communications,
    state.videoServices,
    state.hrSystems
  ]);

  useEffect(() => {
    // Calculate analytics data based on integration state
    const calculateAnalytics = () => {
      const { calendarsActive, communicationsActive, videoServicesActive, hrSystemsActive } = connectionStatus;
      const totalActive = calendarsActive + communicationsActive + videoServicesActive + hrSystemsActive;
      
      // Determine sync health status
      let healthy = 0;
      let warning = 0;
      let error = 0;
      
      // Check last synced times for all services
      const now = new Date();
      const checkSyncHealth = (lastSynced?: Date) => {
        if (!lastSynced) return 'error';
        
        const diffMinutes = Math.floor((now.getTime() - lastSynced.getTime()) / (1000 * 60));
        if (diffMinutes < 60) return 'healthy';
        if (diffMinutes < 240) return 'warning';
        return 'error';
      };
      
      // Count health statuses
      [...Object.values(state.calendars), ...Object.values(state.communications)].forEach(service => {
        if (!service.connected) return;
        
        const health = checkSyncHealth(service.lastSynced);
        if (health === 'healthy') healthy++;
        else if (health === 'warning') warning++;
        else error++;
      });
      
      // Use deterministic "random" values based on the number of active connections
      const seed = `${calendarsActive}-${communicationsActive}-${videoServicesActive}-${hrSystemsActive}`;
      const meetingsScheduled = Math.floor(getStableRandom(`${seed}-meetings`) * 50) + 10;
      const notificationsSent = Math.floor(getStableRandom(`${seed}-notifications`) * 100) + 25;
      const commandsExecuted = Math.floor(getStableRandom(`${seed}-commands`) * 30) + 5;
      
      // Mock timezone coverage
      const regions = ['Americas', 'Europe', 'Asia Pacific'];
      const percentage = totalActive > 5 ? 85 : totalActive > 3 ? 65 : 40;
      
      setAnalyticsData({
        totalConnections: totalActive,
        activeServices: {
          calendars: calendarsActive,
          communications: communicationsActive,
          videoServices: videoServicesActive,
          hrSystems: hrSystemsActive,
        },
        syncStatus: {
          healthy,
          warning,
          error,
        },
        usageMetrics: {
          meetingsScheduled,
          notificationsSent,
          commandsExecuted,
        },
        timezoneCoverage: {
          regions,
          percentage,
        },
      });
    };
    
    calculateAnalytics();
  }, [connectionStatus, state.calendars, state.communications]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-700 relative z-0">
      <h3 className="text-xl font-semibold mb-4">Integration Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Connection Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Connection Status</h4>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{analyticsData.totalConnections}</span>
              <span className="text-xs text-gray-400">Active Connections</span>
            </div>
            <div className="flex space-x-2">
              <div className="flex flex-col items-center">
                <div className="w-2 h-10 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 w-full" 
                    style={{ height: `${(analyticsData.activeServices.calendars / 3) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 mt-1">Cal</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-10 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 w-full" 
                    style={{ height: `${(analyticsData.activeServices.communications / 3) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 mt-1">Comm</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-10 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 w-full" 
                    style={{ height: `${(analyticsData.activeServices.videoServices / 4) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 mt-1">Video</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-10 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 w-full" 
                    style={{ height: `${(analyticsData.activeServices.hrSystems / 2) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 mt-1">HR</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sync Health */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Sync Health</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white">{analyticsData.syncStatus.healthy}</span>
                <span className="text-xs text-gray-400">Healthy</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white">{analyticsData.syncStatus.warning}</span>
                <span className="text-xs text-gray-400">Warning</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white">{analyticsData.syncStatus.error}</span>
                <span className="text-xs text-gray-400">Error</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage Metrics */}
      <div className="bg-gray-700 rounded-lg p-4 mb-5">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Usage Metrics (Last 30 Days)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{analyticsData.usageMetrics.meetingsScheduled}</span>
            <span className="text-xs text-gray-400 text-center">Meetings Scheduled</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{analyticsData.usageMetrics.notificationsSent}</span>
            <span className="text-xs text-gray-400 text-center">Notifications Sent</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{analyticsData.usageMetrics.commandsExecuted}</span>
            <span className="text-xs text-gray-400 text-center">Commands Executed</span>
          </div>
        </div>
      </div>
      
      {/* Timezone Coverage */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Timezone Coverage</h4>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">{analyticsData.timezoneCoverage.percentage}%</span>
              <span className="text-xs text-gray-400 ml-2">Coverage</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Regions: {analyticsData.timezoneCoverage.regions.join(', ')}
            </div>
          </div>
          <div className="w-16 h-16 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4B5563"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${analyticsData.timezoneCoverage.percentage}, 100`}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

export default IntegrationAnalytics; 