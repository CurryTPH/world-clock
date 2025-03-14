import React, { useState, useCallback, useMemo, memo } from 'react';
import { useTimezoneData, TimezoneData } from '../api/TimeZoneDataService';
import { useInView } from 'react-intersection-observer';

interface ContextualInfoProps {
  timezone: string;
  className?: string;
}

// Create memoized section components
const InfoSection = memo(({ 
  title, 
  icon, 
  badge, 
  isExpanded, 
  onToggle, 
  children 
}: { 
  title: string; 
  icon: string; 
  badge: string | number; 
  isExpanded: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) => {
  return (
    <div className="p-3 border-b border-gray-700">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={onToggle}
      >
        <span className="font-medium flex items-center">
          {icon} {title}
        </span>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
          {badge}
        </span>
      </div>
      
      {isExpanded && (
        <div className="mt-2 pl-5 text-xs animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
});

InfoSection.displayName = 'InfoSection';

// Virtualized list component for better performance with large lists
const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 45, 
  maxHeight = 300 
}: { 
  items: any[]; 
  renderItem: (item: any, index: number) => React.ReactNode; 
  itemHeight?: number; 
  maxHeight?: number;
}) => {
  // Only render a reasonable number of items
  const maxItemsToRender = Math.min(Math.ceil(maxHeight / itemHeight) + 2, items.length);
  const displayItems = items.slice(0, maxItemsToRender);
  
  return (
    <ul className="space-y-2" style={{ maxHeight, overflowY: 'auto' }}>
      {displayItems.map((item, idx) => (
        <li key={idx} style={{ height: itemHeight, minHeight: itemHeight }}>
          {renderItem(item, idx)}
        </li>
      ))}
      {items.length > maxItemsToRender && (
        <li className="text-center text-gray-500">
          + {items.length - maxItemsToRender} more items
        </li>
      )}
    </ul>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Main component with optimizations
function ContextualInfo({ timezone, className = '' }: ContextualInfoProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('weather');
  const { data, loading, error } = useTimezoneData(timezone);
  
  // Use Intersection Observer to detect if component is in view
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Memoized toggle handler to prevent recreation on each render
  const toggleSection = useCallback((section: string) => {
    setExpandedSection(prevSection => prevSection === section ? null : section);
  }, []);

  // Memoized rendering functions for each content type
  const renderNewsItem = useCallback((item: any, idx: number) => (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-400">
      {item.headline}
      <div className="text-gray-500 text-[10px] mt-1 flex justify-between">
        <span>{item.source}</span>
        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
      </div>
    </a>
  ), []);
  
  const renderSportsItem = useCallback((item: any, idx: number) => (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-400">
      {item.headline}
      <div className="text-gray-500 text-[10px] mt-1">
        {item.league}
      </div>
    </a>
  ), []);
  
  const renderPoliticsItem = useCallback((item: any, idx: number) => (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-400">
      {item.headline}
      <div className="text-gray-500 text-[10px] mt-1 flex justify-between">
        <span>{item.source}</span>
        <span>{new Date(item.date).toLocaleDateString()}</span>
      </div>
    </a>
  ), []);
  
  const renderEventsItem = useCallback((item: any, idx: number) => (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-400">
      {item.name}
      <div className="text-gray-500 text-[10px] mt-1 flex justify-between">
        <span>{item.location}</span>
        <span>{new Date(item.date).toLocaleDateString()}</span>
      </div>
    </a>
  ), []);

  // Early returns for loading/error states
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

  // Use Web Vitals optimization - only render full content when in view
  if (!inView) {
    return <div ref={ref} className={`bg-gray-800 bg-opacity-60 p-3 rounded-lg text-sm ${className}`}>
      <div className="flex justify-between items-center">
        <span>Contextual Info for {timezone}</span>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{data.weather.temp}°C</span>
      </div>
    </div>;
  }

  return (
    <div 
      ref={ref}
      className={`bg-gray-800 bg-opacity-60 rounded-lg text-sm text-gray-300 overflow-hidden transition-all duration-300 ${className}`}
      style={{ contain: 'content' }}
    >
      {/* Weather Section - always render this one as it's small */}
      <InfoSection 
        title="Weather" 
        icon={data.weather.icon} 
        badge={`${data.weather.temp}°C`}
        isExpanded={expandedSection === 'weather'}
        onToggle={() => toggleSection('weather')}
      >
        <p>{data.weather.description}</p>
        {data.weather.humidity && (
          <p className="mt-1">Humidity: {data.weather.humidity}%</p>
        )}
        {data.weather.windSpeed && (
          <p>Wind: {data.weather.windSpeed} km/h</p>
        )}
      </InfoSection>

      {/* News Section */}
      <InfoSection 
        title="News" 
        icon="🗞️"
        badge={data.news.length}
        isExpanded={expandedSection === 'news'}
        onToggle={() => toggleSection('news')}
      >
        <VirtualizedList
          items={data.news}
          renderItem={renderNewsItem}
        />
      </InfoSection>

      {/* Sports Section */}
      <InfoSection 
        title="Sports" 
        icon="⚽"
        badge={data.sports.length}
        isExpanded={expandedSection === 'sports'}
        onToggle={() => toggleSection('sports')}
      >
        <VirtualizedList
          items={data.sports}
          renderItem={renderSportsItem}
        />
      </InfoSection>

      {/* Politics Section */}
      <InfoSection 
        title="Politics" 
        icon="🏛️"
        badge={data.politics.length}
        isExpanded={expandedSection === 'politics'}
        onToggle={() => toggleSection('politics')}
      >
        <VirtualizedList
          items={data.politics}
          renderItem={renderPoliticsItem}
        />
      </InfoSection>

      {/* Events Section */}
      <InfoSection 
        title="Events" 
        icon="🎟️"
        badge={data.events.length}
        isExpanded={expandedSection === 'events'}
        onToggle={() => toggleSection('events')}
      >
        <VirtualizedList
          items={data.events}
          renderItem={renderEventsItem}
        />
      </InfoSection>

      {/* Update information */}
      <div className="text-[10px] text-gray-500 text-right pr-3 pb-2">
        Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}

// Export as memoized component to prevent unnecessary re-renders
export default memo(ContextualInfo); 