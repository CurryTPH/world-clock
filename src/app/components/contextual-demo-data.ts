import { addNotification } from './NotificationButton';

// Common world events to simulate real data (USE FOR DEVELOMENT ONLY, FOR PRODUCTION USE REAL DATA)
const majorWorldEvents = [
  {
    title: "Global Climate Summit 2023",
    dates: "Nov 30 - Dec 12, 2023",
    locations: ["New York", "London", "Paris", "Tokyo", "Sydney"]
  },
  {
    title: "International Tech Conference",
    dates: "Feb 15 - Feb 20, 2024",
    locations: ["San Francisco", "Berlin", "Singapore", "Toronto"]
  },
  {
    title: "World Economic Forum",
    dates: "Jan 16 - Jan 20, 2024",
    locations: ["Davos", "Geneva", "Zurich"]
  },
  {
    title: "Olympic Games",
    dates: "Jul 26 - Aug 11, 2024",
    locations: ["Paris", "Marseille", "Lyon", "Nice"]
  },
  {
    title: "International Film Festival",
    dates: "May 14 - May 25, 2024",
    locations: ["Cannes", "Venice", "Toronto", "Berlin", "Sundance"]
  }
];

const weatherEvents = [
  {
    type: "Storm Warning",
    regions: ["East Coast USA", "Caribbean", "Tokyo Bay", "Philippines", "Hong Kong"],
    description: "Severe storm system developing with high winds and heavy rainfall expected."
  },
  {
    type: "Heat Wave",
    regions: ["Australia", "Southern Europe", "Middle East", "Southern USA"],
    description: "Extreme temperatures forecasted to exceed seasonal averages by 10-15°C."
  },
  {
    type: "Snow Storm",
    regions: ["Northern Europe", "Canada", "Northern USA", "Russia"],
    description: "Heavy snowfall expected with accumulations of 30-50cm possible."
  }
];

const sportingEvents = [
  {
    title: "Champions League Final",
    date: "May 31, 2024",
    locations: ["London", "Madrid", "Munich", "Paris"]
  },
  {
    title: "Super Bowl",
    date: "Feb 11, 2024",
    locations: ["Las Vegas", "New Orleans", "Miami", "Los Angeles"]
  },
  {
    title: "Grand Slam Tennis Tournament",
    date: "Jan 14 - Jan 28, 2024",
    locations: ["Melbourne", "Paris", "London", "New York"]
  },
  {
    title: "Formula 1 Grand Prix",
    locations: ["Monaco", "Singapore", "Abu Dhabi", "Melbourne", "Monza", "Silverstone"]
  },
  {
    title: "Cricket World Cup",
    locations: ["Mumbai", "Kolkata", "Sydney", "Melbourne", "London", "Auckland"]
  }
];

function findRelevantEvents(timezone: string, eventList: any[], locationKey: string = 'locations') {
// Extract city from timezone (e.g., 'America/New_York' -> 'New York')
  const cityParts = timezone.split('/').pop()?.replace('_', ' ') || '';
  const city = cityParts;
  
  return eventList.filter(event => {
    const directMatch = event[locationKey].some((loc: string) => 
      loc.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(loc.toLowerCase())
    );
    
    const regionMatch = matchRegion(city, event[locationKey]);
    
    return directMatch || regionMatch;
  });
}

function matchRegion(city: string, locations: string[]) {
// Map of cities to regions/countries for better matching
  const regionMap: Record<string, string[]> = {
    'New York': ['USA', 'United States', 'North America', 'America'],
    'Los Angeles': ['USA', 'United States', 'North America', 'America', 'West Coast'],
    'Chicago': ['USA', 'United States', 'North America', 'America', 'Midwest'],
    'London': ['UK', 'United Kingdom', 'England', 'Europe', 'Britain'],
    'Paris': ['France', 'Europe'],
    'Berlin': ['Germany', 'Europe'],
    'Tokyo': ['Japan', 'Asia', 'East Asia'],
    'Sydney': ['Australia', 'Oceania'],
    'Singapore': ['Asia', 'Southeast Asia'],
    'Hong Kong': ['China', 'Asia', 'East Asia'],
    'Toronto': ['Canada', 'North America'],
    'Dubai': ['UAE', 'United Arab Emirates', 'Middle East'],
    'Moscow': ['Russia', 'Europe', 'Eastern Europe'],
    'Madrid': ['Spain', 'Europe', 'Southern Europe'],
    'Rome': ['Italy', 'Europe', 'Southern Europe'],
    'Amsterdam': ['Netherlands', 'Europe', 'Western Europe'],
    'Cairo': ['Egypt', 'Africa', 'Middle East', 'North Africa'],
    'Bangkok': ['Thailand', 'Asia', 'Southeast Asia'],
    'Mumbai': ['India', 'Asia', 'South Asia'],
    'Shanghai': ['China', 'Asia', 'East Asia'],
    'Sao Paulo': ['Brazil', 'South America', 'Latin America'],
    'Mexico City': ['Mexico', 'North America', 'Latin America']
  };
  
// Look up regions for the city
  const cityRegions = regionMap[city] || [];
  if (cityRegions.length === 0) return false;
  
  for (const location of locations) {
    for (const region of cityRegions) {
      if (location.toLowerCase().includes(region.toLowerCase())) {
        return true;
      }
    }
  }
  
  return false;
}

export function startContextualNotifications(timezone: string) {
// Check every 3-5 minutes for possible notifications (randomized intervals)
  const checkInterval = Math.floor(Math.random() * (300000 - 180000) + 180000);
  
// Initial data collection
  setTimeout(() => {
    const relevantWorldEvents = findRelevantEvents(timezone, majorWorldEvents);
    const relevantSportingEvents = findRelevantEvents(timezone, sportingEvents);
    const relevantWeatherEvents = findRelevantEvents(timezone, weatherEvents, 'regions');
    
    if (relevantWorldEvents.length > 0 && Math.random() > 0.7) {
      const event = relevantWorldEvents[Math.floor(Math.random() * relevantWorldEvents.length)];
      addNotification({
        title: `Upcoming: ${event.title}`,
        message: `${event.title} scheduled for ${event.dates}`,
        type: 'info',
        source: 'Events Calendar',
        link: '#'
      });
    }
    
    if (relevantSportingEvents.length > 0 && Math.random() > 0.8) {
      const event = relevantSportingEvents[Math.floor(Math.random() * relevantSportingEvents.length)];
      addNotification({
        title: `Sports Alert: ${event.title}`,
        message: `${event.title} coming up${event.date ? ` on ${event.date}` : ''}`,
        type: 'info',
        source: 'Sports Calendar',
        link: '#'
      });
    }
    
    if (relevantWeatherEvents.length > 0 && Math.random() > 0.6) {
      const event = relevantWeatherEvents[Math.floor(Math.random() * relevantWeatherEvents.length)];
      addNotification({
        title: `Weather Alert: ${event.type}`,
        message: event.description,
        type: 'warning',
        source: 'Weather Service',
        link: '#'
      });
    }
  }, 5000); // Initial delay of 5 seconds
  
// Continue with periodic checks
  const intervalId = setInterval(() => {
    const relevantWorldEvents = findRelevantEvents(timezone, majorWorldEvents);
    const relevantSportingEvents = findRelevantEvents(timezone, sportingEvents);
    const relevantWeatherEvents = findRelevantEvents(timezone, weatherEvents, 'regions');
    
// Only send notification if we have relevant data and random chance is right
    if (relevantWorldEvents.length > 0 && Math.random() > 0.9) {
      const event = relevantWorldEvents[Math.floor(Math.random() * relevantWorldEvents.length)];
      addNotification({
        title: `Upcoming: ${event.title}`,
        message: `${event.title} scheduled for ${event.dates}`,
        type: 'info',
        source: 'Events Calendar',
        link: '#'
      });
    }
    
    if (relevantSportingEvents.length > 0 && Math.random() > 0.9) {
      const event = relevantSportingEvents[Math.floor(Math.random() * relevantSportingEvents.length)];
      addNotification({
        title: `Sports Update: ${event.title}`,
        message: `New information available for ${event.title}`,
        type: 'info',
        source: 'Sports Calendar',
        link: '#'
      });
    }
    
    if (relevantWeatherEvents.length > 0 && Math.random() > 0.9) {
      const event = relevantWeatherEvents[Math.floor(Math.random() * relevantWeatherEvents.length)];
      addNotification({
        title: `Weather Update: ${event.type}`,
        message: event.description,
        type: 'warning',
        source: 'Weather Service',
        link: '#'
      });
    }
  }, checkInterval);
  
// Return function to stop notifications
  return () => clearInterval(intervalId);
} 