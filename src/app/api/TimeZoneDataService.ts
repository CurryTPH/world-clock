import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

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

// LRU Cache implementation for improved memory management
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  private keys: K[] = [];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // Move key to the end (most recently used)
    this.keys = this.keys.filter(k => k !== key);
    this.keys.push(key);
    
    return this.cache.get(key);
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.set(key, value);
      // Move to the end (most recently used)
      this.keys = this.keys.filter(k => k !== key);
      this.keys.push(key);
      return;
    }

    // Check if we need to evict
    if (this.keys.length >= this.capacity) {
      const oldestKey = this.keys.shift();
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    // Add new key
    this.cache.set(key, value);
    this.keys.push(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.keys = [];
  }

  // Get all entries for debugging
  entries(): [K, V][] {
    return Array.from(this.cache.entries());
  }
}

// Cache configuration
const CACHE_SIZE = 20; // Maximum number of timezone entries to cache
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds
const STALE_WHILE_REVALIDATE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const BACKGROUND_REFRESH_RATE_LIMIT = 5000; // Min ms between background refreshes

// Use LRU Cache instead of a simple object
const dataCache = new LRUCache<string, { 
  data: TimezoneData; 
  timestamp: number;
  refreshing?: boolean; // Flag to prevent multiple simultaneous background refreshes
  lastRefreshAttempt?: number; // Rate limiting for background refreshes
}>(CACHE_SIZE);

// Track in-flight requests to prevent duplicate requests for the same timezone
const pendingRequests: Record<string, Promise<TimezoneData>> = {};

const API_BASE_URL = '/api/data';

// Default empty data to return in case of errors - memoized for better memory usage
const getEmptyData = (): TimezoneData => ({
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
});

// Function to fetch data from the API with improved caching strategy
export async function fetchTimezoneData(timezone: string): Promise<TimezoneData> {
  // Return immediately if there's a pending request for this timezone
  if (timezone in pendingRequests) {
    return pendingRequests[timezone];
  }

  const now = Date.now();
  const cachedEntry = dataCache.get(timezone);
  
  // Fresh cache hit - return immediately
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
    return cachedEntry.data;
  }
  
  // Stale cache hit - return stale data but refresh in background if not too old and not already refreshing
  const shouldRefreshInBackground = 
    cachedEntry && 
    now - cachedEntry.timestamp < STALE_WHILE_REVALIDATE_TTL &&
    !cachedEntry.refreshing &&
    (!cachedEntry.lastRefreshAttempt || now - cachedEntry.lastRefreshAttempt > BACKGROUND_REFRESH_RATE_LIMIT);
  
  if (shouldRefreshInBackground) {
    // Mark as refreshing to prevent multiple simultaneous background refreshes
    dataCache.put(timezone, {
      ...cachedEntry,
      refreshing: true,
      lastRefreshAttempt: now
    });
    
    // Schedule background refresh with a small delay to improve performance
    setTimeout(() => {
      simulateApiResponse(timezone)
        .then(freshData => {
          dataCache.put(timezone, {
            data: freshData,
            timestamp: Date.now(),
            refreshing: false
          });
        })
        .catch(error => {
          console.error('Background refresh error:', error);
          // Reset refreshing flag on error
          const current = dataCache.get(timezone);
          if (current) {
            dataCache.put(timezone, {
              ...current,
              refreshing: false
            });
          }
        });
    }, 50);
    
    return cachedEntry.data;
  }
  
  // No cache or cache too old - wait for fresh data
  try {
    // Track this request to avoid duplicates
    const fetchPromise = simulateApiResponse(timezone);
    pendingRequests[timezone] = fetchPromise;
    
    const data = await fetchPromise;
    
    dataCache.put(timezone, {
      data,
      timestamp: now
    });
    
    // Clean up pending request
    delete pendingRequests[timezone];
    
    return data;
  } catch (error) {
    console.error('Error fetching timezone data:', error);
    
    // Clean up pending request
    delete pendingRequests[timezone];
    
    // If we have any cached data, return it even if it's old
    if (cachedEntry) {
      return cachedEntry.data;
    }
    
    // Return empty data if everything fails
    return getEmptyData();
  }
}

// For debugging and memory monitoring
export function getCacheStats() {
  return {
    entries: dataCache.entries().length,
    pendingRequests: Object.keys(pendingRequests).length
  };
}

// Optimized hook with better memory management
export function useTimezoneData(timezone: string) {
  const [data, setData] = useState<TimezoneData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep previous timezone for cleanup
  const prevTimezoneRef = useRef<string>(timezone);
  
  // Use useCallback to avoid recreating the function on every render
  const loadData = useCallback(async () => {
    // Skip if the timezone is empty
    if (!timezone) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchTimezoneData(timezone);
      // Only update state if the component is still interested in this timezone
      // to prevent unnecessary renders and memory usage
      if (prevTimezoneRef.current === timezone) {
        setData(result);
      }
    } catch (err) {
      if (prevTimezoneRef.current === timezone) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        // Use cached data if available despite error
        const cachedEntry = dataCache.get(timezone);
        if (cachedEntry) {
          setData(cachedEntry.data);
        } else {
          setData(getEmptyData());
        }
      }
    } finally {
      if (prevTimezoneRef.current === timezone) {
        setLoading(false);
      }
    }
  }, [timezone]);

  useEffect(() => {
    let mounted = true;
    
    // Update the ref for the current timezone
    prevTimezoneRef.current = timezone;
    
    async function fetchData() {
      if (!mounted) return;
      
      await loadData();
      
      // Set up periodic refresh with dynamic refresh rate
      if (mounted) {
        // Increase refresh interval when the tab is not visible
        const refreshInterval = document.hidden ? CACHE_TTL * 2 : CACHE_TTL;
        
        fetchTimeoutRef.current = setTimeout(() => {
          if (mounted) {
            fetchData();
          }
        }, refreshInterval);
      }
    }
    
    fetchData();
    
    // Listen for visibility changes to optimize refresh rate
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause or slow down refreshes when tab is not visible
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        // Refresh less frequently when tab is not visible
        fetchTimeoutRef.current = setTimeout(() => {
          if (mounted && !document.hidden) {
            fetchData();
          }
        }, CACHE_TTL * 2);
      } else if (mounted) {
        // Resume normal refresh rate when tab becomes visible again
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mounted = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timezone, loadData]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({ 
    data, 
    loading, 
    error, 
    refresh: loadData 
  }), [data, loading, error, loadData]);
}

// Fake data for development - optimized to reduce memory allocations
async function simulateApiResponse(timezone: string): Promise<TimezoneData> {
  // Adding a small delay to simulate api latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get the city name from the timezone string
  const city = timezone.split('/').pop()?.replace('_', ' ') || timezone;
  const currentYear = new Date().getFullYear();
  
  // Use template strings only when needed
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
        name: `Tech Conference ${currentYear}`,
        location: `${city} Convention Center`,
        date: new Date(Date.now() + 86400000 * 12).toISOString(), // 12 days from now
        link: '#'
      }
    ],
    lastUpdated: new Date()
  };
} 