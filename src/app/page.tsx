"use client";
import { useEffect, useState } from "react";
import Select from "react-select";
import { format, addMinutes, set } from "date-fns";

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];

const getTimeSlots = (interval = 30) => {
  let times = [];
  for (let i = 0; i < 24 * 60; i += interval) {
    const time = set(new Date(), {
      hours: Math.floor(i / 60),
      minutes: i % 60,
      seconds: 0,
      milliseconds: 0,
    });
    times.push(time);
  }
  return times;
};

export default function WorldClock() {
  const [selectedTimezones, setSelectedTimezones] = useState([
    timezones[0],
    timezones[1],
    timezones[2],
    timezones[3],
  ]);

  const [highlightedTime, setHighlightedTime] = useState<Date | null>(null);
  const timeSlots = getTimeSlots(30);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">World Clock</h1>
      <div className="grid grid-cols-4 gap-6 w-full max-w-6xl">
        {selectedTimezones.map((tz, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <Select
              options={timezones}
              value={tz}
              onChange={(val) => {
                if (val) {
                  const newZones = [...selectedTimezones];
                  newZones[idx] = val;
                  setSelectedTimezones(newZones);
                }
              }}
              className="mb-4 text-black"
            />
            <div className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg">
              {timeSlots.map((time, i) => {
                const formattedTime = format(time, "hh:mm a");
                const isNow = format(time, "HH:mm") === format(new Date(), "HH:mm");
                const isHighlighted =
                  highlightedTime && format(highlightedTime, "HH:mm") === format(time, "HH:mm");

                return (
                  <div
                    key={i}
                    className={`p-2 text-center cursor-pointer ${
                      isNow ? "bg-blue-500 text-white font-bold" : ""
                    } ${isHighlighted ? "bg-pink-500 text-white font-bold" : ""}`}
                    onClick={() => setHighlightedTime(time)}
                  >
                    {formattedTime}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
