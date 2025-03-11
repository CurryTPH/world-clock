"use client";

import { useState, useEffect, useCallback } from 'react';
import { format, addHours, isWithinInterval, set } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { UserPreferences } from '../settings/page';

interface Participant {
  name: string;
  timezone: string;
  workingHours: {
    start: string; // Format: "HH:mm"
    end: string;   // Format: "HH:mm"
  };
  preferredTimes?: {
    start: string; // Format: "HH:mm"
    end: string;   // Format: "HH:mm"
  };
  meetingHistory?: Date[];
  focusTime?: {
    start: string; // Format: "HH:mm"
    end: string;   // Format: "HH:mm"
  };
}

interface MeetingSlot {
  startTime: Date;
  score: number;
  participantAvailability: {
    [participantId: string]: {
      isAvailable: boolean;
      isPreferred: boolean;
      isFocusTime: boolean;
    };
  };
}

interface AISchedulerProps {
  participants: Participant[];
  duration?: number;
  onSlotSelect: (slot: Date) => void;
  userPreferences: UserPreferences;
}

export function AIScheduler({
  participants,
  duration = 60,
  onSlotSelect,
  userPreferences
}: AISchedulerProps) {
  const [suggestedSlots, setSuggestedSlots] = useState<MeetingSlot[]>([]);

  // Move analyzeParticipantPatterns outside since it doesn't depend on any props or state
  const analyzeParticipantPatterns = useCallback((participant: Participant) => {
    const meetingHistory = participant.meetingHistory ?? [];
    
    // Analyze preferred meeting times
    const timeDistribution = meetingHistory.reduce((acc, date) => {
      const hour = date.getHours();
      if (hour < 12) acc.morning++;
      else if (hour < 17) acc.afternoon++;
      else acc.evening++;
      return acc;
    }, { morning: 0, afternoon: 0, evening: 0 });

    const preferredDayTime = Object.entries(timeDistribution)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as 'morning' | 'afternoon' | 'evening';

    // Calculate average meetings per day
    const meetingFrequency = meetingHistory.length / 30; // Assuming 30 days of history

    // Analyze if person tends to schedule back-to-back meetings
    const backToBackMeetings = meetingHistory.reduce((count, date, index) => {
      if (index === 0) return 0;
      const timeDiff = Math.abs(date.getTime() - meetingHistory[index - 1].getTime());
      return timeDiff <= 3600000 ? count + 1 : count; // Within 1 hour
    }, 0);

    const backToBackPreference = backToBackMeetings > meetingHistory.length * 0.3;

    return {
      preferredDayTime,
      meetingFrequency,
      backToBackPreference
    };
  }, []);

  const scoreTimeSlot = useCallback((
    time: Date,
    participant: Participant,
    patterns: ReturnType<typeof analyzeParticipantPatterns>
  ): number => {
    let score = 0;
    const participantTime = toZonedTime(time, participant.timezone);
    const hour = participantTime.getHours();
    const minutes = participantTime.getMinutes();

    // Convert working hours to participant's timezone
    const workStart = set(participantTime, {
      hours: parseInt(participant.workingHours.start.split(':')[0]),
      minutes: parseInt(participant.workingHours.start.split(':')[1])
    });
    const workEnd = set(participantTime, {
      hours: parseInt(participant.workingHours.end.split(':')[0]),
      minutes: parseInt(participant.workingHours.end.split(':')[1])
    });

    // Base availability score
    if (isWithinInterval(participantTime, { start: workStart, end: workEnd })) {
      score += 50;
    } else {
      return 0; // Not within working hours
    }

    // Preferred time bonus
    if (participant.preferredTimes) {
      const prefStart = parseInt(participant.preferredTimes.start.split(':')[0]);
      const prefEnd = parseInt(participant.preferredTimes.end.split(':')[0]);
      if (hour >= prefStart && hour < prefEnd) {
        score += 20;
      }
    }

    // Focus time penalty
    if (participant.focusTime) {
      const focusStart = parseInt(participant.focusTime.start.split(':')[0]);
      const focusEnd = parseInt(participant.focusTime.end.split(':')[0]);
      if (hour >= focusStart && hour < focusEnd) {
        score -= 30;
      }
    }

    // Lunch time penalty
    const lunchStart = parseInt(userPreferences.lunchTime.start.split(':')[0]);
    const lunchEnd = parseInt(userPreferences.lunchTime.end.split(':')[0]);
    if (hour >= lunchStart && hour < lunchEnd) {
      score -= 25;
    }

    // Pattern matching bonus
    if (
      (hour < 12 && patterns.preferredDayTime === 'morning') ||
      (hour >= 12 && hour < 17 && patterns.preferredDayTime === 'afternoon') ||
      (hour >= 17 && patterns.preferredDayTime === 'evening')
    ) {
      score += 15;
    }

    // Back-to-back meetings handling
    const meetingHistory = participant.meetingHistory ?? [];
    if (!userPreferences.backToBackMeetings && meetingHistory.length > 0) {
      const lastMeeting = meetingHistory[meetingHistory.length - 1];
      const timeSinceLastMeeting = Math.abs(time.getTime() - lastMeeting.getTime()) / (1000 * 60); // in minutes
      
      if (timeSinceLastMeeting < userPreferences.minimumBreakBetweenMeetings) {
        score -= 40;
      }
    }

    // Meeting frequency check
    if (meetingHistory.length > 0) {
      const todayMeetings = meetingHistory.filter(
        meeting => meeting.toDateString() === time.toDateString()
      ).length;

      if (todayMeetings >= userPreferences.maxMeetingsPerDay) {
        score -= 50;
      }
    }

    // Prefer quarter-hour intervals
    if (minutes % 15 === 0) {
      score += 5;
    }

    return score;
  }, [userPreferences]);

  useEffect(() => {
    const generateSlots = () => {
      const slots: MeetingSlot[] = [];
      const now = new Date();
      const endDate = addHours(now, 168); // Look ahead 1 week

      const participantPatterns = participants.reduce((acc, participant) => ({
        ...acc,
        [participant.name]: analyzeParticipantPatterns(participant)
      }), {} as { [key: string]: ReturnType<typeof analyzeParticipantPatterns> });

      // Generate slots for the next week
      for (let time = now; time < endDate; time = addHours(time, 0.5)) {
        const slot: MeetingSlot = {
          startTime: time,
          score: 0,
          participantAvailability: {}
        };

        // Score the slot for each participant
        participants.forEach(participant => {
          const participantScore = scoreTimeSlot(
            time,
            participant,
            participantPatterns[participant.name]
          );

          slot.participantAvailability[participant.name] = {
            isAvailable: participantScore > 0,
            isPreferred: participantScore >= 70,
            isFocusTime: false // Set based on focus time check
          };

          slot.score += participantScore;
        });

        // Only include slots where all participants are available
        if (Object.values(slot.participantAvailability).every(p => p.isAvailable)) {
          slots.push(slot);
        }
      }

      // Sort slots by score and take top 10
      return slots
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    };

    setSuggestedSlots(generateSlots());
  }, [participants, duration, userPreferences, analyzeParticipantPatterns, scoreTimeSlot]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white font-bold mb-4">AI-Suggested Meeting Times</h3>
      <div className="space-y-2">
        {suggestedSlots.map((slot) => (
          <div
            key={slot.startTime.toISOString()}
            className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
            onClick={() => onSlotSelect(slot.startTime)}
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">
                {format(slot.startTime, "MMM d, h:mm a")}
              </span>
              <span className="text-green-400 text-sm">
                Score: {Math.round(slot.score)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(slot.participantAvailability).map(([name, status]) => (
                <span
                  key={name}
                  className={`px-2 py-1 rounded-full text-xs ${
                    status.isPreferred
                      ? 'bg-green-500 text-white'
                      : status.isAvailable
                      ? 'bg-blue-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 