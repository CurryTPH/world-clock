"use client";

import { useState } from 'react';
import { AIScheduler } from '../components/AIScheduler';
import TimezoneSelect from '../components/TimezoneSelect';
import { defaultPreferences } from '../settings/preferences';

export default function AISchedulerPage() {
  const [participants, setParticipants] = useState([
    {
      name: "You",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      workingHours: {
        start: "09:00",
        end: "17:00"
      }
    }
  ]);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    timezone: "America/New_York",
    workingHours: {
      start: "09:00",
      end: "17:00"
    }
  });
  const [duration, setDuration] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const handleAddParticipant = () => {
    if (newParticipant.name.trim() === "") return;
    
    setParticipants([...participants, { ...newParticipant }]);
    setNewParticipant({
      name: "",
      timezone: "America/New_York",
      workingHours: {
        start: "09:00",
        end: "17:00"
      }
    });
  };

  const handleRemoveParticipant = (index: number) => {
    const updated = [...participants];
    updated.splice(index, 1);
    setParticipants(updated);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">AI Meeting Scheduler</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg p-4 border border-border">
            <h2 className="text-lg font-semibold mb-4">Participants</h2>
            <div className="space-y-4">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-muted-foreground">{participant.timezone}</p>
                  </div>
                  {index !== 0 && (
                    <button
                      onClick={() => handleRemoveParticipant(index)}
                      className="text-sm text-destructive hover:text-destructive/80"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-3">Add Participant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  placeholder="Name"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <TimezoneSelect 
                  value={newParticipant.timezone}
                  onChange={(tz) => setNewParticipant({ ...newParticipant, timezone: tz })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs mb-1">Working hours start</label>
                  <input
                    type="time"
                    value={newParticipant.workingHours.start}
                    onChange={(e) => setNewParticipant({
                      ...newParticipant,
                      workingHours: { ...newParticipant.workingHours, start: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Working hours end</label>
                  <input
                    type="time"
                    value={newParticipant.workingHours.end}
                    onChange={(e) => setNewParticipant({
                      ...newParticipant,
                      workingHours: { ...newParticipant.workingHours, end: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={handleAddParticipant}
                className="mt-3 w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Participant
              </button>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border border-border">
            <h2 className="text-lg font-semibold mb-4">Meeting Details</h2>
            <div>
              <label className="block text-sm mb-1">Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-4 border border-border sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Suggested Times</h2>
            <AIScheduler
              participants={participants}
              duration={duration}
              onSlotSelect={setSelectedSlot}
              userPreferences={defaultPreferences}
            />
            
            {selectedSlot && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
                <h3 className="text-sm font-semibold text-primary">Selected Time</h3>
                <p className="mt-1">{selectedSlot.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 