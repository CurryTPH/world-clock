"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';

interface CommandHistory {
  input: string;
  response: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}

export default function CommandCenter() {
  const { state, executeCommand } = useIntegrations();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      input: '',
      response: 'Welcome to World Clock Command Center. Type "help" to see available commands.',
      type: 'info',
      timestamp: new Date()
    }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const command = input.trim();
    setInput('');
    setIsProcessing(true);
    
    // Add command to history immediately
    setHistory(prev => [...prev, {
      input: command,
      response: '',
      type: 'info',
      timestamp: new Date()
    }]);
    
    try {
      let response = '';
      let type: 'success' | 'error' | 'info' = 'info';
      
      // Process built-in commands
      if (command.toLowerCase() === 'help') {
        response = `
Available commands:
- help: Show this help message
- status: Show integration status
- schedule [person] [duration]: Schedule a meeting with someone
- notify [service] [message]: Send a notification
- sync [service]: Sync a specific service
- clear: Clear command history
        `.trim();
        type = 'info';
      } 
      else if (command.toLowerCase() === 'status') {
        const connectedServices = [
          ...Object.entries(state.calendars),
          ...Object.entries(state.communications),
          ...Object.entries(state.videoServices),
          ...Object.entries(state.hrSystems)
        ].filter(([_, service]) => service.connected);
        
        if (connectedServices.length === 0) {
          response = 'No services connected. Use the integration panel to connect services.';
        } else {
          response = `Connected services:\n${connectedServices.map(([name, service]) => 
            `- ${name}: Connected${service.lastSynced ? ` (Last synced: ${service.lastSynced.toLocaleTimeString()})` : ''}`
          ).join('\n')}`;
        }
        type = 'success';
      }
      else if (command.toLowerCase() === 'clear') {
        setHistory([{
          input: '',
          response: 'Command history cleared.',
          type: 'info',
          timestamp: new Date()
        }]);
        setIsProcessing(false);
        return;
      }
      else if (command.toLowerCase().startsWith('schedule ')) {
        const parts = command.split(' ');
        if (parts.length < 3) {
          response = 'Invalid command format. Use: schedule [person] [duration]';
          type = 'error';
        } else {
          const person = parts[1];
          const duration = parts[2];
          response = `Scheduling a ${duration} meeting with ${person}...`;
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const connectedCalendars = Object.entries(state.calendars)
            .filter(([_, cal]) => cal.connected)
            .map(([name]) => name);
          
          if (connectedCalendars.length === 0) {
            response += '\nFailed: No calendar services connected.';
            type = 'error';
          } else {
            response += `\nSuccess! Meeting scheduled using ${connectedCalendars[0]} calendar.`;
            type = 'success';
          }
        }
      }
      else if (command.toLowerCase().startsWith('notify ')) {
        const parts = command.split(' ');
        if (parts.length < 3) {
          response = 'Invalid command format. Use: notify [service] [message]';
          type = 'error';
        } else {
          const service = parts[1].toLowerCase();
          const message = parts.slice(2).join(' ');
          
          const validServices = Object.keys(state.communications);
          if (!validServices.includes(service)) {
            response = `Invalid service. Available services: ${validServices.join(', ')}`;
            type = 'error';
          } else if (!state.communications[service]?.connected) {
            response = `Service ${service} is not connected.`;
            type = 'error';
          } else {
            response = `Sending notification to ${service}: "${message}"`;
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            response += '\nNotification sent successfully!';
            type = 'success';
          }
        }
      }
      else if (command.toLowerCase().startsWith('sync ')) {
        const service = command.split(' ')[1]?.toLowerCase();
        
        const allServices = {
          ...state.calendars,
          ...state.communications,
          ...state.videoServices,
          ...state.hrSystems
        };
        
        if (!service || !Object.keys(allServices).includes(service)) {
          response = `Invalid service. Available services: ${Object.keys(allServices).join(', ')}`;
          type = 'error';
        } else if (!allServices[service]?.connected) {
          response = `Service ${service} is not connected.`;
          type = 'error';
        } else {
          response = `Syncing ${service}...`;
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          response += '\nSync completed successfully!';
          type = 'success';
        }
      }
      else {
        // Try to execute via integration context
        if (typeof executeCommand === 'function') {
          try {
            const result = await executeCommand(command);
            response = result || 'Command executed successfully.';
            type = 'success';
          } catch (error) {
            response = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            type = 'error';
          }
        } else {
          response = `Unknown command: ${command}. Type "help" to see available commands.`;
          type = 'error';
        }
      }
      
      // Update the last history item with the response
      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          ...newHistory[newHistory.length - 1],
          response,
          type
        };
        return newHistory;
      });
    } catch (error) {
      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          ...newHistory[newHistory.length - 1],
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error'
        };
        return newHistory;
      });
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-700 flex flex-col h-full relative z-0">
      <h3 className="text-xl font-semibold mb-4">Command Center</h3>
      
      <div className="flex-1 overflow-y-auto mb-4 font-mono text-sm bg-gray-900 rounded-lg p-3 h-[280px]">
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            {item.input && (
              <div className="flex items-start">
                <span className="text-green-500 mr-2">❯</span>
                <span className="text-gray-300">{item.input}</span>
              </div>
            )}
            <div className={`pl-4 ${
              item.type === 'success' ? 'text-green-400' : 
              item.type === 'error' ? 'text-red-400' : 
              'text-blue-400'
            }`}>
              {item.response.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ))}
        <div ref={historyEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-l-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type a command..."
            disabled={isProcessing}
          />
        </div>
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className={`bg-blue-600 text-white rounded-r-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            isProcessing || !input.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
          ) : (
            'Send'
          )}
        </button>
      </form>
      
      <div className="mt-2 text-xs text-gray-500">
        <span>Tip: Type "help" to see available commands</span>
      </div>
    </div>
  );
} 