"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';

interface CommandOutput {
  text: string;
  isError?: boolean;
  isSystem?: boolean;
}

export default function CommandCenter() {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [outputs, setOutputs] = useState<CommandOutput[]>([
    { text: 'Welcome to Command Center. Type "help" for available commands.', isSystem: true }
  ]);
  const { state, connectCalendar, connectCommunication, connectVideoService } = useIntegrations();
  const commandInputRef = useRef<HTMLInputElement>(null);
  const outputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
    }
  }, [outputs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commandInput.trim()) {
      executeCommand(commandInput);
      setCommandInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const cmdLower = trimmedCmd.toLowerCase();
    const args = trimmedCmd.split(' ').filter(arg => arg);
    const command = args[0]?.toLowerCase();

    // Add to history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Add command to output
    setOutputs(prev => [...prev, { text: `> ${trimmedCmd}` }]);

    // Process command
    if (command === 'help') {
      showHelp();
    } else if (command === 'clear') {
      clearOutput();
    } else if (command === 'status') {
      showStatus();
    } else if (command === 'connect') {
      connectService(args);
    } else if (command === 'sync') {
      syncService(args);
    } else if (command === 'schedule') {
      scheduleCommand(args);
    } else if (command === 'notify') {
      notifyCommand(args);
    } else {
      setOutputs(prev => [...prev, { 
        text: `Command not recognized: ${command}. Type "help" for available commands.`,
        isError: true 
      }]);
    }
  };

  const showHelp = () => {
    setOutputs(prev => [...prev, { 
      text: `
Available commands:
  help                          Show this help message
  clear                         Clear the command output
  status                        Show integration status
  connect [service] [name]      Connect to a service
  sync [service]                Sync data from a service
  schedule [person] [duration]  Schedule a meeting
  notify [service] [message]    Send a notification
      `,
      isSystem: true
    }]);
  };

  const clearOutput = () => {
    setOutputs([{ 
      text: 'Command output cleared. Type "help" for available commands.',
      isSystem: true 
    }]);
  };

  const showStatus = () => {
    const { calendars, communications, videoServices, hrSystems } = state;
    
    const calendarStatus = Object.entries(calendars)
      .map(([name, cal]) => `  ${name}: ${cal.connected ? 'Connected' : 'Disconnected'}`)
      .join('\n');
      
    const commStatus = Object.entries(communications)
      .map(([name, comm]) => `  ${name}: ${comm.connected ? 'Connected' : 'Disconnected'}`)
      .join('\n');
      
    const videoStatus = Object.entries(videoServices)
      .map(([name, video]) => `  ${name}: ${video.connected ? 'Connected' : 'Disconnected'}`)
      .join('\n');
      
    const hrStatus = Object.entries(hrSystems)
      .map(([name, hr]) => `  ${name}: ${hr.connected ? 'Connected' : 'Disconnected'}`)
      .join('\n');
    
    setOutputs(prev => [...prev, { 
      text: `
Integration Status:

Calendar Services:
${calendarStatus}

Communication Services:
${commStatus}

Video Services:
${videoStatus}

HR Systems:
${hrStatus}
      `,
      isSystem: true
    }]);
  };

  const connectService = (args: string[]) => {
    if (args.length < 3) {
      setOutputs(prev => [...prev, { 
        text: 'Usage: connect [service-type] [service-name]',
        isError: true 
      }]);
      return;
    }

    const serviceType = args[1].toLowerCase();
    const serviceName = args[2];

    try {
      if (serviceType === 'calendar') {
        connectCalendar(serviceName);
        setOutputs(prev => [...prev, { 
          text: `Connected to calendar service: ${serviceName}`,
          isSystem: true 
        }]);
      } else if (serviceType === 'communication') {
        connectCommunication(serviceName);
        setOutputs(prev => [...prev, { 
          text: `Connected to communication service: ${serviceName}`,
          isSystem: true 
        }]);
      } else if (serviceType === 'video') {
        connectVideoService(serviceName);
        setOutputs(prev => [...prev, { 
          text: `Connected to video service: ${serviceName}`,
          isSystem: true 
        }]);
      } else {
        setOutputs(prev => [...prev, { 
          text: `Unknown service type: ${serviceType}. Available types: calendar, communication, video`,
          isError: true 
        }]);
      }
    } catch (error) {
      setOutputs(prev => [...prev, { 
        text: `Error connecting to ${serviceType} service: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isError: true 
      }]);
    }
  };

  const syncService = (args: string[]) => {
    if (args.length < 2) {
      setOutputs(prev => [...prev, { 
        text: 'Usage: sync [service-name]',
        isError: true 
      }]);
      return;
    }

    const serviceName = args[1];
    setOutputs(prev => [...prev, { 
      text: `Syncing data from ${serviceName}...`,
      isSystem: true 
    }]);

    // Simulate sync delay
    setTimeout(() => {
      setOutputs(prev => [...prev, { 
        text: `Successfully synced data from ${serviceName}.`,
        isSystem: true 
      }]);
    }, 1500);
  };

  const scheduleCommand = (args: string[]) => {
    if (args.length < 3) {
      setOutputs(prev => [...prev, { 
        text: 'Usage: schedule [person] [duration-in-minutes]',
        isError: true 
      }]);
      return;
    }

    const person = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
      setOutputs(prev => [...prev, { 
        text: 'Duration must be a number in minutes',
        isError: true 
      }]);
      return;
    }

    setOutputs(prev => [...prev, { 
      text: `Scheduling a ${duration} minute meeting with ${person}...`,
      isSystem: true 
    }]);

    // Simulate scheduling delay
    setTimeout(() => {
      setOutputs(prev => [...prev, { 
        text: `Meeting scheduled with ${person} for ${duration} minutes.`,
        isSystem: true 
      }]);
    }, 1000);
  };

  const notifyCommand = (args: string[]) => {
    if (args.length < 3) {
      setOutputs(prev => [...prev, { 
        text: 'Usage: notify [service] [message]',
        isError: true 
      }]);
      return;
    }

    const service = args[1];
    const message = args.slice(2).join(' ');

    setOutputs(prev => [...prev, { 
      text: `Sending notification to ${service}: "${message}"`,
      isSystem: true 
    }]);

    // Simulate notification delay
    setTimeout(() => {
      setOutputs(prev => [...prev, { 
        text: `Notification sent to ${service}.`,
        isSystem: true 
      }]);
    }, 800);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-full flex flex-col relative z-0">
      <h3 className="text-lg font-semibold mb-2">Command Center</h3>
      
      <div 
        ref={outputContainerRef}
        className="flex-1 overflow-y-auto mb-2 font-mono text-sm bg-black/30 p-2 rounded"
      >
        {outputs.map((output, index) => (
          <div 
            key={index} 
            className={`mb-1 ${output.isError ? 'text-red-400' : output.isSystem ? 'text-green-400' : 'text-gray-300'}`}
          >
            {output.text}
          </div>
        ))}
      </div>
      
      <div className="flex items-center bg-black/30 rounded overflow-hidden">
        <span className="text-green-500 px-2">$</span>
        <input
          ref={commandInputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white p-2 font-mono"
          placeholder="Type a command..."
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">
        <span>Tip: Type &quot;help&quot; to see available commands</span>
      </div>
    </div>
  );
} 