import { useState, useEffect } from 'react';

// Define types for our data
export interface Article {
  headline: string;
  link: string;
  source: string;
  timestamp: string;
}

export interface SportEvent {
  headline: string;
  link: string;
  league: string;
  teams?: string;
}

export interface PoliticalNews {
  headline: string;
  source: string;
  date: string;
  link: string;
}

export interface Weather {
  temp: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

export interface Event {
  name: string;
  location: string;
  date: string;
  link: string;
}

export interface TimezoneData {
  news: Article[];
  sports: SportEvent[];
  politics: PoliticalNews[];
  weather: Weather;
  events: Event[];
  lastUpdated: Date;
}

// Cache for storing fetched data to reduce API calls
const dataCache: Record<string, { data: TimezoneData; timestamp: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

// Example API URLs - replace with your actual API endpoints
const API_BASE_URL = '/api/data';

export async function fetchTimezoneData(timezone: string): Promise<TimezoneData> {
  const now = Date.now();
  
  // Check if we have cached data that's still fresh
  if (dataCache[timezone] && now - dataCache[timezone].timestamp < CACHE_TTL) {
    return dataCache[timezone].data;
  }
  
  try {
    // In a real implementation, this would be your actual API endpoint
    // For development purposes, we'll simulate the API response
    // const response = await fetch(`${API_BASE_URL}?timezone=${encodeURIComponent(timezone)}`);
    // const data = await response.json();

    // Simulate API response for development
    const data = await simulateApiResponse(timezone);
    
    // Cache the result
    dataCache[timezone] = {
      data,
      timestamp: now
    };
    
    return data;
  } catch (error) {
    console.error('Error fetching timezone data:', error);
    // Return empty data structure on error
    return {
      news: [],
      sports: [],
      politics: [],
      weather: {
        temp: 0,
        description: 'Data unavailable',
        icon: 'error'
      },
      events: [],
      lastUpdated: new Date()
    };
  }
}

// This hook will fetch data for a timezone and keep it updated
export function useTimezoneData(timezone: string) {
  const [data, setData] = useState<TimezoneData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchTimezoneData(timezone);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load timezone data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(loadData, CACHE_TTL);
    
    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [timezone]);

  return { data, loading, error };
}

// For development purposes only - simulate API responses
async function simulateApiResponse(timezone: string): Promise<TimezoneData> {
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate some mock data based on the timezone
  const city = timezone.split('/').pop()?.replace('_', ' ') || timezone;
  
  return {
    news: [
      {
        headline: `Local Economic Forum Opens in ${city}`,
        link: '#',
        source: 'Global News Network',
        timestamp: new Date().toISOString()
      },
      {
        headline: `New Public Transportation Plan Announced for ${city}`,
        link: '#',
        source: 'City Times',
        timestamp: new Date().toISOString()
      },
      {
        headline: `Tech Industry Growing Rapidly in ${city} Region`,
        link: '#',
        source: 'Tech Daily',
        timestamp: new Date().toISOString()
      }
    ],
    sports: [
      {
        headline: `${city} United Wins Championship Game`,
        link: '#',
        league: 'Premier League'
      },
      {
        headline: `Basketball Tournament to be Hosted in ${city} Next Month`,
        link: '#',
        league: 'National Basketball Association'
      }
    ],
    politics: [
      {
        headline: `${city} Mayor Announces Reelection Campaign`,
        source: 'Politics Today',
        date: new Date().toISOString(),
        link: '#'
      },
      {
        headline: `New Environmental Regulations in ${city}`,
        source: 'Government News',
        date: new Date().toISOString(),
        link: '#'
      }
    ],
    weather: {
      temp: Math.floor(Math.random() * 30) + 5, // Random temperature between 5-35°C
      description: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
      icon: ['☀️', '☁️', '🌧️', '⛅'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: Math.floor(Math.random() * 20) + 5
    },
    events: [
      {
        name: `${city} International Film Festival`,
        location: `Downtown ${city}`,
        date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        link: '#'
      },
      {
        name: `Tech Conference ${new Date().getFullYear()}`,
        location: `${city} Convention Center`,
        date: new Date(Date.now() + 86400000 * 12).toISOString(), // 12 days from now
        link: '#'
      }
    ],
    lastUpdated: new Date()
  };
} 