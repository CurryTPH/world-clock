"use client";

import React from 'react';

export default function GuidesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">World Clock Guides</h1>
      
      <div className="space-y-8">
        {/* Quick Start Guide */}
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Basic Navigation</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Use the sidebar to switch between different World Clock views</li>
                <li>Click on any time to highlight it across all timezones</li>
                <li>Use keyboard arrows for precise time navigation</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Working with Timezones</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Select different timezones using the dropdown menus</li>
                <li>DST transitions are highlighted with yellow indicators</li>
                <li>Current time is marked in blue across all columns</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Guide */}
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Features Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">World Clock Classic</h3>
              <p className="text-gray-300">The original view with basic timezone comparison and DST tracking.</p>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">World Clock 2</h3>
              <p className="text-gray-300">Enhanced view with AI scheduling capabilities and meeting optimization.</p>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">World Clock 3</h3>
              <p className="text-gray-300">Advanced analytics and global workforce optimization features.</p>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Settings</h3>
              <p className="text-gray-300">Customize your experience with working hours, meeting preferences, and analytics options.</p>
            </div>
          </div>
        </section>

        {/* AI Scheduler Guide */}
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">AI Scheduler Guide</h2>
          
          <div className="space-y-6">
            {/* What is AI Scheduler? */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">What is AI Scheduler?</h3>
              <p className="text-gray-300 mb-4">
                The AI Scheduler is an intelligent meeting scheduling assistant that helps you find optimal meeting times across different timezones. It considers multiple factors including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Working hours of all participants</li>
                <li>Preferred meeting times</li>
                <li>Focus time blocks</li>
                <li>Existing meeting patterns</li>
                <li>Time zone overlaps</li>
                <li>DST transitions</li>
              </ul>
            </div>

            {/* How to Access */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">How to Access the AI Scheduler</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Navigate to World Clock 2 or World Clock 3</li>
                <li>Look for the &quot;AI-Powered Scheduling&quot; section at the top</li>
                <li>Click the &quot;Show Scheduler&quot; button to expand the interface</li>
              </ol>
            </div>

            {/* Setting Up Participants */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Setting Up Participants</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Adding Participants</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Use the timezone dropdown to add participants from different regions</li>
                    <li>Each participant is automatically assigned default working hours (9 AM - 5 PM in their timezone)</li>
                    <li>Your preferences are automatically imported from your settings</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Participant Settings</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Working Hours: Main availability window</li>
                    <li>Preferred Times: Optimal meeting hours</li>
                    <li>Focus Time: Protected time blocks for deep work</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How the AI Works */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">How the AI Works</h3>
              <div className="space-y-4 text-gray-300">
                <p>The AI Scheduler uses a sophisticated algorithm to:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Analyze timezone overlaps between all participants</li>
                  <li>Calculate optimal meeting slots based on:
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>Common working hours</li>
                      <li>Preferred meeting times</li>
                      <li>Historical meeting patterns</li>
                      <li>Break requirements between meetings</li>
                    </ul>
                  </li>
                  <li>Score potential time slots based on:
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>Number of participants in their working hours</li>
                      <li>Alignment with preferred meeting times</li>
                      <li>Distance from focus time blocks</li>
                      <li>Meeting frequency patterns</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>

            {/* Using the Scheduler */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Using the Scheduler</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Finding Optimal Times</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Add all meeting participants using the timezone selector</li>
                    <li>The AI will automatically highlight optimal meeting slots</li>
                    <li>Click on a suggested time to see it highlighted across all timezones</li>
                    <li>Green slots indicate optimal times that work for all participants</li>
                    <li>Yellow slots indicate times that work but may not be ideal for some participants</li>
                    <li>Red slots indicate times that conflict with working hours or focus time</li>
                  </ol>
                </div>
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Advanced Features</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Hover over time slots to see detailed compatibility information</li>
                    <li>Use the duration selector to find slots for longer or shorter meetings</li>
                    <li>Check DST indicators to avoid scheduling during timezone transitions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Best Practices</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Keep your working hours and preferences up to date in Settings</li>
                <li>Consider adding buffer time before and after meetings across timezones</li>
                <li>The AI&apos;s suggestions as a starting point, but always verify with participants</li>
                <li>Pay attention to DST changes when scheduling meetings weeks in advance</li>
                <li>Use the analytics features to understand team meeting patterns and optimize scheduling</li>
              </ul>
            </div>

            {/* Troubleshooting */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Troubleshooting</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Common Issues</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>No suitable slots found: Try adjusting the meeting duration or date range</li>
                    <li>Incorrect working hours: Verify participant settings in their local timezone</li>
                    <li>DST conflicts: Check for timezone transitions during the selected period</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Tips for Better Results</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Start with shorter meeting durations to find more available slots</li>
                    <li>Consider splitting long meetings into multiple shorter sessions</li>
                    <li>Use the analytics dashboard to identify optimal meeting patterns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Workforce Analytics Guide */}
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Global Workforce Analytics Guide</h2>
          
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Understanding Global Workforce Analytics</h3>
              <p className="text-gray-300 mb-4">
                Global Workforce Analytics is a powerful feature that transforms timezone data into actionable insights for better team coordination and efficiency. It helps you:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Visualize team productivity patterns across timezones</li>
                <li>Identify optimal collaboration windows</li>
                <li>Track project completion improvements</li>
                <li>Monitor collaboration efficiency</li>
                <li>Receive AI-driven recommendations for team optimization</li>
              </ul>
            </div>

            {/* Key Features */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Key Features</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Productivity Heat Map</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>24-hour visualization of team activity levels</li>
                    <li>Color intensity indicates productivity levels</li>
                    <li>Hover over time blocks to see detailed metrics</li>
                    <li>UTC-based timeline for global consistency</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Work Pattern Metrics</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Project completion improvement tracking</li>
                    <li>Collaboration efficiency scores</li>
                    <li>Team overlap analysis</li>
                    <li>Historical trend visualization</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">AI Recommendations</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Smart suggestions for schedule optimization</li>
                    <li>Team coverage gap identification</li>
                    <li>Workflow improvement recommendations</li>
                    <li>Automated pattern recognition</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Using Analytics */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Using Analytics Dashboard</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Accessing Analytics</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Navigate to World Clock 3</li>
                    <li>Find the Analytics Dashboard at the top of the page</li>
                    <li>Toggle between different metric views using the dashboard controls</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Reading the Heat Map</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Darker colors indicate higher activity levels</li>
                    <li>Each column represents one hour in UTC</li>
                    <li>Hover for detailed activity percentages</li>
                    <li>Look for patterns in team activity distribution</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Interpreting Data */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Interpreting Analytics Data</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Productivity Metrics</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Project Completion Rate: Measures improvement in task completion times</li>
                    <li>Collaboration Score: Indicates effectiveness of team interaction</li>
                    <li>Activity Levels: Shows team engagement across different hours</li>
                    <li>Coverage Analysis: Identifies gaps in team availability</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Understanding Recommendations</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Warning indicators highlight immediate attention areas</li>
                    <li>Insight badges suggest optimization opportunities</li>
                    <li>Trend arrows show metric movement direction</li>
                    <li>Action items provide specific steps for improvement</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Optimization Strategies */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Optimization Strategies</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Team Coverage</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Identify and fill coverage gaps across timezones</li>
                    <li>Adjust team schedules based on activity patterns</li>
                    <li>Optimize handoff times between regions</li>
                    <li>Balance workload across different time zones</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Collaboration Windows</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Schedule key meetings during high-overlap periods</li>
                    <li>Plan async work during low-overlap times</li>
                    <li>Use analytics to find optimal collaboration times</li>
                    <li>Respect team members&apos; peak productivity hours</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Analytics Best Practices</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Regularly review analytics data to identify trends</li>
                <li>Act on AI recommendations promptly</li>
                <li>Share insights with team leads for better coordination</li>
                <li>Use data to make informed scheduling decisions</li>
                <li>Monitor the impact of schedule changes on productivity</li>
                <li>Balance efficiency with team well-being</li>
              </ul>
            </div>

            {/* Troubleshooting */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Troubleshooting Analytics</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Common Issues</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Incomplete data: Ensure all team members are properly tracked</li>
                    <li>Misleading patterns: Account for holidays and local events</li>
                    <li>Metric fluctuations: Consider seasonal variations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Data Accuracy Tips</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Regularly update team member timezone information</li>
                    <li>Validate working hours and schedule changes</li>
                    <li>Consider DST changes in long-term analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips & Tricks */}
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Tips & Tricks</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Keyboard Shortcuts</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>↑/↓: Navigate in 30-minute increments</li>
                <li>Page Up/Down: Navigate hours</li>
                <li>Home: Jump to current time</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Pro Tips</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Hover over DST indicators for transition details</li>
                <li>Use AI Scheduler for optimal meeting times</li>
                <li>Check analytics for team productivity insights</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 