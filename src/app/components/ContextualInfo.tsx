import React, { useState } from 'react';
import { useTimezoneData, TimezoneData } from '../api/TimeZoneDataService';

interface ContextualInfoProps {
  timezone: string;
  className?: string;
}

export default function ContextualInfo({ timezone, className = '' }: ContextualInfoProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('weather');
  const { data, loading, error } = useTimezoneData(timezone);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 bg-opacity-60 p-3 rounded-lg text-center text-sm ${className}`}>
        <div className="animate-pulse flex space-x-4 items-center justify-center">
          <div className="h-2 bg-gray-600 rounded w-1/4"></div>
          <div className="h-2 bg-gray-600 rounded w-1/4"></div>
          <div className="h-2 bg-gray-600 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`bg-gray-800 bg-opacity-60 p-3 rounded-lg text-center text-sm ${className}`}>
        <p className="text-red-400">Unable to load contextual information</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 bg-opacity-60 rounded-lg text-sm text-gray-300 overflow-hidden transition-all duration-300 ${className}`}>
      {/* Weather Section - Always Visible */}
      <div className="p-3 border-b border-gray-700">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('weather')}
        >
          <span className="font-medium flex items-center">
            {data.weather.icon} Weather
          </span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
            {data.weather.temp}°C
          </span>
        </div>
        
        {expandedSection === 'weather' && (
          <div className="mt-2 pl-5 text-xs animate-fadeIn">
            <p>{data.weather.description}</p>
            {data.weather.humidity && (
              <p className="mt-1">Humidity: {data.weather.humidity}%</p>
            )}
            {data.weather.windSpeed && (
              <p>Wind: {data.weather.windSpeed} km/h</p>
            )}
          </div>
        )}
      </div>

      {/* News Section */}
      <div className="p-3 border-b border-gray-700">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('news')}
        >
          <span className="font-medium">🗞️ News</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
            {data.news.length}
          </span>
        </div>
        
        {expandedSection === 'news' && (
          <div className="mt-2 pl-5 text-xs animate-fadeIn">
            <ul className="space-y-2">
              {data.news.map((item, idx) => (
                <li key={idx} className="hover:text-blue-400">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                    {item.headline}
                    <div className="text-gray-500 text-[10px] mt-1 flex justify-between">
                      <span>{item.source}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sports Section */}
      <div className="p-3 border-b border-gray-700">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('sports')}
        >
          <span className="font-medium">⚽ Sports</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
            {data.sports.length}
          </span>
        </div>
        
        {expandedSection === 'sports' && (
          <div className="mt-2 pl-5 text-xs animate-fadeIn">
            <ul className="space-y-2">
              {data.sports.map((item, idx) => (
                <li key={idx} className="hover:text-blue-400">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                    {item.headline}
                    <div className="text-gray-500 text-[10px] mt-1">
                      {item.league}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Politics Section */}
      <div className="p-3 border-b border-gray-700">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('politics')}
        >
          <span className="font-medium">🏛️ Politics</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
            {data.politics.length}
          </span>
        </div>
        
        {expandedSection === 'politics' && (
          <div className="mt-2 pl-5 text-xs animate-fadeIn">
            <ul className="space-y-2">
              {data.politics.map((item, idx) => (
                <li key={idx} className="hover:text-blue-400">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                    {item.headline}
                    <div className="text-gray-500 text-[10px] mt-1 flex justify-between">
                      <span>{item.source}</span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="p-3">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('events')}
        >
          <span className="font-medium">🎟️ Events</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
            {data.events.length}
          </span>
        </div>
        
        {expandedSection === 'events' && (
          <div className="mt-2 pl-5 text-xs animate-fadeIn">
            <ul className="space-y-2">
              {data.events.map((item, idx) => (
                <li key={idx} className="hover:text-blue-400">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                    {item.name}
                    <div className="text-gray-500 text-[10px] mt-1 flex justify-between">
                      <span>{item.location}</span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Update information */}
      <div className="text-[10px] text-gray-500 text-right pr-3 pb-2">
        Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
} 